// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';

export class Diagnostics extends APIResource {
  /**
   * Analyzes code and returns a list of potential issues
   *
   * @example
   * ```ts
   * const response = await client.diagnostics.run({
   *   files: [
   *     {
   *       path: 'src/component.tsx',
   *       contents:
   *         "function Button() { return <button className='bg-blue'>Click me</button> }",
   *     },
   *   ],
   * });
   * ```
   */
  run(body: DiagnosticRunParams, options?: RequestOptions): APIPromise<DiagnosticRunResponse> {
    return this._client.post('/v1/diagnostics', { body, ...options });
  }
}

export interface DiagnosticRunResponse {
  data?: DiagnosticRunResponse.Data;

  meta?: DiagnosticRunResponse.Meta;
}

export namespace DiagnosticRunResponse {
  export interface Data {
    issues?: Array<Data.Issue>;
  }

  export namespace Data {
    export interface Issue {
      location?: Issue.Location;

      /**
       * Description of the issue
       */
      message?: string;

      /**
       * Type of issue found
       */
      type?: string;
    }

    export namespace Issue {
      export interface Location {
        column?: number;

        file?: string;

        line?: number;
      }
    }
  }

  export interface Meta {
    /**
     * Customer identifier if provided in the request
     */
    external_id?: string;

    /**
     * Unique ID of the fixer run
     */
    fixer_run_id?: string;

    /**
     * Unique ID for tracing the request
     */
    trace_id?: string;
  }
}

export interface DiagnosticRunParams {
  /**
   * Array of file objects with path and contents
   */
  files: Array<DiagnosticRunParams.File>;

  /**
   * Benchify will apply all static fixes by default. If you want to only apply
   * certain fixes, pass in the flags you want to apply.
   */
  fixes?: DiagnosticRunParams.Fixes;

  /**
   * Optional metadata for tracking and identification purposes
   */
  meta?: DiagnosticRunParams.Meta;
}

export namespace DiagnosticRunParams {
  export interface File {
    contents: string;

    path: string;
  }

  /**
   * Benchify will apply all static fixes by default. If you want to only apply
   * certain fixes, pass in the flags you want to apply.
   */
  export interface Fixes {
    /**
     * Analyzes and corrects unused, invalid, or misapplied CSS and Tailwind class
     * references, including removal of unused styles
     */
    css?: boolean;

    /**
     * Fix incorrect packages, undefined references, local paths, hallucinated
     * dependencies, and other import/export errors
     */
    imports?: boolean;

    /**
     * Statically fix string escape sequences, invalid characters, and other common
     * string literal issues
     */
    stringLiterals?: boolean;

    /**
     * Applies TypeScript compiler suggestions and fixes, resolving type errors,
     * mismatched assertions, and generic parameter issues through static analysis.
     */
    tsSuggestions?: boolean;
  }

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

export declare namespace Diagnostics {
  export {
    type DiagnosticRunResponse as DiagnosticRunResponse,
    type DiagnosticRunParams as DiagnosticRunParams,
  };
}
