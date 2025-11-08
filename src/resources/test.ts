// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';

export class Test extends APIResource {
  /**
   * Simple test endpoint that returns hello
   */
  retrieve(options?: RequestOptions): APIPromise<TestRetrieveResponse> {
    return this._client.get('/v1/test', options);
  }
}

export interface TestRetrieveResponse {
  message: string;
}

export declare namespace Test {
  export { type TestRetrieveResponse as TestRetrieveResponse };
}
