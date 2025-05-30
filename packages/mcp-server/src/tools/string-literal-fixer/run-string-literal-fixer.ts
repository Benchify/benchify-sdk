// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { Metadata } from '../';
import Benchify from 'benchify';

export const metadata: Metadata = {
  resource: 'stringLiteralFixer',
  operation: 'write',
  tags: [],
  httpMethod: 'post',
  httpPath: '/v1/fix-string-literals',
  operationId: 'runFixStringLiteralsInFile',
};

export const tool: Tool = {
  name: 'run_string_literal_fixer',
  description:
    'Analyzes a single file and automatically fixes string literal issues such as escape sequences, invalid characters, and syntax errors',
  inputSchema: {
    type: 'object',
    properties: {
      file: {
        type: 'object',
        description: 'Single file to analyze and fix for string literal issues',
        properties: {
          contents: {
            type: 'string',
            description: 'Full contents of the file to analyze',
          },
          path: {
            type: 'string',
            description: 'Path of the file relative to the project root',
          },
        },
        required: ['contents', 'path'],
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

export const handler = (client: Benchify, args: Record<string, unknown> | undefined) => {
  const body = args as any;
  return client.stringLiteralFixer.run(body);
};

export default { metadata, tool, handler };
