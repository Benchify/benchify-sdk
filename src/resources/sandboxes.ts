// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { type Uploadable } from '../core/uploads';
import { buildHeaders } from '../internal/headers';
import { RequestOptions } from '../internal/request-options';
import { multipartFormRequestOptions } from '../internal/uploads';
import { path } from '../internal/utils/path';

export class Sandboxes extends APIResource {
  /**
   * Upload files or blob to create a new stack environment. For multi-service
   * stacks, automatically detects and orchestrates multiple services.
   *
   * @example
   * ```ts
   * const sandbox = await client.sandboxes.create();
   * ```
   */
  create(params: SandboxCreateParams, options?: RequestOptions): APIPromise<SandboxCreateResponse> {
    const { 'Content-Hash': contentHash, 'Idempotency-Key': idempotencyKey, ...body } = params;
    return this._client.post(
      '/sandboxes',
      multipartFormRequestOptions(
        {
          body,
          ...options,
          headers: buildHeaders([
            {
              ...(contentHash != null ? { 'Content-Hash': contentHash } : undefined),
              ...(idempotencyKey != null ? { 'Idempotency-Key': idempotencyKey } : undefined),
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
   * const sandbox = await client.sandboxes.retrieve('id');
   * ```
   */
  retrieve(id: string, options?: RequestOptions): APIPromise<SandboxRetrieveResponse> {
    return this._client.get(path`/sandboxes/${id}`, options);
  }

  /**
   * Update stack files using packed blobs and/or individual operations. For
   * multi-service stacks, changes are routed to appropriate services.
   *
   * @example
   * ```ts
   * const sandbox = await client.sandboxes.update('id');
   * ```
   */
  update(
    id: string,
    params: SandboxUpdateParams,
    options?: RequestOptions,
  ): APIPromise<SandboxUpdateResponse> {
    const { 'Base-Etag': baseEtag, 'Idempotency-Key': idempotencyKey, ...body } = params;
    return this._client.post(
      path`/sandboxes/${id}:patch`,
      multipartFormRequestOptions(
        {
          body,
          ...options,
          headers: buildHeaders([
            {
              ...(baseEtag != null ? { 'Base-Etag': baseEtag } : undefined),
              ...(idempotencyKey != null ? { 'Idempotency-Key': idempotencyKey } : undefined),
            },
            options?.headers,
          ]),
        },
        this._client,
      ),
    );
  }

  /**
   * Permanently destroy a stack and all its services, cleaning up resources
   *
   * @example
   * ```ts
   * await client.sandboxes.delete('id');
   * ```
   */
  delete(id: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/sandboxes/${id}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export interface SandboxCreateResponse {
  id: string;

  contentHash: string;

  etag: string;

  kind: 'single' | 'stack';

  phase: 'starting' | 'building' | 'deploying' | 'running' | 'failed' | 'stopped';

  url: string;

  buildStatus?: SandboxCreateResponse.BuildStatus;

  idempotencyKey?: string;

  runtime?: SandboxCreateResponse.Runtime;

  services?: Array<SandboxCreateResponse.Service>;
}

export namespace SandboxCreateResponse {
  export interface BuildStatus {
    phase: 'pending' | 'running' | 'completed' | 'failed';

    duration?: number;

    error?: string;

    logs?: string;
  }

  export interface Runtime {
    nodeVersion: string;

    packageManager: 'npm' | 'yarn' | 'pnpm';

    port: number;

    startCommand: string;

    type: 'node';

    typescript: boolean;

    buildCommand?: string;

    framework?: 'react' | 'nextjs' | 'vue' | 'nuxt' | 'express' | 'fastify' | 'nest' | 'vite' | 'vanilla';
  }

  export interface Service {
    id: string;

    name: string;

    phase: 'starting' | 'building' | 'deploying' | 'running' | 'failed' | 'stopped';

    role: 'frontend' | 'backend' | 'worker' | 'database' | 'unknown';

    workspacePath: string;

    port?: number;
  }
}

export interface SandboxRetrieveResponse {
  id: string;

  etag: string;

  phase: 'starting' | 'building' | 'deploying' | 'running' | 'failed' | 'stopped';

  lastError?: string;

  lastLogs?: Array<string>;

  ports?: Array<number>;

  readyAt?: string;
}

export interface SandboxUpdateResponse {
  id: string;

  applied: number;

  etag: string;

  phase: 'starting' | 'building' | 'deploying' | 'running' | 'failed' | 'stopped';

  restarted: boolean;

  affectedServices?: Array<string>;

  warnings?: Array<string>;
}

export interface SandboxCreateParams {
  /**
   * Body param:
   */
  blob?: SandboxCreateParams.Blob;

  /**
   * Body param: Files to upload
   */
  files?: Array<Uploadable>;

  /**
   * Body param:
   */
  options?: SandboxCreateParams.Options;

  /**
   * Header param: SHA-256 hash of uploaded content for deduplication
   */
  'Content-Hash'?: string;

  /**
   * Header param: Unique key for idempotent requests
   */
  'Idempotency-Key'?: string;
}

export namespace SandboxCreateParams {
  export interface Blob {
    files_data: string;

    files_manifest: Array<Blob.FilesManifest>;

    compressedSize?: number;

    format?: 'gzip-base64';
  }

  export namespace Blob {
    export interface FilesManifest {
      path: string;

      size: number;
    }
  }

  export interface Options {
    options?: Options.Options;
  }

  export namespace Options {
    export interface Options {
      buildCommand?: string;

      environment?: { [key: string]: string };

      name?: string;

      port?: number;

      runtime?: Options.Runtime;

      startCommand?: string;

      subdomain?: string;
    }

    export namespace Options {
      export interface Runtime {
        framework?: 'react' | 'nextjs' | 'vue' | 'nuxt' | 'express' | 'fastify' | 'nest' | 'vite';

        nodeVersion?: string;

        packageManager?: 'npm' | 'yarn' | 'pnpm';
      }
    }
  }
}

export interface SandboxUpdateParams {
  /**
   * Body param: JSON array of patch operations
   */
  ops?: string;

  /**
   * Body param: tar+zstd or tar+gz containing changed/added files
   */
  packed?: Uploadable;

  /**
   * Header param: Current stack etag for conflict detection
   */
  'Base-Etag'?: string;

  /**
   * Header param: Unique key for idempotent requests
   */
  'Idempotency-Key'?: string;
}

export declare namespace Sandboxes {
  export {
    type SandboxCreateResponse as SandboxCreateResponse,
    type SandboxRetrieveResponse as SandboxRetrieveResponse,
    type SandboxUpdateResponse as SandboxUpdateResponse,
    type SandboxCreateParams as SandboxCreateParams,
    type SandboxUpdateParams as SandboxUpdateParams,
  };
}
