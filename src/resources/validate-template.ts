// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';

export class ValidateTemplate extends APIResource {
  /**
   * Validate Template
   */
  validate(
    body: ValidateTemplateValidateParams,
    options?: RequestOptions,
  ): APIPromise<ValidateTemplateValidateResponse> {
    return this._client.post('/v1/validate-template', { body, ...options });
  }
}

export interface ValidateTemplateValidateResponse {
  /**
   * Whether the template validation succeeded
   */
  success: boolean;

  /**
   * Error message if validation failed
   */
  error?: string | null;
}

export interface ValidateTemplateValidateParams {
  /**
   * Command to build the project
   */
  build_cmd?: string | null;

  /**
   * Command to run the development server
   */
  dev_cmd?: string | null;

  /**
   * Unique identifier for the event
   */
  event_id?: string | null;

  /**
   * Meta information for API requests
   */
  meta?: ValidateTemplateValidateParams.Meta | null;

  /**
   * Format for the response (diff, changed_files, or all_files)
   */
  response_format?: 'DIFF' | 'CHANGED_FILES' | 'ALL_FILES' | null;

  /**
   * Return before and after diagnostics when fixing.
   */
  return_diagnostics?: boolean | null;

  /**
   * ID of the template to use for the template validation process
   */
  template_id?: string | null;

  /**
   * Command to run TypeScript compiler
   */
  tsc_cmd?: string | null;
}

export namespace ValidateTemplateValidateParams {
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

export declare namespace ValidateTemplate {
  export {
    type ValidateTemplateValidateResponse as ValidateTemplateValidateResponse,
    type ValidateTemplateValidateParams as ValidateTemplateValidateParams,
  };
}
