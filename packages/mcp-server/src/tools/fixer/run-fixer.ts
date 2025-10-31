// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { Metadata, asTextContentResult } from 'benchify-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Benchify from 'benchify';

export const metadata: Metadata = {
  resource: 'fixer',
  operation: 'write',
  tags: [],
  httpMethod: 'post',
  httpPath: '/v1/fixer',
  operationId: 'fixer_api_fixer_post',
};

export const tool: Tool = {
  name: 'run_fixer',
  description:
    'Handle fixer requests - supports two formats: 1) JSON with inline file contents in files array, 2) multipart/form-data with tar.zst bundle and manifest (same as Sandbox API). Use multipart for better performance with large projects.',
  inputSchema: {
    type: 'object',
    properties: {
      bundle: {
        type: 'boolean',
        description: 'Whether to bundle the project (experimental)',
      },
      event_id: {
        type: 'string',
        description: 'Unique identifier for the event',
      },
      files: {
        type: 'array',
        description:
          'List of files to process (JSON format with inline contents). For large projects, use multipart/form-data with manifest + bundle instead.',
        items: {
          type: 'object',
          properties: {
            contents: {
              type: 'string',
              description: 'File contents',
            },
            path: {
              type: 'string',
              description: 'Path to the file',
            },
          },
          required: ['contents', 'path'],
        },
      },
      fixes: {
        type: 'array',
        description: 'Configuration for which fix types to apply',
        items: {
          type: 'string',
          enum: ['dependency', 'parsing', 'css', 'ai_fallback', 'types', 'ui', 'sql'],
        },
      },
      meta: {
        type: 'object',
        description: 'Meta information for the request',
        properties: {
          external_id: {
            type: 'string',
            description: 'Customer tracking identifier',
          },
        },
      },
      mode: {
        type: 'string',
        description: 'Fixer operating mode',
        enum: ['project', 'files'],
      },
      response_encoding: {
        type: 'string',
        description: 'Response encoding format',
        enum: ['json', 'blob'],
      },
      response_format: {
        type: 'string',
        description: 'Format for the response (diff, changed_files, or all_files)',
        enum: ['DIFF', 'CHANGED_FILES', 'ALL_FILES'],
      },
      template_id: {
        type: 'string',
        description: 'ID of the template to use',
      },
      template_path: {
        type: 'string',
        description: 'Full path to the template',
      },
    },
    required: [],
  },
  annotations: {},
};

export const handler = async (client: Benchify, args: Record<string, unknown> | undefined) => {
  const body = args as any;
  return asTextContentResult(await client.fixer.run(body));
};

export default { metadata, tool, handler };
