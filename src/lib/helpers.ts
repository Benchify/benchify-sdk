import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { minimatch } from 'minimatch';
import * as tar from 'tar-stream';
import * as zstd from '@mongodb-js/zstd';

export interface FileData {
  path: string;
  contents: string;
}

export interface BinaryFileData {
  path: string;
  contents: string | Uint8Array;
  mode?: string; // Optional file mode (e.g., '0755' for executable)
}

const DEFAULT_PATTERNS = [
  '**/*.ts',
  '**/*.tsx',
  '**/*.js',
  '**/*.jsx',
  '**/package.json',
  '**/tsconfig*.json',
  '**/*.config.*',
];

const DEFAULT_IGNORE = [
  'node_modules/**',
  '.claude/**',
  '.git/**',
  'dist/**',
  'build/**',
  '.next/**',
  'coverage/**',
  '**/__tests__/**',
  '**/.env*',
];

function walkDirectory(dir: string, basePath: string, patterns: string[], ignore: string[]): string[] {
  const files: string[] = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(basePath, fullPath);

      if (ignore.some((ignorePattern) => minimatch(relativePath, ignorePattern))) {
        continue;
      }

      if (entry.isDirectory()) {
        files.push(...walkDirectory(fullPath, basePath, patterns, ignore));
      } else if (entry.isFile()) {
        if (patterns.some((pattern) => minimatch(relativePath, pattern))) {
          files.push(relativePath);
        }
      }
    }
  } catch {
    // Skip directories we can't read
  }

  return files;
}

export async function collectFiles({
  basePath = process.cwd(),
  patterns = DEFAULT_PATTERNS,
  ignore = DEFAULT_IGNORE,
}: { basePath?: string; patterns?: string[]; ignore?: string[] } = {}): Promise<FileData[]> {
  const resolvedBasePath = path.resolve(basePath);
  const filePaths = walkDirectory(resolvedBasePath, resolvedBasePath, patterns, ignore);

  const files: FileData[] = [];

  for (const filePath of filePaths) {
    try {
      const fullPath = path.join(resolvedBasePath, filePath);
      const contents = fs.readFileSync(fullPath, 'utf8');
      if (contents.trim()) {
        files.push({
          path: filePath,
          contents,
        });
      }
    } catch {
      continue;
    }
  }

  return files;
}

export function applyChanges({
  files,
  basePath = process.cwd(),
}: {
  files: FileData[];
  basePath?: string;
}): void {
  for (const file of files) {
    try {
      const fullPath = path.resolve(basePath, file.path);
      const dirPath = path.dirname(fullPath);

      fs.mkdirSync(dirPath, { recursive: true });
      fs.writeFileSync(fullPath, file.contents, 'utf8');
    } catch {
      continue;
    }
  }
}

/**
 * Normalize path to POSIX format and remove ./ and // patterns
 * Throws on absolute paths or path traversal attempts
 */
export function normalizePath(path: string): string {
  // Convert backslashes to forward slashes
  let normalized = path.replace(/\\/g, '/');

  // Remove leading ./
  normalized = normalized.replace(/^\.\//, '');

  // Remove double slashes
  normalized = normalized.replace(/\/+/g, '/');

  // Remove trailing slash unless it's the root
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }

  // Path safety checks
  if (normalized.startsWith('/')) {
    throw new Error(`Absolute paths not allowed: ${path}`);
  }
  if (normalized.includes('../')) {
    throw new Error(`Path traversal not allowed: ${path}`);
  }

  return normalized;
}

/**
 * Pack files into tar.zst format
 * Used by both Sandbox and Fixer APIs
 */
export async function packTarZst(
  files: BinaryFileData[],
  options?: {
    buildTime?: number;
  },
): Promise<Buffer> {
  // Normalize all paths once and sort for deterministic output
  const normalizedFiles = files
    .map((file) => ({
      ...file,
      path: normalizePath(file.path),
    }))
    .sort((a, b) => a.path.localeCompare(b.path));

  // Create tar pack stream
  const pack = tar.pack();
  const chunks: Buffer[] = [];

  // Collect tar data
  pack.on('data', (chunk: Buffer) => {
    chunks.push(chunk);
  });

  // Add files to tar stream
  for (const file of normalizedFiles) {
    // Handle binary-safe content
    const contentBuffer =
      typeof file.contents === 'string' ? Buffer.from(file.contents, 'utf8') : Buffer.from(file.contents);

    // Add entry with proper headers
    const entry = pack.entry({
      name: file.path,
      size: contentBuffer.length,
      mode: file.mode ? parseInt(file.mode, 8) : 0o644,
      mtime: options?.buildTime ? new Date(options.buildTime * 1000) : new Date(0), // Deterministic timestamp
      type: 'file',
    });

    entry.write(contentBuffer);
    entry.end();
  }

  // Finalize tar stream
  pack.finalize();

  // Wait for all data to be collected
  await new Promise<void>((resolve) => {
    pack.on('end', resolve);
  });

  // Combine tar data
  const tarData = Buffer.concat(chunks);

  // Compress with zstd (level 10 for better compression)
  const zstdData = await zstd.compress(tarData, 10);

  return zstdData;
}

/**
 * Manifest format matching API specification
 */
export interface Manifest {
  manifest_version: '1';
  bundle: {
    digest: string;
    size: number;
    format: 'tar.zst';
    compression: 'zstd';
  };
  files: Array<{
    path: string;
    digest: string;
    size: number;
    type: 'file';
    mode: string;
  }>;
  tree_hash: string;
}

/**
 * Pack files and create manifest in one operation
 * Returns both the packed buffer and the manifest
 */
export async function packWithManifest(
  files: BinaryFileData[],
  treeHash: string,
  options?: {
    buildTime?: number;
  },
): Promise<{ buffer: Buffer; manifest: Manifest }> {
  // Pack the files
  const buffer = await packTarZst(files, options);

  // Calculate bundle hash
  const bundleDigest = createHash('sha256').update(buffer).digest('hex');

  // Build manifest
  const manifest: Manifest = {
    manifest_version: '1',
    bundle: {
      digest: `sha256:${bundleDigest}`,
      size: buffer.length,
      format: 'tar.zst',
      compression: 'zstd',
    },
    files: files.map((file) => {
      const contentBuffer =
        typeof file.contents === 'string' ? Buffer.from(file.contents, 'utf-8') : file.contents;
      const fileDigest = createHash('sha256').update(contentBuffer).digest('hex');

      return {
        path: file.path,
        digest: `sha256:${fileDigest}`,
        size: contentBuffer.length,
        type: 'file' as const,
        mode: file.mode || '0644',
      };
    }),
    tree_hash: `sha256:${treeHash}`,
  };

  return { buffer, manifest };
}

/**
 * Unpack tar.zst format back to files
 * Used by both Sandbox and Fixer APIs
 */
export async function unpackTarZst(bundleBuffer: Buffer): Promise<BinaryFileData[]> {
  // Decompress with zstd
  const tarBuffer = await zstd.decompress(bundleBuffer);

  // Extract files from tar
  return new Promise((resolve, reject) => {
    const files: BinaryFileData[] = [];
    const extract = tar.extract();
    const { Readable } = require('stream');
    const stream = Readable.from(tarBuffer);

    extract.on('entry', (header: any, entryStream: any, next: any) => {
      // Only process files, skip directories
      if (header.type !== 'file') {
        entryStream.resume();
        return next();
      }

      const filePath = normalizePath(header.name);
      const chunks: Buffer[] = [];

      entryStream.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      entryStream.on('end', () => {
        const content = Buffer.concat(chunks);
        files.push({
          path: filePath,
          contents: content,
          mode: header.mode ? `0${header.mode.toString(8)}` : '0644',
        });
        next();
      });

      entryStream.on('error', reject);
    });

    extract.on('finish', () => {
      resolve(files);
    });

    extract.on('error', reject);

    stream.pipe(extract);
  });
}
