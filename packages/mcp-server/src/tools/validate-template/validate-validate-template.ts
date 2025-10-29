// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { maybeFilter } from 'benchify-mcp/filtering';
import { Metadata, asTextContentResult } from 'benchify-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Benchify from 'benchify';

export const metadata: Metadata = {
  resource: 'validate_template',
  operation: 'write',
  tags: [],
  httpMethod: 'post',
  httpPath: '/v1/validate-template',
};

export const tool: Tool = {
  name: 'validate_validate_template',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nValidate a template configuration\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/validate_template_validate_response',\n  $defs: {\n    validate_template_validate_response: {\n      type: 'object',\n      properties: {\n        success: {\n          type: 'boolean',\n          description: 'Whether the template validation succeeded'\n        },\n        error: {\n          type: 'string',\n          description: 'Error message if validation failed'\n        }\n      },\n      required: [        'success'\n      ]\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      meta: {
        type: 'object',
        description: 'Meta information for the request',
        properties: {
          external_id: {
            type: 'string',
            description: 'Customer tracking identifier',
          },
        },
      },
      response_format: {
        type: 'string',
        description: 'Format for the response',
        enum: ['DIFF', 'CHANGED_FILES', 'ALL_FILES'],
      },
      template_id: {
        type: 'string',
        description: 'ID of the template',
      },
      template_path: {
        type: 'string',
        description: 'Full path to the template to use for validation',
      },
      templateId: {
        type: 'string',
      },
      templateName: {
        type: 'string',
      },
      jq_filter: {
        type: 'string',
        title: 'jq Filter',
        description:
          'A jq filter to apply to the response to include certain fields. Consult the output schema in the tool description to see the fields that are available.\n\nFor example: to include only the `name` field in every object of a results array, you can provide ".results[].name".\n\nFor more information, see the [jq documentation](https://jqlang.org/manual/).',
      },
    },
    required: [],
  },
  annotations: {},
};

export const handler = async (client: Benchify, args: Record<string, unknown> | undefined) => {
  const { jq_filter, ...body } = args as any;
  return asTextContentResult(await maybeFilter(jq_filter, await client.validateTemplate.validate(body)));
};

export default { metadata, tool, handler };
