import fs from 'fs';
import path from 'path';
import { minimatch } from 'minimatch';
import { gzipSync, gunzipSync } from 'zlib';

export interface FileData {
  path: string;
  contents: string;
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
 * Convert files to package blob format (compressed base64 data + manifest)
 * This is the format expected by the Benchify API for efficient file transfer
 */
export function filesToPackageBlob(files: FileData[]): PackageBlob {
  // Create a combined buffer with all file contents
  // Format: [path_length][path][content_length][content]... (repeated for each file)
  const chunks: Buffer[] = [];
  const manifest: Array<{ path: string; size: number }> = [];

  for (const file of files) {
    const pathBuffer = Buffer.from(file.path, 'utf8');
    const contentBuffer = Buffer.from(file.contents, 'utf8');

    // Add path length (4 bytes), path, content length (4 bytes), content
    const pathLengthBuffer = Buffer.allocUnsafe(4);
    pathLengthBuffer.writeUInt32LE(pathBuffer.length, 0);

    const contentLengthBuffer = Buffer.allocUnsafe(4);
    contentLengthBuffer.writeUInt32LE(contentBuffer.length, 0);

    chunks.push(pathLengthBuffer, pathBuffer, contentLengthBuffer, contentBuffer);

    manifest.push({
      path: file.path,
      size: contentBuffer.length,
    });
  }

  // Combine all chunks and compress
  const combinedBuffer = Buffer.concat(chunks);
  const compressedBuffer = gzipSync(combinedBuffer);
  const base64Data = compressedBuffer.toString('base64');

  return {
    files_data: base64Data,
    files_manifest: manifest,
  };
}

/**
 * Convert package blob format back to files (for testing/debugging)
 */
export function packageBlobToFiles(blob: PackageBlob): FileData[] {
  const compressedBuffer = Buffer.from(blob.files_data, 'base64');
  const decompressedBuffer = gunzipSync(compressedBuffer);

  const files: FileData[] = [];
  let offset = 0;

  while (offset < decompressedBuffer.length) {
    // Read path length
    const pathLength = decompressedBuffer.readUInt32LE(offset);
    offset += 4;

    // Read path
    const pathBuffer = decompressedBuffer.subarray(offset, offset + pathLength);
    const path = pathBuffer.toString('utf8');
    offset += pathLength;

    // Read content length
    const contentLength = decompressedBuffer.readUInt32LE(offset);
    offset += 4;

    // Read content
    const contentBuffer = decompressedBuffer.subarray(offset, offset + contentLength);
    const contents = contentBuffer.toString('utf8');
    offset += contentLength;

    files.push({ path, contents });
  }

  return files;
}
