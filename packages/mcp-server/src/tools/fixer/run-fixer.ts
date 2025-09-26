// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { maybeFilter } from 'benchify-mcp/filtering';
import { Metadata, asTextContentResult } from 'benchify-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Benchify from 'benchify';

export const metadata: Metadata = {
  resource: 'fixer',
  operation: 'write',
  tags: [],
  httpMethod: 'post',
  httpPath: '/v1/fixer',
  operationId: 'fixer_api_fixer_post',
};

export const tool: Tool = {
  name: 'run_fixer',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nHandle fixer requests to process and fix TypeScript files.\n\n# Response Schema\n```json\n{\n  type: 'object',\n  title: 'WrappedFixerResponse',\n  description: 'Wrapped response model for benchify-api compatibility',\n  properties: {\n    data: {\n      type: 'object',\n      title: 'FixerResponse',\n      description: 'The actual response data',\n      properties: {\n        status: {\n          type: 'object',\n          title: 'FixerStatus',\n          description: 'Final per-file status after fixing',\n          properties: {\n            composite_status: {\n              type: 'string',\n              title: 'CompositeStatus',\n              enum: [                'FIXED_EVERYTHING',\n                'FIXED_REQUESTED',\n                'PARTIALLY_FIXED',\n                'NO_REQUESTED_ISSUES',\n                'NO_ISSUES',\n                'FAILED'\n              ]\n            },\n            file_to_composite_status: {\n              type: 'object',\n              title: 'File To Composite Status',\n              description: 'Status of each file.',\n              additionalProperties: true\n            }\n          },\n          required: [            'composite_status'\n          ]\n        },\n        bundle: {\n          type: 'object',\n          title: 'BundleInfo',\n          description: 'Information about the bundling process and results',\n          properties: {\n            status: {\n              type: 'string',\n              title: 'BundleStatus',\n              description: 'Overall status of the bundling operation',\n              enum: [                'SUCCESS',\n                'FAILED',\n                'NOT_ATTEMPTED',\n                'PARTIAL_SUCCESS'\n              ]\n            },\n            files: {\n              type: 'array',\n              title: 'Files',\n              description: 'Successfully bundled files',\n              items: {\n                $ref: '#/$defs/fixer_file'\n              }\n            }\n          },\n          required: [            'status'\n          ]\n        },\n        fix_types_used: {\n          type: 'array',\n          title: 'Fix Types Used',\n          description: 'List of fix types that were actually applied during the fixer run',\n          items: {\n            type: 'string',\n            title: 'FixTypeName',\n            description: 'Enumeration of available fix types',\n            enum: [              'dependency',\n              'parsing',\n              'css',\n              'ai_fallback',\n              'types',\n              'ui',\n              'sql'\n            ]\n          }\n        },\n        suggested_changes: {\n          anyOf: [            {\n              type: 'object',\n              title: 'DiffFormat',\n              properties: {\n                diff: {\n                  type: 'string',\n                  title: 'Diff',\n                  description: 'Git diff of changes made'\n                }\n              }\n            },\n            {\n              type: 'object',\n              title: 'ChangedFilesFormat',\n              properties: {\n                changed_files: {\n                  type: 'array',\n                  title: 'Changed Files',\n                  description: 'List of changed files with their new contents',\n                  items: {\n                    $ref: '#/$defs/fixer_file'\n                  }\n                }\n              }\n            },\n            {\n              type: 'object',\n              title: 'AllFilesFormat',\n              properties: {\n                all_files: {\n                  type: 'array',\n                  title: 'All Files',\n                  description: 'List of all files with their current contents',\n                  items: {\n                    $ref: '#/$defs/fixer_file'\n                  }\n                }\n              }\n            }\n          ],\n          title: 'Suggested Changes',\n          description: 'Changes made by the fixer in the requested format'\n        }\n      },\n      required: [        'status'\n      ]\n    },\n    error: {\n      type: 'object',\n      title: 'ResponseError',\n      description: 'The error from the API query',\n      properties: {\n        code: {\n          type: 'string',\n          title: 'Code',\n          description: 'The error code'\n        },\n        message: {\n          type: 'string',\n          title: 'Message',\n          description: 'The error message'\n        },\n        details: {\n          type: 'string',\n          title: 'Details',\n          description: 'Details about what caused the error, if available'\n        },\n        suggestions: {\n          type: 'array',\n          title: 'Suggestions',\n          description: 'Potential suggestions about how to fix the error, if applicable',\n          items: {\n            type: 'string'\n          }\n        }\n      },\n      required: [        'code',\n        'message'\n      ]\n    },\n    meta: {\n      $ref: '#/$defs/response_meta'\n    }\n  },\n  required: [    'data'\n  ],\n  $defs: {\n    fixer_file: {\n      type: 'object',\n      title: 'FixerFile',\n      description: 'Model for a single file change',\n      properties: {\n        contents: {\n          type: 'string',\n          title: 'Contents',\n          description: 'Contents of the file'\n        },\n        path: {\n          type: 'string',\n          title: 'Path',\n          description: 'Path of the file'\n        }\n      },\n      required: [        'contents',\n        'path'\n      ]\n    },\n    response_meta: {\n      type: 'object',\n      title: 'ResponseMeta',\n      description: 'Meta information for API responses',\n      properties: {\n        external_id: {\n          type: 'string',\n          title: 'External Id',\n          description: 'Customer tracking identifier'\n        },\n        trace_id: {\n          type: 'string',\n          title: 'Trace Id',\n          description: 'Unique trace identifier for the request'\n        }\n      }\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      files: {
        type: 'array',
        title: 'Files',
        description: 'List of files to process',
        items: {
          type: 'object',
          title: 'RequestTestFile',
          description: 'Model for file data in requests',
          properties: {
            contents: {
              type: 'string',
              title: 'Contents',
              description: 'Original contents of the file before any modifications',
            },
            path: {
              type: 'string',
              title: 'Path',
              description: 'Path to the file',
            },
          },
          required: ['contents', 'path'],
        },
      },
      bundle: {
        type: 'boolean',
        title: 'Bundle',
        description: 'Whether to bundle the project (experimental)',
      },
      fixes: {
        type: 'array',
        title: 'Fixes',
        description: 'Configuration for which fix types to apply',
        items: {
          type: 'string',
          title: 'FixTypeName',
          description: 'Enumeration of available fix types',
          enum: ['dependency', 'parsing', 'css', 'ai_fallback', 'types', 'ui', 'sql'],
        },
      },
      meta: {
        type: 'object',
        title: 'RequestMeta',
        description: 'Meta information for API requests',
        properties: {
          external_id: {
            type: 'string',
            title: 'External Id',
            description: 'Customer tracking identifier',
          },
        },
      },
      response_format: {
        type: 'string',
        title: 'ResponseFormat',
        description: 'Format for the response (diff, changed_files, or all_files)',
        enum: ['DIFF', 'CHANGED_FILES', 'ALL_FILES'],
      },
      template_id: {
        type: 'string',
        title: 'Template Id',
        description: 'ID of the template to use for the fixer process',
      },
      jq_filter: {
        type: 'string',
        title: 'jq Filter',
        description:
          'A jq filter to apply to the response to include certain fields. Consult the output schema in the tool description to see the fields that are available.\n\nFor example: to include only the `name` field in every object of a results array, you can provide ".results[].name".\n\nFor more information, see the [jq documentation](https://jqlang.org/manual/).',
      },
    },
    required: ['files'],
  },
  annotations: {},
};

export const handler = async (client: Benchify, args: Record<string, unknown> | undefined) => {
  const { jq_filter, ...body } = args as any;
  return asTextContentResult(await maybeFilter(jq_filter, await client.fixer.run(body)));
};

export default { metadata, tool, handler };
