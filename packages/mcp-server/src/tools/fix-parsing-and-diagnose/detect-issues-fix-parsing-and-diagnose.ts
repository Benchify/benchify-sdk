// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { maybeFilter } from 'benchify-mcp/filtering';
import { Metadata, asTextContentResult } from 'benchify-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Benchify from 'benchify';

export const metadata: Metadata = {
  resource: 'fix_parsing_and_diagnose',
  operation: 'write',
  tags: [],
  httpMethod: 'post',
  httpPath: '/v1/fix-parsing-and-diagnose',
  operationId: 'fixer_detect_post',
};

export const tool: Tool = {
  name: 'detect_issues_fix_parsing_and_diagnose',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nFast detection endpoint for quick diagnostic results. Phase 1 of the 3-phase architecture. Returns issues quickly (within 1-3 seconds) and provides metadata about available fixes and time estimates. Does not apply any fixes, only analyzes code.\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/fix_parsing_and_diagnose_detect_issues_response',\n  $defs: {\n    fix_parsing_and_diagnose_detect_issues_response: {\n      type: 'object',\n      properties: {\n        data: {\n          type: 'object',\n          description: 'The actual response data',\n          properties: {\n            diagnostics: {\n              type: 'object',\n              description: 'Diagnostics split into fixable (requested) and other (not_requested) groups',\n              properties: {\n                not_requested: {\n                  type: 'object',\n                  description: 'Diagnostics that do not match the requested fix types',\n                  properties: {\n                    file_to_diagnostics: {\n                      type: 'object',\n                      description: 'Diagnostics grouped by file',\n                      additionalProperties: true\n                    }\n                  }\n                },\n                requested: {\n                  type: 'object',\n                  description: 'Diagnostics that match the requested fix types',\n                  properties: {\n                    file_to_diagnostics: {\n                      type: 'object',\n                      description: 'Diagnostics grouped by file',\n                      additionalProperties: true\n                    }\n                  }\n                }\n              }\n            },\n            fixer_version: {\n              type: 'string',\n              description: 'Version of the fixer'\n            },\n            statistics: {\n              type: 'object',\n              description: 'Statistics about the diagnostics',\n              properties: {\n                by_severity: {\n                  type: 'object',\n                  description: 'Count of diagnostics by severity',\n                  additionalProperties: true\n                },\n                by_type: {\n                  type: 'object',\n                  description: 'Count of diagnostics by type',\n                  additionalProperties: true\n                },\n                total_diagnostics: {\n                  type: 'number',\n                  description: 'Total number of diagnostics found'\n                },\n                estimated_fix_time_seconds: {\n                  type: 'number',\n                  description: 'Estimated time to fix in seconds'\n                }\n              },\n              required: [                'by_severity',\n                'by_type',\n                'total_diagnostics'\n              ]\n            }\n          },\n          required: [            'diagnostics',\n            'fixer_version',\n            'statistics'\n          ]\n        },\n        error: {\n          type: 'object',\n          description: 'The error from the API query',\n          properties: {\n            code: {\n              type: 'string',\n              description: 'The error code'\n            },\n            message: {\n              type: 'string',\n              description: 'The error message'\n            },\n            details: {\n              type: 'object',\n              description: 'Details about what caused the error',\n              additionalProperties: true\n            }\n          },\n          required: [            'code',\n            'message'\n          ]\n        },\n        meta: {\n          type: 'object',\n          description: 'Meta information',\n          properties: {\n            external_id: {\n              type: 'string',\n              description: 'Customer tracking identifier'\n            },\n            trace_id: {\n              type: 'string',\n              description: 'Unique trace identifier for the request'\n            }\n          }\n        }\n      },\n      required: [        'data'\n      ]\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      event_id: {
        type: 'string',
        description: 'Unique identifier for the event',
      },
      files: {
        type: 'array',
        description:
          'List of files to analyze (JSON format with inline contents). For large projects, use multipart/form-data with manifest + bundle instead.',
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
      template_path: {
        type: 'string',
        description: 'Full path to the template',
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
  return asTextContentResult(
    await maybeFilter(jq_filter, await client.fixParsingAndDiagnose.detectIssues(body)),
  );
};

export default { metadata, tool, handler };
