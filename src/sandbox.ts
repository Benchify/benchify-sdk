// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { createHash } from 'crypto';
import { minimatch } from 'minimatch';
import { Benchify } from './client';
import { filesToPackageBlob, type FileData } from './lib/helpers';
import { type SandboxRetrieveResponse } from './resources/sandboxes';
import { APIError, ConflictError } from './core/error';

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
        const normalized = this._normalizeFileContents(file.contents);
        this._fileManifest[file.path] = this._computeFileHash(normalized);
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

      const normalized = this._normalizeFileContents(change.contents);
      const newHash = this._computeFileHash(normalized);
      const currentHash = newManifest[change.path];

      // Only include if file is actually changed
      if (newHash !== currentHash) {
        changedFiles.push({
          path: change.path,
          contents: normalized,
        });
        newManifest[change.path] = newHash;
      }
    }

    // Remove deleted files from manifest
    for (const deletion of deletions) {
      delete newManifest[deletion.path];
    }

    // Build operations JSON for deletions
    const ops =
      deletions.length > 0 ?
        JSON.stringify(deletions.map((del) => ({ op: 'remove', path: del.path })))
      : undefined;

    // Determine if we should use packed format
    const totalSize = changedFiles.reduce((acc, file) => acc + Buffer.from(file.contents).length, 0);
    const shouldUsePacked = changedFiles.length > 0 && (changedFiles.length > 10 || totalSize > 50000); // 50KB threshold

    // Generate idempotency key
    const currentTreeHash = this._computeTreeHash(this._fileManifest);
    const proposedTreeHash = this._computeTreeHash(newManifest);
    const idempotencyKey = this._generateIdempotencyKey(currentTreeHash, proposedTreeHash);

    let packed: Blob | undefined;
    if (shouldUsePacked && changedFiles.length > 0) {
      const packageBlob = filesToPackageBlob(changedFiles);
      packed = new Blob([JSON.stringify(packageBlob)], { type: 'application/json' });
    }

    // Call update API
    const response = await this._client.sandboxes.update(this._id, {
      ...(packed && { packed }),
      ...(ops && { ops }),
      'Base-Etag': this._etag,
      'Idempotency-Key': idempotencyKey,
    });

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

  private _computeFileHash(contents: string): string {
    return createHash('sha256').update(Buffer.from(contents, 'utf-8')).digest('hex');
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
    const normalizedFiles: FileData[] = [];
    const fileManifest: Record<string, string> = {};

    for (const file of filteredFiles) {
      const normalized = this._normalizeFileContents(file.contents);
      normalizedFiles.push({
        path: file.path,
        contents: normalized,
      });
      fileManifest[file.path] = this._computeFileHash(normalized);
    }

    // Compute tree hash for content hash
    const treeHash = this._computeTreeHash(fileManifest);

    // Build packed tar+gzip blob
    const packageBlob = filesToPackageBlob(normalizedFiles);

    // Generate idempotency key
    const idempotencyKey = this._generateIdempotencyKey('', treeHash);

    try {
      const response = await this._client.sandboxes.create({
        blob: {
          files_data: packageBlob.files_data,
          files_manifest: packageBlob.files_manifest,
          format: 'gzip-base64' as const,
        },
        ...(Object.keys(opts).length > 0 && {
          options: {
            options: {
              ...opts,
            },
          },
        }),
        'Content-Hash': treeHash,
        'Idempotency-Key': idempotencyKey,
      });

      return new SandboxHandle(
        this._client,
        response.id,
        response.url,
        response.kind,
        response.etag,
        response.kind === 'stack' ? response.id : undefined,
        response.kind === 'stack' && response.services ?
          response.services.reduce(
            (acc, service) => {
              acc[service.workspacePath] = service.id;
              return acc;
            },
            {} as Record<string, string>,
          )
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

  private _computeFileHash(contents: string): string {
    return createHash('sha256').update(Buffer.from(contents, 'utf-8')).digest('hex');
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
