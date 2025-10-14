import fs from 'fs';
import path from 'path';
import { minimatch } from 'minimatch';
import { gzipSync, gunzipSync } from 'zlib';
import * as tar from 'tar-stream';

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
 * Package blob data structure for sending files in compressed format
 */
export interface PackageBlob {
  files_data: string;
  files_manifest: Array<{ path: string; size: number }>;
}

/**
 * Convert files to package blob format using BYTE-based processing
 * This eliminates JavaScript vs Python character counting discrepancies
 */
export function filesToPackageBlob(files: FileData[]): PackageBlob {
  // Work with BYTES throughout, not strings
  const manifest: Array<{ path: string; size: number }> = [];
  const fileBuffers: Buffer[] = [];

  for (const file of files) {
    // CRITICAL: Use BYTE length, not character length
    const contentBuffer =
      typeof file.contents === 'string' ? Buffer.from(file.contents, 'utf8') : Buffer.from(file.contents);
    const byteSize = contentBuffer.length; // This is UTF-8 byte count

    fileBuffers.push(contentBuffer);
    manifest.push({
      path: file.path,
      size: byteSize, // Store byte count, not character count
    });
  }

  // Concatenate ALL file buffers into single byte array
  const combinedBuffer = Buffer.concat(fileBuffers);
  const compressedBuffer = gzipSync(combinedBuffer);
  const base64Data = compressedBuffer.toString('base64');

  return {
    files_data: base64Data,
    files_manifest: manifest,
  };
}

/**
 * Convert package blob back to files using BYTE-based slicing
 */
export function packageBlobToFiles(blob: PackageBlob): FileData[] {
  const compressedBuffer = Buffer.from(blob.files_data, 'base64');
  const rawBytes = gunzipSync(compressedBuffer); // Keep as bytes!

  const files: FileData[] = [];
  let byteOffset = 0;

  for (const manifestEntry of blob.files_manifest) {
    const byteSize = manifestEntry.size; // This is UTF-8 byte count

    // Slice RAW BYTES first
    const fileBytes = rawBytes.subarray(byteOffset, byteOffset + byteSize);

    // THEN decode to string
    const contents = fileBytes.toString('utf8');

    files.push({
      path: manifestEntry.path,
      contents: contents,
    });

    byteOffset += byteSize;
  }

  return files;
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
 * Create a tar.gz blob from files using tar-stream (battle-tested and reliable)
 * Handles binary safety, deterministic output, and proper USTAR format
 */
export async function filesToTarGzBlob(
  files: BinaryFileData[],
  options?: {
    buildTime?: number;
  },
): Promise<Blob> {
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

  // Compress with gzip
  const gzippedData = gzipSync(tarData);

  return new Blob([new Uint8Array(gzippedData)], { type: 'application/octet-stream' });
}
