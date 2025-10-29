// Tests for the Stack wrapper functionality

import { Benchify } from '../src/client';
import { Stack, StackHandle, type StackFile, type FileChange } from '../src/sandbox';
import { ConflictError, APIError } from '../src/core/error';

// Mock the client's stack API
const mockStackAPI = {
  create: jest.fn(),
  retrieve: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
};

const mockClient = {
  stacks: mockStackAPI,
} as any as Benchify;

describe('Stack', () => {
  let stack: Stack;

  beforeEach(() => {
    stack = new Stack(mockClient);
    jest.clearAllMocks();
  });

  describe('create()', () => {
    const testFiles: StackFile[] = [
      { path: 'src/index.ts', contents: 'console.log("Hello, world!");' },
      { path: 'package.json', contents: JSON.stringify({ name: 'test-app' }) },
    ];

    it('should create a sandbox and return a handle', async () => {
      const mockResponse = {
        id: 'sandbox-123',
        url: 'https://stack.example.com',
        kind: 'single' as const,
        etag: 'etag-456',
        contentHash: 'hash-789',
        phase: 'running' as const,
      };

      mockStackAPI.create.mockResolvedValueOnce(mockResponse);

      const handle = await stack.create(testFiles);

      expect(handle).toBeInstanceOf(StackHandle);
      expect(handle.id).toBe('sandbox-123');
      expect(handle.url).toBe('https://stack.example.com');
      expect(handle.kind).toBe('single');

      expect(mockStackAPI.create).toHaveBeenCalledWith({
        bundle: expect.any(File),
        manifest: expect.any(File),
        'content-hash': expect.any(String),
        'idempotency-key': expect.any(String),
      });

      // Verify manifest structure
      const callArgs = mockStackAPI.create.mock.calls[0][0];
      // manifest is now a File object, we need to read its contents
      const manifestText = await callArgs.manifest.text();
      const manifest = JSON.parse(manifestText);
      expect(manifest).toHaveProperty('manifest_version');
      expect(manifest).toHaveProperty('bundle');
      expect(manifest).toHaveProperty('files');
      expect(manifest).toHaveProperty('tree_hash');
      expect(manifest.manifest_version).toBe('1');
      expect(manifest.bundle.format).toBe('tar.zst');
      expect(manifest.bundle.compression).toBe('zstd');
      expect(manifest.files).toBeInstanceOf(Array);
      expect(manifest.files[0]).toHaveProperty('path');
      expect(manifest.files[0]).toHaveProperty('digest');
    });

    it('should create a stack sandbox with services', async () => {
      const mockResponse = {
        id: 'stack-123',
        url: 'https://stack.example.com',
        kind: 'stack' as const,
        etag: 'etag-456',
        contentHash: 'hash-789',
        phase: 'running' as const,
        services: [
          {
            id: 'service-1',
            name: 'frontend',
            phase: 'running' as const,
            role: 'frontend' as const,
            workspacePath: 'frontend/',
          },
          {
            id: 'service-2',
            name: 'backend',
            phase: 'running' as const,
            role: 'backend' as const,
            workspacePath: 'backend/',
          },
        ],
      };

      mockStackAPI.create.mockResolvedValueOnce(mockResponse);

      const handle = await stack.create(testFiles);

      expect(handle.kind).toBe('stack');
      expect(handle.stackId).toBe('stack-123');
    });

    it('should include options when provided', async () => {
      const mockResponse = {
        id: 'sandbox-123',
        url: 'https://stack.example.com',
        kind: 'single' as const,
        etag: 'etag-456',
        contentHash: 'hash-789',
        phase: 'running' as const,
      };

      mockStackAPI.create.mockResolvedValueOnce(mockResponse);

      const options = {
        name: 'test-sandbox',
        port: 3000,
        buildCommand: 'npm run build',
        startCommand: 'npm start',
        runtime: {
          nodeVersion: '18.x',
          packageManager: 'npm' as const,
          framework: 'react' as const,
        },
      };

      await stack.create(testFiles, options);

      expect(mockStackAPI.create).toHaveBeenCalledWith({
        bundle: expect.any(File),
        manifest: expect.any(File),
        options: expect.any(String),
        'content-hash': expect.any(String),
        'idempotency-key': expect.any(String),
      });
    });

    it('should filter out ignored files', async () => {
      const filesWithIgnored: StackFile[] = [
        { path: 'src/index.ts', contents: 'console.log("Hello, world!");' },
        { path: 'node_modules/package/index.js', contents: 'module.exports = {}' },
        { path: '.git/config', contents: '[core]' },
        { path: 'package-lock.json', contents: '{}' },
      ];

      const mockResponse = {
        id: 'sandbox-123',
        url: 'https://stack.example.com',
        kind: 'single' as const,
        etag: 'etag-456',
        contentHash: 'hash-789',
        phase: 'running' as const,
      };

      mockStackAPI.create.mockResolvedValueOnce(mockResponse);

      await stack.create(filesWithIgnored);

      const callArgs = mockStackAPI.create.mock.calls[0][0];
      expect(callArgs.bundle).toBeInstanceOf(File);
      expect(callArgs.bundle.type).toBe('application/octet-stream');
    });

    it('should handle Uint8Array file contents', async () => {
      const filesWithBytes: StackFile[] = [
        { path: 'src/index.ts', contents: new TextEncoder().encode('console.log("Hello!");') },
      ];

      const mockResponse = {
        id: 'sandbox-123',
        url: 'https://stack.example.com',
        kind: 'single' as const,
        etag: 'etag-456',
        contentHash: 'hash-789',
        phase: 'running' as const,
      };

      mockStackAPI.create.mockResolvedValueOnce(mockResponse);

      const handle = await stack.create(filesWithBytes);

      expect(handle.id).toBe('sandbox-123');
      expect(mockStackAPI.create).toHaveBeenCalled();
    });

    it('should normalize API errors', async () => {
      const apiError = new APIError(400, { message: 'Bad request' }, 'Bad request', new Headers());
      mockStackAPI.create.mockRejectedValueOnce(apiError);

      await expect(stack.create(testFiles)).rejects.toMatchObject({
        code: 'API',
        message: '400 Bad request',
      });
    });

    it('should normalize file paths and reject dangerous paths', async () => {
      const dangerousFiles: StackFile[] = [{ path: '/absolute/path.ts', contents: 'console.log("Bad");' }];

      await expect(stack.create(dangerousFiles)).rejects.toThrow('Absolute paths not allowed');
    });

    it('should reject path traversal attempts', async () => {
      const traversalFiles: StackFile[] = [
        { path: 'src/../../../evil.ts', contents: 'console.log("Evil");' },
      ];

      await expect(stack.create(traversalFiles)).rejects.toThrow('Path traversal not allowed');
    });

    it('should normalize Windows-style paths', async () => {
      const windowsFiles: StackFile[] = [
        { path: 'src\\index.ts', contents: 'console.log("Windows");' },
        { path: '.\\package.json', contents: '{}' },
      ];

      const mockResponse = {
        id: 'sandbox-123',
        url: 'https://stack.example.com',
        kind: 'single' as const,
        etag: 'etag-456',
        contentHash: 'hash-789',
        phase: 'running' as const,
      };

      mockStackAPI.create.mockResolvedValueOnce(mockResponse);

      await stack.create(windowsFiles);

      const callArgs = mockStackAPI.create.mock.calls[0][0];
      // manifest is now a File object, we need to read its contents
      const manifestText = await callArgs.manifest.text();
      const manifest = JSON.parse(manifestText);

      // Paths should be normalized to POSIX format and sorted
      expect(manifest.files[0].path).toBe('package.json'); // Comes first alphabetically
      expect(manifest.files[1].path).toBe('src/index.ts');
    });

    it('should generate deterministic output with sorted files', async () => {
      const unsortedFiles: StackFile[] = [
        { path: 'z-last.ts', contents: 'console.log("Last");' },
        { path: 'a-first.ts', contents: 'console.log("First");' },
        { path: 'm-middle.ts', contents: 'console.log("Middle");' },
      ];

      const mockResponse = {
        id: 'sandbox-123',
        url: 'https://stack.example.com',
        kind: 'single' as const,
        etag: 'etag-456',
        contentHash: 'hash-789',
        phase: 'running' as const,
      };

      mockStackAPI.create.mockResolvedValueOnce(mockResponse);

      await stack.create(unsortedFiles);

      const callArgs = mockStackAPI.create.mock.calls[0][0];
      // manifest is now a File object, we need to read its contents
      const manifestText = await callArgs.manifest.text();
      const manifest = JSON.parse(manifestText);

      // Files should be sorted by path in manifest
      expect(manifest.files[0].path).toBe('a-first.ts');
      expect(manifest.files[1].path).toBe('m-middle.ts');
      expect(manifest.files[2].path).toBe('z-last.ts');
    });
  });
});

describe('StackHandle', () => {
  let handle: StackHandle;
  const testFiles: StackFile[] = [{ path: 'src/index.ts', contents: 'console.log("Hello, world!");' }];

  beforeEach(() => {
    handle = new StackHandle(
      mockClient,
      'sandbox-123',
      'https://stack.example.com',
      'single',
      'etag-456',
      undefined,
      undefined,
      testFiles,
    );
    jest.clearAllMocks();
  });

  describe('status()', () => {
    it('should retrieve sandbox status', async () => {
      const mockStatus = {
        id: 'sandbox-123',
        etag: 'etag-789',
        phase: 'running' as const,
      };

      mockStackAPI.retrieve.mockResolvedValueOnce(mockStatus);

      const status = await handle.status();

      expect(status).toEqual(mockStatus);
      expect(mockStackAPI.retrieve).toHaveBeenCalledWith('sandbox-123');
    });

    it('should update internal etag after status call', async () => {
      const mockStatus = {
        id: 'sandbox-123',
        etag: 'new-etag-789',
        phase: 'running' as const,
      };

      mockStackAPI.retrieve.mockResolvedValueOnce(mockStatus);

      await handle.status();

      // The etag should be updated internally (we can verify this through subsequent calls)
      expect(mockStackAPI.retrieve).toHaveBeenCalledWith('sandbox-123');
    });
  });

  describe('apply()', () => {
    it('should apply single file update', async () => {
      const changes: FileChange[] = [{ path: 'src/index.ts', contents: 'console.log("Updated!");' }];

      const mockResponse = {
        id: 'sandbox-123',
        applied: 1,
        etag: 'new-etag-789',
        phase: 'running' as const,
        restarted: false,
      };

      mockStackAPI.update.mockResolvedValueOnce(mockResponse);

      await handle.apply(changes);

      expect(mockStackAPI.update).toHaveBeenCalledWith(
        'sandbox-123',
        expect.objectContaining({
          bundle: expect.any(File),
          manifest: expect.any(File),
          'base-etag': 'etag-456',
          'idempotency-key': expect.any(String),
        }),
      );

      // Verify manifest structure for updates
      const callArgs = mockStackAPI.update.mock.calls[0][1];
      // manifest is now a File object, we need to read its contents
      const manifestText = await callArgs.manifest.text();
      const manifest = JSON.parse(manifestText);
      expect(manifest).toHaveProperty('manifest_version');
      expect(manifest).toHaveProperty('bundle');
      expect(manifest).toHaveProperty('files');
      expect(manifest).toHaveProperty('tree_hash');
      expect(manifest.manifest_version).toBe('1');
      expect(manifest.bundle.format).toBe('tar.zst');
    });

    it('should handle file deletions only (no packed data)', async () => {
      const changes: FileChange[] = [
        { path: 'src/unused.ts' }, // undefined contents = delete
      ];

      const mockResponse = {
        id: 'sandbox-123',
        applied: 1,
        etag: 'new-etag-789',
        phase: 'running' as const,
        restarted: false,
      };

      mockStackAPI.update.mockResolvedValueOnce(mockResponse);

      await handle.apply(changes);

      const callArgs = mockStackAPI.update.mock.calls[0][1];
      expect(callArgs.ops).toBe('[{"op":"remove","path":"src/unused.ts"}]');
      expect(callArgs.packed).toBeUndefined();
      expect(callArgs.manifest).toBeUndefined();
    });

    it('should use packed format for file changes', async () => {
      // Create multiple changes to verify packing works
      const changes: FileChange[] = Array.from({ length: 5 }, (_, i) => ({
        path: `src/file${i}.ts`,
        contents: `console.log("File ${i}");`,
      }));

      const mockResponse = {
        id: 'sandbox-123',
        applied: 5,
        etag: 'new-etag-789',
        phase: 'running' as const,
        restarted: false,
      };

      mockStackAPI.update.mockResolvedValueOnce(mockResponse);

      await handle.apply(changes);

      const callArgs = mockStackAPI.update.mock.calls[0][1];
      expect(callArgs.bundle).toBeDefined();
      expect(callArgs.manifest).toBeDefined();

      // Verify bundle file is correct type
      expect(callArgs.bundle.type).toBe('application/octet-stream');
    });

    it('should handle 409 conflict with retry', async () => {
      const changes: FileChange[] = [{ path: 'src/index.ts', contents: 'console.log("Updated!");' }];

      const conflictError = new ConflictError(409, { message: 'Conflict' }, 'Conflict', new Headers());
      const statusResponse = {
        id: 'sandbox-123',
        etag: 'newer-etag-999',
        phase: 'running' as const,
      };
      const successResponse = {
        id: 'sandbox-123',
        applied: 1,
        etag: 'final-etag-000',
        phase: 'running' as const,
        restarted: false,
      };

      mockStackAPI.update.mockRejectedValueOnce(conflictError).mockResolvedValueOnce(successResponse);
      mockStackAPI.retrieve.mockResolvedValueOnce(statusResponse);

      await handle.apply(changes);

      expect(mockStackAPI.update).toHaveBeenCalledTimes(2);
      expect(mockStackAPI.retrieve).toHaveBeenCalledTimes(1);
    });

    it('should fail after one retry attempt', async () => {
      const changes: FileChange[] = [{ path: 'src/index.ts', contents: 'console.log("Updated!");' }];

      const conflictError = new ConflictError(409, { message: 'Conflict' }, 'Conflict', new Headers());
      const statusResponse = {
        id: 'sandbox-123',
        etag: 'newer-etag-999',
        phase: 'running' as const,
      };

      mockStackAPI.update.mockRejectedValueOnce(conflictError).mockRejectedValueOnce(conflictError);
      mockStackAPI.retrieve.mockResolvedValueOnce(statusResponse);

      await expect(handle.apply(changes)).rejects.toMatchObject({
        code: 'CONFLICT',
        message: '409 Conflict',
      });

      expect(mockStackAPI.update).toHaveBeenCalledTimes(2);
      expect(mockStackAPI.retrieve).toHaveBeenCalledTimes(1);
    });

    it('should skip unchanged files', async () => {
      // Apply the same content that was already there
      const changes: FileChange[] = [
        { path: 'src/index.ts', contents: 'console.log("Hello, world!");' }, // Same as initial
      ];

      const mockResponse = {
        id: 'sandbox-123',
        applied: 0,
        etag: 'etag-456', // Same etag since no changes
        phase: 'running' as const,
        restarted: false,
      };

      mockStackAPI.update.mockResolvedValueOnce(mockResponse);

      await handle.apply(changes);

      // Should still make the API call, but with no packed data since no actual changes
      const callArgs = mockStackAPI.update.mock.calls[0][1];
      expect(callArgs.packed).toBeUndefined();
      expect(callArgs.manifest).toBeUndefined();
      expect(callArgs.ops).toBeUndefined();
    });
  });

  describe('destroy()', () => {
    it('should delete the sandbox', async () => {
      mockStackAPI.destroy.mockResolvedValueOnce(undefined);

      await handle.destroy();

      expect(mockStackAPI.destroy).toHaveBeenCalledWith('sandbox-123');
    });

    it('should normalize API errors', async () => {
      const apiError = new APIError(404, { message: 'Not found' }, 'Not found', new Headers());
      mockStackAPI.destroy.mockRejectedValueOnce(apiError);

      await expect(handle.destroy()).rejects.toMatchObject({
        code: 'API',
        message: '404 Not found',
      });
    });
  });

  describe('mixed operations', () => {
    it('should handle mixed add/update/delete operations', async () => {
      const changes: FileChange[] = [
        { path: 'src/index.ts', contents: 'console.log("Updated!");' }, // update
        { path: 'src/new-file.ts', contents: 'export const newFunction = () => {};' }, // add
        { path: 'src/old-file.ts' }, // delete (undefined contents)
      ];

      const mockResponse = {
        id: 'sandbox-123',
        applied: 3,
        etag: 'new-etag-789',
        phase: 'running' as const,
        restarted: true,
      };

      mockStackAPI.update.mockResolvedValueOnce(mockResponse);

      await handle.apply(changes);

      const callArgs = mockStackAPI.update.mock.calls[0][1];
      expect(callArgs.ops).toBe('[{"op":"remove","path":"src/old-file.ts"}]');
      expect(callArgs.bundle).toBeDefined(); // Always pack when there are file changes for consistency
      expect(callArgs.manifest).toBeDefined(); // Should include manifest with file changes
    });
  });

  describe('stack operations', () => {
    it('should handle stack edits without changing public DX', async () => {
      const stackHandle = new StackHandle(
        mockClient,
        'stack-123',
        'https://stack.example.com',
        'stack',
        'etag-456',
        'stack-123',
        { 'frontend/': 'service-1', 'backend/': 'service-2' },
        testFiles,
      );

      const changes: FileChange[] = [
        { path: 'frontend/src/App.tsx', contents: '<div>Updated App</div>' },
        { path: 'backend/src/server.ts', contents: 'console.log("Updated server");' },
      ];

      const mockResponse = {
        id: 'stack-123',
        applied: 2,
        etag: 'new-etag-789',
        phase: 'running' as const,
        restarted: false,
        affectedServices: ['service-1', 'service-2'],
      };

      mockStackAPI.update.mockResolvedValueOnce(mockResponse);

      await stackHandle.apply(changes);

      expect(mockStackAPI.update).toHaveBeenCalledWith('stack-123', expect.any(Object));
    });
  });

  describe('path normalization in updates', () => {
    it('should normalize paths in file changes', async () => {
      const changes: FileChange[] = [
        { path: 'src\\windows\\path.ts', contents: 'console.log("Windows path");' },
        { path: './relative/path.ts', contents: 'console.log("Relative path");' },
      ];

      const mockResponse = {
        id: 'sandbox-123',
        applied: 2,
        etag: 'new-etag-789',
        phase: 'running' as const,
        restarted: false,
      };

      mockStackAPI.update.mockResolvedValueOnce(mockResponse);

      await handle.apply(changes);

      const callArgs = mockStackAPI.update.mock.calls[0][1];
      // manifest is now a File object, we need to read its contents
      const manifestText = await callArgs.manifest.text();
      const manifest = JSON.parse(manifestText);

      // Paths should be normalized to POSIX format
      expect(manifest.files[0].path).toBe('relative/path.ts');
      expect(manifest.files[1].path).toBe('src/windows/path.ts');
    });

    it('should reject dangerous paths in updates', async () => {
      const changes: FileChange[] = [{ path: '../../../evil.ts', contents: 'console.log("Evil");' }];

      // Path validation should throw before any API call is made
      await expect(handle.apply(changes)).rejects.toMatchObject({
        code: 'UNKNOWN_ERROR',
        message: expect.stringContaining('Path traversal not allowed'),
      });

      // Verify no API call was made due to early validation failure
      expect(mockStackAPI.update).not.toHaveBeenCalled();
    });

    it('should normalize deletion paths', async () => {
      const changes: FileChange[] = [
        { path: 'src\\to\\delete.ts' }, // Windows path deletion
      ];

      const mockResponse = {
        id: 'sandbox-123',
        applied: 1,
        etag: 'new-etag-789',
        phase: 'running' as const,
        restarted: false,
      };

      mockStackAPI.update.mockResolvedValueOnce(mockResponse);

      await handle.apply(changes);

      const callArgs = mockStackAPI.update.mock.calls[0][1];
      expect(callArgs.ops).toBe('[{"op":"remove","path":"src/to/delete.ts"}]');
    });
  });
});
