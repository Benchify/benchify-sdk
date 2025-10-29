// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Benchify from 'benchify';

const client = new Benchify({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource validateTemplate', () => {
  // Prism tests are disabled
  test.skip('validate', async () => {
    const responsePromise = client.validateTemplate.validate();
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('validate: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.validateTemplate.validate(
        {
          meta: { external_id: 'external_id' },
          response_format: 'DIFF',
          template_id: 'template_id',
          template_path: 'template_path',
          templateId: 'templateId',
          templateName: 'templateName',
        },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Benchify.NotFoundError);
  });
});
