// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';

export class ValidateSql extends APIResource {
  /**
   * Validate SQL queries.
   *
   * @example
   * ```ts
   * const response = await client.validateSql.validate({
   *   sql: 'x',
   * });
   * ```
   */
  validate(
    body: ValidateSqlValidateParams,
    options?: RequestOptions,
  ): APIPromise<ValidateSqlValidateResponse> {
    return this._client.post('/v1/validate-sql', { body, ...options });
  }
}

/**
 * Response model for the /api/validate_sql endpoint
 */
export interface ValidateSqlValidateResponse {
  /**
   * Validation message or error details
   */
  message: string;

  /**
   * Whether the SQL is valid
   */
  valid: boolean;

  /**
   * Error details if validation fails
   */
  error?: string | null;
}

export interface ValidateSqlValidateParams {
  /**
   * SQL query to validate
   */
  sql: string;

  /**
   * Meta information for API requests
   */
  meta?: ValidateSqlValidateParams.Meta | null;
}

export namespace ValidateSqlValidateParams {
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

export declare namespace ValidateSql {
  export {
    type ValidateSqlValidateResponse as ValidateSqlValidateResponse,
    type ValidateSqlValidateParams as ValidateSqlValidateParams,
  };
}
