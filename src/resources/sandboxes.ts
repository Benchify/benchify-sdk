// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';

export class Sandboxes extends APIResource {
  /**
   * Create a new sandbox
   */
  create(body: SandboxCreateParams, options?: RequestOptions): APIPromise<SandboxCreateResponse> {
    return this._client.post('/v1/sandboxes', { body, ...options });
  }

  /**
   * Retrieve sandbox status
   */
  retrieve(id: string, options?: RequestOptions): APIPromise<SandboxRetrieveResponse> {
    return this._client.get(`/v1/sandboxes/${id}`, options);
  }

  /**
   * Update sandbox files
   */
  update(id: string, body: SandboxUpdateParams, options?: RequestOptions): APIPromise<SandboxUpdateResponse> {
    return this._client.patch(`/v1/sandboxes/${id}`, { body, ...options });
  }

  /**
   * Delete a sandbox
   */
  delete(id: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(`/v1/sandboxes/${id}`, {
      ...options,
      headers: { Accept: '*/*', ...options?.headers },
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
  buildStatus?: {
    phase: 'pending' | 'running' | 'completed' | 'failed';
    duration?: number;
    error?: string;
    logs?: string;
  };
  idempotencyKey?: string;
  runtime?: {
    nodeVersion: string;
    packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
    port: number;
    startCommand: string;
    type: 'node';
    typescript: boolean;
    buildCommand?: string;
    framework?: 'react' | 'nextjs' | 'vue' | 'nuxt' | 'express' | 'fastify' | 'nest' | 'vite' | 'vanilla';
  };
  services?: Array<{
    id: string;
    name: string;
    phase: 'starting' | 'building' | 'deploying' | 'running' | 'failed' | 'stopped';
    role: 'frontend' | 'backend' | 'worker' | 'database' | 'unknown';
    workspacePath: string;
    port?: number;
  }>;
}

export interface SandboxRetrieveResponse {
  id: string;
  etag: string;
  phase: 'starting' | 'building' | 'deploying' | 'running' | 'failed' | 'stopped';
  lastError?: string;
  lastLogs?: string[];
  ports?: number[];
  readyAt?: string;
}

export interface SandboxUpdateResponse {
  id: string;
  applied: number;
  etag: string;
  phase: 'starting' | 'building' | 'deploying' | 'running' | 'failed' | 'stopped';
  restarted: boolean;
  affectedServices?: string[];
  warnings?: string[];
}

export interface SandboxCreateParams {
  packed: unknown;
  'Content-Hash': string;
  'Idempotency-Key': string;
  manifest?: string;
  options?: string;
}

export interface SandboxUpdateParams {
  'Idempotency-Key': string;
  'Base-Etag'?: string;
  'Base-Commit'?: string;
  manifest?: string;
  ops?: string;
  packed?: unknown;
}

export interface ResponseMeta {
  trace_id?: string;
  external_id?: string;
}

export declare namespace Sandboxes {
  export {
    type SandboxCreateResponse as SandboxCreateResponse,
    type SandboxRetrieveResponse as SandboxRetrieveResponse,
    type SandboxUpdateResponse as SandboxUpdateResponse,
    type SandboxCreateParams as SandboxCreateParams,
    type SandboxUpdateParams as SandboxUpdateParams,
    type ResponseMeta as ResponseMeta,
  };
}
