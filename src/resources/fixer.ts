// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';

export class Fixer extends APIResource {
  /**
   * Submit a repository for fixing
   *
   * @example
   * ```ts
   * const response = await client.fixer.submit({
   *   buildCmd: 'npm run build',
   *   jobName: 'fix-simple-demo',
   *   repoUrl: '$REPO_URL',
   * });
   * ```
   */
  submit(body: FixerSubmitParams, options?: RequestOptions): APIPromise<FixerSubmitResponse> {
    return this._client.post('/v1/fixer', { body, ...options });
  }
}

export interface FixerSubmitResponse {
  /**
   * The stdout/stderr output from the build command.
   */
  build_output?: string;

  /**
   * Exit code of the build command after applying fixes. 0 indicates success.
   */
  build_status?: number;

  /**
   * A git diff showing the changes applied. Empty if no changes were needed or the
   * build failed.
   */
  diff?: string;
}

export interface FixerSubmitParams {
  /**
   * The command required to build the project.
   */
  buildCmd: string;

  /**
   * List of files to be fixed. Use this instead of repoUrl when submitting
   * individual files.
   */
  files?: Array<FixerSubmitParams.File>;

  /**
   * A user-defined name for the fix job.
   */
  jobName?: string;

  /**
   * Publicly accessible URL to a .git repo, zip, tar, or tar.gz archive.
   */
  repoUrl?: string;
}

export namespace FixerSubmitParams {
  export interface File {
    /**
     * Contents of the file
     */
    contents: string;

    /**
     * Path to the file within the project
     */
    path: string;
  }
}

export declare namespace Fixer {
  export { type FixerSubmitResponse as FixerSubmitResponse, type FixerSubmitParams as FixerSubmitParams };
}
