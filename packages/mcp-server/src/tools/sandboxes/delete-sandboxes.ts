// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { Metadata, asTextContentResult } from 'benchify-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Benchify from 'benchify';

export const metadata: Metadata = {
  resource: 'sandboxes',
  operation: 'write',
  tags: [],
  httpMethod: 'delete',
  httpPath: '/v1/sandboxes/{id}',
  operationId: 'sandboxes_delete',
};

export const tool: Tool = {
  name: 'delete_sandboxes',
  description: 'Permanently destroy a stack and all its services, cleaning up resources',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
    },
    required: ['id'],
  },
  annotations: {},
};

export const handler = async (client: Benchify, args: Record<string, unknown> | undefined) => {
  const { id } = args as any;
  await client.sandboxes.delete(id);
  return asTextContentResult({ success: true });
};

export default { metadata, tool, handler };
