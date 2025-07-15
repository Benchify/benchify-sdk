// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';

export class Fixer extends APIResource {
  /**
   * Handle fixer requests to process and fix TypeScript files.
   *
   * @example
   * ```ts
   * const response = await client.fixer.run({
   *   files: [
   *     {
   *       contents: 'contents',
   *       original_contents: 'original_contents',
   *       path: 'x',
   *     },
   *   ],
   * });
   * ```
   */
  run(body: FixerRunParams, options?: RequestOptions): APIPromise<FixerRunResponse> {
    return this._client.post('/v1/fixer', { body, ...options });
  }
}

/**
 * Request model for the /api/fixer endpoint
 */
export interface FixerRequest {
  /**
   * List of files to process
   */
  files: Array<FixerRequest.File>;

  /**
   * Command to build the project
   */
  build_cmd?: string;

  /**
   * Command to run the development server
   */
  dev_cmd?: string;

  /**
   * Configuration object for specifying which fixes to apply
   */
  fixes?: FixerRequest.Fixes | null;

  /**
   * Format for the response (diff, changed_files, or all_files)
   */
  response_format?: 'DIFF' | 'CHANGED_FILES' | 'ALL_FILES';

  /**
   * Return before and after diagnostics when fixing.
   */
  return_diagnostics?: boolean;

  /**
   * Command to run TypeScript compiler
   */
  tsc_cmd?: string;
}

export namespace FixerRequest {
  /**
   * Model for file data in requests
   */
  export interface File {
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
   * Configuration object for specifying which fixes to apply
   */
  export interface Fixes {
    /**
     * Whether to fix CSS issues
     */
    css?: boolean;

    /**
     * Whether to fix import issues
     */
    imports?: boolean;

    /**
     * Whether to fix React issues
     */
    react?: boolean;

    /**
     * Whether to fix string literal issues
     */
    stringLiterals?: boolean;

    /**
     * Whether to fix Tailwind issues
     */
    tailwind?: boolean;

    /**
     * Whether to fix TypeScript suggestions
     */
    tsSuggestions?: boolean;
  }
}

/**
 * Response model for the /api/fixer endpoint
 */
export interface FixerRunResponse {
  /**
   * Status code of the build process
   */
  build_status: number;

  /**
   * Number of files processed
   */
  files_processed: number;

  /**
   * Diagnostics from the code after fixing
   */
  final_diagnostics: FixerRunResponse.FinalDiagnostics;

  /**
   * Version of the fixer
   */
  fixer_version: string;

  /**
   * Diagnostics from the code before fixing
   */
  initial_diagnostics: FixerRunResponse.InitialDiagnostics;

  /**
   * Output of the build command
   */
  build_output?: string;

  /**
   * Information about fixed files
   */
  fixed_files?: { [key: string]: unknown } | null;

  /**
   * Data about the fixer
   */
  fixer_data?: { [key: string]: unknown } | null;

  /**
   * Changes made by the fixer in the requested format
   */
  suggested_changes?:
    | FixerRunResponse.DiffFormat
    | FixerRunResponse.ChangedFilesFormat
    | FixerRunResponse.AllFilesFormat
    | null;
}

export namespace FixerRunResponse {
  /**
   * Diagnostics from the code after fixing
   */
  export interface FinalDiagnostics {
    /**
     * Diagnostics grouped by file
     */
    file_to_diagnostics?: { [key: string]: Array<FinalDiagnostics.FileToDiagnostic> };

    /**
     * Human-readable summary of issues
     */
    summary?: string;

    /**
     * Total number of diagnostics
     */
    total_count?: number;
  }

  export namespace FinalDiagnostics {
    /**
     * Enhanced diagnostic model for external API
     */
    export interface FileToDiagnostic {
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
      location: FileToDiagnostic.Location;

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

    export namespace FileToDiagnostic {
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

  /**
   * Diagnostics from the code before fixing
   */
  export interface InitialDiagnostics {
    /**
     * Diagnostics grouped by file
     */
    file_to_diagnostics?: { [key: string]: Array<InitialDiagnostics.FileToDiagnostic> };

    /**
     * Human-readable summary of issues
     */
    summary?: string;

    /**
     * Total number of diagnostics
     */
    total_count?: number;
  }

  export namespace InitialDiagnostics {
    /**
     * Enhanced diagnostic model for external API
     */
    export interface FileToDiagnostic {
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
      location: FileToDiagnostic.Location;

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

    export namespace FileToDiagnostic {
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

  export interface DiffFormat {
    /**
     * Git diff of changes made
     */
    diff?: string | null;
  }

  export interface ChangedFilesFormat {
    /**
     * List of changed files with their new contents
     */
    changed_files?: Array<ChangedFilesFormat.ChangedFile> | null;
  }

  export namespace ChangedFilesFormat {
    /**
     * Model for a single file change
     */
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

  export interface AllFilesFormat {
    /**
     * List of all files with their current contents
     */
    all_files?: Array<AllFilesFormat.AllFile> | null;
  }

  export namespace AllFilesFormat {
    /**
     * Model for a single file change
     */
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
  }
}

export interface FixerRunParams {
  /**
   * List of files to process
   */
  files: Array<FixerRunParams.File>;

  /**
   * Command to build the project
   */
  build_cmd?: string;

  /**
   * Command to run the development server
   */
  dev_cmd?: string;

  /**
   * Configuration object for specifying which fixes to apply
   */
  fixes?: FixerRunParams.Fixes | null;

  /**
   * Format for the response (diff, changed_files, or all_files)
   */
  response_format?: 'DIFF' | 'CHANGED_FILES' | 'ALL_FILES';

  /**
   * Return before and after diagnostics when fixing.
   */
  return_diagnostics?: boolean;

  /**
   * Command to run TypeScript compiler
   */
  tsc_cmd?: string;
}

export namespace FixerRunParams {
  /**
   * Model for file data in requests
   */
  export interface File {
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
   * Configuration object for specifying which fixes to apply
   */
  export interface Fixes {
    /**
     * Whether to fix CSS issues
     */
    css?: boolean;

    /**
     * Whether to fix import issues
     */
    imports?: boolean;

    /**
     * Whether to fix React issues
     */
    react?: boolean;

    /**
     * Whether to fix string literal issues
     */
    stringLiterals?: boolean;

    /**
     * Whether to fix Tailwind issues
     */
    tailwind?: boolean;

    /**
     * Whether to fix TypeScript suggestions
     */
    tsSuggestions?: boolean;
  }
}

export declare namespace Fixer {
  export {
    type FixerRequest as FixerRequest,
    type FixerRunResponse as FixerRunResponse,
    type FixerRunParams as FixerRunParams,
  };
}
