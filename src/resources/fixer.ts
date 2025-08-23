// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import * as FixerAPI from './fixer';
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
}

export namespace DiagnosticResponse {
  /**
   * Enhanced diagnostic model for external API
   */
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
    type:
      | 'type_error'
      | 'string_literal'
      | 'import_export'
      | 'implicit_any'
      | 'implicit_any_array'
      | 'invalid_jsx'
      | 'unclassified';

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
     * Final per-file status after fixing
     */
    status: Data.Status;

    /**
     * Bundled files
     */
    bundled_files?: Array<FixerAPI.FileChange> | null;

    /**
     * List of fix types that were actually applied during the fixer run
     */
    fix_types_used?: Array<
      'import_export' | 'string_literals' | 'css' | 'tailwind' | 'ai_fallback' | 'types'
    >;

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
  files: Array<FixerRunParams.File>;

  /**
   * Whether to bundle the project (experimental)
   */
  bundle?: boolean;

  /**
   * Configuration for which fix types to apply
   */
  fix_types?: Array<'import_export' | 'string_literals' | 'css' | 'tailwind' | 'ai_fallback' | 'types'>;

  /**
   * @deprecated DEPRECATED: legacy boolean flags for which fixes to apply.
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
   * ID of the template to use for the fixer process
   */
  template_id?: string | null;
}

export namespace FixerRunParams {
  /**
   * Model for file data in requests
   */
  export interface File {
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
   * @deprecated DEPRECATED: legacy boolean flags for which fixes to apply.
   */
  export interface Fixes {
    /**
     * @deprecated Whether to fix CSS issues
     */
    css?: boolean | null;

    /**
     * @deprecated Whether to fix import issues
     */
    imports?: boolean | null;

    /**
     * @deprecated Whether to fix React issues
     */
    react?: boolean | null;

    /**
     * @deprecated Whether to fix string literal issues
     */
    stringLiterals?: boolean | null;

    /**
     * @deprecated Whether to fix Tailwind issues
     */
    tailwind?: boolean | null;

    /**
     * @deprecated Whether to fix TypeScript suggestions
     */
    tsSuggestions?: boolean | null;
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
