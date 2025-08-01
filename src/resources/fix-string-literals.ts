// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import * as Shared from './shared';
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
 * Wrapped response model for benchify-api compatibility
 */
export interface FixStringLiteralRunResponse {
  /**
   * Response model for the /api/fix_string_literals endpoint
   */
  data: FixStringLiteralRunResponse.Data;

  /**
   * Meta information for API responses
   */
  meta: Shared.ResponseMeta;
}

export namespace FixStringLiteralRunResponse {
  /**
   * Response model for the /api/fix_string_literals endpoint
   */
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
     * Status of the fix operation
     */
    status: 'FIXED' | 'PARTIALLY_FIXED' | 'FAILED' | 'NO_ISSUES_FOUND' | 'fix_applied';

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
      category: 'typescript' | 'import_export';

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

  /**
   * Meta information for API requests
   */
  meta?: FixStringLiteralRunParams.Meta | null;
}

export namespace FixStringLiteralRunParams {
  /**
   * Meta information for API requests
   */
  export interface Meta {
    /**
     * Customer tracking identifier
     */
    external_id?: string | null;
  }
}

export declare namespace FixStringLiterals {
  export {
    type RequestTestFile as RequestTestFile,
    type FixStringLiteralRunResponse as FixStringLiteralRunResponse,
    type FixStringLiteralRunParams as FixStringLiteralRunParams,
  };
}
