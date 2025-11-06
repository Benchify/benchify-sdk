// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { createHash } from 'crypto';
import { minimatch } from 'minimatch';
import { Benchify } from './client';
import { type BinaryFileData, packWithManifest, normalizePath } from './lib/helpers';
import { StackExecuteCommandResponse, type StackRetrieveResponse } from './resources/stacks';
import { APIError, ConflictError } from './core/error';
import { toFile, type Uploadable } from './core/uploads';

/**
 * A file to include in a stack
 */
export interface StackFile {
  /** Relative path within the stack (e.g. 'src/index.ts') */
  path: string;
  /** File contents as string or binary data */
  contents: string | Uint8Array;
}

/**
 * A file change to apply to a running stack
 *
 * Omit `contents` to delete the file.
 */
export interface FileChange {
  /** Path of the file to change or delete */
  path: string;
  /** New contents, or undefined to delete */
  contents?: string | Uint8Array;
}

/**
 * Configuration options for creating a stack
 */
export interface StackCreateOptions {
  name?: string;
  buildCommand?: string;
  startCommand?: string;
  port?: number;
  subdomain?: string;
  environment?: Record<string, string>;
  runtime?: {
    nodeVersion?: string;
    packageManager?: 'npm' | 'yarn' | 'pnpm';
    framework?: 'react' | 'nextjs' | 'vue' | 'nuxt' | 'express' | 'fastify' | 'nest' | 'vite';
  };
}

/**
 * Files and directories automatically excluded when creating stacks
 *
 * These patterns prevent unnecessary files (dependencies, build outputs, etc.)
 * from being uploaded. The server will install dependencies during the build.
 */
const DEFAULT_IGNORE_PATTERNS = [
  '.git/**',
  'node_modules/**',
  '**/*.lock',
  '**/package-lock.json',
  '**/yarn.lock',
  '**/pnpm-lock.yaml',
  'dist/**',
  'build/**',
  '.next/**',
  'coverage/**',
];

/**
 * Handle for interacting with a running stack
 *
 * This is a stateless client - all stack state is managed server-side.
 * The handle only tracks the etag for optimistic concurrency control.
 */
export class StackHandle {
  private _client: Benchify;
  private _id: string;
  private _url: string;
  private _stackId: string | undefined;
  private _kind: 'single' | 'stack';
  private _etag: string;
  private _workspaceMap: Record<string, string> | undefined;

  constructor(
    client: Benchify,
    id: string,
    url: string,
    kind: 'single' | 'stack',
    etag: string,
    stackId?: string,
    workspaceMap?: Record<string, string>,
  ) {
    this._client = client;
    this._id = id;
    this._url = url;
    this._stackId = stackId;
    this._kind = kind;
    this._etag = etag;
    this._workspaceMap = workspaceMap;
  }

  get id(): string {
    return this._id;
  }
  get url(): string {
    return this._url;
  }
  get stackId(): string | undefined {
    return this._stackId;
  }
  get kind(): 'single' | 'stack' {
    return this._kind;
  }

  /**
   * Apply file changes to the stack
   *
   * Changes are sent to the server which handles deduplication and change detection.
   * If a conflict occurs (another client modified the stack), will retry once automatically.
   *
   * @param changes - Array of file changes. Omit `contents` to delete a file.
   */
  async apply(changes: FileChange[]): Promise<void> {
    const maxRetries = 1;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        await this._applyChangesInternal(changes);
        return;
      } catch (error) {
        if (this._isConflictError(error) && attempt < maxRetries) {
          await this._refreshStatus();
          attempt++;
          continue;
        }
        throw error;
      }
    }
  }

  /**
   * Fetch the current status of the stack
   */
  async status(): Promise<StackRetrieveResponse> {
    const response = await this._client.stacks.retrieve(this._id);
    this._etag = response.etag;
    return response;
  }
  async waitForDevServerURL(): Promise<string> {
    const response = await this._client.stacks.waitForDevServerURL(this._id);
    return response.url;
  }
  async executeCommand(command: string): Promise<StackExecuteCommandResponse> {
    const response = await this._client.stacks.executeCommand(this._id, { command: [command] });
    return response;
  }
  async getSandboxIP(): Promise<string> {
    const response = await this.executeCommand('hostname -i');
    return response.stdout.trim();
  }

  /**
   * Permanently destroy the stack and free resources
   */
  async destroy(): Promise<void> {
    await this._client.stacks.destroy(this._id);
  }

  private async _applyChangesInternal(changes: FileChange[]): Promise<void> {
    const updates = changes.filter((change) => change.contents !== undefined);
    const deletions = changes.filter((change) => change.contents === undefined);

    const ops =
      deletions.length > 0 ?
        JSON.stringify(deletions.map((del) => ({ op: 'remove', path: normalizePath(del.path) })))
      : undefined;

    // Idempotency key ensures retries are safe
    const changeSignature = changes
      .map((c) => `${c.path}:${c.contents ? 'update' : 'delete'}`)
      .sort()
      .join('|');
    const idempotencyKey = createHash('sha256').update(`${this._etag}:${changeSignature}`).digest('hex');

    const requestParams: any = {
      'base-etag': this._etag,
      'idempotency-key': idempotencyKey,
    };

    if (updates.length > 0) {
      const binaryFiles: BinaryFileData[] = updates.map((change) => ({
        path: normalizePath(change.path),
        contents: change.contents!,
      }));

      const { buffer, manifest } = await packWithManifest(binaryFiles);
      requestParams.bundle = await toFile(buffer, 'changes.tar.zst', { type: 'application/octet-stream' });
      requestParams.manifest = await toFile(Buffer.from(JSON.stringify(manifest), 'utf-8'), 'manifest.json', {
        type: 'application/json',
      });
    }

    if (ops) {
      requestParams.ops = ops;
    }

    const response = await this._client.stacks.update(this._id, requestParams);
    this._etag = response.etag;
  }

  private async _refreshStatus(): Promise<void> {
    await this.status();
  }

  private _isConflictError(error: any): boolean {
    return (
      error instanceof ConflictError ||
      (error instanceof APIError && error.status === 409) ||
      error?.code === 'STALE_BASE' ||
      error?.code === 'CONFLICT'
    );
  }
}

/**
 * Stacks API for creating and managing sandboxes
 *
 * Use `stack.create()` to create a new stack, which returns a StackHandle.
 * Keep the handle to perform operations like applying changes or checking status.
 *
 * If you lose the handle, use `stack.get(id)` to retrieve it.
 *
 * @example
 * ```typescript
 * // Create a new stack
 * const handle = await client.stack.create(files);
 *
 * // Reconnect to an existing stack
 * const handle2 = await client.stack.get('stack_abc123');
 * ```
 */
export class Stacks {
  private _client: Benchify;

  constructor(client: Benchify) {
    this._client = client;
  }

  /**
   * Create a new stack with the provided files and configuration
   *
   * Files are automatically filtered to exclude common build artifacts and dependencies.
   * Returns a StackHandle for interacting with the running stack.
   *
   * @param files - Array of files to include in the stack
   * @param opts - Stack configuration (name, build/start commands, environment, etc.)
   * @returns A handle for the created stack
   *
   * @example
   * ```typescript
   * const stack = await client.stack.create([
   *   { path: 'index.js', contents: 'console.log("Hello!")' }
   * ], {
   *   name: 'my-app',
   *   startCommand: 'node index.js'
   * });
   *
   * console.log(stack.url); // https://...
   * ```
   */
  async create(files: StackFile[], opts: StackCreateOptions = {}): Promise<StackHandle> {
    const filteredFiles = this._filterFiles(files);

    const normalizedFiles: BinaryFileData[] = [];
    for (const file of filteredFiles) {
      const normalizedPath = normalizePath(file.path);
      normalizedFiles.push({
        path: normalizedPath,
        contents: file.contents,
      });
    }

    const { buffer, manifest } = await packWithManifest(normalizedFiles);
    const packed = await toFile(buffer, 'sandbox.tar.zst', { type: 'application/octet-stream' });
    const idempotencyKey = this._generateIdempotencyKey('', manifest.tree_hash);

    const params: {
      bundle: Uploadable;
      manifest: Uploadable;
      options?: string;
      'content-hash': string;
      'idempotency-key': string;
    } = {
      bundle: packed,
      manifest: await toFile(Buffer.from(JSON.stringify(manifest), 'utf-8'), 'manifest.json', {
        type: 'application/json',
      }),
      'content-hash': manifest.tree_hash,
      'idempotency-key': idempotencyKey,
    };

    if (Object.keys(opts).length > 0) {
      params.options = JSON.stringify(opts);
    }

    const response = await this._client.stacks.create(params);

    return new StackHandle(
      this._client,
      response.id,
      response.url,
      response.kind,
      response.etag,
      response.kind === 'stack' ? response.id : undefined,
      response.kind === 'stack' && response.services ?
        response.services.reduce<Record<string, string>>(
          (acc: Record<string, string>, service: { workspacePath: string; id: string }) => {
            acc[service.workspacePath] = service.id;
            return acc;
          },
          {},
        )
      : undefined,
    );
  }

  /**
   * Get a handle to an existing stack by ID
   *
   * Useful if you lost the original handle or need to connect to a stack in a new session.
   *
   * @param id - The stack ID
   * @returns A handle for the existing stack
   *
   * @example
   * ```typescript
   * // Reconnect to an existing stack
   * const stack = await client.stack.get('stack_abc123');
   * const status = await stack.status();
   * ```
   */
  async get(id: string): Promise<StackHandle> {
    const response = await this._client.stacks.retrieve(id);

    // Construct URL from base URL and stack ID
    const baseUrl = this._client.baseURL.replace(/\/$/, '');
    const url = `${baseUrl}/stacks/${response.id}`;

    return new StackHandle(
      this._client,
      response.id,
      url,
      'single', // Default to single, actual kind doesn't affect operations
      response.etag,
      undefined, // stackId not available from retrieve
      undefined, // workspaceMap not available from retrieve
    );
  }

  async waitForDevServerURL(
    id: string,
    params?: { interval?: number; timeout?: number },
  ): Promise<{ url: string }> {
    return await this._client.stacks.waitForDevServerURL(id, params);
  }

  private _filterFiles(files: StackFile[]): StackFile[] {
    return files.filter((file) => {
      return !DEFAULT_IGNORE_PATTERNS.some((pattern) => minimatch(file.path, pattern));
    });
  }

  private _generateIdempotencyKey(baseCommit: string, proposedTree: string): string {
    return createHash('sha256').update(`${baseCommit}:${proposedTree}`).digest('hex');
  }
}
