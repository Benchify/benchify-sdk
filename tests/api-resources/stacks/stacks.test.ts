// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Benchify, { toFile } from 'benchify';

const client = new Benchify({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource stacks', () => {
  // Prism tests are disabled
  test.skip('create: only required params', async () => {
    const responsePromise = client.stacks.create({
      bundle: await toFile(Buffer.from('# my file contents'), 'README.md'),
      manifest: await toFile(Buffer.from('# my file contents'), 'README.md'),
      'idempotency-key': 'key-12345678',
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
    const response = await client.stacks.create({
      bundle: await toFile(Buffer.from('# my file contents'), 'README.md'),
      manifest: await toFile(Buffer.from('# my file contents'), 'README.md'),
      'idempotency-key': 'key-12345678',
      options: 'options',
      'content-hash': 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    });
  });

  // Prism tests are disabled
  test.skip('retrieve', async () => {
    const responsePromise = client.stacks.retrieve('stk_abc123');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('update: only required params', async () => {
    const responsePromise = client.stacks.update('stk_abc123', {
      'idempotency-key': 'key-12345678',
      'base-etag': 'sha256:abc123...',
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
  test.skip('update: required and optional params', async () => {
    const response = await client.stacks.update('stk_abc123', {
      bundle: await toFile(Buffer.from('# my file contents'), 'README.md'),
      manifest: await toFile(Buffer.from('# my file contents'), 'README.md'),
      ops: 'ops',
      'base-etag': 'sha256:abc123...',
      'idempotency-key': 'key-12345678',
    });
  });

  // Prism tests are disabled
  test.skip('bundleMultipart: only required params', async () => {
    const responsePromise = client.stacks.bundleMultipart({
      manifest: '{"entrypoint":"src/index.ts"}',
      tarball: await toFile(Buffer.from('# my file contents'), 'README.md'),
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
  test.skip('bundleMultipart: required and optional params', async () => {
    const response = await client.stacks.bundleMultipart({
      manifest: '{"entrypoint":"src/index.ts"}',
      tarball: await toFile(Buffer.from('# my file contents'), 'README.md'),
    });
  });

  // Prism tests are disabled
  test.skip('destroy', async () => {
    const responsePromise = client.stacks.destroy('stk_abc123');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('executeCommand: only required params', async () => {
    const responsePromise = client.stacks.executeCommand('stk_abc123', {
      command: ['curl', '-s', 'https://example.com'],
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
  test.skip('executeCommand: required and optional params', async () => {
    const response = await client.stacks.executeCommand('stk_abc123', {
      command: ['curl', '-s', 'https://example.com'],
    });
  });

  // Prism tests are disabled
  test.skip('getLogs', async () => {
    const responsePromise = client.stacks.getLogs('stk_abc123');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('getLogs: request options and params are passed correctly', async () => {
    await expect(
      client.stacks.getLogs('stk_abc123', { tail: '100' }, { path: '/_stainless_unknown_path' }),
    ).rejects.toThrow(Benchify.NotFoundError);
  });

  // Prism tests are disabled
  test.skip('getNetworkInfo', async () => {
    const responsePromise = client.stacks.getNetworkInfo('stk_abc123');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('readFile: only required params', async () => {
    const responsePromise = client.stacks.readFile('stk_abc123', { path: '/workspace/index.html' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('readFile: required and optional params', async () => {
    const response = await client.stacks.readFile('stk_abc123', { path: '/workspace/index.html' });
  });

  // Prism tests are disabled
  test.skip('reset: only required params', async () => {
    const responsePromise = client.stacks.reset('stk_abc123', { tarball_base64: 'tarball_base64' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('reset: required and optional params', async () => {
    const response = await client.stacks.reset('stk_abc123', {
      tarball_base64: 'tarball_base64',
      tarball_filename: 'project.tar.gz',
    });
  });

  // Prism tests are disabled
  test.skip('waitForDevServerURL', async () => {
    const responsePromise = client.stacks.waitForDevServerURL('stk_abc123');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('waitForDevServerURL: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.stacks.waitForDevServerURL(
        'stk_abc123',
        { interval: 200, wait_timeout: 60 },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Benchify.NotFoundError);
  });

  // Prism tests are disabled
  test.skip('writeFile: only required params', async () => {
    const responsePromise = client.stacks.writeFile('stk_abc123', {
      content: 'content',
      path: '/workspace/index.html',
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
  test.skip('writeFile: required and optional params', async () => {
    const response = await client.stacks.writeFile('stk_abc123', {
      content: 'content',
      path: '/workspace/index.html',
    });
  });
});
