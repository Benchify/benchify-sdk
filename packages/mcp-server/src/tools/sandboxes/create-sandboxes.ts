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
  httpPath: '/sandboxes',
  operationId: 'createStack',
};

export const tool: Tool = {
  name: 'create_sandboxes',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nUpload a binary tar.gz file to create a new stack environment. For multi-service stacks, automatically detects and orchestrates multiple services.\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/sandbox_create_response',\n  $defs: {\n    sandbox_create_response: {\n      type: 'object',\n      properties: {\n        id: {\n          type: 'string'\n        },\n        contentHash: {\n          type: 'string'\n        },\n        etag: {\n          type: 'string'\n        },\n        kind: {\n          type: 'string',\n          enum: [            'single',\n            'stack'\n          ]\n        },\n        phase: {\n          type: 'string',\n          enum: [            'starting',\n            'building',\n            'deploying',\n            'running',\n            'failed',\n            'stopped'\n          ]\n        },\n        url: {\n          type: 'string'\n        },\n        buildStatus: {\n          type: 'object',\n          properties: {\n            phase: {\n              type: 'string',\n              enum: [                'pending',\n                'running',\n                'completed',\n                'failed'\n              ]\n            },\n            duration: {\n              type: 'number'\n            },\n            error: {\n              type: 'string'\n            },\n            logs: {\n              type: 'string'\n            }\n          },\n          required: [            'phase'\n          ]\n        },\n        idempotencyKey: {\n          type: 'string'\n        },\n        runtime: {\n          type: 'object',\n          properties: {\n            nodeVersion: {\n              type: 'string'\n            },\n            packageManager: {\n              type: 'string',\n              enum: [                'npm',\n                'yarn',\n                'pnpm',\n                'bun'\n              ]\n            },\n            port: {\n              type: 'number'\n            },\n            startCommand: {\n              type: 'string'\n            },\n            type: {\n              type: 'string',\n              enum: [                'node'\n              ]\n            },\n            typescript: {\n              type: 'boolean'\n            },\n            buildCommand: {\n              type: 'string'\n            },\n            framework: {\n              type: 'string',\n              enum: [                'react',\n                'nextjs',\n                'vue',\n                'nuxt',\n                'express',\n                'fastify',\n                'nest',\n                'vite',\n                'vanilla'\n              ]\n            }\n          },\n          required: [            'nodeVersion',\n            'packageManager',\n            'port',\n            'startCommand',\n            'type',\n            'typescript'\n          ]\n        },\n        services: {\n          type: 'array',\n          items: {\n            type: 'object',\n            properties: {\n              id: {\n                type: 'string'\n              },\n              name: {\n                type: 'string'\n              },\n              phase: {\n                type: 'string',\n                enum: [                  'starting',\n                  'building',\n                  'deploying',\n                  'running',\n                  'failed',\n                  'stopped'\n                ]\n              },\n              role: {\n                type: 'string',\n                enum: [                  'frontend',\n                  'backend',\n                  'worker',\n                  'database',\n                  'unknown'\n                ]\n              },\n              workspacePath: {\n                type: 'string'\n              },\n              port: {\n                type: 'number'\n              }\n            },\n            required: [              'id',\n              'name',\n              'phase',\n              'role',\n              'workspacePath'\n            ]\n          }\n        }\n      },\n      required: [        'id',\n        'contentHash',\n        'etag',\n        'kind',\n        'phase',\n        'url'\n      ]\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      packed: {
        type: 'string',
        description: 'Binary gzipped tar archive containing project files',
      },
      'Content-Hash': {
        type: 'string',
      },
      'Idempotency-Key': {
        type: 'string',
      },
      manifest: {
        type: 'string',
        description: 'Optional JSON metadata as string',
      },
      options: {
        type: 'string',
        description: 'Optional JSON configuration as string',
      },
      jq_filter: {
        type: 'string',
        title: 'jq Filter',
        description:
          'A jq filter to apply to the response to include certain fields. Consult the output schema in the tool description to see the fields that are available.\n\nFor example: to include only the `name` field in every object of a results array, you can provide ".results[].name".\n\nFor more information, see the [jq documentation](https://jqlang.org/manual/).',
      },
    },
    required: ['packed', 'Content-Hash', 'Idempotency-Key'],
  },
  annotations: {},
};

export const handler = async (client: Benchify, args: Record<string, unknown> | undefined) => {
  const { jq_filter, ...body } = args as any;
  return asTextContentResult(await maybeFilter(jq_filter, await client.sandboxes.create(body)));
};

export default { metadata, tool, handler };
