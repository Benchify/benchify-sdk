// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';

export class Fix extends APIResource {
  /**
   * AI-powered fallback for complex issues. Phase 3 of the 3-phase architecture.
   * Handles issues that standard fixers cannot resolve. Uses LLM to understand and
   * fix complex problems. Provides confidence scores and alternative suggestions.
   *
   * @example
   * ```ts
   * const response = await client.fix.createAIFallback({
   *   files: [
   *     {
   *       path: 'src/complex.ts',
   *       contents:
   *         'export function complexFunction() { /* complex logic * / }',
   *     },
   *   ],
   *   remaining_diagnostics: {
   *     file_to_diagnostics: {
   *       'src/complex.ts': [
   *         {
   *           message: 'Complex type inference issue',
   *           type: 'types',
   *           code: 2000,
   *           file_path: 'src/complex.ts',
   *           location: {
   *             line: 1,
   *             column: 1,
   *             starting_character_position: 0,
   *             span: 10,
   *           },
   *         },
   *       ],
   *     },
   *   },
   *   template_path: 'benchify/default-template',
   *   include_context: true,
   *   max_attempts: 3,
   * });
   * ```
   */
  createAIFallback(
    body: FixCreateAIFallbackParams,
    options?: RequestOptions,
  ): APIPromise<FixCreateAIFallbackResponse> {
    return this._client.post('/v1/fix/ai-fallback', { body, ...options });
  }
}

export interface FixCreateAIFallbackResponse {
  /**
   * The actual response data
   */
  data: FixCreateAIFallbackResponse.Data;

  /**
   * The error from the API query
   */
  error?: FixCreateAIFallbackResponse.Error | null;

  /**
   * Meta information
   */
  meta?: FixCreateAIFallbackResponse.Meta;
}

export namespace FixCreateAIFallbackResponse {
  /**
   * The actual response data
   */
  export interface Data {
    /**
     * Per-file AI fix results
     */
    file_results: Array<Data.FileResult>;

    /**
     * Number of files that were fixed
     */
    files_fixed: number;

    /**
     * Version of the fixer
     */
    fixer_version: string;

    /**
     * Total number of issues still remaining
     */
    issues_remaining: number;

    /**
     * Total number of issues resolved
     */
    issues_resolved: number;

    /**
     * Whether the AI fallback was successful overall
     */
    success: boolean;

    /**
     * Suggested changes from AI fixes
     */
    suggested_changes: Data.SuggestedChanges;
  }

  export namespace Data {
    export interface FileResult {
      /**
       * Confidence score of the fix (0-1)
       */
      confidence_score: number;

      /**
       * Number of issues still remaining
       */
      issues_remaining: number;

      /**
       * Number of issues resolved
       */
      issues_resolved: number;

      /**
       * Path of the file
       */
      path: string;

      /**
       * Whether the AI fix was successful
       */
      success: boolean;

      /**
       * Alternative fix suggestions
       */
      alternative_suggestions?: Array<string>;
    }

    /**
     * Suggested changes from AI fixes
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

export interface FixCreateAIFallbackParams {
  /**
   * List of files (potentially already fixed by standard fixers)
   */
  files: Array<FixCreateAIFallbackParams.File>;

  /**
   * Diagnostics that remain after standard fixing
   */
  remaining_diagnostics: FixCreateAIFallbackParams.RemainingDiagnostics;

  /**
   * Full path to the template
   */
  template_path: string;

  /**
   * Unique identifier for the event
   */
  event_id?: string;

  /**
   * Whether to include context in AI prompts
   */
  include_context?: boolean;

  /**
   * Maximum number of AI fix attempts
   */
  max_attempts?: number;

  /**
   * Meta information for the request
   */
  meta?: FixCreateAIFallbackParams.Meta | null;
}

export namespace FixCreateAIFallbackParams {
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
   * Diagnostics that remain after standard fixing
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

export declare namespace Fix {
  export {
    type FixCreateAIFallbackResponse as FixCreateAIFallbackResponse,
    type FixCreateAIFallbackParams as FixCreateAIFallbackParams,
  };
}
