// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';

export class Standard extends APIResource {
  /**
   * Standard fixes endpoint - applies non-parsing fixes. Phase 2 of the 3-phase
   * architecture. Takes the output from Phase 1 (detection) and applies CSS, UI,
   * dependency, and type fixes. The output can be used as input to Phase 3 (AI
   * fallback).
   *
   * @example
   * ```ts
   * const standard = await client.fix.standard.create({
   *   files: [
   *     { path: 'src/index.ts', contents: "export const hello = 'world';" },
   *     { path: 'src/styles.css', contents: '.container { widht: 100%; }' },
   *   ],
   *   remaining_diagnostics: {
   *     file_to_diagnostics: { ... },
   *   },
   *   fix_types: ['css', 'ui', 'dependency', 'types'],
   *   mode: 'project',
   *   template_path: 'benchify/default-template',
   * });
   * ```
   */
  create(body: StandardCreateParams, options?: RequestOptions): APIPromise<StandardCreateResponse> {
    return this._client.post('/v1/fix-standard', { body, ...options });
  }
}

export interface StandardCreateResponse {
  /**
   * The actual response data
   */
  data: StandardCreateResponse.Data;

  /**
   * The error from the API query
   */
  error?: StandardCreateResponse.Error | null;

  /**
   * Meta information
   */
  meta?: StandardCreateResponse.Meta;
}

export namespace StandardCreateResponse {
  /**
   * The actual response data
   */
  export interface Data {
    /**
     * Files that were modified during fixing
     */
    changed_files: Array<Data.ChangedFile>;

    /**
     * Total execution time in seconds
     */
    execution_time: number;

    /**
     * Number of files that were fixed
     */
    files_fixed: number;

    /**
     * Types of fixes that were actually applied
     */
    fix_types_applied: Array<'dependency' | 'parsing' | 'css' | 'ai_fallback' | 'types' | 'ui' | 'sql'>;

    /**
     * Number of issues still remaining
     */
    issues_remaining: number;

    /**
     * Number of issues resolved
     */
    issues_resolved: number;

    /**
     * Remaining diagnostics after standard fixes
     */
    remaining_diagnostics: Data.RemainingDiagnostics;

    /**
     * Whether fixes were successfully applied
     */
    success: boolean;

    /**
     * Bundled output files if bundling was requested
     */
    bundled_files?: Array<Data.BundledFile> | null;
  }

  export namespace Data {
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

    /**
     * Remaining diagnostics after standard fixes
     */
    export interface RemainingDiagnostics {
      /**
       * Diagnostics grouped by file
       */
      file_to_diagnostics?: { [key: string]: Array<RemainingDiagnostics.FileToDiagnostic> };
    }

    export namespace RemainingDiagnostics {
      export interface FileToDiagnostic {
        /**
         * File where diagnostic occurs
         */
        file_path: string;

        /**
         * Location of the diagnostic
         */
        location: FileToDiagnostic.Location;

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
         * Surrounding code context
         */
        context?: string | null;
      }

      export namespace FileToDiagnostic {
        /**
         * Location of the diagnostic
         */
        export interface Location {
          /**
           * Column number (1-based)
           */
          column: number | null;

          /**
           * Line number (1-based)
           */
          line: number | null;

          /**
           * Span of the error
           */
          span: number;

          /**
           * Position of the first character of the error location in the source code
           */
          starting_character_position: number | null;
        }
      }
    }

    export interface BundledFile {
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

export interface StandardCreateParams {
  /**
   * List of files to fix (can be output from step 1)
   */
  files: Array<StandardCreateParams.File>;

  /**
   * Diagnostics to fix (output from step 1 or previous fixes)
   */
  remaining_diagnostics: StandardCreateParams.RemainingDiagnostics;

  /**
   * Whether to bundle the project after fixes
   */
  bundle?: boolean;

  /**
   * Event ID from Step 1 to continue with the same temp directory
   */
  continuation_event_id?: string;

  /**
   * Unique identifier for tracking
   */
  event_id?: string;

  /**
   * Types of standard fixes to apply
   */
  fix_types?: Array<'dependency' | 'parsing' | 'css' | 'ai_fallback' | 'types' | 'ui' | 'sql'>;

  /**
   * Meta information for the request
   */
  meta?: StandardCreateParams.Meta | null;

  /**
   * Fixer mode: 'project' for full analysis, 'files' for incremental
   */
  mode?: 'project' | 'files';

  /**
   * Template path for project context
   */
  template_path?: string;
}

export namespace StandardCreateParams {
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
   * Diagnostics to fix (output from step 1 or previous fixes)
   */
  export interface RemainingDiagnostics {
    /**
     * Diagnostics grouped by file
     */
    file_to_diagnostics?: { [key: string]: Array<RemainingDiagnostics.FileToDiagnostic> };
  }

  export namespace RemainingDiagnostics {
    export interface FileToDiagnostic {
      /**
       * File where diagnostic occurs
       */
      file_path: string;

      /**
       * Location of the diagnostic
       */
      location: FileToDiagnostic.Location;

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
       * Surrounding code context
       */
      context?: string | null;
    }

    export namespace FileToDiagnostic {
      /**
       * Location of the diagnostic
       */
      export interface Location {
        /**
         * Column number (1-based)
         */
        column: number | null;

        /**
         * Line number (1-based)
         */
        line: number | null;

        /**
         * Span of the error
         */
        span: number;

        /**
         * Position of the first character of the error location in the source code
         */
        starting_character_position: number | null;
      }
    }
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

export declare namespace Standard {
  export {
    type StandardCreateResponse as StandardCreateResponse,
    type StandardCreateParams as StandardCreateParams,
  };
}
