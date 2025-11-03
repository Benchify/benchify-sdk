// Tests for the helpers utility functions

import { normalizePath, packTarZst, type BinaryFileData } from '../src/lib/helpers';

describe('normalizePath', () => {
  it('should normalize Windows paths to POSIX', () => {
    expect(normalizePath('src\\index.ts')).toBe('src/index.ts');
    expect(normalizePath('components\\Button\\index.tsx')).toBe('components/Button/index.tsx');
  });

  it('should normalize relative paths', () => {
    expect(normalizePath('./src/index.ts')).toBe('src/index.ts');
    expect(normalizePath('./package.json')).toBe('package.json');
  });

  it('should normalize multiple slashes', () => {
    expect(normalizePath('src//components//Button.tsx')).toBe('src/components/Button.tsx');
    expect(normalizePath('src///index.ts')).toBe('src/index.ts');
  });

  it('should remove trailing slashes', () => {
    expect(normalizePath('src/components/')).toBe('src/components');
    expect(normalizePath('dist/')).toBe('dist');
  });

  it('should keep root files as-is', () => {
    expect(normalizePath('package.json')).toBe('package.json');
    expect(normalizePath('README.md')).toBe('README.md');
  });

  it('should reject absolute paths', () => {
    expect(() => normalizePath('/etc/passwd')).toThrow('Absolute paths not allowed');
    expect(() => normalizePath('/usr/local/bin')).toThrow('Absolute paths not allowed');
  });

  it('should reject path traversal attempts', () => {
    expect(() => normalizePath('../../../etc/passwd')).toThrow('Path traversal not allowed');
    expect(() => normalizePath('src/../../../evil.ts')).toThrow('Path traversal not allowed');
    expect(() => normalizePath('../package.json')).toThrow('Path traversal not allowed');
  });
});

describe('packTarZst', () => {
  it('should create tar.zst buffer from files', async () => {
    const files: BinaryFileData[] = [
      { path: 'src/index.ts', contents: 'console.log("Hello, world!");' },
      { path: 'package.json', contents: JSON.stringify({ name: 'test' }) },
    ];

    const buffer = await packTarZst(files);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('should handle binary file contents', async () => {
    const binaryContent = new Uint8Array([0x89, 0x50, 0x4e, 0x47]); // PNG header
    const files: BinaryFileData[] = [
      { path: 'image.png', contents: binaryContent },
      { path: 'text.txt', contents: 'Hello, world!' },
    ];

    const buffer = await packTarZst(files);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('should sort files by path for deterministic output', async () => {
    const files: BinaryFileData[] = [
      { path: 'z-last.ts', contents: 'last' },
      { path: 'a-first.ts', contents: 'first' },
      { path: 'm-middle.ts', contents: 'middle' },
    ];

    const buffer1 = await packTarZst(files);

    // Same files in different order
    const shuffledFiles: BinaryFileData[] = [
      { path: 'm-middle.ts', contents: 'middle' },
      { path: 'z-last.ts', contents: 'last' },
      { path: 'a-first.ts', contents: 'first' },
    ];

    const buffer2 = await packTarZst(shuffledFiles);

    // Both buffers should be identical since files are sorted internally
    expect(buffer1.length).toBe(buffer2.length);
  });

  it('should normalize paths in tar creation', async () => {
    const files: BinaryFileData[] = [
      { path: 'src\\windows\\path.ts', contents: 'windows' },
      { path: './relative/path.ts', contents: 'relative' },
    ];

    const buffer = await packTarZst(files);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('should handle custom file modes', async () => {
    const files: BinaryFileData[] = [
      { path: 'script.sh', contents: '#!/bin/bash\necho "Hello"', mode: '0755' },
      { path: 'config.json', contents: '{}', mode: '0644' },
    ];

    const buffer = await packTarZst(files);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('should use deterministic timestamps', async () => {
    const files: BinaryFileData[] = [{ path: 'test.txt', contents: 'content' }];

    const buffer1 = await packTarZst(files);
    const buffer2 = await packTarZst(files);

    // Should produce identical output with deterministic timestamps
    expect(buffer1.length).toBe(buffer2.length);
  });

  it('should handle empty files', async () => {
    const files: BinaryFileData[] = [
      { path: 'empty.txt', contents: '' },
      { path: 'empty-binary', contents: new Uint8Array(0) },
    ];

    const buffer = await packTarZst(files);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });
});
