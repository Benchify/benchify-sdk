// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';

export class Fixer extends APIResource {
  /**
   * Submit a repository or set of files for fixing
   *
   * @example
   * ```ts
   * const response = await client.fixer.submit({
   *   buildCmd: 'npm run build',
   *   jobName: 'fix-from-repo',
   *   repoUrl: 'https://github.com/example/repo.git',
   * });
   * ```
   */
  submit(body: FixerSubmitParams, options?: RequestOptions): APIPromise<FixerSubmitResponse> {
    return this._client.post('/v1/fixer', { body, ...options });
  }
}

export interface FixerRequestBase {
  /**
   * The command required to build the project.
   */
  buildCmd: string;

  /**
   * A user-defined name for the fix job.
   */
  jobName: string;
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

export type FixerSubmitParams = FixerSubmitParams.FixerRequestRepo | FixerSubmitParams.FixerRequestFiles;

export declare namespace FixerSubmitParams {
  export interface FixerRequestRepo {
    /**
     * The command required to build the project.
     */
    buildCmd: string;

    /**
     * A user-defined name for the fix job.
     */
    jobName: string;

    /**
     * Publicly accessible URL to a .git repo, zip, tar, or tar.gz archive.
     */
    repoUrl: string;
  }

  export interface FixerRequestFiles {
    /**
     * The command required to build the project.
     */
    buildCmd: string;

    /**
     * List of files to be fixed. Use this instead of repoUrl when submitting
     * individual files.
     */
    files: Array<FixerRequestFiles.File>;

    /**
     * A user-defined name for the fix job.
     */
    jobName: string;
  }

  export namespace FixerRequestFiles {
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
}

export declare namespace Fixer {
  export {
    type FixerRequestBase as FixerRequestBase,
    type FixerSubmitResponse as FixerSubmitResponse,
    type FixerSubmitParams as FixerSubmitParams,
  };
}
