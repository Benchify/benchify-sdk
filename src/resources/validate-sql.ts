// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import * as DiagnosticsAPI from './diagnostics';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';

export class ValidateSql extends APIResource {
  /**
   * Analyzes SQL queries for potential issues and forbidden keywords
   *
   * @example
   * ```ts
   * const response = await client.validateSql.validate({
   *   sql: 'SELECT * FROM users WHERE id = 1',
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

export interface ValidateSqlValidateResponse {
  data?: ValidateSqlValidateResponse.Data;

  meta?: DiagnosticsAPI.ResponseMeta;
}

export namespace ValidateSqlValidateResponse {
  export interface Data {
    /**
     * Description of validation result or error message
     */
    message?: string;

    /**
     * Whether the SQL query is valid
     */
    valid?: boolean;
  }
}

export interface ValidateSqlValidateParams {
  /**
   * SQL query to validate
   */
  sql: string;

  /**
   * Optional metadata for tracking and identification purposes
   */
  meta?: ValidateSqlValidateParams.Meta;
}

export namespace ValidateSqlValidateParams {
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

export declare namespace ValidateSql {
  export {
    type ValidateSqlValidateResponse as ValidateSqlValidateResponse,
    type ValidateSqlValidateParams as ValidateSqlValidateParams,
  };
}
