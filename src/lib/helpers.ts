import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { minimatch } from 'minimatch';
import * as tar from 'tar-stream';
import * as zstd from '@mongodb-js/zstd';
import { Benchify } from '../client';
import zlib from 'zlib';
import { toFile } from '../core/uploads';

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
 * Note: Assumes paths are already normalized
 */
export async function packTarZst(
  files: BinaryFileData[],
  options?: {
    buildTime?: number;
  },
): Promise<Buffer> {
  // Sort for deterministic output
  const sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path, 'en-US', { numeric: true }));

  // Create tar pack stream
  const pack = tar.pack();
  const chunks: Buffer[] = [];

  // Collect tar data
  pack.on('data', (chunk: Buffer) => {
    chunks.push(chunk);
  });

  // Add files to tar stream
  for (const file of sortedFiles) {
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
 * Calculate tree hash for content-addressable verification
 * Algorithm matches API specification exactly
 *
 * @internal Assumes paths are already normalized - only called by packWithManifest
 */
export function calculateTreeHash(files: BinaryFileData[]): string {
  if (files.length === 0) {
    return createHash('sha256').update('').digest('hex');
  }

  // 1. Sort by path using localeCompare with en-US locale
  const sorted = [...files].sort((a, b) => a.path.localeCompare(b.path, 'en-US', { numeric: true }));

  // 2. Build entries: calculate hash for each file
  const entries = sorted.map((file) => {
    const content =
      typeof file.contents === 'string' ? Buffer.from(file.contents, 'utf-8') : Buffer.from(file.contents);

    const hash = createHash('sha256').update(content).digest('hex');
    return `${file.path}:${hash}`;
  });

  // 3. Hash the concatenated entries
  const treeInput = entries.join('\n');
  return createHash('sha256').update(treeInput).digest('hex');
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
  options?: {
    buildTime?: number;
  },
): Promise<{ buffer: Buffer; manifest: Manifest }> {
  // 1. Normalize ALL paths first
  const normalizedFiles = files.map((file) => ({
    ...file,
    path: normalizePath(file.path),
  }));

  // 2. Calculate tree hash on normalized files
  const treeHash = calculateTreeHash(normalizedFiles);

  // 3. Pack files (packTarZst will sort internally)
  const buffer = await packTarZst(normalizedFiles, options);

  // 4. Calculate bundle hash
  const bundleDigest = createHash('sha256').update(buffer).digest('hex');

  // 5. Build manifest
  const manifest: Manifest = {
    manifest_version: '1',
    bundle: {
      digest: `sha256:${bundleDigest}`,
      size: buffer.length,
      format: 'tar.zst',
      compression: 'zstd',
    },
    files: normalizedFiles.map((file) => {
      const contentBuffer =
        typeof file.contents === 'string' ? Buffer.from(file.contents, 'utf-8') : Buffer.from(file.contents);
      const fileDigest = createHash('sha256').update(contentBuffer).digest('hex');

      return {
        path: file.path, // Already normalized
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
  // Detect archive format and obtain a tar buffer
  const isZstd =
    bundleBuffer.length >= 4 &&
    bundleBuffer[0] === 0x28 &&
    bundleBuffer[1] === 0xb5 &&
    bundleBuffer[2] === 0x2f &&
    bundleBuffer[3] === 0xfd; // Zstandard magic 28 B5 2F FD
  const isGzip = bundleBuffer.length >= 2 && bundleBuffer[0] === 0x1f && bundleBuffer[1] === 0x8b; // GZip magic 1F 8B

  let tarBuffer: Buffer;
  if (isZstd) {
    tarBuffer = await zstd.decompress(bundleBuffer);
  } else if (isGzip) {
    tarBuffer = zlib.gunzipSync(bundleBuffer);
  } else {
    // Assume it's already a tar stream
    tarBuffer = bundleBuffer;
  }

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

export interface BundleAndExtractParams {
  entrypoint: string;
  outputDir: string;
  dir?: string;
  tarballPath?: string;
  tarballFilename?: string;
  patterns?: string[];
  ignore?: string[];
}

export interface BundleAndExtractResult {
  outputDir: string;
  writtenPaths: string[];
  responsePath: string;
}

/**
 * Node-only helper that wraps the Stacks Bundle endpoints:
 * - If `dir` is provided, collects files and calls createFiles
 * - If `tarballPath` is provided, reads file as base64 and calls create
 * - Then unpacks the returned tar.zst bundle to `outputDir`
 */
export async function bundleAndExtract(
  client: Benchify,
  params: BundleAndExtractParams,
): Promise<BundleAndExtractResult> {
  const { entrypoint, outputDir, dir, tarballPath, tarballFilename, patterns, ignore } = params;

  if ((dir && tarballPath) || (!dir && !tarballPath)) {
    throw new Error('Provide exactly one of "dir" or "tarballPath".');
  }

  let contentBase64: string;
  let responsePath: string;

  if (dir) {
    const files = await collectFiles({
      basePath: dir,
      patterns: patterns ?? ['**/*'],
      ignore: ignore ?? DEFAULT_IGNORE,
    });
    const resp = await client.stacks.bundle.createFiles({
      entrypoint,
      files: files.map((f) => ({ path: f.path, content: f.contents })),
      ...(tarballFilename ? { tarball_filename: tarballFilename } : {}),
    });
    contentBase64 = resp.content;
    responsePath = resp.path;
  } else {
    const absTarballPath = path.resolve(tarballPath as string);
    const tarballBuffer = fs.readFileSync(absTarballPath);
    const tarballBase64 = Buffer.from(tarballBuffer).toString('base64');
    const resp = await client.stacks.bundle.create({
      entrypoint,
      tarball_base64: tarballBase64,
      ...(tarballFilename ? { tarball_filename: tarballFilename } : {}),
    });
    contentBase64 = resp.content;
    responsePath = resp.path;
  }

  // Unpack returned tar.zst to disk
  const bundleBuffer = Buffer.from(contentBase64, 'base64');
  const unpackedFiles = await unpackTarZst(bundleBuffer);

  const absOutputDir = path.resolve(outputDir);
  const writtenPaths: string[] = [];

  for (const file of unpackedFiles) {
    const targetPath = path.join(absOutputDir, file.path);
    const targetDir = path.dirname(targetPath);
    fs.mkdirSync(targetDir, { recursive: true });
    const contentBuffer = Buffer.isBuffer(file.contents) ? file.contents : Buffer.from(file.contents);
    fs.writeFileSync(targetPath, contentBuffer);
    if (file.mode) {
      try {
        fs.chmodSync(targetPath, parseInt(file.mode, 8));
      } catch {
        // ignore chmod errors
      }
    }
    writtenPaths.push(targetPath);
  }

  return { outputDir: absOutputDir, writtenPaths, responsePath };
}

export interface BundleProjectParams {
  /**
   * Files to include in the bundle
   */
  files: Array<{ path: string; contents: string }>;
  /**
   * Directory to write the unbundled response files into
  */
 outputDir: string;
 /**
  * Entrypoint path inside the bundle (e.g., index.html)
  */
 entrypoint?: string;
  /**
   * Optional server-side filename hint for the tarball
   */
  tarballFilename?: string;
  /**
   * If true, set host_code=true in the manifest and return the hosted URL
   */
  return_url?: boolean;
  /**
   * Optional deterministic build time for tar headers
   */
  buildTime?: number;
}

export interface BundleProjectResult {
  outputDir: string;
  writtenPaths: string[];
  responsePath: string;
  url?: string;
  files: Array<{ path: string; contents: string }>;
}

/**
 * Bundle wrapper:
 * - Packs Files into tar.zst and generates manifest
 * - Adds required entrypoint and optional host_code to manifest
 * - Uploads via multipart/form-data to /v1/stacks/bundle-multipart
 * - Decodes returned base64 bundle and extracts into outputDir
 * - If return_url=true, also returns the hosted URL (from response.path)
 */
export async function BundleProject(
  client: Benchify,
  params: BundleProjectParams,
): Promise<BundleProjectResult> {
  const { files, entrypoint, outputDir, tarballFilename, return_url, buildTime } = params;

  // 1) Pack files and create manifest
  const packOptions = buildTime != null ? { buildTime } : undefined;
  const { buffer: packedBuffer, manifest } = await packWithManifest(files, packOptions);

  // 2) Extend manifest per endpoint requirements
  const manifestToSend: any = {
    ...manifest,
    entrypoint,
    ...(return_url ? { host_code: true } : {}),
  };

  // 3) Convert packed buffer to File for multipart upload
  const tarballFile = await toFile(packedBuffer, tarballFilename ?? 'project.tar.zst', {
    type: 'application/octet-stream',
  });

  // 4) Call multipart endpoint
  const resp = await client.stacks.bundleMultipart({
    manifest: JSON.stringify(manifestToSend),
    tarball: tarballFile,
  });

  // 5) Unpack response bundle (base64-encoded tar.zst/gzip/tar)
  const writtenPaths: string[] = [];
  const absOutputDir = path.resolve(outputDir);
  let filesOut: Array<{ path: string; contents: string }> = [];

  if (resp.content && resp.content.length > 0) {
    const bundleBuffer = Buffer.from(resp.content, 'base64');
    const unpackedFiles = await unpackTarZst(bundleBuffer);
    filesOut = unpackedFiles.map((f) => ({
      path: f.path,
      contents: typeof f.contents === 'string' ? f.contents : Buffer.from(f.contents).toString('utf-8'),
    }));
    for (const file of unpackedFiles) {
      const targetPath = path.join(absOutputDir, file.path);
      const targetDir = path.dirname(targetPath);
      fs.mkdirSync(targetDir, { recursive: true });
      const contentBuffer = Buffer.isBuffer(file.contents) ? file.contents : Buffer.from(file.contents);
      fs.writeFileSync(targetPath, contentBuffer);
      if (file.mode) {
        try {
          fs.chmodSync(targetPath, parseInt(file.mode, 8));
        } catch {
          // ignore chmod errors
        }
      }
      writtenPaths.push(targetPath);
    }
  }

  const result: BundleProjectResult = {
    outputDir: absOutputDir,
    writtenPaths,
    responsePath: resp.path,
    files: filesOut,
  };
  if (return_url) {
    (result as any).url = resp.path;
  }
  return result;
}
