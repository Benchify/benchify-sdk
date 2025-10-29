// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Benchify from 'benchify';

const client = new Benchify({ baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010' });

describe('resource fixer', () => {
  // Prism tests are disabled
  test.skip('run', async () => {
    const responsePromise = client.fixer.run();
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('run: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.fixer.run(
        {
          bundle: false,
          event_id: 'event_id',
          files: [
            { contents: "export const hello = 'world';", path: 'src/index.ts' },
            { contents: 'export function helper() {}', path: 'src/utils.ts' },
          ],
          files_data: 'files_data',
          files_manifest: [{ foo: 'bar' }],
          fixes: ['dependency'],
          meta: { external_id: 'external_id' },
          mode: 'project',
          response_encoding: 'json',
          response_format: 'ALL_FILES',
          template_id: 'template_id',
          template_path: 'template_path',
        },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Benchify.NotFoundError);
  });
});
