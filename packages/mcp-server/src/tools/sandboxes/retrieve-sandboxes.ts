// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { Metadata, asTextContentResult } from 'benchify-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Benchify from 'benchify';

export const metadata: Metadata = {
  resource: 'sandboxes',
  operation: 'read',
  tags: [],
  httpMethod: 'get',
  httpPath: '/v1/sandboxes/{id}',
  operationId: 'sandboxes_retrieve',
};

export const tool: Tool = {
  name: 'retrieve_sandboxes',
  description: 'Retrieve current status and information about a stack and its services',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
      jq_filter: {
        type: 'string',
        title: 'jq Filter',
        description: 'A jq filter to apply to the response to include certain fields',
      },
    },
    required: ['id'],
  },
  annotations: {},
};

export const handler = async (client: Benchify, args: Record<string, unknown> | undefined) => {
  const { id } = args as any;
  return asTextContentResult(await client.sandboxes.retrieve(id));
};

export default { metadata, tool, handler };
