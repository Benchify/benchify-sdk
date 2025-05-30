// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Benchify from 'benchify';

const client = new Benchify({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource fixer', () => {
  // skipped: tests are disabled for the time being
  test.skip('run: only required params', async () => {
    const responsePromise = client.fixer.run({
      files: [
        {
          contents: '{"name": "simple-shopping-app", "version": "0.1.0", "scripts": {"build": "next build"}}',
          path: 'package.json',
        },
        {
          contents: "import Link from 'next/navigation/link';\nconsole.log('Hello world');",
          path: 'src/index.tsx',
        },
      ],
    });
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
    const response = await client.fixer.run({
      files: [
        {
          contents: '{"name": "simple-shopping-app", "version": "0.1.0", "scripts": {"build": "next build"}}',
          path: 'package.json',
        },
        {
          contents: "import Link from 'next/navigation/link';\nconsole.log('Hello world');",
          path: 'src/index.tsx',
        },
      ],
      fixes: { css: true, imports: true, stringLiterals: true, tsSuggestions: true },
      meta: { external_id: 'customer-batch-001' },
    });
  });
});
