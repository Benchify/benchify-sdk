// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

/**
 * Meta information for API responses
 */
export interface ResponseMeta {
  /**
   * Customer tracking identifier
   */
  external_id?: string | null;

  /**
   * Unique trace identifier for the request
   */
  trace_id?: string | null;
}
