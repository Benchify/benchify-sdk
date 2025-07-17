// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';

export class FixStringLiterals extends APIResource {
  /**
   * Fix string literal issues in TypeScript files.
   *
   * Args: request: The request containing the file to fix load_balancer: The
   * diagnostic load balancer instance
   *
   * Returns: StringLiteralsFixerResponse: The response containing the fixed file or
   * error details
   *
   * @example
   * ```ts
   * const response = await client.fixStringLiterals.run({
   *   file: { contents: 'contents', path: 'x' },
   * });
   * ```
   */
  run(body: FixStringLiteralRunParams, options?: RequestOptions): APIPromise<FixStringLiteralRunResponse> {
    return this._client.post('/v1/fix-string-literals', { body, ...options });
  }
}

/**
 * Model for file data in requests
 */
export interface RequestTestFile {
  /**
   * Original contents of the file before any modifications
   */
  contents: string;

  /**
   * Path to the file
   */
  path: string;
}

/**
 * Response model for the /api/fix_string_literals endpoint
 */
export interface FixStringLiteralRunResponse {
  data?: FixStringLiteralRunResponse.Data;

  meta?: FixStringLiteralRunResponse.Meta;
}

export namespace FixStringLiteralRunResponse {
  export interface Data {
    /**
     * The file contents (original or fixed)
     */
    contents: string;

    /**
     * Human-readable message explaining the status
     */
    message: string;

    /**
     * Status of the string literal fix operation (deprecated, will be replaced by
     * fix_status)
     */
    status: 'no_fix_needed' | 'fix_applied' | 'fix_failed' | 'error';

    /**
     * Number of diagnostics found
     */
    diagnostics_found?: number | null;

    /**
     * Error details if status is 'error'
     */
    error?: string | null;

    /**
     * Enhanced diagnostic model for external API
     */
    relevant_error?: Data.RelevantError | null;
  }

  export namespace Data {
    /**
     * Enhanced diagnostic model for external API
     */
    export interface RelevantError {
      /**
       * Category of diagnostic
       */
      category: 'tsc' | 'tsgo' | 'import_export';

      /**
       * Code given by the diagnostic generator
       */
      code: number;

      /**
       * File where diagnostic occurs
       */
      file_path: string;

      /**
       * Location of the diagnostic
       */
      location: RelevantError.Location;

      /**
       * Diagnostic message
       */
      message: string;

      /**
       * Surrounding code context
       */
      context?: string | null;

      /**
       * Diagnostic category
       */
      severity?: 'error' | 'warning';
    }

    export namespace RelevantError {
      /**
       * Location of the diagnostic
       */
      export interface Location {
        /**
         * Column number (1-based)
         */
        column: number;

        /**
         * Line number (1-based)
         */
        line: number;

        /**
         * Span of the error
         */
        span: number;

        /**
         * Position of the first character of the error location in the source code
         */
        starting_character_position: number;
      }
    }
  }

  export interface Meta {
    /**
     * Customer identifier if provided in the request
     */
    external_id?: string;

    /**
     * Unique ID of the fixer run
     */
    fixer_run_id?: string;

    /**
     * Unique ID for tracing the request
     */
    trace_id?: string;
  }
}

export interface FixStringLiteralRunParams {
  /**
   * File to process
   */
  file: RequestTestFile;

  /**
   * Unique identifier for the event
   */
  event_id?: string | null;
}

export declare namespace FixStringLiterals {
  export {
    type RequestTestFile as RequestTestFile,
    type FixStringLiteralRunResponse as FixStringLiteralRunResponse,
    type FixStringLiteralRunParams as FixStringLiteralRunParams,
  };
}
