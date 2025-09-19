// Conditionally load Node.js modules to avoid errors in browser environments
let fs: any;
let path: any;
let process: any;

try {
  fs = require('fs');
  path = require('path');
  process = require('process');
} catch (err) {
  // Node.js modules not available - will throw helpful error when functions are used
  fs = null;
  path = null;
  process = null;
}

function ensureNodeEnvironment(functionName: string) {
  if (!fs || !path || !process) {
    throw new Error(
      `${functionName} requires Node.js environment and is not available in browsers.\n` +
      'This function uses Node.js filesystem APIs (fs, path) which are not available in browser environments.\n' +
      'Please use this function only in Node.js server-side code.'
    );
  }
}

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
  basePath,
  patterns = DEFAULT_PATTERNS,
  ignore = DEFAULT_IGNORE,
}: { basePath?: string; patterns?: string[]; ignore?: string[] } = {}): Promise<FileData[]> {
  ensureNodeEnvironment('collectFiles');

  const defaultBasePath = basePath || process.cwd();
  const resolvedBasePath = path.resolve(defaultBasePath);
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
  basePath,
}: {
  files: FileData[];
  basePath?: string;
}): void {
  ensureNodeEnvironment('applyChanges');

  const defaultBasePath = basePath || process.cwd();
  for (const file of files) {
    try {
      const fullPath = path.resolve(defaultBasePath, file.path);
      const dirPath = path.dirname(fullPath);

      fs.mkdirSync(dirPath, { recursive: true });
      fs.writeFileSync(fullPath, file.contents, 'utf8');
    } catch {
      continue;
    }
  }
}
