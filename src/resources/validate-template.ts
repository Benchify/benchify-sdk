// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';

export class ValidateTemplate extends APIResource {
  /**
   * Validate a template configuration
   */
  validate(
    body: ValidateTemplateValidateParams | null | undefined = {},
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
   * Meta information for the request
   */
  meta?: ValidateTemplateValidateParams.Meta | null;

  /**
   * Format for the response
   */
  response_format?: 'DIFF' | 'CHANGED_FILES' | 'ALL_FILES' | null;

  /**
   * ID of the template
   */
  template_id?: string | null;

  /**
   * Full path to the template to use for validation
   */
  template_path?: string | null;

  templateId?: string;

  templateName?: string;
}

export namespace ValidateTemplateValidateParams {
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

export declare namespace ValidateTemplate {
  export {
    type ValidateTemplateValidateResponse as ValidateTemplateValidateResponse,
    type ValidateTemplateValidateParams as ValidateTemplateValidateParams,
  };
}
