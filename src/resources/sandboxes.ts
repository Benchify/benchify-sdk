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
   * Upload a binary tar.gz file to create a new stack environment. For multi-service
   * stacks, automatically detects and orchestrates multiple services.
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
            { 'Content-Hash': contentHash, 'Idempotency-Key': idempotencyKey },
            options?.headers,
          ]),
        },
        this._client,
      ),
    );
  }

  /**
   * Retrieve current status and information about a stack and its services
   */
  retrieve(id: string, options?: RequestOptions): APIPromise<SandboxRetrieveResponse> {
    return this._client.get(path`/sandboxes/${id}`, options);
  }

  /**
   * Update stack files using tar.gz blobs and/or individual operations. For
   * multi-service stacks, changes are routed to appropriate services.
   */
  update(
    id: string,
    params: SandboxUpdateParams,
    options?: RequestOptions,
  ): APIPromise<SandboxUpdateResponse> {
    const {
      'Idempotency-Key': idempotencyKey,
      'Base-Commit': baseCommit,
      'Base-Etag': baseEtag,
      ...body
    } = params;
    return this._client.post(
      path`/sandboxes/${id}:patch`,
      multipartFormRequestOptions(
        {
          body,
          ...options,
          headers: buildHeaders([
            {
              'Idempotency-Key': idempotencyKey,
              ...(baseCommit != null ? { 'Base-Commit': baseCommit } : undefined),
              ...(baseEtag != null ? { 'Base-Etag': baseEtag } : undefined),
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
   * Body param: Binary gzipped tar archive containing project files
   */
  packed: Uploadable;

  /**
   * Header param: SHA-256 hash of uploaded content for deduplication
   */
  'Content-Hash': string;

  /**
   * Header param: Unique key for idempotent requests
   */
  'Idempotency-Key': string;

  /**
   * Body param: Optional JSON metadata as string
   */
  manifest?: string;

  /**
   * Body param: Optional JSON configuration as string
   */
  options?: string;
}

export interface SandboxUpdateParams {
  /**
   * Header param: Unique key for idempotent requests
   */
  'Idempotency-Key': string;

  /**
   * Body param: JSON string containing patch metadata: { base, proposed, files:
   * {...changed hashes...} }. Required when packed is present.
   */
  manifest?: string;

  /**
   * Body param: Optional JSON string containing array of patch operations
   */
  ops?: string;

  /**
   * Body param: Optional gzipped tar archive containing changed/added files
   */
  packed?: Uploadable;

  /**
   * Header param: Current stack commit hash for conflict detection
   */
  'Base-Commit'?: string;

  /**
   * Header param: Alternative to Base-Commit. Current stack etag for conflict
   * detection
   */
  'Base-Etag'?: string;
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
