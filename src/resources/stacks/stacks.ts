// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as BundleAPI from './bundle';
import { Bundle, BundleCreateFilesParams, BundleCreateFilesResponse } from './bundle';
import { APIPromise } from '../../core/api-promise';
import { type Uploadable } from '../../core/uploads';
import { buildHeaders } from '../../internal/headers';
import { RequestOptions } from '../../internal/request-options';
import { multipartFormRequestOptions } from '../../internal/uploads';
import { path } from '../../internal/utils/path';

export class Stacks extends APIResource {
  bundle: BundleAPI.Bundle = new BundleAPI.Bundle(this._client);

  /**
   * Create a new stack environment using manifest + bundle format. Upload a JSON
   * manifest with file metadata and a tar.zst bundle containing your project files.
   * For multi-service stacks, automatically detects and orchestrates multiple
   * services.
   *
   * @example
   * ```ts
   * const stack = await client.stacks.create({
   *   bundle: fs.createReadStream('path/to/file'),
   *   manifest: fs.createReadStream('path/to/file'),
   *   'idempotency-key': 'key-12345678',
   * });
   * ```
   */
  create(params: StackCreateParams, options?: RequestOptions): APIPromise<StackCreateResponse> {
    const { 'idempotency-key': idempotencyKey, 'content-hash': contentHash, ...body } = params;
    return this._client.post(
      '/v1/stacks',
      multipartFormRequestOptions(
        {
          body,
          ...options,
          headers: buildHeaders([
            {
              'idempotency-key': idempotencyKey,
              ...(contentHash != null ? { 'content-hash': contentHash } : undefined),
            },
            options?.headers,
          ]),
        },
        this._client,
      ),
    );
  }

  /**
   * Retrieve current status and information about a stack and its services
   *
   * @example
   * ```ts
   * const stack = await client.stacks.retrieve('stk_abc123');
   * ```
   */
  retrieve(id: string, options?: RequestOptions): APIPromise<StackRetrieveResponse> {
    return this._client.get(path`/v1/stacks/${id}`, options);
  }

  /**
   * Update stack files using manifest + bundle format and/or individual operations.
   * For multi-service stacks, changes are routed to appropriate services.
   *
   * @example
   * ```ts
   * const stack = await client.stacks.update('stk_abc123', {
   *   'idempotency-key': 'key-12345678',
   * });
   * ```
   */
  update(id: string, params: StackUpdateParams, options?: RequestOptions): APIPromise<StackUpdateResponse> {
    const { 'idempotency-key': idempotencyKey, 'base-etag': baseEtag, ...body } = params;
    return this._client.post(
      path`/v1/stacks/${id}/patch`,
      multipartFormRequestOptions(
        {
          body,
          ...options,
          headers: buildHeaders([
            {
              'idempotency-key': idempotencyKey,
              ...(baseEtag != null ? { 'base-etag': baseEtag } : undefined),
            },
            options?.headers,
          ]),
        },
        this._client,
      ),
    );
  }

  /**
   * Accepts multipart/form-data containing a JSON string manifest (must include
   * entrypoint) and a tarball file, forwards to /sandbox/bundle-multipart, and
   * returns base64 bundle (path + content).
   *
   * @example
   * ```ts
   * const response = await client.stacks.bundleMultipart({
   *   manifest: '{"entrypoint":"src/index.ts"}',
   *   tarball: fs.createReadStream('path/to/file'),
   * });
   * ```
   */
  bundleMultipart(
    body: StackBundleMultipartParams,
    options?: RequestOptions,
  ): APIPromise<StackBundleMultipartResponse> {
    return this._client.post(
      '/v1/stacks/bundle-multipart',
      multipartFormRequestOptions({ body, ...options }, this._client),
    );
  }

  /**
   * Create a simple container sandbox with a custom image and command
   *
   * @example
   * ```ts
   * const response = await client.stacks.createAndRun({
   *   command: ['sleep', '3600'],
   *   image: 'curlimages/curl:latest',
   * });
   * ```
   */
  createAndRun(
    body: StackCreateAndRunParams,
    options?: RequestOptions,
  ): APIPromise<StackCreateAndRunResponse> {
    return this._client.post('/v1/stacks/create-and-run', { body, ...options });
  }

  /**
   * Permanently destroy a stack and all its services, cleaning up resources
   *
   * @example
   * ```ts
   * await client.stacks.destroy('stk_abc123');
   * ```
   */
  destroy(id: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/v1/stacks/${id}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Run a command in the sandbox container and get the output
   *
   * @example
   * ```ts
   * const response = await client.stacks.executeCommand(
   *   'stk_abc123',
   *   { command: ['curl', '-s', 'https://example.com'] },
   * );
   * ```
   */
  executeCommand(
    id: string,
    body: StackExecuteCommandParams,
    options?: RequestOptions,
  ): APIPromise<StackExecuteCommandResponse> {
    return this._client.post(path`/v1/stacks/${id}/exec`, { body, ...options });
  }

  /**
   * Retrieve logs from all services in the stack
   *
   * @example
   * ```ts
   * const response = await client.stacks.getLogs('stk_abc123');
   * ```
   */
  getLogs(
    id: string,
    query: StackGetLogsParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<StackGetLogsResponse> {
    return this._client.get(path`/v1/stacks/${id}/logs`, { query, ...options });
  }

  /**
   * Retrieve network details for a stack including URLs and connection info
   *
   * @example
   * ```ts
   * const response = await client.stacks.getNetworkInfo(
   *   'stk_abc123',
   * );
   * ```
   */
  getNetworkInfo(id: string, options?: RequestOptions): APIPromise<StackGetNetworkInfoResponse> {
    return this._client.get(path`/v1/stacks/${id}/network-info`, options);
  }

  /**
   * Reads file content from inside the sandbox (using exec under the hood)
   *
   * @example
   * ```ts
   * const response = await client.stacks.readFile(
   *   'stk_abc123',
   *   { path: '/workspace/index.html' },
   * );
   * ```
   */
  readFile(
    id: string,
    query: StackReadFileParams,
    options?: RequestOptions,
  ): APIPromise<StackReadFileResponse> {
    return this._client.get(path`/v1/stacks/${id}/read-file`, { query, ...options });
  }

  /**
   * Clears /workspace and extracts a new tarball into the sandbox. Use
   * tarball_base64 and optional tarball_filename.
   *
   * @example
   * ```ts
   * const response = await client.stacks.reset('stk_abc123', {
   *   tarball_base64: 'tarball_base64',
   * });
   * ```
   */
  reset(id: string, body: StackResetParams, options?: RequestOptions): APIPromise<StackResetResponse> {
    return this._client.post(path`/v1/stacks/${id}/reset`, { body, ...options });
  }

  /**
   * Poll stack logs until a dev server URL is detected or timeout
   *
   * @example
   * ```ts
   * const response = await client.stacks.waitForDevServerURL(
   *   'stk_abc123',
   * );
   * ```
   */
  waitForDevServerURL(
    id: string,
    query: StackWaitForDevServerURLParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<StackWaitForDevServerURLResponse> {
    return this._client.get(path`/v1/stacks/${id}/wait-url`, { query, ...options });
  }

  /**
   * Writes file content to a path inside the sandbox (via mount or exec under the
   * hood)
   *
   * @example
   * ```ts
   * const response = await client.stacks.writeFile(
   *   'stk_abc123',
   *   { content: 'content', path: '/workspace/index.html' },
   * );
   * ```
   */
  writeFile(
    id: string,
    body: StackWriteFileParams,
    options?: RequestOptions,
  ): APIPromise<StackWriteFileResponse> {
    return this._client.post(path`/v1/stacks/${id}/write-file`, { body, ...options });
  }
}

/**
 * Response after creating a new stack
 */
export interface StackCreateResponse {
  /**
   * Stack identifier
   */
  id: string;

  /**
   * Content hash for deduplication
   */
  contentHash: string;

  /**
   * ETag for caching/optimistic updates
   */
  etag: string;

  /**
   * Stack kinds
   */
  kind: 'single' | 'stack';

  /**
   * Stack lifecycle phases
   */
  phase: 'starting' | 'building' | 'deploying' | 'running' | 'failed' | 'stopped';

  /**
   * Live URL for the stack
   */
  url: string;

  /**
   * Build status information
   */
  buildStatus?: StackCreateResponse.BuildStatus;

  /**
   * Idempotency key echo
   */
  idempotencyKey?: string;

  /**
   * Services in the stack
   */
  services?: Array<StackCreateResponse.Service>;
}

export namespace StackCreateResponse {
  /**
   * Build status information
   */
  export interface BuildStatus {
    /**
     * Build phase states
     */
    phase: 'pending' | 'running' | 'completed' | 'failed';

    /**
     * Build duration in milliseconds
     */
    duration?: number;

    /**
     * Error message if failed
     */
    error?: string;

    /**
     * Build logs (truncated)
     */
    logs?: string;
  }

  /**
   * Information about a service in the stack
   */
  export interface Service {
    /**
     * Service identifier
     */
    id: string;

    /**
     * Service name
     */
    name: string;

    /**
     * Stack lifecycle phases
     */
    phase: 'starting' | 'building' | 'deploying' | 'running' | 'failed' | 'stopped';

    /**
     * Service roles in a stack
     */
    role: 'frontend' | 'backend' | 'fullstack' | 'worker' | 'database' | 'unknown';

    /**
     * Workspace path relative to project root
     */
    workspacePath: string;

    /**
     * Port (if applicable)
     */
    port?: number;
  }
}

/**
 * Stack status response
 */
export interface StackRetrieveResponse {
  /**
   * Stack identifier
   */
  id: string;

  /**
   * ETag for caching
   */
  etag: string;

  /**
   * Stack lifecycle phases
   */
  phase: 'starting' | 'building' | 'deploying' | 'running' | 'failed' | 'stopped';

  /**
   * Last error message (if failed)
   */
  lastError?: string;

  /**
   * Recent log entries (truncated for size)
   */
  lastLogs?: Array<string>;

  /**
   * Active ports (if running)
   */
  ports?: Array<number>;

  /**
   * When stack became ready (ISO 8601)
   */
  readyAt?: string;
}

/**
 * Response after patching a stack
 */
export interface StackUpdateResponse {
  /**
   * Stack identifier
   */
  id: string;

  /**
   * Number of operations applied
   */
  applied: number;

  /**
   * New ETag after changes
   */
  etag: string;

  /**
   * Stack lifecycle phases
   */
  phase: 'starting' | 'building' | 'deploying' | 'running' | 'failed' | 'stopped';

  /**
   * Whether stack was restarted
   */
  restarted: boolean;

  /**
   * Services affected by patch (for multi-service stacks)
   */
  affectedServices?: Array<string>;

  /**
   * Optional warnings if patch partially failed
   */
  warnings?: Array<string>;
}

export interface StackBundleMultipartResponse {
  content: string;

  path: string;
}

export interface StackCreateAndRunResponse {
  id: string;

  command: Array<string>;

  image: string;

  status: string;
}

export interface StackExecuteCommandResponse {
  exitCode: number;

  stderr: string;

  stdout: string;
}

/**
 * Structured logs response from stack
 */
export interface StackGetLogsResponse {
  /**
   * Stack ID
   */
  id: string;

  /**
   * Logs organized by service
   */
  services: Array<StackGetLogsResponse.Service>;

  /**
   * Total log lines across all services
   */
  totalLineCount: number;

  /**
   * Combined logs from all services (legacy support)
   */
  combinedLogs?: string;
}

export namespace StackGetLogsResponse {
  /**
   * Logs from a single service
   */
  export interface Service {
    /**
     * Service ID
     */
    id: string;

    /**
     * Number of log lines
     */
    lineCount: number;

    /**
     * Logs for this service
     */
    logs: string;

    /**
     * Service name
     */
    name: string;

    /**
     * Service roles in a stack
     */
    role: 'frontend' | 'backend' | 'fullstack' | 'worker' | 'database' | 'unknown';
  }
}

export interface StackGetNetworkInfoResponse {
  id: string;

  domains: Array<string>;

  has_networking: boolean;

  namespace: string;

  service_name: string;

  service_url: string;
}

export interface StackReadFileResponse {
  content: string;

  path: string;
}

export interface StackResetResponse {
  message: string;

  id?: string;
}

export interface StackWaitForDevServerURLResponse {
  url: string;
}

export interface StackWriteFileResponse {
  host_path?: string;

  message?: string;

  method?: string;

  sandbox_path?: string;
}

export interface StackCreateParams {
  /**
   * Body param: Tar.zst bundle containing project files
   */
  bundle: Uploadable;

  /**
   * Body param: JSON manifest file containing file metadata and tree hashes
   */
  manifest: Uploadable;

  /**
   * Header param: Unique key for idempotent requests
   */
  'idempotency-key': string;

  /**
   * Body param: Optional JSON configuration string
   */
  options?: string;

  /**
   * Header param: SHA-256 hash of the bundle for deduplication
   */
  'content-hash'?: string;
}

export interface StackUpdateParams {
  /**
   * Header param: Unique key for idempotent requests
   */
  'idempotency-key': string;

  /**
   * Body param: Optional tar.zst bundle containing changed/added files
   */
  bundle?: Uploadable;

  /**
   * Body param: Optional JSON manifest file with file metadata
   */
  manifest?: Uploadable;

  /**
   * Body param: Optional JSON string containing array of patch operations
   */
  ops?: string;

  /**
   * Header param: Current stack etag for conflict detection
   */
  'base-etag'?: string;
}

export interface StackBundleMultipartParams {
  /**
   * JSON string containing bundler manifest (must include entrypoint)
   */
  manifest: string;

  /**
   * Tar.zst project archive
   */
  tarball: Uploadable;
}

export interface StackCreateAndRunParams {
  /**
   * Command to run
   */
  command: Array<string>;

  /**
   * Docker image to use
   */
  image: string;

  /**
   * Time to live in seconds
   */
  ttl_seconds?: number;

  /**
   * Wait for container to be ready
   */
  wait?: boolean;
}

export interface StackExecuteCommandParams {
  /**
   * Command to execute as array
   */
  command: Array<string>;
}

export interface StackGetLogsParams {
  /**
   * Number of log lines to return per service
   */
  tail?: string;
}

export interface StackReadFileParams {
  /**
   * Absolute path inside the sandbox
   */
  path: string;
}

export interface StackResetParams {
  /**
   * Base64-encoded tarball content
   */
  tarball_base64: string;

  /**
   * Optional tarball filename
   */
  tarball_filename?: string;
}

export interface StackWaitForDevServerURLParams {
  /**
   * Polling interval in milliseconds
   */
  interval?: number;

  /**
   * Timeout in seconds
   */
  wait_timeout?: number;
}

export interface StackWriteFileParams {
  /**
   * File contents
   */
  content: string;

  /**
   * Absolute path inside the sandbox
   */
  path: string;
}

Stacks.Bundle = Bundle;

export declare namespace Stacks {
  export {
    type StackCreateResponse as StackCreateResponse,
    type StackRetrieveResponse as StackRetrieveResponse,
    type StackUpdateResponse as StackUpdateResponse,
    type StackBundleMultipartResponse as StackBundleMultipartResponse,
    type StackCreateAndRunResponse as StackCreateAndRunResponse,
    type StackExecuteCommandResponse as StackExecuteCommandResponse,
    type StackGetLogsResponse as StackGetLogsResponse,
    type StackGetNetworkInfoResponse as StackGetNetworkInfoResponse,
    type StackReadFileResponse as StackReadFileResponse,
    type StackResetResponse as StackResetResponse,
    type StackWaitForDevServerURLResponse as StackWaitForDevServerURLResponse,
    type StackWriteFileResponse as StackWriteFileResponse,
    type StackCreateParams as StackCreateParams,
    type StackUpdateParams as StackUpdateParams,
    type StackBundleMultipartParams as StackBundleMultipartParams,
    type StackCreateAndRunParams as StackCreateAndRunParams,
    type StackExecuteCommandParams as StackExecuteCommandParams,
    type StackGetLogsParams as StackGetLogsParams,
    type StackReadFileParams as StackReadFileParams,
    type StackResetParams as StackResetParams,
    type StackWaitForDevServerURLParams as StackWaitForDevServerURLParams,
    type StackWriteFileParams as StackWriteFileParams,
  };

  export {
    Bundle as Bundle,
    type BundleCreateFilesResponse as BundleCreateFilesResponse,
    type BundleCreateFilesParams as BundleCreateFilesParams,
  };
}
