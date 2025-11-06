// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { maybeFilter } from 'benchify-mcp/filtering';
import { Metadata, asTextContentResult } from 'benchify-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Benchify from 'benchify';

export const metadata: Metadata = {
  resource: 'stacks',
  operation: 'read',
  tags: [],
  httpMethod: 'get',
  httpPath: '/v1/stacks/{id}/read-file',
  operationId: 'read_file',
};

export const tool: Tool = {
  name: 'read_file_stacks',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nReads file content from inside the sandbox (using exec under the hood)\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/stack_read_file_response',\n  $defs: {\n    stack_read_file_response: {\n      type: 'object',\n      properties: {\n        content: {\n          type: 'string'\n        },\n        path: {\n          type: 'string'\n        }\n      },\n      required: [        'content',\n        'path'\n      ]\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'Stack identifier',
      },
      path: {
        type: 'string',
        description: 'Absolute path inside the sandbox',
      },
      jq_filter: {
        type: 'string',
        title: 'jq Filter',
        description:
          'A jq filter to apply to the response to include certain fields. Consult the output schema in the tool description to see the fields that are available.\n\nFor example: to include only the `name` field in every object of a results array, you can provide ".results[].name".\n\nFor more information, see the [jq documentation](https://jqlang.org/manual/).',
      },
    },
    required: ['id', 'path'],
  },
  annotations: {
    readOnlyHint: true,
  },
};

export const handler = async (client: Benchify, args: Record<string, unknown> | undefined) => {
  const { id, jq_filter, ...body } = args as any;
  return asTextContentResult(await maybeFilter(jq_filter, await client.stacks.readFile(id, body)));
};

export default { metadata, tool, handler };
