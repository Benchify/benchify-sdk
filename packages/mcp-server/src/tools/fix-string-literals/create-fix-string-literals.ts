// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { maybeFilter } from 'benchify-mcp/filtering';
import { Metadata, asTextContentResult } from 'benchify-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Benchify from 'benchify';

export const metadata: Metadata = {
  resource: 'fix_string_literals',
  operation: 'write',
  tags: [],
  httpMethod: 'post',
  httpPath: '/v1/fix-string-literals',
  operationId: 'fix_string_literals',
};

export const tool: Tool = {
  name: 'create_fix_string_literals',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nFix string literal issues in TypeScript files.\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/fix_string_literal_create_response',\n  $defs: {\n    fix_string_literal_create_response: {\n      type: 'object',\n      properties: {\n        data: {\n          type: 'object',\n          description: 'The actual response data',\n          properties: {\n            contents: {\n              type: 'string',\n              description: 'The file contents (original or fixed)'\n            },\n            fixer_version: {\n              type: 'string',\n              description: 'Version of the fixer'\n            },\n            status: {\n              type: 'string',\n              description: 'Status of the fix operation',\n              enum: [                'FIXED',\n                'ALREADY_FIXED',\n                'NO_ISSUES_FOUND',\n                'fix_applied'\n              ]\n            },\n            strategy_statistics: {\n              type: 'array',\n              description: 'Strategy statistics for the single file',\n              items: {\n                type: 'object',\n                properties: {\n                  strategy_name: {\n                    type: 'string'\n                  },\n                  version_hash: {\n                    type: 'string'\n                  },\n                  fixes_applied: {\n                    type: 'boolean'\n                  },\n                  fixes_fired: {\n                    type: 'boolean'\n                  }\n                },\n                required: [                  'strategy_name',\n                  'version_hash'\n                ]\n              }\n            },\n            error: {\n              type: 'string',\n              description: 'Error details if status is \\'error\\''\n            }\n          },\n          required: [            'contents',\n            'fixer_version',\n            'status',\n            'strategy_statistics'\n          ]\n        },\n        error: {\n          type: 'object',\n          description: 'The error from the API query',\n          properties: {\n            code: {\n              type: 'string',\n              description: 'The error code'\n            },\n            message: {\n              type: 'string',\n              description: 'The error message'\n            },\n            details: {\n              type: 'object',\n              description: 'Details about what caused the error',\n              additionalProperties: true\n            }\n          },\n          required: [            'code',\n            'message'\n          ]\n        },\n        meta: {\n          type: 'object',\n          description: 'Meta information',\n          properties: {\n            external_id: {\n              type: 'string',\n              description: 'Customer tracking identifier'\n            },\n            trace_id: {\n              type: 'string',\n              description: 'Unique trace identifier for the request'\n            }\n          }\n        }\n      },\n      required: [        'data'\n      ]\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      file: {
        type: 'object',
        description: 'File to process',
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
      event_id: {
        type: 'string',
        description: 'Unique identifier for the event',
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
      jq_filter: {
        type: 'string',
        title: 'jq Filter',
        description:
          'A jq filter to apply to the response to include certain fields. Consult the output schema in the tool description to see the fields that are available.\n\nFor example: to include only the `name` field in every object of a results array, you can provide ".results[].name".\n\nFor more information, see the [jq documentation](https://jqlang.org/manual/).',
      },
    },
    required: ['file'],
  },
  annotations: {},
};

export const handler = async (client: Benchify, args: Record<string, unknown> | undefined) => {
  const { jq_filter, ...body } = args as any;
  return asTextContentResult(await maybeFilter(jq_filter, await client.fixStringLiterals.create(body)));
};

export default { metadata, tool, handler };
