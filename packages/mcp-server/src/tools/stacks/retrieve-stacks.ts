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
  httpPath: '/v1/stacks/{id}',
  operationId: 'get_stack',
};

export const tool: Tool = {
  name: 'retrieve_stacks',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nRetrieve current status and information about a stack and its services\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/stack_retrieve_response',\n  $defs: {\n    stack_retrieve_response: {\n      type: 'object',\n      description: 'Stack status response',\n      properties: {\n        id: {\n          type: 'string',\n          description: 'Stack identifier'\n        },\n        etag: {\n          type: 'string',\n          description: 'ETag for caching'\n        },\n        phase: {\n          type: 'string',\n          description: 'Stack lifecycle phases',\n          enum: [            'starting',\n            'building',\n            'deploying',\n            'running',\n            'failed',\n            'stopped'\n          ]\n        },\n        lastError: {\n          type: 'string',\n          description: 'Last error message (if failed)'\n        },\n        lastLogs: {\n          type: 'array',\n          description: 'Recent log entries (truncated for size)',\n          items: {\n            type: 'string'\n          }\n        },\n        ports: {\n          type: 'array',\n          description: 'Active ports (if running)',\n          items: {\n            type: 'number'\n          }\n        },\n        readyAt: {\n          type: 'string',\n          description: 'When stack became ready (ISO 8601)'\n        }\n      },\n      required: [        'id',\n        'etag',\n        'phase'\n      ]\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'Stack identifier',
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
    return asTextContentResult(await maybeFilter(jq_filter, await client.stacks.retrieve(id)));
  } catch (error) {
    if (isJqError(error)) {
      return asErrorResult(error.message);
    }
    throw error;
  }
};

export default { metadata, tool, handler };
