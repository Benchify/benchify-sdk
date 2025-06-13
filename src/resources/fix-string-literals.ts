// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import * as DiagnosticsAPI from './diagnostics';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';

export class FixStringLiterals extends APIResource {
  /**
   * Analyzes a single file and automatically fixes string literal issues such as
   * escape sequences, invalid characters, and syntax errors
   *
   * @example
   * ```ts
   * const fixStringLiteral =
   *   await client.fixStringLiterals.create({
   *     file: {
   *       path: 'src/components/Button.tsx',
   *       contents:
   *         'function Button() { return <button>Click me</button> }',
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

export interface FixStringLiteralCreateResponse {
  data?: FixStringLiteralCreateResponse.Data;

  meta?: DiagnosticsAPI.ResponseMeta;
}

export namespace FixStringLiteralCreateResponse {
  export interface Data {
    /**
     * The file contents (original if no fix needed/failed, or fixed if successful)
     */
    contents?: string;

    /**
     * Number of diagnostics found in the file
     */
    diagnostics_found?: number | null;

    /**
     * Error details if status is 'error'
     */
    error?: string | null;

    /**
     * Human-readable message explaining the status
     */
    message?: string;

    /**
     * The earliest relevant string literal error found, if any
     */
    relevant_error?: Data.RelevantError | null;

    /**
     * Status of the string literal fix operation
     */
    status?: 'no_fix_needed' | 'fix_applied' | 'fix_failed' | 'error';
  }

  export namespace Data {
    /**
     * The earliest relevant string literal error found, if any
     */
    export interface RelevantError {
      /**
       * Column number where the error occurred
       */
      column?: number;

      /**
       * Line number where the error occurred
       */
      line?: number;

      /**
       * Error message
       */
      message?: string;
    }
  }
}

export interface FixStringLiteralCreateParams {
  /**
   * Single file to analyze and fix for string literal issues
   */
  file: FixStringLiteralCreateParams.File;

  /**
   * Optional metadata for tracking and identification purposes
   */
  meta?: FixStringLiteralCreateParams.Meta;
}

export namespace FixStringLiteralCreateParams {
  /**
   * Single file to analyze and fix for string literal issues
   */
  export interface File {
    /**
     * Full contents of the file to analyze
     */
    contents: string;

    /**
     * Path of the file relative to the project root
     */
    path: string;
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

export declare namespace FixStringLiterals {
  export {
    type FixStringLiteralCreateResponse as FixStringLiteralCreateResponse,
    type FixStringLiteralCreateParams as FixStringLiteralCreateParams,
  };
}
