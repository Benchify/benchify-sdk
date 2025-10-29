// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { Metadata, asTextContentResult } from 'benchify-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Benchify from 'benchify';

export const metadata: Metadata = {
  resource: 'stacks',
  operation: 'write',
  tags: [],
  httpMethod: 'delete',
  httpPath: '/v1/stacks/{id}',
  operationId: 'delete_stack',
};

export const tool: Tool = {
  name: 'destroy_stacks',
  description: 'Permanently destroy a stack and all its services, cleaning up resources',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'Stack identifier',
      },
    },
    required: ['id'],
  },
  annotations: {
    idempotentHint: true,
  },
};

export const handler = async (client: Benchify, args: Record<string, unknown> | undefined) => {
  const { id, ...body } = args as any;
  const response = await client.stacks.destroy(id).asResponse();
  return asTextContentResult(await response.text());
};

export default { metadata, tool, handler };
