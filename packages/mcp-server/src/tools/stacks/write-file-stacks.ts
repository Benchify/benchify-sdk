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
  httpPath: '/v1/stacks/{id}/write-file',
  operationId: 'write_file',
};

export const tool: Tool = {
  name: 'write_file_stacks',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nWrites file content to a path inside the sandbox (via mount or exec under the hood)\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/stack_write_file_response',\n  $defs: {\n    stack_write_file_response: {\n      type: 'object',\n      properties: {\n        host_path: {\n          type: 'string'\n        },\n        message: {\n          type: 'string'\n        },\n        method: {\n          type: 'string'\n        },\n        sandbox_path: {\n          type: 'string'\n        }\n      }\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'Stack identifier',
      },
      content: {
        type: 'string',
        description: 'File contents',
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
    required: ['id', 'content', 'path'],
  },
  annotations: {},
};

export const handler = async (client: Benchify, args: Record<string, unknown> | undefined) => {
  const { id, jq_filter, ...body } = args as any;
  try {
    return asTextContentResult(await maybeFilter(jq_filter, await client.stacks.writeFile(id, body)));
  } catch (error) {
    if (isJqError(error)) {
      return asErrorResult(error.message);
    }
    throw error;
  }
};

export default { metadata, tool, handler };
