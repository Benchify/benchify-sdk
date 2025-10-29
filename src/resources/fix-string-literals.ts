// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';

export class FixStringLiterals extends APIResource {
  /**
   * Fix string literal issues in TypeScript files.
   */
  create(
    body: FixStringLiteralCreateParams,
    options?: RequestOptions,
  ): APIPromise<FixStringLiteralCreateResponse> {
    return this._client.post('/v1/fix-string-literals', { body, ...options });
  }
}

export interface FixStringLiteralCreateResponse {
  /**
   * The actual response data
   */
  data: FixStringLiteralCreateResponse.Data;

  /**
   * The error from the API query
   */
  error?: FixStringLiteralCreateResponse.Error | null;

  /**
   * Meta information
   */
  meta?: FixStringLiteralCreateResponse.Meta;
}

export namespace FixStringLiteralCreateResponse {
  /**
   * The actual response data
   */
  export interface Data {
    /**
     * The file contents (original or fixed)
     */
    contents: string;

    /**
     * Version of the fixer
     */
    fixer_version: string;

    /**
     * Status of the fix operation
     */
    status: 'FIXED' | 'ALREADY_FIXED' | 'NO_ISSUES_FOUND' | 'fix_applied';

    /**
     * Strategy statistics for the single file
     */
    strategy_statistics: Array<Data.StrategyStatistic>;

    /**
     * Error details if status is 'error'
     */
    error?: string | null;
  }

  export namespace Data {
    export interface StrategyStatistic {
      strategy_name: string;

      version_hash: string;

      fixes_applied?: boolean;

      fixes_fired?: boolean;
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

export interface FixStringLiteralCreateParams {
  /**
   * File to process
   */
  file: FixStringLiteralCreateParams.File;

  /**
   * Unique identifier for the event
   */
  event_id?: string | null;

  /**
   * Meta information for the request
   */
  meta?: FixStringLiteralCreateParams.Meta | null;
}

export namespace FixStringLiteralCreateParams {
  /**
   * File to process
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
   * Meta information for the request
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
    type FixStringLiteralCreateResponse as FixStringLiteralCreateResponse,
    type FixStringLiteralCreateParams as FixStringLiteralCreateParams,
  };
}
