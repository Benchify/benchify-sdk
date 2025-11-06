// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { maybeFilter } from 'benchify-mcp/filtering';
import { Metadata, asTextContentResult } from 'benchify-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Benchify from 'benchify';

export const metadata: Metadata = {
  resource: 'fix',
  operation: 'write',
  tags: [],
  httpMethod: 'post',
  httpPath: '/v1/fix/ai-fallback',
  operationId: 'fixer_ai_fallback_post',
};

export const tool: Tool = {
  name: 'create_ai_fallback_fix',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nAI-powered fallback for complex issues. Phase 3 of the 3-phase architecture. Handles issues that standard fixers cannot resolve. Uses LLM to understand and fix complex problems. Provides confidence scores and alternative suggestions.\n\n# Response Schema\n```json\n{\n  $ref: '#/$defs/fix_create_ai_fallback_response',\n  $defs: {\n    fix_create_ai_fallback_response: {\n      type: 'object',\n      properties: {\n        data: {\n          type: 'object',\n          description: 'The actual response data',\n          properties: {\n            file_results: {\n              type: 'array',\n              description: 'Per-file AI fix results',\n              items: {\n                type: 'object',\n                properties: {\n                  confidence_score: {\n                    type: 'number',\n                    description: 'Confidence score of the fix (0-1)'\n                  },\n                  issues_remaining: {\n                    type: 'number',\n                    description: 'Number of issues still remaining'\n                  },\n                  issues_resolved: {\n                    type: 'number',\n                    description: 'Number of issues resolved'\n                  },\n                  path: {\n                    type: 'string',\n                    description: 'Path of the file'\n                  },\n                  success: {\n                    type: 'boolean',\n                    description: 'Whether the AI fix was successful'\n                  },\n                  alternative_suggestions: {\n                    type: 'array',\n                    description: 'Alternative fix suggestions',\n                    items: {\n                      type: 'string'\n                    }\n                  }\n                },\n                required: [                  'confidence_score',\n                  'issues_remaining',\n                  'issues_resolved',\n                  'path',\n                  'success'\n                ]\n              }\n            },\n            files_fixed: {\n              type: 'number',\n              description: 'Number of files that were fixed'\n            },\n            fixer_version: {\n              type: 'string',\n              description: 'Version of the fixer'\n            },\n            issues_remaining: {\n              type: 'number',\n              description: 'Total number of issues still remaining'\n            },\n            issues_resolved: {\n              type: 'number',\n              description: 'Total number of issues resolved'\n            },\n            success: {\n              type: 'boolean',\n              description: 'Whether the AI fallback was successful overall'\n            },\n            suggested_changes: {\n              type: 'object',\n              description: 'Suggested changes from AI fixes',\n              properties: {\n                all_files: {\n                  type: 'array',\n                  description: 'List of all files with their current contents. Only present when response_encoding is \"json\".',\n                  items: {\n                    type: 'object',\n                    properties: {\n                      contents: {\n                        type: 'string',\n                        description: 'Contents of the file'\n                      },\n                      path: {\n                        type: 'string',\n                        description: 'Path of the file'\n                      }\n                    },\n                    required: [                      'contents',\n                      'path'\n                    ]\n                  }\n                },\n                changed_files: {\n                  type: 'array',\n                  description: 'List of changed files with their new contents. Only present when response_encoding is \"json\".',\n                  items: {\n                    type: 'object',\n                    properties: {\n                      contents: {\n                        type: 'string',\n                        description: 'Contents of the file'\n                      },\n                      path: {\n                        type: 'string',\n                        description: 'Path of the file'\n                      }\n                    },\n                    required: [                      'contents',\n                      'path'\n                    ]\n                  }\n                },\n                diff: {\n                  type: 'string',\n                  description: 'Unified diff of changes. Only present when response_encoding is \"json\".'\n                }\n              }\n            }\n          },\n          required: [            'file_results',\n            'files_fixed',\n            'fixer_version',\n            'issues_remaining',\n            'issues_resolved',\n            'success',\n            'suggested_changes'\n          ]\n        },\n        error: {\n          type: 'object',\n          description: 'The error from the API query',\n          properties: {\n            code: {\n              type: 'string',\n              description: 'The error code'\n            },\n            message: {\n              type: 'string',\n              description: 'The error message'\n            },\n            details: {\n              type: 'object',\n              description: 'Details about what caused the error',\n              additionalProperties: true\n            }\n          },\n          required: [            'code',\n            'message'\n          ]\n        },\n        meta: {\n          type: 'object',\n          description: 'Meta information',\n          properties: {\n            external_id: {\n              type: 'string',\n              description: 'Customer tracking identifier'\n            },\n            trace_id: {\n              type: 'string',\n              description: 'Unique trace identifier for the request'\n            }\n          }\n        }\n      },\n      required: [        'data'\n      ]\n    }\n  }\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      files: {
        type: 'array',
        description: 'List of files (potentially already fixed by standard fixers)',
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
        description: 'Diagnostics that remain after standard fixing',
        properties: {
          file_to_diagnostics: {
            type: 'object',
            description: 'Diagnostics grouped by file',
            additionalProperties: true,
          },
        },
      },
      template_path: {
        type: 'string',
        description: 'Full path to the template',
      },
      event_id: {
        type: 'string',
        description: 'Unique identifier for the event',
      },
      include_context: {
        type: 'boolean',
        description: 'Whether to include context in AI prompts',
      },
      max_attempts: {
        type: 'number',
        description: 'Maximum number of AI fix attempts',
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
      jq_filter: {
        type: 'string',
        title: 'jq Filter',
        description:
          'A jq filter to apply to the response to include certain fields. Consult the output schema in the tool description to see the fields that are available.\n\nFor example: to include only the `name` field in every object of a results array, you can provide ".results[].name".\n\nFor more information, see the [jq documentation](https://jqlang.org/manual/).',
      },
    },
    required: ['files', 'remaining_diagnostics', 'template_path'],
  },
  annotations: {},
};

export const handler = async (client: Benchify, args: Record<string, unknown> | undefined) => {
  const { jq_filter, ...body } = args as any;
  return asTextContentResult(await maybeFilter(jq_filter, await client.fix.createAIFallback(body)));
};

export default { metadata, tool, handler };
