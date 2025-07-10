// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import * as DiagnosticsAPI from './diagnostics';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';

export class Fixer extends APIResource {
  /**
   * Analyzes code and automatically fixes build issues
   *
   * @example
   * ```ts
   * const response = await client.fixer.run({
   *   files: [
   *     {
   *       path: 'package.json',
   *       contents:
   *         '{"name": "simple-shopping-app", "version": "0.1.0", "scripts": {"build": "next build"}}',
   *     },
   *     {
   *       path: 'src/index.tsx',
   *       contents:
   *         "import Link from 'next/navigation/link';\nconsole.log('Max's demo');",
   *     },
   *   ],
   *   fixes: {
   *     imports: true,
   *     stringLiterals: true,
   *     tsSuggestions: true,
   *   },
   * });
   * ```
   */
  run(body: FixerRunParams, options?: RequestOptions): APIPromise<FixerRunResponse> {
    return this._client.post('/v1/fixer', { body, ...options });
  }
}

export interface FixerRequest {
  /**
   * Array of file objects with path and contents
   */
  files: Array<FixerRequest.File>;

  /**
   * Benchify will apply all static fixes by default. If you want to only apply
   * certain fixes, pass in the flags you want to apply.
   */
  fixes?: FixerRequest.Fixes;

  /**
   * Optional metadata for tracking and identification purposes
   */
  meta?: FixerRequest.Meta;

  /**
   * Format of the response (DIFF, CHANGED_FILES, ALL_FILES)
   */
  response_format?: 'DIFF' | 'CHANGED_FILES' | 'ALL_FILES';

  /**
   * Template ID for the request (must be a valid template ID for the user's org)
   */
  template?: string;
}

export namespace FixerRequest {
  export interface File {
    contents: string;

    path: string;
  }

  /**
   * Benchify will apply all static fixes by default. If you want to only apply
   * certain fixes, pass in the flags you want to apply.
   */
  export interface Fixes {
    /**
     * Analyzes and corrects unused, invalid, or misapplied CSS and Tailwind class
     * references, including removal of unused styles
     */
    css?: boolean;

    /**
     * Fix incorrect packages, undefined references, local paths, hallucinated
     * dependencies, and other import/export errors
     */
    imports?: boolean;

    /**
     * Statically fix string escape sequences, invalid characters, and other common
     * string literal issues
     */
    stringLiterals?: boolean;

    /**
     * Applies TypeScript compiler suggestions and fixes, resolving type errors,
     * mismatched assertions, and generic parameter issues through static analysis.
     */
    tsSuggestions?: boolean;
  }

  /**
   * Optional metadata for tracking and identification purposes
   */
  export interface Meta {
    /**
     * Customer identifier for tracking purposes
     */
    external_id?: string;
  }
}

export interface FixerRunResponse {
  data?: FixerRunResponse.Data;

  meta?: DiagnosticsAPI.ResponseMeta;
}

export namespace FixerRunResponse {
  export interface Data {
    /**
     * Output of the build command
     */
    build_output?: string;

    /**
     * Whether the build succeeded
     */
    success?: boolean;

    suggested_changes?: Data.Diff | Data.ChangedFiles | Data.AllFiles;
  }

  export namespace Data {
    export interface Diff {
      /**
       * Git diff of the changes made by the fixer, or null if no changes were made
       */
      diff?: string | null;
    }

    export interface ChangedFiles {
      /**
       * List of changed files with their new contents, or null if no changes were made
       */
      changed_files?: Array<ChangedFiles.ChangedFile> | null;
    }

    export namespace ChangedFiles {
      export interface ChangedFile {
        /**
         * New contents of the file
         */
        contents?: string;

        /**
         * Path of the changed file
         */
        path?: string;
      }
    }

    export interface AllFiles {
      /**
       * List of all files with their current contents
       */
      all_files?: Array<AllFiles.AllFile> | null;
    }

    export namespace AllFiles {
      export interface AllFile {
        /**
         * Current contents of the file
         */
        contents?: string;

        /**
         * Path of the file
         */
        path?: string;
      }
    }
  }
}

export interface FixerRunParams {
  /**
   * Array of file objects with path and contents
   */
  files: Array<FixerRunParams.File>;

  /**
   * Benchify will apply all static fixes by default. If you want to only apply
   * certain fixes, pass in the flags you want to apply.
   */
  fixes?: FixerRunParams.Fixes;

  /**
   * Optional metadata for tracking and identification purposes
   */
  meta?: FixerRunParams.Meta;

  /**
   * Format of the response (DIFF, CHANGED_FILES, ALL_FILES)
   */
  response_format?: 'DIFF' | 'CHANGED_FILES' | 'ALL_FILES';

  /**
   * Template ID for the request (must be a valid template ID for the user's org)
   */
  template?: string;
}

export namespace FixerRunParams {
  export interface File {
    contents: string;

    path: string;
  }

  /**
   * Benchify will apply all static fixes by default. If you want to only apply
   * certain fixes, pass in the flags you want to apply.
   */
  export interface Fixes {
    /**
     * Analyzes and corrects unused, invalid, or misapplied CSS and Tailwind class
     * references, including removal of unused styles
     */
    css?: boolean;

    /**
     * Fix incorrect packages, undefined references, local paths, hallucinated
     * dependencies, and other import/export errors
     */
    imports?: boolean;

    /**
     * Statically fix string escape sequences, invalid characters, and other common
     * string literal issues
     */
    stringLiterals?: boolean;

    /**
     * Applies TypeScript compiler suggestions and fixes, resolving type errors,
     * mismatched assertions, and generic parameter issues through static analysis.
     */
    tsSuggestions?: boolean;
  }

  /**
   * Optional metadata for tracking and identification purposes
   */
  export interface Meta {
    /**
     * Customer identifier for tracking purposes
     */
    external_id?: string;
  }
}

export declare namespace Fixer {
  export {
    type FixerRequest as FixerRequest,
    type FixerRunResponse as FixerRunResponse,
    type FixerRunParams as FixerRunParams,
  };
}
