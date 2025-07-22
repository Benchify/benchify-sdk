// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';

export class Heartbeat extends APIResource {
  /**
   * Simple heartbeat endpoint to check if Fixer is alive
   */
  check(options?: RequestOptions): APIPromise<unknown> {
    return this._client.post('/v1/heartbeat', options);
  }
}

export type HeartbeatCheckResponse = unknown;

export declare namespace Heartbeat {
  export { type HeartbeatCheckResponse as HeartbeatCheckResponse };
}
