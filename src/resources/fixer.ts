// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';
import { maybeMultipartFormRequestOptions } from '../internal/uploads';

export class Fixer extends APIResource {
  /**
   * Handle fixer requests - supports two formats: 1) JSON with inline file contents
   * in files array, 2) multipart/form-data with tar.zst bundle and manifest (same as
   * Sandbox API). Use multipart for better performance with large projects.
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
    return this._client.post(
      '/v1/fixer',
      maybeMultipartFormRequestOptions({ body, ...options }, this._client),
    );
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
     * Diagnostics after fixing, split into relevant vs other based on requested fix types
     */
    final_diagnostics?: Data.PartitionedDiagnosticResponse | null;

    /**
     * Fix types that were used
     */
    fix_types_used?: Array<'dependency' | 'parsing' | 'css' | 'ai_fallback' | 'types' | 'ui' | 'sql'>;

    /**
     * Diagnostics before fixing, split into relevant vs other based on requested fix types
     */
    initial_diagnostics?: Data.PartitionedDiagnosticResponse | null;
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
     * Response format when requesting DIFF format
     */
    export interface DiffFormat {
      diff?: string | null;
      diff_data?: string | null;
      diff_manifest?: Array<{ [key: string]: unknown }> | null;
    }

    /**
     * Response format when requesting CHANGED_FILES format
     */
    export interface ChangedFilesFormat {
      changed_files?: Array<SuggestedChanges.ChangedFile> | null;
      changed_files_data?: string | null;
      changed_files_manifest?: Array<{ [key: string]: unknown }> | null;
    }

    /**
     * Response format when requesting ALL_FILES format
     */
    export interface AllFilesFormat {
      all_files?: Array<SuggestedChanges.AllFile> | null;
      all_files_data?: string | null;
      all_files_manifest?: Array<{ [key: string]: unknown }> | null;
    }

    /**
     * Suggested changes to fix the issues
     */
    export interface SuggestedChanges {
      /**
       * List of all files with their current contents. Only present when
       * response_encoding is "json".
       */
      all_files?: Array<SuggestedChanges.AllFile> | null;

      /**
       * List of changed files with their new contents. Only present when
       * response_encoding is "json".
       */
      changed_files?: Array<SuggestedChanges.ChangedFile> | null;

      /**
       * Unified diff of changes. Only present when response_encoding is "json".
       */
      diff?: string | null;
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

      /**
       * Base64-encoded tar.zst archive containing bundled files (multipart format)
       */
      files_data?: string | null;
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

    /**
     * Location information for a diagnostic
     */
    export interface DiagnosticLocation {
      /**
       * Line number (1-based)
       */
      line: number | null;

      /**
       * Column number (1-based)
       */
      column: number | null;

      /**
       * Position of the first character of the error location in the source code
       */
      starting_character_position: number | null;

      /**
       * Span of the error
       */
      span: number;
    }

    /**
     * A single diagnostic entry
     */
    export interface Diagnostic {
      /**
       * Diagnostic message
       */
      message: string;

      /**
       * Type of the diagnostic
       */
      type: string;

      /**
       * Code given by the diagnostic generator
       */
      code?: number | null;

      /**
       * File where diagnostic occurs
       */
      file_path: string;

      /**
       * Location of the diagnostic
       */
      location: DiagnosticLocation;

      /**
       * Surrounding code context
       */
      context?: string | null;
    }

    /**
     * Diagnostics grouped by file
     */
    export interface DiagnosticResponse {
      /**
       * Diagnostics grouped by file path
       */
      file_to_diagnostics: { [key: string]: Array<Diagnostic> };
    }

    /**
     * Diagnostics split into requested and other groups
     */
    export interface PartitionedDiagnosticResponse {
      /**
       * Diagnostics that match the requested fix types
       */
      requested?: DiagnosticResponse | null;

      /**
       * Diagnostics that do not match the requested fix types
       */
      not_requested?: DiagnosticResponse | null;
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
   * List of files to process (JSON format with inline contents). For large projects,
   * use multipart/form-data with manifest + bundle instead.
   */
  files?: Array<FixerRunParams.File> | null;

  /**
   * Base64-encoded tar.zst archive containing all files (multipart format). Preferred
   * over the files array for better performance with large projects.
   */
  files_data?: string;

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
   * Response encoding: "json" for inline file contents in JSON, "multipart" for
   * multipart/form-data with tar.zst bundle + manifest
   */
  response_encoding?: 'json' | 'multipart';

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
