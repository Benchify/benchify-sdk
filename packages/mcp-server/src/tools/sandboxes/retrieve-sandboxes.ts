// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { maybeFilter } from 'benchify-mcp/filtering';
import { Metadata, asTextContentResult } from 'benchify-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Benchify from 'benchify';

export const metadata: Metadata = {
  resource: 'sandboxes',
  operation: 'read',
  tags: [],
  httpMethod: 'get',
  httpPath: '/sandboxes/{id}',
  operationId: 'getStackStatus',
};

export const tool: Tool = {
  name: 'retrieve_sandboxes',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nRetrieve current status and information about a stack and its services\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/sandbox_retrieve_response',\n  $defs: {\n    sandbox_retrieve_response: {\n      type: 'object',\n      properties: {\n        id: {\n          type: 'string'\n        },\n        etag: {\n          type: 'string'\n        },\n        phase: {\n          type: 'string',\n          enum: [            'starting',\n            'building',\n            'deploying',\n            'running',\n            'failed',\n            'stopped'\n          ]\n        },\n        lastError: {\n          type: 'string'\n        },\n        lastLogs: {\n          type: 'array',\n          items: {\n            type: 'string'\n          }\n        },\n        ports: {\n          type: 'array',\n          items: {\n            type: 'number'\n          }\n        },\n        readyAt: {\n          type: 'string'\n        }\n      },\n      required: [        'id',\n        'etag',\n        'phase'\n      ]\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
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
  return asTextContentResult(await maybeFilter(jq_filter, await client.sandboxes.retrieve(id)));
};

export default { metadata, tool, handler };
