// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { Metadata, asTextContentResult } from 'benchify-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Benchify from 'benchify';

export const metadata: Metadata = {
  resource: 'sandboxes',
  operation: 'write',
  tags: [],
  httpMethod: 'post',
  httpPath: '/v1/sandboxes',
  operationId: 'sandboxes_create',
};

export const tool: Tool = {
  name: 'create_sandboxes',
  description:
    'Upload a binary tar.zst file to create a new stack environment. For multi-service stacks, automatically detects and orchestrates multiple services.',
  inputSchema: {
    type: 'object',
    properties: {
      packed: {
        type: 'string',
        description: 'Binary tar archive compressed with Zstandard containing project files',
      },
      'Content-Hash': {
        type: 'string',
      },
      'Idempotency-Key': {
        type: 'string',
      },
      jq_filter: {
        type: 'string',
        title: 'jq Filter',
        description: 'A jq filter to apply to the response to include certain fields',
      },
      manifest: {
        type: 'string',
        description: 'Optional JSON metadata as string',
      },
      options: {
        type: 'string',
        description: 'Optional JSON configuration as string',
      },
    },
    required: ['packed', 'Content-Hash', 'Idempotency-Key'],
  },
  annotations: {},
};

export const handler = async (client: Benchify, args: Record<string, unknown> | undefined) => {
  const body = args as any;
  return asTextContentResult(await client.stacks.create(body));
};

export default { metadata, tool, handler };
