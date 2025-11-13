// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { isJqError, maybeFilter } from 'benchify-mcp/filtering';
import { Metadata, asErrorResult, asTextContentResult } from 'benchify-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Benchify from 'benchify';

export const metadata: Metadata = {
  resource: 'stacks',
  operation: 'write',
  tags: [],
  httpMethod: 'post',
  httpPath: '/v1/stacks/create-and-run',
  operationId: 'create_and_run',
};

export const tool: Tool = {
  name: 'create_and_run_stacks',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nCreate a simple container sandbox with a custom image and command\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/stack_create_and_run_response',\n  $defs: {\n    stack_create_and_run_response: {\n      type: 'object',\n      properties: {\n        id: {\n          type: 'string'\n        },\n        command: {\n          type: 'array',\n          items: {\n            type: 'string'\n          }\n        },\n        image: {\n          type: 'string'\n        },\n        status: {\n          type: 'string'\n        }\n      },\n      required: [        'id',\n        'command',\n        'image',\n        'status'\n      ]\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      command: {
        type: 'array',
        description: 'Command to run',
        items: {
          type: 'string',
        },
      },
      image: {
        type: 'string',
        description: 'Docker image to use',
      },
      ttl_seconds: {
        type: 'number',
        description: 'Time to live in seconds',
      },
      wait: {
        type: 'boolean',
        description: 'Wait for container to be ready',
      },
      jq_filter: {
        type: 'string',
        title: 'jq Filter',
        description:
          'A jq filter to apply to the response to include certain fields. Consult the output schema in the tool description to see the fields that are available.\n\nFor example: to include only the `name` field in every object of a results array, you can provide ".results[].name".\n\nFor more information, see the [jq documentation](https://jqlang.org/manual/).',
      },
    },
    required: ['command', 'image'],
  },
  annotations: {},
};

export const handler = async (client: Benchify, args: Record<string, unknown> | undefined) => {
  const { jq_filter, ...body } = args as any;
  try {
    return asTextContentResult(await maybeFilter(jq_filter, await client.stacks.createAndRun(body)));
  } catch (error) {
    if (isJqError(error)) {
      return asErrorResult(error.message);
    }
    throw error;
  }
};

export default { metadata, tool, handler };
