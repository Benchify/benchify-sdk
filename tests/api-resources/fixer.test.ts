// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Benchify from 'benchify';
import { packWithManifest } from '../../src/lib/helpers';

const client = new Benchify({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource fixer', () => {
  // Integration test - requires running API server
  test.skip('runFixer returns diagnostics with correct structure', async () => {
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

  // Unit test - mocks fetch response to test tar.zst handling
  test('runFixer handles multipart tar.zst responses correctly', async () => {
    // Create mock files
    const mockFiles = [
      { path: 'src/index.ts', contents: 'export const fixed = true;' },
      { path: 'src/utils.ts', contents: 'export function helper() { return "fixed"; }' },
    ];

    // Pack them into tar.zst format with manifest
    const { buffer: packedBuffer, manifest } = await packWithManifest(mockFiles);
    const base64Data = packedBuffer.toString('base64');

    // Create a mock response
    const mockResponse = {
      data: {
        fixer_version: '1.0.0',
        status: {
          composite_status: 'FIXED_EVERYTHING' as const,
        },
        suggested_changes: {
          all_files_data: base64Data,
        },
        initial_diagnostics: {
          requested: { file_to_diagnostics: {} },
          not_requested: { file_to_diagnostics: {} },
        },
        final_diagnostics: {
          requested: { file_to_diagnostics: {} },
          not_requested: { file_to_diagnostics: {} },
        },
      },
    };

    // Mock the fetch call
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockResponse,
      text: async () => JSON.stringify(mockResponse),
      url: 'http://test.com/v1/fixer',
    });

    const testClient = new Benchify({
      apiKey: 'test-key',
      baseURL: 'http://test.com',
      fetch: mockFetch as any,
    });

    // Call runFixer
    const result = await testClient.runFixer([{ path: 'input.ts', contents: 'const test = 1;' }], {
      response_format: 'ALL_FILES',
    });

    // Verify the request was made with multipart encoding and manifest
    expect(mockFetch).toHaveBeenCalled();

    // The first call might be internal (like FormData support check), so use the last call
    const callArgs = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
    const requestInit = callArgs[1];
    const requestBody = requestInit?.body;

    // Verify it's actually FormData (multipart)
    expect(requestBody).toBeInstanceOf(FormData);

    // Check that the FormData contains the expected fields
    expect(requestBody.has('files_data')).toBe(true);
    expect(requestBody.has('manifest')).toBe(true);
    expect(requestBody.has('response_encoding')).toBe(true);
    expect(requestBody.has('response_format')).toBe(true);

    // Verify response_encoding and response_format values
    expect(requestBody.get('response_encoding')).toBe('multipart');
    expect(requestBody.get('response_format')).toBe('ALL_FILES');

    // Verify files_data is a File/Blob
    const filesData = requestBody.get('files_data');
    expect(filesData).toBeInstanceOf(File);

    // Verify manifest is a File/Blob
    const manifestData = requestBody.get('manifest');
    expect(manifestData).toBeInstanceOf(File);

    // Verify the response was unpacked correctly
    expect(result).toHaveProperty('files');
    expect(Array.isArray(result.files)).toBe(true);
    expect(result.files).toHaveLength(2);
    expect(result.files[0]).toEqual({ path: 'src/index.ts', contents: 'export const fixed = true;' });
    expect(result.files[1]).toEqual({
      path: 'src/utils.ts',
      contents: 'export function helper() { return "fixed"; }',
    });

    // Verify diagnostics are returned
    expect(result).toHaveProperty('initial_diagnostics');
    expect(result).toHaveProperty('final_diagnostics');
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
