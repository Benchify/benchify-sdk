// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { isJqError, maybeFilter } from 'benchify-mcp/filtering';
import { Metadata, asErrorResult, asTextContentResult } from 'benchify-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Benchify from 'benchify';

export const metadata: Metadata = {
  resource: 'stacks',
  operation: 'read',
  tags: [],
  httpMethod: 'get',
  httpPath: '/v1/stacks/{id}/logs',
  operationId: 'get_stack_logs',
};

export const tool: Tool = {
  name: 'get_logs_stacks',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nRetrieve logs from all services in the stack\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/stack_get_logs_response',\n  $defs: {\n    stack_get_logs_response: {\n      type: 'object',\n      description: 'Structured logs response from stack',\n      properties: {\n        id: {\n          type: 'string',\n          description: 'Stack ID'\n        },\n        services: {\n          type: 'array',\n          description: 'Logs organized by service',\n          items: {\n            type: 'object',\n            description: 'Logs from a single service',\n            properties: {\n              id: {\n                type: 'string',\n                description: 'Service ID'\n              },\n              lineCount: {\n                type: 'number',\n                description: 'Number of log lines'\n              },\n              logs: {\n                type: 'string',\n                description: 'Logs for this service'\n              },\n              name: {\n                type: 'string',\n                description: 'Service name'\n              },\n              role: {\n                type: 'string',\n                description: 'Service roles in a stack',\n                enum: [                  'frontend',\n                  'backend',\n                  'fullstack',\n                  'worker',\n                  'database',\n                  'unknown'\n                ]\n              }\n            },\n            required: [              'id',\n              'lineCount',\n              'logs',\n              'name',\n              'role'\n            ]\n          }\n        },\n        totalLineCount: {\n          type: 'number',\n          description: 'Total log lines across all services'\n        },\n        combinedLogs: {\n          type: 'string',\n          description: 'Combined logs from all services (legacy support)'\n        }\n      },\n      required: [        'id',\n        'services',\n        'totalLineCount'\n      ]\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'Stack identifier',
      },
      tail: {
        type: 'string',
        description: 'Number of log lines to return per service',
      },
      jq_filter: {
        type: 'string',
        title: 'jq Filter',
        description:
          'A jq filter to apply to the response to include certain fields. Consult the output schema in the tool description to see the fields that are available.\n\nFor example: to include only the `name` field in every object of a results array, you can provide ".results[].name".\n\nFor more information, see the [jq documentation](https://jqlang.org/manual/).',
      },
    },
    required: ['id'],
  },
  annotations: {
    readOnlyHint: true,
  },
};

export const handler = async (client: Benchify, args: Record<string, unknown> | undefined) => {
  const { id, jq_filter, ...body } = args as any;
  try {
    return asTextContentResult(await maybeFilter(jq_filter, await client.stacks.getLogs(id, body)));
  } catch (error) {
    if (isJqError(error)) {
      return asErrorResult(error.message);
    }
    throw error;
  }
};

export default { metadata, tool, handler };
