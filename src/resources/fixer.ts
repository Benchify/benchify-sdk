// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';

export class Fixer extends APIResource {
  /**
   * Submit a repository for fixing
   *
   * @example
   * ```ts
   * const response = await client.fixer.run({
   *   buildCmd: 'npm run build',
   *   files: [
   *     {
   *       path: 'package.json',
   *       contents:
   *         '{"name": "simple-shopping-app", "version": "0.1.0", "scripts": {"build": "next build"}}',
   *     },
   *     {
   *       path: 'src/index.tsx',
   *       contents:
   *         "import Link from 'next/navigation/link';\nconsole.log('Hello world');",
   *     },
   *   ],
   *   fixes: {
   *     imports: true,
   *     stringLiterals: true,
   *     tsSuggestions: true,
   *   },
   * });
   * ```
   */
  run(body: FixerRunParams, options?: RequestOptions): APIPromise<FixerRunResponse> {
    return this._client.post('/v1/fixer', { body, ...options });
  }
}

export interface FixerRunResponse {
  data?: FixerRunResponse.Data;

  meta?: FixerRunResponse.Meta;
}

export namespace FixerRunResponse {
  export interface Data {
    /**
     * Output of the build command
     */
    build_output?: string;

    /**
     * Git diff of the changes made by the fixer, or null if no changes were made
     */
    diff?: string | null;

    /**
     * Whether the build succeeded
     */
    success?: boolean;
  }

  export interface Meta {
    /**
     * Unique ID of the fixer run
     */
    fixer_run_id?: string;
  }
}

export interface FixerRunParams {
  /**
   * The command required to build the project.
   */
  buildCmd: string;

  /**
   * List of files to be fixed. Use this instead of repoUrl when submitting
   * individual files.
   */
  files?: Array<FixerRunParams.File>;

  /**
   * Benchify will apply all static fixes by default. If you want to only apply
   * certain fixes, pass in the flags you want to apply.
   */
  fixes?: FixerRunParams.Fixes;

  /**
   * A user-defined name for the fix job.
   */
  jobName?: string;

  /**
   * Publicly accessible URL to a .git repo, zip, tar, or tar.gz archive.
   */
  repoUrl?: string;
}

export namespace FixerRunParams {
  export interface File {
    /**
     * Contents of the file
     */
    contents: string;

    /**
     * Path to the file within the project
     */
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
}

export declare namespace Fixer {
  export { type FixerRunResponse as FixerRunResponse, type FixerRunParams as FixerRunParams };
}
