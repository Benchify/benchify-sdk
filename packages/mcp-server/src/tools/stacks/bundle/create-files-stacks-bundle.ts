// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { isJqError, maybeFilter } from 'benchify-mcp/filtering';
import { Metadata, asErrorResult, asTextContentResult } from 'benchify-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Benchify from 'benchify';

export const metadata: Metadata = {
  resource: 'stacks.bundle',
  operation: 'write',
  tags: [],
  httpMethod: 'post',
  httpPath: '/v1/stacks/bundle/files',
  operationId: 'bundle_files',
};

export const tool: Tool = {
  name: 'create_files_stacks_bundle',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nAccepts a JSON array of {path, content}, packs into a tar.zst, and forwards to the Sandbox Manager /sandbox/bundle endpoint.\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/bundle_create_files_response',\n  $defs: {\n    bundle_create_files_response: {\n      type: 'object',\n      properties: {\n        content: {\n          type: 'string'\n        },\n        path: {\n          type: 'string'\n        }\n      },\n      required: [        'content',\n        'path'\n      ]\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      entrypoint: {
        type: 'string',
      },
      files: {
        type: 'array',
        description: 'Files to bundle',
        items: {
          type: 'object',
          properties: {
            content: {
              type: 'string',
            },
            path: {
              type: 'string',
            },
          },
          required: ['content', 'path'],
        },
      },
      tarball_filename: {
        type: 'string',
      },
      jq_filter: {
        type: 'string',
        title: 'jq Filter',
        description:
          'A jq filter to apply to the response to include certain fields. Consult the output schema in the tool description to see the fields that are available.\n\nFor example: to include only the `name` field in every object of a results array, you can provide ".results[].name".\n\nFor more information, see the [jq documentation](https://jqlang.org/manual/).',
      },
    },
    required: ['entrypoint', 'files'],
  },
  annotations: {},
};

export const handler = async (client: Benchify, args: Record<string, unknown> | undefined) => {
  const { jq_filter, ...body } = args as any;
  try {
    return asTextContentResult(await maybeFilter(jq_filter, await client.stacks.bundle.createFiles(body)));
  } catch (error) {
    if (isJqError(error)) {
      return asErrorResult(error.message);
    }
    throw error;
  }
};

export default { metadata, tool, handler };
