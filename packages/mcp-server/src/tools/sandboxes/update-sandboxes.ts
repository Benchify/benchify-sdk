// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { Metadata, asTextContentResult } from 'benchify-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Benchify from 'benchify';

export const metadata: Metadata = {
  resource: 'sandboxes',
  operation: 'write',
  tags: [],
  httpMethod: 'patch',
  httpPath: '/v1/sandboxes/{id}',
  operationId: 'sandboxes_update',
};

export const tool: Tool = {
  name: 'update_sandboxes',
  description:
    'Update stack files using tar.zst blobs and/or individual operations. For multi-service stacks, changes are routed to appropriate services.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
      'Idempotency-Key': {
        type: 'string',
      },
      'Base-Etag': {
        type: 'string',
      },
      'Base-Commit': {
        type: 'string',
      },
      jq_filter: {
        type: 'string',
        title: 'jq Filter',
        description: 'A jq filter to apply to the response to include certain fields',
      },
      manifest: {
        type: 'string',
        description:
          'JSON string containing patch metadata: { base, proposed, files: {...changed hashes...} }. Required when packed is present.',
      },
      ops: {
        type: 'string',
        description: 'Optional JSON string containing array of patch operations',
      },
      packed: {
        type: 'string',
        description: 'Optional tar archive compressed with Zstandard containing changed/added files',
      },
    },
    required: ['id', 'Idempotency-Key'],
  },
  annotations: {},
};

export const handler = async (client: Benchify, args: Record<string, unknown> | undefined) => {
  const { id, ...body } = args as any;
  return asTextContentResult(await client.sandboxes.update(id, body));
};

export default { metadata, tool, handler };
