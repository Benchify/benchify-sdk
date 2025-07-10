// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Benchify from 'benchify';

const client = new Benchify({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource validateSql', () => {
  // skipped: tests are disabled for the time being
  test.skip('validate: only required params', async () => {
    const responsePromise = client.validateSql.validate({ sql: 'SELECT * FROM users WHERE id = 1' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // skipped: tests are disabled for the time being
  test.skip('validate: required and optional params', async () => {
    const response = await client.validateSql.validate({
      sql: 'SELECT * FROM users WHERE id = 1',
      meta: { external_id: 'customer-batch-001' },
    });
  });
});
