// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { createHash } from 'crypto';
import { minimatch } from 'minimatch';
import { Benchify } from './client';
import { type FileData, type BinaryFileData, filesToTarGzBlob, normalizePath } from './lib/helpers';
import { type SandboxRetrieveResponse } from './resources/sandboxes';
import { APIError, ConflictError } from './core/error';
import { toFile, type Uploadable } from './core/uploads';

/**
 * File input with path and contents
 */
export interface SandboxFile {
  path: string;
  contents: string | Uint8Array;
}

/**
 * File change operation for applying updates
 */
export interface FileChange {
  path: string;
  contents?: string | Uint8Array; // undefined means delete
}

/**
 * Options for creating a sandbox
 */
export interface SandboxCreateOptions {
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
 * Normalized error response
 */
export interface SandboxError {
  code: string;
  message: string;
  requestId?: string;
}

/**
 * Default ignore patterns for files
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
 * Sandbox handle returned from create() with methods to interact with the sandbox
 */
export class SandboxHandle {
  private _client: Benchify;
  private _id: string;
  private _url: string;
  private _stackId: string | undefined;
  private _kind: 'single' | 'stack';
  private _etag: string;
  private _workspaceMap: Record<string, string> | undefined;
  private _fileManifest: Record<string, string> = {}; // path -> sha256

  constructor(
    client: Benchify,
    id: string,
    url: string,
    kind: 'single' | 'stack',
    etag: string,
    stackId?: string,
    workspaceMap?: Record<string, string>,
    initialFiles?: SandboxFile[],
  ) {
    this._client = client;
    this._id = id;
    this._url = url;
    this._stackId = stackId;
    this._kind = kind;
    this._etag = etag;
    this._workspaceMap = workspaceMap;

    // Build initial file manifest
    if (initialFiles) {
      for (const file of initialFiles) {
        const normalizedPath = normalizePath(file.path);
        const normalized = this._normalizeFileContents(file.contents);
        this._fileManifest[normalizedPath] = this._computeFileHash(normalized);
      }
    }
  }

  /**
   * Get sandbox properties
   */
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
   * Apply changes to the sandbox with optimistic concurrency control
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
          // On 409 conflict, fetch latest status and retry once
          await this._refreshStatus();
          attempt++;
          continue;
        }
        throw this._normalizeError(error);
      }
    }
  }

  /**
   * Get current sandbox status
   */
  async status(): Promise<SandboxRetrieveResponse> {
    try {
      const response = await this._client.sandboxes.retrieve(this._id);
      this._etag = response.etag;
      return response;
    } catch (error) {
      throw this._normalizeError(error);
    }
  }

  /**
   * Destroy the sandbox
   */
  async destroy(): Promise<void> {
    try {
      await this._client.sandboxes.delete(this._id);
    } catch (error) {
      throw this._normalizeError(error);
    }
  }

  private async _applyChangesInternal(changes: FileChange[]): Promise<void> {
    // Separate additions/updates from deletions
    const updates = changes.filter((change) => change.contents !== undefined);
    const deletions = changes.filter((change) => change.contents === undefined);

    // Update local manifest for changes
    const newManifest = { ...this._fileManifest };
    const changedFiles: FileData[] = [];

    for (const change of updates) {
      if (change.contents === undefined) continue;

      const normalizedPath = normalizePath(change.path);
      const normalized = this._normalizeFileContents(change.contents);
      const newHash = this._computeFileHash(normalized);
      const currentHash = newManifest[normalizedPath];

      // Only include if file is actually changed
      if (newHash !== currentHash) {
        changedFiles.push({
          path: normalizedPath,
          contents: normalized,
        });
        newManifest[normalizedPath] = newHash;
      }
    }

    // Remove deleted files from manifest
    for (const deletion of deletions) {
      const normalizedPath = normalizePath(deletion.path);
      delete newManifest[normalizedPath];
    }

    // Build operations JSON for deletions
    const ops =
      deletions.length > 0 ?
        JSON.stringify(deletions.map((del) => ({ op: 'remove', path: normalizePath(del.path) })))
      : undefined;

    // Generate idempotency key
    const currentTreeHash = this._computeTreeHash(this._fileManifest);
    const proposedTreeHash = this._computeTreeHash(newManifest);
    const idempotencyKey = this._generateIdempotencyKey(currentTreeHash, proposedTreeHash);

    // Build request parameters - Stainless will detect Blob and create multipart FormData
    let requestParams: any;
    if (changedFiles.length > 0 || ops) {
      // Convert to BinaryFileData for tar creation and sort for consistent ordering
      const binaryFiles: BinaryFileData[] = changedFiles
        .map((file) => ({
          path: file.path,
          contents: file.contents,
          // Don't include mode to use default
        }))
        .sort((a, b) => a.path.localeCompare(b.path));

      // Build parameters - Stainless will detect Blob and create multipart FormData
      requestParams = {
        'Base-Etag': this._etag,
        'Idempotency-Key': idempotencyKey,
      };

      // Add binary tar.gz file if there are file changes
      if (changedFiles.length > 0) {
        const packedBlob = await filesToTarGzBlob(binaryFiles); // Binary tar.gz
        requestParams.packed = await toFile(packedBlob, 'changes.tar.gz', { type: 'application/gzip' }); // Convert to File for Uploadable interface

        // Build manifest: path → sha256(fileBytes) (same order as tarball)
        const manifest = {
          files: binaryFiles.map((file) => ({
            path: file.path,
            hash: this._computeFileHash(file.contents),
          })),
          treeHash: proposedTreeHash,
        };
        requestParams.manifest = JSON.stringify(manifest);
      }

      // Add operations as JSON string if present
      if (ops) {
        requestParams.ops = ops;
      }
    } else {
      // No changes, send minimal update with headers only
      requestParams = {
        'Base-Etag': this._etag,
        'Idempotency-Key': idempotencyKey,
      };
    }

    // The generated client already handles multipart conversion properly
    const response = await this._client.sandboxes.update(this._id, requestParams);

    // Update our state
    this._etag = response.etag;
    this._fileManifest = newManifest;
  }

  private async _refreshStatus(): Promise<void> {
    const status = await this.status();
    // Status call already updates _etag
  }

  private _normalizeFileContents(contents: string | Uint8Array): string {
    if (typeof contents === 'string') {
      return contents;
    }
    return Buffer.from(contents).toString('utf-8');
  }

  private _computeFileHash(contents: string | Uint8Array): string {
    // Hash file bytes directly (not tar bytes)
    const buffer = typeof contents === 'string' ? Buffer.from(contents, 'utf-8') : Buffer.from(contents);
    return createHash('sha256').update(buffer).digest('hex');
  }

  private _computeTreeHash(manifest: Record<string, string>): string {
    // Sort paths and create deterministic tree hash
    const sorted = Object.keys(manifest)
      .sort()
      .map((path) => `${path}:${manifest[path]}`);
    return createHash('sha256').update(sorted.join('\n')).digest('hex');
  }

  private _generateIdempotencyKey(baseCommit: string, proposedTree: string): string {
    return createHash('sha256').update(`${baseCommit}:${proposedTree}`).digest('hex');
  }

  private _isConflictError(error: any): boolean {
    return (
      error instanceof ConflictError ||
      (error instanceof APIError && error.status === 409) ||
      error?.code === 'STALE_BASE' ||
      error?.code === 'CONFLICT'
    );
  }

  private _normalizeError(error: any): SandboxError {
    if (error instanceof APIError) {
      return {
        code: error.constructor.name.replace('Error', '').toUpperCase(),
        message: error.message,
        requestId: error.headers?.get?.('x-request-id') || undefined,
      };
    }

    if (error?.code && error?.message) {
      return {
        code: error.code,
        message: error.message,
        requestId: error.requestId,
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: error?.message || 'An unknown error occurred',
    };
  }
}

/**
 * High-level sandbox API with ergonomic interface
 */
export class Sandbox {
  private _client: Benchify;

  constructor(client: Benchify) {
    this._client = client;
  }

  /**
   * Create a new sandbox with files and options
   * Returns a handle to interact with the sandbox
   */
  async create(files: SandboxFile[], opts: SandboxCreateOptions = {}): Promise<SandboxHandle> {
    // Filter files based on ignore patterns
    const filteredFiles = this._filterFiles(files);

    // Normalize file contents and compute hashes
    const normalizedFiles: BinaryFileData[] = [];
    const fileManifest: Record<string, string> = {};

    for (const file of filteredFiles) {
      const normalizedPath = normalizePath(file.path);
      normalizedFiles.push({
        path: normalizedPath,
        contents: file.contents, // Keep as string | Uint8Array for binary safety
        // Don't include mode to use default
      });
      fileManifest[normalizedPath] = this._computeFileHash(file.contents);
    }

    // Compute tree hash for content hash
    const treeHash = this._computeTreeHash(fileManifest);

    // Generate idempotency key
    const idempotencyKey = this._generateIdempotencyKey('', treeHash);

    try {
      // Sort files for consistent ordering between manifest and tarball
      const sortedFiles = normalizedFiles.sort((a, b) => a.path.localeCompare(b.path));

      // Create binary tar.gz blob and convert to File for Uploadable interface
      const packedBlob = await filesToTarGzBlob(sortedFiles);
      const packed = await toFile(packedBlob, 'sandbox.tar.gz', { type: 'application/gzip' });

      // Build manifest: path → sha256(fileBytes) (same order as tarball)
      const manifest = {
        files: sortedFiles.map((file) => ({
          path: file.path,
          hash: this._computeFileHash(file.contents),
        })),
        treeHash: treeHash,
      };

      // Build parameters for API - Stainless will detect File and create multipart FormData
      const params: {
        packed: Uploadable;
        manifest: string;
        options?: string;
        'Content-Hash': string;
        'Idempotency-Key': string;
      } = {
        packed, // Binary tar.gz file - Stainless will detect this and use multipart
        manifest: JSON.stringify(manifest), // JSON string field
        'Content-Hash': treeHash,
        'Idempotency-Key': idempotencyKey,
      };

      // Add options as JSON string if present
      if (Object.keys(opts).length > 0) {
        params.options = JSON.stringify(opts);
      }

      // The generated client already handles multipart conversion properly
      const response = await this._client.sandboxes.create(params);

      return new SandboxHandle(
        this._client,
        response.id,
        response.url,
        response.kind,
        response.etag,
        response.kind === 'stack' ? response.id : undefined,
        response.kind === 'stack' && response.services ?
          response.services.reduce<Record<string, string>>((acc, service) => {
            acc[service.workspacePath] = service.id;
            return acc;
          }, {})
        : undefined,
        filteredFiles,
      );
    } catch (error) {
      throw this._normalizeError(error);
    }
  }

  private _filterFiles(files: SandboxFile[]): SandboxFile[] {
    return files.filter((file) => {
      return !DEFAULT_IGNORE_PATTERNS.some((pattern) => minimatch(file.path, pattern));
    });
  }

  private _normalizeFileContents(contents: string | Uint8Array): string {
    if (typeof contents === 'string') {
      return contents;
    }
    return Buffer.from(contents).toString('utf-8');
  }

  private _computeFileHash(contents: string | Uint8Array): string {
    // Hash file bytes directly (not tar bytes)
    const buffer = typeof contents === 'string' ? Buffer.from(contents, 'utf-8') : Buffer.from(contents);
    return createHash('sha256').update(buffer).digest('hex');
  }

  private _computeTreeHash(manifest: Record<string, string>): string {
    // Sort paths and create deterministic tree hash
    const sorted = Object.keys(manifest)
      .sort()
      .map((path) => `${path}:${manifest[path]}`);
    return createHash('sha256').update(sorted.join('\n')).digest('hex');
  }

  private _generateIdempotencyKey(baseCommit: string, proposedTree: string): string {
    return createHash('sha256').update(`${baseCommit}:${proposedTree}`).digest('hex');
  }

  private _normalizeError(error: any): SandboxError {
    if (error instanceof APIError) {
      return {
        code: error.constructor.name.replace('Error', '').toUpperCase(),
        message: error.message,
        requestId: error.headers?.get?.('x-request-id') || undefined,
      };
    }

    if (error?.code && error?.message) {
      return {
        code: error.code,
        message: error.message,
        requestId: error.requestId,
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: error?.message || 'An unknown error occurred',
    };
  }
}
