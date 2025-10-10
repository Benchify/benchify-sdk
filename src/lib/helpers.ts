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
 * Uses character-based counting to match Python's len() and string slicing
 */
export function filesToPackageBlob(files: FileData[]): PackageBlob {
  // Simple concatenation format - no binary length prefixes
  // Files are joined as UTF-8 strings, manifest tracks boundaries
  let combinedContent = '';
  const manifest: Array<{ path: string; size: number }> = [];
  let currentOffset = 0;

  for (const file of files) {
    // Use character count to match Python's len() behavior
    const contentLength = file.contents.length;

    // Add content to combined string
    combinedContent += file.contents;

    // Track file in manifest with character count (matches Python len())
    manifest.push({
      path: file.path,
      size: contentLength,
    });

    currentOffset += contentLength;
  }

  // Convert to buffer, compress, and encode
  const combinedBuffer = Buffer.from(combinedContent, 'utf8');
  const compressedBuffer = gzipSync(combinedBuffer);
  const base64Data = compressedBuffer.toString('base64');

  return {
    files_data: base64Data,
    files_manifest: manifest,
  };
}

/**
 * Convert package blob format back to files (for testing/debugging)
 * Uses character-based slicing to match Python's string behavior
 */
export function packageBlobToFiles(blob: PackageBlob): FileData[] {
  const compressedBuffer = Buffer.from(blob.files_data, 'base64');
  const decompressedBuffer = gunzipSync(compressedBuffer);

  // Convert back to UTF-8 string
  const combinedContent = decompressedBuffer.toString('utf8');

  const files: FileData[] = [];
  let characterOffset = 0;

  for (const manifestEntry of blob.files_manifest) {
    // Use character-based slicing to match Python's string slicing behavior
    // Manifest now contains character counts, not byte counts
    const contents = combinedContent.slice(characterOffset, characterOffset + manifestEntry.size);

    files.push({
      path: manifestEntry.path,
      contents: contents,
    });

    characterOffset += manifestEntry.size;
  }

  return files;
}
