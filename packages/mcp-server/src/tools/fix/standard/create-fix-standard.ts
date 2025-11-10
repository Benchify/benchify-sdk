// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { maybeFilter } from 'benchify-mcp/filtering';
import { Metadata, asTextContentResult } from 'benchify-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Benchify from 'benchify';

export const metadata: Metadata = {
  resource: 'fix.standard',
  operation: 'write',
  tags: [],
  httpMethod: 'post',
  httpPath: '/v1/fix-standard',
  operationId: 'fixer_standard_post',
};

export const tool: Tool = {
  name: 'create_fix_standard',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nStandard fixes endpoint - applies non-parsing fixes. Phase 2 of the 3-phase architecture. Takes the output from Phase 1 (detection) and applies CSS, UI, dependency, and type fixes. The output can be used as input to Phase 3 (AI fallback).\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/standard_create_response',\n  $defs: {\n    standard_create_response: {\n      type: 'object',\n      properties: {\n        data: {\n          type: 'object',\n          description: 'The actual response data',\n          properties: {\n            changed_files: {\n              type: 'array',\n              description: 'Files that were modified during fixing',\n              items: {\n                type: 'object',\n                properties: {\n                  contents: {\n                    type: 'string',\n                    description: 'Contents of the file'\n                  },\n                  path: {\n                    type: 'string',\n                    description: 'Path of the file'\n                  }\n                },\n                required: [                  'contents',\n                  'path'\n                ]\n              }\n            },\n            execution_time: {\n              type: 'number',\n              description: 'Total execution time in seconds'\n            },\n            files_fixed: {\n              type: 'number',\n              description: 'Number of files that were fixed'\n            },\n            fix_types_applied: {\n              type: 'array',\n              description: 'Types of fixes that were actually applied',\n              items: {\n                type: 'string',\n                enum: [                  'dependency',\n                  'parsing',\n                  'css',\n                  'ai_fallback',\n                  'types',\n                  'ui',\n                  'sql'\n                ]\n              }\n            },\n            issues_remaining: {\n              type: 'number',\n              description: 'Number of issues still remaining'\n            },\n            issues_resolved: {\n              type: 'number',\n              description: 'Number of issues resolved'\n            },\n            remaining_diagnostics: {\n              type: 'object',\n              description: 'Remaining diagnostics after standard fixes',\n              properties: {\n                file_to_diagnostics: {\n                  type: 'object',\n                  description: 'Diagnostics grouped by file',\n                  additionalProperties: true\n                }\n              }\n            },\n            success: {\n              type: 'boolean',\n              description: 'Whether fixes were successfully applied'\n            },\n            bundled_files: {\n              type: 'array',\n              description: 'Bundled output files if bundling was requested',\n              items: {\n                type: 'object',\n                properties: {\n                  contents: {\n                    type: 'string',\n                    description: 'Contents of the file'\n                  },\n                  path: {\n                    type: 'string',\n                    description: 'Path of the file'\n                  }\n                },\n                required: [                  'contents',\n                  'path'\n                ]\n              }\n            }\n          },\n          required: [            'changed_files',\n            'execution_time',\n            'files_fixed',\n            'fix_types_applied',\n            'issues_remaining',\n            'issues_resolved',\n            'remaining_diagnostics',\n            'success'\n          ]\n        },\n        error: {\n          type: 'object',\n          description: 'The error from the API query',\n          properties: {\n            code: {\n              type: 'string',\n              description: 'The error code'\n            },\n            message: {\n              type: 'string',\n              description: 'The error message'\n            },\n            details: {\n              type: 'object',\n              description: 'Details about what caused the error',\n              additionalProperties: true\n            }\n          },\n          required: [            'code',\n            'message'\n          ]\n        },\n        meta: {\n          type: 'object',\n          description: 'Meta information',\n          properties: {\n            external_id: {\n              type: 'string',\n              description: 'Customer tracking identifier'\n            },\n            trace_id: {\n              type: 'string',\n              description: 'Unique trace identifier for the request'\n            }\n          }\n        }\n      },\n      required: [        'data'\n      ]\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      files: {
        type: 'array',
        description: 'List of files to fix (can be output from step 1)',
        items: {
          type: 'object',
          properties: {
            contents: {
              type: 'string',
              description: 'File contents',
            },
            path: {
              type: 'string',
              description: 'Path to the file',
            },
          },
          required: ['contents', 'path'],
        },
      },
      remaining_diagnostics: {
        type: 'object',
        description: 'Diagnostics to fix (output from step 1 or previous fixes)',
        properties: {
          file_to_diagnostics: {
            type: 'object',
            description: 'Diagnostics grouped by file',
            additionalProperties: true,
          },
        },
      },
      bundle: {
        type: 'boolean',
        description: 'Whether to bundle the project after fixes',
      },
      continuation_event_id: {
        type: 'string',
        description: 'Event ID from Step 1 to continue with the same temp directory',
      },
      event_id: {
        type: 'string',
        description: 'Unique identifier for tracking',
      },
      fix_types: {
        type: 'array',
        description: 'Types of standard fixes to apply',
        items: {
          type: 'string',
          enum: ['dependency', 'parsing', 'css', 'ai_fallback', 'types', 'ui', 'sql'],
        },
      },
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
      mode: {
        type: 'string',
        description: "Fixer mode: 'project' for full analysis, 'files' for incremental",
        enum: ['project', 'files'],
      },
      template_path: {
        type: 'string',
        description: 'Template path for project context',
      },
      jq_filter: {
        type: 'string',
        title: 'jq Filter',
        description:
          'A jq filter to apply to the response to include certain fields. Consult the output schema in the tool description to see the fields that are available.\n\nFor example: to include only the `name` field in every object of a results array, you can provide ".results[].name".\n\nFor more information, see the [jq documentation](https://jqlang.org/manual/).',
      },
    },
    required: ['files', 'remaining_diagnostics'],
  },
  annotations: {},
};

export const handler = async (client: Benchify, args: Record<string, unknown> | undefined) => {
  const { jq_filter, ...body } = args as any;
  return asTextContentResult(await maybeFilter(jq_filter, await client.fix.standard.create(body)));
};

export default { metadata, tool, handler };
