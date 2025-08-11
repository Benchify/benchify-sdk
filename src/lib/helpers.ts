import fs from 'fs';
import path from 'path';
import { minimatch } from 'minimatch';

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
