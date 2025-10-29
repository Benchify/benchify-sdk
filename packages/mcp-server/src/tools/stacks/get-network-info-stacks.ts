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
  httpPath: '/v1/stacks/{id}/network-info',
  operationId: 'get_stack_network_info',
};

export const tool: Tool = {
  name: 'get_network_info_stacks',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nRetrieve network details for a stack including URLs and connection info\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/stack_get_network_info_response',\n  $defs: {\n    stack_get_network_info_response: {\n      type: 'object',\n      properties: {\n        id: {\n          type: 'string'\n        },\n        domains: {\n          type: 'array',\n          items: {\n            type: 'string'\n          }\n        },\n        has_networking: {\n          type: 'boolean'\n        },\n        namespace: {\n          type: 'string'\n        },\n        service_name: {\n          type: 'string'\n        },\n        service_url: {\n          type: 'string'\n        }\n      },\n      required: [        'id',\n        'domains',\n        'has_networking',\n        'namespace',\n        'service_name',\n        'service_url'\n      ]\n    }\n  }\n}\n```",
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
  return asTextContentResult(await maybeFilter(jq_filter, await client.stacks.getNetworkInfo(id)));
};

export default { metadata, tool, handler };
