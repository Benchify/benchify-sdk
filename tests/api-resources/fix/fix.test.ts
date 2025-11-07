// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Benchify from 'benchify';

const client = new Benchify({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource fix', () => {
  // Prism tests are disabled
  test.skip('createAIFallback: only required params', async () => {
    const responsePromise = client.fix.createAIFallback({
      files: [
        { contents: 'export function complexFunction() { /* complex logic */ }', path: 'src/complex.ts' },
      ],
      remaining_diagnostics: {},
      template_path: 'benchify/default-template',
    });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('createAIFallback: required and optional params', async () => {
    const response = await client.fix.createAIFallback({
      files: [
        { contents: 'export function complexFunction() { /* complex logic */ }', path: 'src/complex.ts' },
      ],
      remaining_diagnostics: {
        file_to_diagnostics: {
          'src/complex.ts': [
            {
              file_path: 'src/complex.ts',
              location: { column: 1, line: 1, span: 10, starting_character_position: 0 },
              message: 'Complex type inference issue',
              type: 'types',
              code: 2000,
              context: 'context',
            },
          ],
        },
      },
      template_path: 'benchify/default-template',
      event_id: '',
      include_context: true,
      max_attempts: 3,
      meta: { external_id: 'external_id' },
    });
  });
});
