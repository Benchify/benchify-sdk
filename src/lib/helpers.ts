import fs from 'fs';
import path from 'path';
import minimatch from 'minimatch';
import pkg from 'glob';
const { glob } = pkg;

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

export async function collectFiles({
  basePath = process.cwd(),
  patterns = DEFAULT_PATTERNS,
  ignore = DEFAULT_IGNORE,
}: { basePath?: string; patterns?: string[]; ignore?: string[] } = {}): Promise<FileData[]> {
  const originalCwd = process.cwd();

  try {
    process.chdir(basePath);

    const allFilePaths: string[] = [];
    for (const pattern of patterns) {
      const globResult = glob.sync(pattern, { nodir: true });
      const filtered = globResult.filter(
        (match: string) => !ignore.some((ignorePattern) => minimatch(match, ignorePattern)),
      );
      allFilePaths.push(...filtered);
    }

    const filePaths = [...new Set(allFilePaths)];

    const files: FileData[] = [];

    for (const filePath of filePaths) {
      try {
        const contents = fs.readFileSync(path.resolve(basePath, filePath), 'utf8');
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
  } finally {
    process.chdir(originalCwd);
  }
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
