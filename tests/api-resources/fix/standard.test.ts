// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Benchify from 'benchify';

const client = new Benchify({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource standard', () => {
  // Prism tests are disabled
  test.skip('create: only required params', async () => {
    const responsePromise = client.fix.standard.create({
      files: [
        { contents: "export const hello = 'world';", path: 'src/index.ts' },
        { contents: '.container { widht: 100%; }', path: 'src/styles.css' },
      ],
      remaining_diagnostics: {},
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
  test.skip('create: required and optional params', async () => {
    const response = await client.fix.standard.create({
      files: [
        { contents: "export const hello = 'world';", path: 'src/index.ts' },
        { contents: '.container { widht: 100%; }', path: 'src/styles.css' },
      ],
      remaining_diagnostics: {
        file_to_diagnostics: {
          'src/styles.css': [
            {
              file_path: 'src/styles.css',
              location: { column: 14, line: 1, span: 5, starting_character_position: 13 },
              message: 'Unknown property widht',
              type: 'css',
              code: 0,
              context: 'context',
            },
          ],
        },
      },
      bundle: true,
      continuation_event_id: 'continuation_event_id',
      event_id: '',
      fix_types: ['css', 'ui', 'dependency', 'types'],
      meta: { external_id: 'external_id' },
      mode: 'project',
      template_path: 'benchify/default-template',
    });
  });
});
