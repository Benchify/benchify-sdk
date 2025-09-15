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
  description: 'Handle fixer requests to process and fix TypeScript files.',
  inputSchema: {
    type: 'object',
    properties: {
      files: {
        type: 'array',
        title: 'Files',
        description: 'List of files to process',
        items: {
          type: 'object',
          title: 'RequestTestFile',
          description: 'Model for file data in requests',
          properties: {
            contents: {
              type: 'string',
              title: 'Contents',
              description: 'Original contents of the file before any modifications',
            },
            path: {
              type: 'string',
              title: 'Path',
              description: 'Path to the file',
            },
          },
          required: ['contents', 'path'],
        },
      },
      bundle: {
        type: 'boolean',
        title: 'Bundle',
        description: 'Whether to bundle the project (experimental)',
      },
      fix_types: {
        type: 'array',
        title: 'Fix Types',
        description: 'Configuration for which fix types to apply',
        items: {
          type: 'string',
          title: 'FixTypeName',
          description: 'Enumeration of available fix types',
          enum: ['import_export', 'string_literals', 'css', 'ai_fallback', 'types', 'ui', 'sql'],
        },
      },
      fixes: {
        type: 'object',
        title: 'FixConfigObject',
        description: 'DEPRECATED: legacy boolean flags for which fixes to apply.',
        properties: {
          css: {
            type: 'boolean',
            title: 'Css',
            description: 'Whether to fix CSS issues',
          },
          imports: {
            type: 'boolean',
            title: 'Imports',
            description: 'Whether to fix import issues',
          },
          react: {
            type: 'boolean',
            title: 'React',
            description: 'Whether to fix React issues',
          },
          stringLiterals: {
            type: 'boolean',
            title: 'Stringliterals',
            description: 'Whether to fix string literal issues',
          },
          tailwind: {
            type: 'boolean',
            title: 'Tailwind',
            description: 'Whether to fix Tailwind issues',
          },
          tsSuggestions: {
            type: 'boolean',
            title: 'Tssuggestions',
            description: 'Whether to fix TypeScript suggestions',
          },
        },
      },
      meta: {
        type: 'object',
        title: 'RequestMeta',
        description: 'Meta information for API requests',
        properties: {
          external_id: {
            type: 'string',
            title: 'External Id',
            description: 'Customer tracking identifier',
          },
        },
      },
      response_format: {
        type: 'string',
        title: 'ResponseFormat',
        description: 'Format for the response (diff, changed_files, or all_files)',
        enum: ['DIFF', 'CHANGED_FILES', 'ALL_FILES'],
      },
      template_id: {
        type: 'string',
        title: 'Template Id',
        description: 'ID of the template to use for the fixer process',
      },
    },
    required: ['files'],
  },
  annotations: {},
};

export const handler = async (client: Benchify, args: Record<string, unknown> | undefined) => {
  const body = args as any;
  return asTextContentResult(await client.fixer.run(body));
};

export default { metadata, tool, handler };
