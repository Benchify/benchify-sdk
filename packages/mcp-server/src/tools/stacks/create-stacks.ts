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
  httpPath: '/v1/stacks',
  operationId: 'create_stack',
};

export const tool: Tool = {
  name: 'create_stacks',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nCreate a new stack environment using manifest + bundle format. Upload a JSON manifest with file metadata and a tar.zst bundle containing your project files. For multi-service stacks, automatically detects and orchestrates multiple services.\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/stack_create_response',\n  $defs: {\n    stack_create_response: {\n      type: 'object',\n      description: 'Response after creating a new stack',\n      properties: {\n        id: {\n          type: 'string',\n          description: 'Stack identifier'\n        },\n        contentHash: {\n          type: 'string',\n          description: 'Content hash for deduplication'\n        },\n        etag: {\n          type: 'string',\n          description: 'ETag for caching/optimistic updates'\n        },\n        kind: {\n          type: 'string',\n          description: 'Stack kinds',\n          enum: [            'single',\n            'stack'\n          ]\n        },\n        phase: {\n          type: 'string',\n          description: 'Stack lifecycle phases',\n          enum: [            'starting',\n            'building',\n            'deploying',\n            'running',\n            'failed',\n            'stopped'\n          ]\n        },\n        url: {\n          type: 'string',\n          description: 'Live URL for the stack'\n        },\n        buildStatus: {\n          type: 'object',\n          description: 'Build status information',\n          properties: {\n            phase: {\n              type: 'string',\n              description: 'Build phase states',\n              enum: [                'pending',\n                'running',\n                'completed',\n                'failed'\n              ]\n            },\n            duration: {\n              type: 'number',\n              description: 'Build duration in milliseconds'\n            },\n            error: {\n              type: 'string',\n              description: 'Error message if failed'\n            },\n            logs: {\n              type: 'string',\n              description: 'Build logs (truncated)'\n            }\n          },\n          required: [            'phase'\n          ]\n        },\n        idempotencyKey: {\n          type: 'string',\n          description: 'Idempotency key echo'\n        },\n        services: {\n          type: 'array',\n          description: 'Services in the stack',\n          items: {\n            type: 'object',\n            description: 'Information about a service in the stack',\n            properties: {\n              id: {\n                type: 'string',\n                description: 'Service identifier'\n              },\n              name: {\n                type: 'string',\n                description: 'Service name'\n              },\n              phase: {\n                type: 'string',\n                description: 'Stack lifecycle phases',\n                enum: [                  'starting',\n                  'building',\n                  'deploying',\n                  'running',\n                  'failed',\n                  'stopped'\n                ]\n              },\n              role: {\n                type: 'string',\n                description: 'Service roles in a stack',\n                enum: [                  'frontend',\n                  'backend',\n                  'fullstack',\n                  'worker',\n                  'database',\n                  'unknown'\n                ]\n              },\n              workspacePath: {\n                type: 'string',\n                description: 'Workspace path relative to project root'\n              },\n              port: {\n                type: 'number',\n                description: 'Port (if applicable)'\n              }\n            },\n            required: [              'id',\n              'name',\n              'phase',\n              'role',\n              'workspacePath'\n            ]\n          }\n        }\n      },\n      required: [        'id',\n        'contentHash',\n        'etag',\n        'kind',\n        'phase',\n        'url'\n      ]\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      bundle: {
        type: 'string',
        description: 'Tar.zst bundle containing project files',
      },
      manifest: {
        type: 'string',
        description: 'JSON manifest file containing file metadata and tree hashes',
      },
      'idempotency-key': {
        type: 'string',
        description: 'Unique key for idempotent requests',
      },
      options: {
        type: 'string',
        description: 'Optional JSON configuration string',
      },
      'content-hash': {
        type: 'string',
        description: 'SHA-256 hash of the bundle for deduplication',
      },
      jq_filter: {
        type: 'string',
        title: 'jq Filter',
        description:
          'A jq filter to apply to the response to include certain fields. Consult the output schema in the tool description to see the fields that are available.\n\nFor example: to include only the `name` field in every object of a results array, you can provide ".results[].name".\n\nFor more information, see the [jq documentation](https://jqlang.org/manual/).',
      },
    },
    required: ['bundle', 'manifest', 'idempotency-key'],
  },
  annotations: {},
};

export const handler = async (client: Benchify, args: Record<string, unknown> | undefined) => {
  const { jq_filter, ...body } = args as any;
  return asTextContentResult(await maybeFilter(jq_filter, await client.stacks.create(body)));
};

export default { metadata, tool, handler };
