// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { maybeFilter } from 'benchify-mcp/filtering';
import { Metadata, asTextContentResult } from 'benchify-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Benchify from 'benchify';

export const metadata: Metadata = {
  resource: 'stacks',
  operation: 'write',
  tags: [],
  httpMethod: 'post',
  httpPath: '/v1/stacks/{id}/exec',
};

export const tool: Tool = {
  name: 'execute_command_stacks',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nRun a command in the sandbox container and get the output\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/stack_execute_command_response',\n  $defs: {\n    stack_execute_command_response: {\n      type: 'object',\n      properties: {\n        exitCode: {\n          type: 'number'\n        },\n        stderr: {\n          type: 'string'\n        },\n        stdout: {\n          type: 'string'\n        }\n      },\n      required: [        'exitCode',\n        'stderr',\n        'stdout'\n      ]\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'Stack identifier',
      },
      command: {
        type: 'array',
        description: 'Command to execute as array',
        items: {
          type: 'string',
        },
      },
      jq_filter: {
        type: 'string',
        title: 'jq Filter',
        description:
          'A jq filter to apply to the response to include certain fields. Consult the output schema in the tool description to see the fields that are available.\n\nFor example: to include only the `name` field in every object of a results array, you can provide ".results[].name".\n\nFor more information, see the [jq documentation](https://jqlang.org/manual/).',
      },
    },
    required: ['id', 'command'],
  },
  annotations: {},
};

export const handler = async (client: Benchify, args: Record<string, unknown> | undefined) => {
  const { id, jq_filter, ...body } = args as any;
  return asTextContentResult(await maybeFilter(jq_filter, await client.stacks.executeCommand(id, body)));
};

export default { metadata, tool, handler };
