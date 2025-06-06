// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { asTextContentResult } from 'benchify-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { Metadata } from '../';
import Benchify from 'benchify';

export const metadata: Metadata = {
  resource: 'diagnostics',
  operation: 'write',
  tags: [],
  httpMethod: 'post',
  httpPath: '/v1/diagnostics',
  operationId: 'runDiagnostics',
};

export const tool: Tool = {
  name: 'run_diagnostics',
  description: 'Analyzes code and returns a list of potential issues',
  inputSchema: {
    type: 'object',
    properties: {
      files: {
        type: 'array',
        description: 'Array of file objects with path and contents',
        items: {
          type: 'object',
          properties: {
            contents: {
              type: 'string',
            },
            path: {
              type: 'string',
            },
          },
          required: ['contents', 'path'],
        },
      },
      fixes: {
        type: 'object',
        description:
          'Benchify will apply all static fixes by default. If you want to only apply certain fixes, pass in the flags you want to apply.',
        properties: {
          css: {
            type: 'boolean',
            description:
              'Analyzes and corrects unused, invalid, or misapplied CSS and Tailwind class references, including removal of unused styles',
          },
          imports: {
            type: 'boolean',
            description:
              'Fix incorrect packages, undefined references, local paths, hallucinated dependencies, and other import/export errors',
          },
          stringLiterals: {
            type: 'boolean',
            description:
              'Statically fix string escape sequences, invalid characters, and other common string literal issues',
          },
          tsSuggestions: {
            type: 'boolean',
            description:
              'Applies TypeScript compiler suggestions and fixes, resolving type errors, mismatched assertions, and generic parameter issues through static analysis.',
          },
        },
        required: [],
      },
      meta: {
        type: 'object',
        description: 'Optional metadata for tracking and identification purposes',
        properties: {
          external_id: {
            type: 'string',
            description: 'Customer identifier for tracking purposes',
          },
        },
        required: [],
      },
    },
  },
};

export const handler = async (client: Benchify, args: Record<string, unknown> | undefined) => {
  const body = args as any;
  return asTextContentResult(await client.diagnostics.run(body));
};

export default { metadata, tool, handler };
