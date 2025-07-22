// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Benchify from 'benchify';

const client = new Benchify({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource fixStringLiterals', () => {
  // skipped: tests are disabled for the time being
  test.skip('run: only required params', async () => {
    const responsePromise = client.fixStringLiterals.run({ file: { contents: 'contents', path: 'x' } });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // skipped: tests are disabled for the time being
  test.skip('run: required and optional params', async () => {
    const response = await client.fixStringLiterals.run({
      file: { contents: 'contents', path: 'x' },
      event_id: 'x',
      meta: { external_id: 'external_id' },
    });
  });
});
