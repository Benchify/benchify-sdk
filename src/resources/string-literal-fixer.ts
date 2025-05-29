// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';

export class StringLiteralFixer extends APIResource {
  /**
   * Analyzes a single file and automatically fixes string literal issues such as
   * escape sequences, invalid characters, and syntax errors
   *
   * @example
   * ```ts
   * const response = await client.stringLiteralFixer.run({
   *   file: {
   *     path: 'src/components/Button.tsx',
   *     contents:
   *       'function Button() { return <button>Click me</button> }',
   *   },
   * });
   * ```
   */
  run(
    body: StringLiteralFixerRunParams,
    options?: RequestOptions,
  ): APIPromise<StringLiteralFixerRunResponse> {
    return this._client.post('/v1/fix-string-literals', { body, ...options });
  }
}

export interface StringLiteralFixerRunResponse {
  data?: StringLiteralFixerRunResponse.Data;

  meta?: StringLiteralFixerRunResponse.Meta;
}

export namespace StringLiteralFixerRunResponse {
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

  export interface Meta {
    /**
     * Unique ID of the fixer run
     */
    fixer_run_id?: string;
  }
}

export interface StringLiteralFixerRunParams {
  /**
   * Single file to analyze and fix for string literal issues
   */
  file: StringLiteralFixerRunParams.File;
}

export namespace StringLiteralFixerRunParams {
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
}

export declare namespace StringLiteralFixer {
  export {
    type StringLiteralFixerRunResponse as StringLiteralFixerRunResponse,
    type StringLiteralFixerRunParams as StringLiteralFixerRunParams,
  };
}
