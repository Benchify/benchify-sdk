// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Benchify from 'benchify';

const client = new Benchify({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource fixParsingAndDiagnose', () => {
  // Prism tests are disabled
  test.skip('detectIssues', async () => {
    const responsePromise = client.fixParsingAndDiagnose.detectIssues();
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('detectIssues: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.fixParsingAndDiagnose.detectIssues(
        {
          event_id: '',
          files: [
            { contents: "export const hello = 'world';", path: 'src/index.ts' },
            { contents: 'export function helper() {}', path: 'src/utils.ts' },
          ],
          meta: { external_id: 'external_id' },
          template_path: 'benchify/default-template',
        },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Benchify.NotFoundError);
  });
});
