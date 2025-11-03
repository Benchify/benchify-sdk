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
  httpPath: '/v1/stacks/{id}/patch',
  operationId: 'patch_stack',
};

export const tool: Tool = {
  name: 'update_stacks',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nUpdate stack files using manifest + bundle format and/or individual operations. For multi-service stacks, changes are routed to appropriate services.\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/stack_update_response',\n  $defs: {\n    stack_update_response: {\n      type: 'object',\n      description: 'Response after patching a stack',\n      properties: {\n        id: {\n          type: 'string',\n          description: 'Stack identifier'\n        },\n        applied: {\n          type: 'number',\n          description: 'Number of operations applied'\n        },\n        etag: {\n          type: 'string',\n          description: 'New ETag after changes'\n        },\n        phase: {\n          type: 'string',\n          description: 'Stack lifecycle phases',\n          enum: [            'starting',\n            'building',\n            'deploying',\n            'running',\n            'failed',\n            'stopped'\n          ]\n        },\n        restarted: {\n          type: 'boolean',\n          description: 'Whether stack was restarted'\n        },\n        affectedServices: {\n          type: 'array',\n          description: 'Services affected by patch (for multi-service stacks)',\n          items: {\n            type: 'string'\n          }\n        },\n        warnings: {\n          type: 'array',\n          description: 'Optional warnings if patch partially failed',\n          items: {\n            type: 'string'\n          }\n        }\n      },\n      required: [        'id',\n        'applied',\n        'etag',\n        'phase',\n        'restarted'\n      ]\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'Stack identifier',
      },
      'idempotency-key': {
        type: 'string',
        description: 'Unique key for idempotent requests',
      },
      bundle: {
        type: 'string',
        description: 'Optional tar.zst bundle containing changed/added files',
      },
      manifest: {
        type: 'string',
        description: 'Optional JSON manifest file with file metadata',
      },
      ops: {
        type: 'string',
        description: 'Optional JSON string containing array of patch operations',
      },
      'base-etag': {
        type: 'string',
        description: 'Current stack etag for conflict detection',
      },
      jq_filter: {
        type: 'string',
        title: 'jq Filter',
        description:
          'A jq filter to apply to the response to include certain fields. Consult the output schema in the tool description to see the fields that are available.\n\nFor example: to include only the `name` field in every object of a results array, you can provide ".results[].name".\n\nFor more information, see the [jq documentation](https://jqlang.org/manual/).',
      },
    },
    required: ['id', 'idempotency-key'],
  },
  annotations: {},
};

export const handler = async (client: Benchify, args: Record<string, unknown> | undefined) => {
  const { id, jq_filter, ...body } = args as any;
  return asTextContentResult(await maybeFilter(jq_filter, await client.stacks.update(id, body)));
};

export default { metadata, tool, handler };
