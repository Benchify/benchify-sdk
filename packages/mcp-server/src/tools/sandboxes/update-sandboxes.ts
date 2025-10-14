// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { maybeFilter } from 'benchify-mcp/filtering';
import { Metadata, asTextContentResult } from 'benchify-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Benchify from 'benchify';

export const metadata: Metadata = {
  resource: 'sandboxes',
  operation: 'write',
  tags: [],
  httpMethod: 'post',
  httpPath: '/sandboxes/{id}:patch',
  operationId: 'patchStack',
};

export const tool: Tool = {
  name: 'update_sandboxes',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nUpdate stack files using tar.gz blobs and/or individual operations. For multi-service stacks, changes are routed to appropriate services.\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/sandbox_update_response',\n  $defs: {\n    sandbox_update_response: {\n      type: 'object',\n      properties: {\n        id: {\n          type: 'string'\n        },\n        applied: {\n          type: 'number'\n        },\n        etag: {\n          type: 'string'\n        },\n        phase: {\n          type: 'string',\n          enum: [            'starting',\n            'building',\n            'deploying',\n            'running',\n            'failed',\n            'stopped'\n          ]\n        },\n        restarted: {\n          type: 'boolean'\n        },\n        affectedServices: {\n          type: 'array',\n          items: {\n            type: 'string'\n          }\n        },\n        warnings: {\n          type: 'array',\n          items: {\n            type: 'string'\n          }\n        }\n      },\n      required: [        'id',\n        'applied',\n        'etag',\n        'phase',\n        'restarted'\n      ]\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
      'Idempotency-Key': {
        type: 'string',
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
        description: 'Optional gzipped tar archive containing changed/added files',
      },
      'Base-Commit': {
        type: 'string',
      },
      'Base-Etag': {
        type: 'string',
      },
      jq_filter: {
        type: 'string',
        title: 'jq Filter',
        description:
          'A jq filter to apply to the response to include certain fields. Consult the output schema in the tool description to see the fields that are available.\n\nFor example: to include only the `name` field in every object of a results array, you can provide ".results[].name".\n\nFor more information, see the [jq documentation](https://jqlang.org/manual/).',
      },
    },
    required: ['id', 'Idempotency-Key'],
  },
  annotations: {},
};

export const handler = async (client: Benchify, args: Record<string, unknown> | undefined) => {
  const { id, jq_filter, ...body } = args as any;
  return asTextContentResult(await maybeFilter(jq_filter, await client.sandboxes.update(id, body)));
};

export default { metadata, tool, handler };
