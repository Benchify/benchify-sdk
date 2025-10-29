// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';

export class Fixer extends APIResource {
  /**
   * Handle fixer requests - supports both legacy (embedded files) and new
   * (manifest+blobs) formats.
   *
   * @example
   * ```ts
   * const response = await client.fixer.run({
   *   files: [
   *     {
   *       path: 'src/index.ts',
   *       contents: "export const hello = 'world';",
   *     },
   *     {
   *       path: 'src/utils.ts',
   *       contents: 'export function helper() {}',
   *     },
   *   ],
   *   fixes: [],
   *   mode: 'project',
   *   response_encoding: 'json',
   *   response_format: 'ALL_FILES',
   * });
   * ```
   */
  run(body: FixerRunParams | null | undefined = {}, options?: RequestOptions): APIPromise<FixerRunResponse> {
    return this._client.post('/v1/fixer', { body, ...options });
  }
}

export interface FixerRunResponse {
  /**
   * The actual response data
   */
  data: FixerRunResponse.Data;

  /**
   * The error from the API query
   */
  error?: FixerRunResponse.Error | null;

  /**
   * Meta information
   */
  meta?: FixerRunResponse.Meta;
}

export namespace FixerRunResponse {
  /**
   * The actual response data
   */
  export interface Data {
    /**
     * Version of the fixer
     */
    fixer_version: string;

    /**
     * Final per-file status after fixing
     */
    status: Data.Status;

    /**
     * Suggested changes to fix the issues
     */
    suggested_changes: Data.SuggestedChanges;

    /**
     * Bundle information if bundling was requested
     */
    bundle?: Data.Bundle | null;

    /**
     * Per-file strategy statistics
     */
    file_to_strategy_statistics?: { [key: string]: Array<Data.FileToStrategyStatistic> };

    /**
     * Diagnostics after fixing
     */
    final_diagnostics?: unknown;

    /**
     * Fix types that were used
     */
    fix_types_used?: Array<'dependency' | 'parsing' | 'css' | 'ai_fallback' | 'types' | 'ui' | 'sql'>;

    /**
     * Diagnostics before fixing
     */
    initial_diagnostics?: unknown;
  }

  export namespace Data {
    /**
     * Final per-file status after fixing
     */
    export interface Status {
      /**
       * Overall composite status
       */
      composite_status:
        | 'FIXED_EVERYTHING'
        | 'FIXED_REQUESTED'
        | 'PARTIALLY_FIXED'
        | 'NO_REQUESTED_ISSUES'
        | 'NO_ISSUES'
        | 'FAILED';

      /**
       * Status of each file
       */
      file_to_composite_status?: {
        [key: string]:
          | 'FIXED_EVERYTHING'
          | 'FIXED_REQUESTED'
          | 'PARTIALLY_FIXED'
          | 'NO_REQUESTED_ISSUES'
          | 'NO_ISSUES'
          | 'FAILED';
      };
    }

    /**
     * Suggested changes to fix the issues
     */
    export interface SuggestedChanges {
      /**
       * List of all files with their current contents
       */
      all_files?: Array<SuggestedChanges.AllFile> | null;

      /**
       * Base64-encoded compressed file contents
       */
      all_files_data?: string | null;

      /**
       * File manifest for blob format
       */
      all_files_manifest?: Array<{ [key: string]: unknown }> | null;

      /**
       * List of changed files with their new contents
       */
      changed_files?: Array<SuggestedChanges.ChangedFile> | null;

      /**
       * Base64-encoded compressed file contents
       */
      changed_files_data?: string | null;

      /**
       * File manifest for blob format
       */
      changed_files_manifest?: Array<{ [key: string]: unknown }> | null;

      /**
       * Unified diff of changes
       */
      diff?: string | null;

      /**
       * Base64-encoded compressed diff data
       */
      diff_data?: string | null;

      /**
       * File manifest for blob format
       */
      diff_manifest?: Array<{ [key: string]: unknown }> | null;
    }

    export namespace SuggestedChanges {
      export interface AllFile {
        /**
         * Contents of the file
         */
        contents: string;

        /**
         * Path of the file
         */
        path: string;
      }

      export interface ChangedFile {
        /**
         * Contents of the file
         */
        contents: string;

        /**
         * Path of the file
         */
        path: string;
      }
    }

    /**
     * Bundle information if bundling was requested
     */
    export interface Bundle {
      build_system: string;

      status: 'SUCCESS' | 'FAILED' | 'NOT_ATTEMPTED' | 'PARTIAL_SUCCESS';

      template_path: string;

      bundle_url?: string | null;

      debug?: { [key: string]: string };

      files?: Array<Bundle.File>;

      files_data?: string | null;

      files_manifest?: Array<{ [key: string]: unknown }> | null;
    }

    export namespace Bundle {
      export interface File {
        /**
         * Contents of the file
         */
        contents: string;

        /**
         * Path of the file
         */
        path: string;
      }
    }

    export interface FileToStrategyStatistic {
      strategy_name: string;

      version_hash: string;

      fixes_applied?: boolean;

      fixes_fired?: boolean;
    }
  }

  /**
   * The error from the API query
   */
  export interface Error {
    /**
     * The error code
     */
    code: string;

    /**
     * The error message
     */
    message: string;

    /**
     * Details about what caused the error
     */
    details?: { [key: string]: unknown };
  }

  /**
   * Meta information
   */
  export interface Meta {
    /**
     * Customer tracking identifier
     */
    external_id?: string | null;

    /**
     * Unique trace identifier for the request
     */
    trace_id?: string | null;
  }
}

export interface FixerRunParams {
  /**
   * Whether to bundle the project (experimental)
   */
  bundle?: boolean;

  /**
   * Unique identifier for the event
   */
  event_id?: string;

  /**
   * List of files to process (legacy format)
   */
  files?: Array<FixerRunParams.File> | null;

  /**
   * Base64-encoded compressed file contents (packed format)
   */
  files_data?: string | null;

  /**
   * File manifest for packed format
   */
  files_manifest?: Array<{ [key: string]: unknown }> | null;

  /**
   * Configuration for which fix types to apply
   */
  fixes?: Array<'dependency' | 'parsing' | 'css' | 'ai_fallback' | 'types' | 'ui' | 'sql'>;

  /**
   * Meta information for the request
   */
  meta?: FixerRunParams.Meta | null;

  /**
   * Fixer operating mode
   */
  mode?: 'project' | 'files';

  /**
   * Response encoding format
   */
  response_encoding?: 'json' | 'blob';

  /**
   * Format for the response (diff, changed_files, or all_files)
   */
  response_format?: 'DIFF' | 'CHANGED_FILES' | 'ALL_FILES';

  /**
   * ID of the template to use
   */
  template_id?: string | null;

  /**
   * Full path to the template
   */
  template_path?: string;
}

export namespace FixerRunParams {
  export interface File {
    /**
     * File contents
     */
    contents: string;

    /**
     * Path to the file
     */
    path: string;
  }

  /**
   * Meta information for the request
   */
  export interface Meta {
    /**
     * Customer tracking identifier
     */
    external_id?: string | null;
  }
}

export declare namespace Fixer {
  export { type FixerRunResponse as FixerRunResponse, type FixerRunParams as FixerRunParams };
}

// Export File type for convenience
export type File = FixerRunParams.File;
