import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

export interface FileData {
  path: string;
  contents: string;
}

const DEFAULT_PATTERNS = [
  '**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx',
  '**/package.json', '**/tsconfig*.json', '**/*.config.*'
];

const DEFAULT_IGNORE = [
  'node_modules/**',
  '.claude/**',
  '.git/**',
  'dist/**',
  'build/**',
  '.next/**',
  'coverage/**',
  '**/.env*'
];

export async function collectFiles(
  basePath: string = process.cwd(),
  patterns: string[] = DEFAULT_PATTERNS,
  ignore: string[] = DEFAULT_IGNORE
): Promise<FileData[]> {
  const originalCwd = process.cwd();
  
  try {
    process.chdir(basePath);
    
    const allFilePaths: string[] = [];
    for (const pattern of patterns) {
      const filePaths = await glob(pattern, {
        ignore,
        nodir: true,
        absolute: false
      });
      allFilePaths.push(...filePaths);
    }
    
    const filePaths = [...new Set(allFilePaths)];

    const files: FileData[] = [];

    for (const filePath of filePaths) {
      try {
        const content = fs.readFileSync(path.resolve(basePath, filePath), 'utf8');
        if (content.trim()) {
          files.push({ 
            path: filePath, 
            content 
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

export function applyChanges(
  changedFiles: FileData[],
  basePath: string = process.cwd()
): void {
  for (const file of changedFiles) {
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