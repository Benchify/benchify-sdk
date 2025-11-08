// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Benchify from 'benchify';

const client = new Benchify({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource bundle', () => {
  // Prism tests are disabled
  test.skip('create: only required params', async () => {
    const responsePromise = client.stacks.bundle.create({ entrypoint: 'x', tarball_base64: 'x' });
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
    const response = await client.stacks.bundle.create({
      entrypoint: 'x',
      tarball_base64: 'x',
      tarball_filename: 'tarball_filename',
    });
  });

  // Prism tests are disabled
  test.skip('createFiles: only required params', async () => {
    const responsePromise = client.stacks.bundle.createFiles({
      entrypoint: 'x',
      files: [{ content: '<html>...</html>', path: 'index.html' }],
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
  test.skip('createFiles: required and optional params', async () => {
    const response = await client.stacks.bundle.createFiles({
      entrypoint: 'x',
      files: [{ content: '<html>...</html>', path: 'index.html' }],
      tarball_filename: 'tarball_filename',
    });
  });
});
