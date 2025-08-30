// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import * as FixerAPI from './fixer';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';

export class Fixer extends APIResource {
  /**
   * Handle fixer requests to process and fix TypeScript files.
   *
   * @example
   * ```ts
   * const fixer = await client.fixer.create({
   *   files: [{ contents: 'contents', path: 'x' }],
   * });
   * ```
   */
  create(body: FixerCreateParams, options?: RequestOptions): APIPromise<FixerCreateResponse> {
    return this._client.post('/v1/fixer', { body, ...options });
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
 * Enumeration of available fix types
 */
export type FixTypeName = 'import_export' | 'string_literals' | 'css' | 'ai_fallback' | 'types' | 'sql';

/**
 * Wrapped response model for benchify-api compatibility
 */
export interface FixerCreateResponse {
  /**
   * The actual response data
   */
  data: FixerCreateResponse.Data;

  /**
   * The error from the API query
   */
  error?: FixerCreateResponse.Error | null;

  /**
   * Meta information
   */
  meta?: FixerCreateResponse.Meta;
}

export namespace FixerCreateResponse {
  /**
   * The actual response data
   */
  export interface Data {
    /**
     * Final per-file status after fixing
     */
    status: Data.Status;

    /**
     * Information about the bundling process and results
     */
    bundle?: Data.Bundle | null;

    /**
     * List of fix types that were actually applied during the fixer run
     */
    fix_types_used?: Array<FixerAPI.FixTypeName>;

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
      composite_status:
        | 'FIXED_EVERYTHING'
        | 'FIXED_REQUESTED'
        | 'PARTIALLY_FIXED'
        | 'NO_REQUESTED_ISSUES'
        | 'NO_ISSUES'
        | 'FAILED';

      /**
       * Status of each file.
       */
      file_to_composite_status?: {
        [key: string]:
          | 'FIXED_EVERYTHING'
          | 'FIXED_REQUESTED'
          | 'PARTIALLY_FIXED'
          | 'NO_REQUESTED_ISSUES'
          | 'NO_ISSUES'
          | 'FAILED';
      };
    }

    /**
     * Information about the bundling process and results
     */
    export interface Bundle {
      /**
       * The detected project/build system type
       */
      build_system:
        | 'OLIVE_TEMPLATE'
        | 'VITE_SUBDIR'
        | 'VITE_ROOT'
        | 'NEXT'
        | 'ESBUILD'
        | 'WEBPACK'
        | 'PARCEL'
        | 'UNKNOWN';

      /**
       * Overall status of the bundling operation
       */
      status: 'SUCCESS' | 'FAILED' | 'NOT_ATTEMPTED' | 'PARTIAL_SUCCESS';

      /**
       * Template path used for bundling
       */
      template_path: string;

      /**
       * Successfully bundled files
       */
      files?: Array<FixerAPI.FileChange>;
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

export interface FixerCreateParams {
  /**
   * List of files to process
   */
  files: Array<FixerCreateParams.File>;

  /**
   * Whether to bundle the project (experimental)
   */
  bundle?: boolean;

  /**
   * Configuration for which fix types to apply
   */
  fix_types?: Array<FixTypeName>;

  /**
   * @deprecated DEPRECATED: legacy boolean flags for which fixes to apply.
   */
  fixes?: FixerCreateParams.Fixes | null;

  /**
   * Meta information for API requests
   */
  meta?: FixerCreateParams.Meta | null;

  /**
   * Format for the response (diff, changed_files, or all_files)
   */
  response_format?: 'DIFF' | 'CHANGED_FILES' | 'ALL_FILES';

  /**
   * ID of the template to use for the fixer process
   */
  template_id?: string | null;
}

export namespace FixerCreateParams {
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
    type FileChange as FileChange,
    type FixTypeName as FixTypeName,
    type FixerCreateResponse as FixerCreateResponse,
    type FixerCreateParams as FixerCreateParams,
  };
}
