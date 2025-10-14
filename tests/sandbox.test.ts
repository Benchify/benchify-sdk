// Tests for the Sandbox wrapper functionality

import { Benchify } from '../src/client';
import { Sandbox, SandboxHandle, type SandboxFile, type FileChange } from '../src/sandbox';
import { ConflictError, APIError } from '../src/core/error';

// Mock the client's sandbox API
const mockSandboxAPI = {
  create: jest.fn(),
  retrieve: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockClient = {
  sandboxes: mockSandboxAPI,
} as any as Benchify;

describe('Sandbox', () => {
  let sandbox: Sandbox;

  beforeEach(() => {
    sandbox = new Sandbox(mockClient);
    jest.clearAllMocks();
  });

  describe('create()', () => {
    const testFiles: SandboxFile[] = [
      { path: 'src/index.ts', contents: 'console.log("Hello, world!");' },
      { path: 'package.json', contents: JSON.stringify({ name: 'test-app' }) },
    ];

    it('should create a sandbox and return a handle', async () => {
      const mockResponse = {
        id: 'sandbox-123',
        url: 'https://sandbox.example.com',
        kind: 'single' as const,
        etag: 'etag-456',
        contentHash: 'hash-789',
        phase: 'running' as const,
      };

      mockSandboxAPI.create.mockResolvedValueOnce(mockResponse);

      const handle = await sandbox.create(testFiles);

      expect(handle).toBeInstanceOf(SandboxHandle);
      expect(handle.id).toBe('sandbox-123');
      expect(handle.url).toBe('https://sandbox.example.com');
      expect(handle.kind).toBe('single');

      expect(mockSandboxAPI.create).toHaveBeenCalledWith({
        blob: expect.objectContaining({
          files_data: expect.any(String),
          files_manifest: expect.arrayContaining([
            expect.objectContaining({
              path: 'src/index.ts',
              size: expect.any(Number),
            }),
            expect.objectContaining({
              path: 'package.json',
              size: expect.any(Number),
            }),
          ]),
          format: 'gzip-base64',
        }),
        'Content-Hash': expect.any(String),
        'Idempotency-Key': expect.any(String),
      });
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

      mockSandboxAPI.create.mockResolvedValueOnce(mockResponse);

      const handle = await sandbox.create(testFiles);

      expect(handle.kind).toBe('stack');
      expect(handle.stackId).toBe('stack-123');
    });

    it('should include options when provided', async () => {
      const mockResponse = {
        id: 'sandbox-123',
        url: 'https://sandbox.example.com',
        kind: 'single' as const,
        etag: 'etag-456',
        contentHash: 'hash-789',
        phase: 'running' as const,
      };

      mockSandboxAPI.create.mockResolvedValueOnce(mockResponse);

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

      await sandbox.create(testFiles, options);

      expect(mockSandboxAPI.create).toHaveBeenCalledWith({
        blob: expect.any(Object),
        options: { options },
        'Content-Hash': expect.any(String),
        'Idempotency-Key': expect.any(String),
      });
    });

    it('should filter out ignored files', async () => {
      const filesWithIgnored: SandboxFile[] = [
        { path: 'src/index.ts', contents: 'console.log("Hello, world!");' },
        { path: 'node_modules/package/index.js', contents: 'module.exports = {}' },
        { path: '.git/config', contents: '[core]' },
        { path: 'package-lock.json', contents: '{}' },
      ];

      const mockResponse = {
        id: 'sandbox-123',
        url: 'https://sandbox.example.com',
        kind: 'single' as const,
        etag: 'etag-456',
        contentHash: 'hash-789',
        phase: 'running' as const,
      };

      mockSandboxAPI.create.mockResolvedValueOnce(mockResponse);

      await sandbox.create(filesWithIgnored);

      const callArgs = mockSandboxAPI.create.mock.calls[0][0];
      expect(callArgs.blob.files_manifest).toHaveLength(1);
      expect(callArgs.blob.files_manifest[0].path).toBe('src/index.ts');
    });

    it('should handle Uint8Array file contents', async () => {
      const filesWithBytes: SandboxFile[] = [
        { path: 'src/index.ts', contents: new TextEncoder().encode('console.log("Hello!");') },
      ];

      const mockResponse = {
        id: 'sandbox-123',
        url: 'https://sandbox.example.com',
        kind: 'single' as const,
        etag: 'etag-456',
        contentHash: 'hash-789',
        phase: 'running' as const,
      };

      mockSandboxAPI.create.mockResolvedValueOnce(mockResponse);

      const handle = await sandbox.create(filesWithBytes);

      expect(handle.id).toBe('sandbox-123');
      expect(mockSandboxAPI.create).toHaveBeenCalled();
    });

    it('should normalize API errors', async () => {
      const apiError = new APIError(400, { message: 'Bad request' }, 'Bad request', new Headers());
      mockSandboxAPI.create.mockRejectedValueOnce(apiError);

      await expect(sandbox.create(testFiles)).rejects.toMatchObject({
        code: 'APIERROR',
        message: 'Bad request',
      });
    });
  });
});

describe('SandboxHandle', () => {
  let handle: SandboxHandle;
  const testFiles: SandboxFile[] = [{ path: 'src/index.ts', contents: 'console.log("Hello, world!");' }];

  beforeEach(() => {
    handle = new SandboxHandle(
      mockClient,
      'sandbox-123',
      'https://sandbox.example.com',
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

      mockSandboxAPI.retrieve.mockResolvedValueOnce(mockStatus);

      const status = await handle.status();

      expect(status).toEqual(mockStatus);
      expect(mockSandboxAPI.retrieve).toHaveBeenCalledWith('sandbox-123');
    });

    it('should update internal etag after status call', async () => {
      const mockStatus = {
        id: 'sandbox-123',
        etag: 'new-etag-789',
        phase: 'running' as const,
      };

      mockSandboxAPI.retrieve.mockResolvedValueOnce(mockStatus);

      await handle.status();

      // The etag should be updated internally (we can verify this through subsequent calls)
      expect(mockSandboxAPI.retrieve).toHaveBeenCalledWith('sandbox-123');
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

      mockSandboxAPI.update.mockResolvedValueOnce(mockResponse);

      await handle.apply(changes);

      expect(mockSandboxAPI.update).toHaveBeenCalledWith(
        'sandbox-123',
        expect.objectContaining({
          'Base-Etag': 'etag-456',
          'Idempotency-Key': expect.any(String),
        }),
      );
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

      mockSandboxAPI.update.mockResolvedValueOnce(mockResponse);

      await handle.apply(changes);

      const callArgs = mockSandboxAPI.update.mock.calls[0][1];
      expect(callArgs.ops).toBe('[{"op":"remove","path":"src/unused.ts"}]');
      expect(callArgs.packed).toBeUndefined();
    });

    it('should use packed format for large changes', async () => {
      // Create changes that exceed the threshold
      const changes: FileChange[] = Array.from({ length: 15 }, (_, i) => ({
        path: `src/file${i}.ts`,
        contents: `console.log("File ${i}");`,
      }));

      const mockResponse = {
        id: 'sandbox-123',
        applied: 15,
        etag: 'new-etag-789',
        phase: 'running' as const,
        restarted: false,
      };

      mockSandboxAPI.update.mockResolvedValueOnce(mockResponse);

      await handle.apply(changes);

      const callArgs = mockSandboxAPI.update.mock.calls[0][1];
      expect(callArgs.packed).toBeDefined();
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

      mockSandboxAPI.update.mockRejectedValueOnce(conflictError).mockResolvedValueOnce(successResponse);
      mockSandboxAPI.retrieve.mockResolvedValueOnce(statusResponse);

      await handle.apply(changes);

      expect(mockSandboxAPI.update).toHaveBeenCalledTimes(2);
      expect(mockSandboxAPI.retrieve).toHaveBeenCalledTimes(1);
    });

    it('should fail after one retry attempt', async () => {
      const changes: FileChange[] = [{ path: 'src/index.ts', contents: 'console.log("Updated!");' }];

      const conflictError = new ConflictError(409, { message: 'Conflict' }, 'Conflict', new Headers());
      const statusResponse = {
        id: 'sandbox-123',
        etag: 'newer-etag-999',
        phase: 'running' as const,
      };

      mockSandboxAPI.update.mockRejectedValueOnce(conflictError).mockRejectedValueOnce(conflictError);
      mockSandboxAPI.retrieve.mockResolvedValueOnce(statusResponse);

      await expect(handle.apply(changes)).rejects.toMatchObject({
        code: 'CONFLICTERROR',
        message: 'Conflict',
      });

      expect(mockSandboxAPI.update).toHaveBeenCalledTimes(2);
      expect(mockSandboxAPI.retrieve).toHaveBeenCalledTimes(1);
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

      mockSandboxAPI.update.mockResolvedValueOnce(mockResponse);

      await handle.apply(changes);

      // Should still make the API call, but with no packed data since no actual changes
      const callArgs = mockSandboxAPI.update.mock.calls[0][1];
      expect(callArgs.packed).toBeUndefined();
      expect(callArgs.ops).toBeUndefined();
    });
  });

  describe('destroy()', () => {
    it('should delete the sandbox', async () => {
      mockSandboxAPI.delete.mockResolvedValueOnce(undefined);

      await handle.destroy();

      expect(mockSandboxAPI.delete).toHaveBeenCalledWith('sandbox-123');
    });

    it('should normalize API errors', async () => {
      const apiError = new APIError(404, { message: 'Not found' }, 'Not found', new Headers());
      mockSandboxAPI.delete.mockRejectedValueOnce(apiError);

      await expect(handle.destroy()).rejects.toMatchObject({
        code: 'APIERROR',
        message: 'Not found',
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

      mockSandboxAPI.update.mockResolvedValueOnce(mockResponse);

      await handle.apply(changes);

      const callArgs = mockSandboxAPI.update.mock.calls[0][1];
      expect(callArgs.ops).toBe('[{"op":"remove","path":"src/old-file.ts"}]');
      expect(callArgs.packed).toBeDefined(); // Should have packed data for add/update
    });
  });

  describe('stack operations', () => {
    it('should handle stack edits without changing public DX', async () => {
      const stackHandle = new SandboxHandle(
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

      mockSandboxAPI.update.mockResolvedValueOnce(mockResponse);

      await stackHandle.apply(changes);

      expect(mockSandboxAPI.update).toHaveBeenCalledWith('stack-123', expect.any(Object));
    });
  });
});
