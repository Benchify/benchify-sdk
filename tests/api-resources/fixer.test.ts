// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Benchify from 'benchify';

const client = new Benchify({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource fixer', () => {
  test('runFixer returns diagnostics with correct structure', async () => {
    const result = await client.runFixer(
      [
        {
          path: 'src/test.ts',
          contents: `import { nonExistentFunction } from './missing-module';

function demo() {
  console.log('Max's demo');
  return nonExistentFunction();
}`,
        },
      ],
      {
        response_format: 'ALL_FILES',
        fixes: ['parsing'],
      },
    );

    // Print diagnostics for inspection
    console.log('=== INITIAL DIAGNOSTICS ===');
    console.log(JSON.stringify(result.initial_diagnostics, null, 2));
    console.log('\n=== FINAL DIAGNOSTICS ===');
    console.log(JSON.stringify(result.final_diagnostics, null, 2));

    // Verify diagnostics structure exists
    expect(result).toHaveProperty('initial_diagnostics');
    expect(result).toHaveProperty('final_diagnostics');

    // Verify initial diagnostics structure
    if (result.initial_diagnostics) {
      expect(result.initial_diagnostics).toHaveProperty('requested');
      expect(result.initial_diagnostics).toHaveProperty('not_requested');

      // Check nested structure
      if (result.initial_diagnostics.requested) {
        expect(result.initial_diagnostics.requested).toHaveProperty('file_to_diagnostics');
      }
      if (result.initial_diagnostics.not_requested) {
        expect(result.initial_diagnostics.not_requested).toHaveProperty('file_to_diagnostics');
      }
    }

    // Verify final diagnostics structure
    if (result.final_diagnostics) {
      expect(result.final_diagnostics).toHaveProperty('requested');
      expect(result.final_diagnostics).toHaveProperty('not_requested');

      // Check nested structure
      if (result.final_diagnostics.requested) {
        expect(result.final_diagnostics.requested).toHaveProperty('file_to_diagnostics');
      }
      if (result.final_diagnostics.not_requested) {
        expect(result.final_diagnostics.not_requested).toHaveProperty('file_to_diagnostics');
      }
    }

    // Verify files are returned
    expect(result).toHaveProperty('files');
  });

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
          files_manifest: [{ path: 'path', size: 0, digest: 'digest' }],
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
