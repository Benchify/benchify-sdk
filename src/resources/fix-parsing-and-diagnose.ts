// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';

export class FixParsingAndDiagnose extends APIResource {
  /**
   * Fast detection endpoint for quick diagnostic results. Phase 1 of the 3-phase
   * architecture. Returns issues quickly (within 1-3 seconds) and provides metadata
   * about available fixes and time estimates. Does not apply any fixes, only
   * analyzes code.
   *
   * @example
   * ```ts
   * const response =
   *   await client.fixParsingAndDiagnose.detectIssues({
   *     files: [
   *       {
   *         path: 'src/index.ts',
   *         contents: "export const hello = 'world';",
   *       },
   *       {
   *         path: 'src/utils.ts',
   *         contents: 'export function helper() {}',
   *       },
   *     ],
   *     template_path: 'benchify/default-template',
   *   });
   * ```
   */
  detectIssues(
    body: FixParsingAndDiagnoseDetectIssuesParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<FixParsingAndDiagnoseDetectIssuesResponse> {
    return this._client.post('/v1/fix-parsing-and-diagnose', { body, ...options });
  }
}

export interface FixParsingAndDiagnoseDetectIssuesResponse {
  /**
   * The actual response data
   */
  data: FixParsingAndDiagnoseDetectIssuesResponse.Data;

  /**
   * The error from the API query
   */
  error?: FixParsingAndDiagnoseDetectIssuesResponse.Error | null;

  /**
   * Meta information
   */
  meta?: FixParsingAndDiagnoseDetectIssuesResponse.Meta;
}

export namespace FixParsingAndDiagnoseDetectIssuesResponse {
  /**
   * The actual response data
   */
  export interface Data {
    /**
     * Files that were changed during detection
     */
    changed_files: Array<Data.ChangedFile>;

    /**
     * Time taken to detect issues in seconds
     */
    detection_time: number;

    /**
     * Number of diagnostic iterations performed
     */
    diagnosis_iterations: number;

    /**
     * Diagnostics split into fixable (requested) and other (not_requested) groups
     */
    diagnostics: Data.Diagnostics;

    /**
     * Estimated total time to fix all issues in seconds
     */
    estimated_total_fix_time: number;

    /**
     * Event ID for tracking this operation across steps
     */
    event_id: string;

    /**
     * Number of files that were analyzed
     */
    files_analyzed: number;

    /**
     * Available fix types with metadata
     */
    fix_types_available: Array<Data.FixTypesAvailable>;

    /**
     * Number of issues that can be fixed
     */
    fixable_issues: number;

    /**
     * Number of fixes that were applied during detection
     */
    fixes_applied: number;

    /**
     * Total number of issues found
     */
    total_issues: number;

    /**
     * Version of the fixer
     */
    fixer_version?: string;
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
     * Diagnostics split into fixable (requested) and other (not_requested) groups
     */
    export interface Diagnostics {
      /**
       * Diagnostics that do not match the requested fix types
       */
      not_requested?: Diagnostics.NotRequested | null;

      /**
       * Diagnostics that match the requested fix types
       */
      requested?: Diagnostics.Requested | null;
    }

    export namespace Diagnostics {
      /**
       * Diagnostics that do not match the requested fix types
       */
      export interface NotRequested {
        /**
         * Diagnostics grouped by file
         */
        file_to_diagnostics?: { [key: string]: Array<NotRequested.FileToDiagnostic> };
      }

      export namespace NotRequested {
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
       * Diagnostics that match the requested fix types
       */
      export interface Requested {
        /**
         * Diagnostics grouped by file
         */
        file_to_diagnostics?: { [key: string]: Array<Requested.FileToDiagnostic> };
      }

      export namespace Requested {
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
    }

    export interface FixTypesAvailable {
      /**
       * Estimated time to fix in seconds
       */
      estimated_time_seconds: number;

      /**
       * The type of fix available
       */
      fix_type: string;

      /**
       * Number of issues that can be fixed with this type
       */
      issue_count: number;

      /**
       * Priority of this fix type (lower is higher priority)
       */
      priority: number;
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

export interface FixParsingAndDiagnoseDetectIssuesParams {
  /**
   * Unique identifier for the event
   */
  event_id?: string;

  /**
   * List of files to analyze (JSON format with inline contents). For large projects,
   * use multipart/form-data with manifest + bundle instead.
   */
  files?: Array<FixParsingAndDiagnoseDetectIssuesParams.File> | null;

  /**
   * Meta information for the request
   */
  meta?: FixParsingAndDiagnoseDetectIssuesParams.Meta | null;

  /**
   * Full path to the template
   */
  template_path?: string;
}

export namespace FixParsingAndDiagnoseDetectIssuesParams {
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

export declare namespace FixParsingAndDiagnose {
  export {
    type FixParsingAndDiagnoseDetectIssuesResponse as FixParsingAndDiagnoseDetectIssuesResponse,
    type FixParsingAndDiagnoseDetectIssuesParams as FixParsingAndDiagnoseDetectIssuesParams,
  };
}
