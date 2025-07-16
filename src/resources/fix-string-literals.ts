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
   * const fixStringLiteral =
   *   await client.fixStringLiterals.create({
   *     file: {
   *       contents: 'contents',
   *       original_contents: 'original_contents',
   *       path: 'x',
   *     },
   *   });
   * ```
   */
  create(
    body: FixStringLiteralCreateParams,
    options?: RequestOptions,
  ): APIPromise<FixStringLiteralCreateResponse> {
    return this._client.post('/v1/fix-string-literals', { body, ...options });
  }
}

/**
 * Model for file data in requests
 */
export interface RequestTestFile {
  /**
   * Contents of the file
   */
  contents: string;

  /**
   * Original contents of the file before any modifications
   */
  original_contents: string;

  /**
   * Path to the file
   */
  path: string;
}

/**
 * Response model for the /api/fix_string_literals endpoint
 */
export interface FixStringLiteralCreateResponse {
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
  status: 'FIXED' | 'PARTIALLY_FIXED' | 'FAILED' | 'NO_ISSUES_FOUND';

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
  relevant_error?: FixStringLiteralCreateResponse.RelevantError | null;
}

export namespace FixStringLiteralCreateResponse {
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

export interface FixStringLiteralCreateParams {
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
    type FixStringLiteralCreateResponse as FixStringLiteralCreateResponse,
    type FixStringLiteralCreateParams as FixStringLiteralCreateParams,
  };
}
