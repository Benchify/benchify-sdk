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
    'Handle fixer requests - supports both legacy (embedded files) and new (manifest+blobs) formats.',
  inputSchema: {
    type: 'object',
    properties: {
      bundle: {
        type: 'boolean',
        title: 'Bundle',
        description: 'Whether to bundle the project (experimental)',
      },
      files: {
        type: 'array',
        title: 'Files',
        description: 'List of files to process (legacy format)',
        items: {
          type: 'object',
          title: 'RequestTestFile',
          description: 'Model for file data - clean and simple',
          properties: {
            contents: {
              type: 'string',
              title: 'Contents',
              description: 'File contents',
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
      files_data: {
        type: 'string',
        title: 'Files Data',
        description: 'Base64-encoded compressed file contents (packed format)',
      },
      files_manifest: {
        type: 'array',
        title: 'Files Manifest',
        description: 'File manifest for packed format: [{"path": "app.tsx", "size": 1024}, ...]',
        items: {
          type: 'object',
          additionalProperties: true,
        },
      },
      fixes: {
        type: 'array',
        title: 'Fixes',
        description: 'Configuration for which fix types to apply',
        items: {
          type: 'string',
          title: 'FixTypeName',
          description: 'Enumeration of available fix types',
          enum: ['dependency', 'parsing', 'css', 'ai_fallback', 'types', 'ui', 'sql'],
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
      mode: {
        type: 'string',
        title: 'FixerMode',
        description: "Fixer operating mode: 'project' expects full project, 'files' expects subset",
        enum: ['project', 'files'],
      },
      response_encoding: {
        type: 'string',
        title: 'ResponseEncoding',
        description: "Response encoding format: 'json' (default) or 'blob'",
        enum: ['json', 'blob'],
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
    required: [],
  },
  annotations: {},
};

export const handler = async (client: Benchify, args: Record<string, unknown> | undefined) => {
  const body = args as any;
  return asTextContentResult(await client.fixer.run(body));
};

export default { metadata, tool, handler };
