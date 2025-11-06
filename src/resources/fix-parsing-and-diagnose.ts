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
     * Diagnostics split into fixable (requested) and other (not_requested) groups
     */
    diagnostics: Data.Diagnostics;

    /**
     * Version of the fixer
     */
    fixer_version: string;

    /**
     * Statistics about the diagnostics
     */
    statistics: Data.Statistics;
  }

  export namespace Data {
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

    /**
     * Statistics about the diagnostics
     */
    export interface Statistics {
      /**
       * Count of diagnostics by severity
       */
      by_severity: { [key: string]: number };

      /**
       * Count of diagnostics by type
       */
      by_type: { [key: string]: number };

      /**
       * Total number of diagnostics found
       */
      total_diagnostics: number;

      /**
       * Estimated time to fix in seconds
       */
      estimated_fix_time_seconds?: number;
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
