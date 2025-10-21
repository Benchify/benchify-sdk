// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import * as FixerAPI from './fixer';
import * as Shared from './shared';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';

export class Fixer extends APIResource {
  /**
   * Handle fixer requests - supports both legacy (embedded files) and new
   * (manifest+blobs) formats.
   *
   * @example
   * ```ts
   * const response = await client.fixer.run();
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
  file_to_diagnostics?: { [key: string]: Array<unknown> };
}

/**
 * Model for a single file change
 */
export interface FixerFile {
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
     * Information about the bundling process and results
     */
    bundle?: Data.Bundle | null;

    /**
     * List of fix types that were actually applied during the fixer run
     */
    fix_types_used?: Array<'dependency' | 'parsing' | 'css' | 'ai_fallback' | 'types' | 'ui' | 'sql'>;

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
       * Overall status of the bundling operation
       */
      status: 'SUCCESS' | 'FAILED' | 'NOT_ATTEMPTED' | 'PARTIAL_SUCCESS';

      /**
       * Successfully bundled files
       */
      files?: Array<FixerAPI.FixerFile>;

      /**
       * Base64-encoded compressed file contents (blob format)
       */
      files_data?: string | null;

      /**
       * File manifest for blob format: [{"path": "app.tsx", "size": 1024}, ...]
       */
      files_manifest?: Array<{ [key: string]: unknown }> | null;
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
      changed_files?: Array<FixerAPI.FixerFile> | null;

      /**
       * Base64-encoded compressed file contents (blob format)
       */
      changed_files_data?: string | null;

      /**
       * File manifest for blob format: [{"path": "app.tsx", "size": 1024}, ...]
       */
      changed_files_manifest?: Array<{ [key: string]: unknown }> | null;
    }

    export interface AllFilesFormat {
      /**
       * List of all files with their current contents
       */
      all_files?: Array<FixerAPI.FixerFile> | null;

      /**
       * Base64-encoded compressed file contents (blob format)
       */
      all_files_data?: string | null;

      /**
       * File manifest for blob format: [{"path": "app.tsx", "size": 1024}, ...]
       */
      all_files_manifest?: Array<{ [key: string]: unknown }> | null;
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
   * Whether to bundle the project (experimental)
   */
  bundle?: boolean;

  /**
   * List of files to process (legacy format)
   */
  files?: Array<FixerRunParams.File> | null;

  /**
   * Base64-encoded compressed file contents (packed format)
   */
  files_data?: string | null;

  /**
   * File manifest for packed format: [{"path": "app.tsx", "size": 1024}, ...]
   */
  files_manifest?: Array<{ [key: string]: unknown }> | null;

  /**
   * Configuration for which fix types to apply
   */
  fixes?: Array<'dependency' | 'parsing' | 'css' | 'ai_fallback' | 'types' | 'ui' | 'sql'>;

  /**
   * Meta information for API requests
   */
  meta?: FixerRunParams.Meta | null;

  /**
   * Fixer operating mode: 'project' expects full project, 'files' expects subset
   */
  mode?: 'project' | 'files';

  /**
   * Response encoding format: 'json' (default) or 'blob'
   */
  response_encoding?: 'json' | 'blob';

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
   * Model for file data - clean and simple
   */
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
    type FixerFile as FixerFile,
    type FixerRunResponse as FixerRunResponse,
    type FixerRunParams as FixerRunParams,
  };
}
