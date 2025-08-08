// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import * as FixerAPI from './fixer';
import * as FixStringLiteralsAPI from './fix-string-literals';
import * as Shared from './shared';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';

export class Fixer extends APIResource {
  /**
   * Handle fixer requests to process and fix TypeScript files.
   *
   * @example
   * ```ts
   * const response = await client.fixer.run({
   *   files: [{ contents: 'contents', path: 'x' }],
   * });
   * ```
   */
  run(body: FixerRunParams, options?: RequestOptions): APIPromise<FixerRunResponse> {
    return this._client.post('/v1/fixer', { body, ...options });
  }
}

/**
 * Result of running diagnostics
 */
export interface DiagnosticResponse {
  /**
   * Diagnostics grouped by file
   */
  file_to_diagnostics?: { [key: string]: Array<DiagnosticResponse.FileToDiagnostic> };

  /**
   * Human-readable summary of issues
   */
  summary?: string;

  /**
   * Total number of diagnostics
   */
  total_count?: number;
}

export namespace DiagnosticResponse {
  /**
   * Enhanced diagnostic model for external API
   */
  export interface FileToDiagnostic {
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
 * Model for a single file change
 */
export interface FileChange {
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
 * Wrapped response model for benchify-api compatibility
 */
export interface FixerRunResponse {
  /**
   * The actual response data
   */
  data: FixerRunResponse.Data;

  /**
   * The error from the API query
   */
  error?: FixerRunResponse.Error | null;

  /**
   * Meta information
   */
  meta?: Shared.ResponseMeta;
}

export namespace FixerRunResponse {
  /**
   * The actual response data
   */
  export interface Data {
    /**
     * Number of files processed
     */
    files_processed: number;

    /**
     * Final per-file status after fixing
     */
    status: Data.Status;

    /**
     * Information about fixed files
     */
    fixed_files?: { [key: string]: unknown } | null;

    /**
     * Changes made by the fixer in the requested format
     */
    suggested_changes?: Data.DiffFormat | Data.ChangedFilesFormat | Data.AllFilesFormat | null;
  }

  export namespace Data {
    /**
     * Final per-file status after fixing
     */
    export interface Status {
      /**
       * Fix status of each file sent.
       */
      file_to_status?: { [key: string]: 'FIXED' | 'PARTIALLY_FIXED' | 'FAILED' | 'NO_ISSUES_FOUND' };
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
      changed_files?: Array<FixerAPI.FileChange> | null;
    }

    export interface AllFilesFormat {
      /**
       * List of all files with their current contents
       */
      all_files?: Array<FixerAPI.FileChange> | null;
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
     * Details about what caused the error, if available
     */
    details?: string;

    /**
     * Potential suggestions about how to fix the error, if applicable
     */
    suggestions?: Array<string>;
  }
}

export interface FixerRunParams {
  /**
   * List of files to process
   */
  files: Array<FixStringLiteralsAPI.RequestTestFile>;

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
   * Meta information for API requests
   */
  meta?: FixerRunParams.Meta | null;

  /**
   * Format for the response (diff, changed_files, or all_files)
   */
  response_format?: 'DIFF' | 'CHANGED_FILES' | 'ALL_FILES';

  /**
   * Return before and after diagnostics when fixing.
   */
  return_diagnostics?: boolean;

  /**
   * ID of the template to use for the fixer process
   */
  template_id?: string | null;

  /**
   * Command to run TypeScript compiler
   */
  tsc_cmd?: string;
}

export namespace FixerRunParams {
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

export declare namespace Fixer {
  export {
    type DiagnosticResponse as DiagnosticResponse,
    type FileChange as FileChange,
    type FixerRunResponse as FixerRunResponse,
    type FixerRunParams as FixerRunParams,
  };
}
