// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';

export class Bundle extends APIResource {
  /**
   * Accepts a JSON array of {path, content}, packs into a tar.zst, and forwards to
   * the Sandbox Manager /sandbox/bundle endpoint.
   *
   * @example
   * ```ts
   * const response = await client.stacks.bundle.createFiles({
   *   entrypoint: 'x',
   *   files: [
   *     { content: '<html>...</html>', path: 'index.html' },
   *   ],
   * });
   * ```
   */
  createFiles(
    body: BundleCreateFilesParams,
    options?: RequestOptions,
  ): APIPromise<BundleCreateFilesResponse> {
    return this._client.post('/v1/stacks/bundle/files', { body, ...options });
  }
}

export interface BundleCreateFilesResponse {
  content: string;

  path: string;
}

export interface BundleCreateFilesParams {
  entrypoint: string;

  /**
   * Files to bundle
   */
  files: Array<BundleCreateFilesParams.File>;

  tarball_filename?: string;
}

export namespace BundleCreateFilesParams {
  export interface File {
    content: string;

    path: string;
  }
}

export declare namespace Bundle {
  export {
    type BundleCreateFilesResponse as BundleCreateFilesResponse,
    type BundleCreateFilesParams as BundleCreateFilesParams,
  };
}
