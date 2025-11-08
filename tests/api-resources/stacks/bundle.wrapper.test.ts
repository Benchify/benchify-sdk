import fs from 'fs';
import os from 'os';
import path from 'path';
import Benchify from 'benchify';
import { packTarZst, bundleAndExtract } from 'benchify/helpers';

const makeTmpDir = (prefix: string) => fs.mkdtempSync(path.join(os.tmpdir(), prefix));

describe('bundleAndExtract wrapper', () => {
  let client: Benchify;

  beforeEach(() => {
    client = new Benchify({
      apiKey: 'test-key',
      baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
    });
  });

  test('bundles from directory and extracts response to outputDir', async () => {
    const inputDir = makeTmpDir('benchify-input-');
    const outputDir = makeTmpDir('benchify-output-');

    // Write a simple input file (this content is not used in the mocked response)
    fs.writeFileSync(path.join(inputDir, 'index.html'), '<html>input</html>', 'utf8');

    // Prepare a mocked server response: tar.zst containing out/index.html
    const outFiles = [{ path: 'out/index.html', contents: '<html>OK</html>' }];
    const buf = await packTarZst(outFiles);
    const contentBase64 = Buffer.from(buf).toString('base64');

    const spy = jest
      .spyOn(client.stacks.bundle, 'createFiles' as any)
      .mockResolvedValue({ content: contentBase64, path: '/workspace' } as any);

    const result = await bundleAndExtract(client, {
      entrypoint: 'index.html',
      dir: inputDir,
      outputDir,
    });

    expect(spy).toHaveBeenCalledTimes(1);
    const written = path.join(result.outputDir, 'out/index.html');
    expect(fs.existsSync(written)).toBe(true);
    expect(fs.readFileSync(written, 'utf8')).toBe('<html>OK</html>');
  });

  test('bundles from tarball and extracts response to outputDir', async () => {
    const tarballDir = makeTmpDir('benchify-tarball-');
    const outputDir = makeTmpDir('benchify-output-');
    const tarballPath = path.join(tarballDir, 'bundle.tar.zst');
    fs.writeFileSync(tarballPath, Buffer.from('dummy-bytes'));

    // Prepare a mocked server response
    const outFiles = [{ path: 'result.txt', contents: 'done' }];
    const buf = await packTarZst(outFiles);
    const contentBase64 = Buffer.from(buf).toString('base64');

    const spy = jest
      .spyOn(client.stacks.bundle, 'create' as any)
      .mockResolvedValue({ content: contentBase64, path: '/workspace' } as any);

    const result = await bundleAndExtract(client, {
      entrypoint: 'index.html',
      tarballPath,
      outputDir,
      tarballFilename: 'bundle.tar.zst',
    });

    expect(spy).toHaveBeenCalledTimes(1);
    const written = path.join(result.outputDir, 'result.txt');
    expect(fs.existsSync(written)).toBe(true);
    expect(fs.readFileSync(written, 'utf8')).toBe('done');
  });

  test('throws when both dir and tarballPath are provided', async () => {
    const dir = makeTmpDir('benchify-input-');
    const tarballDir = makeTmpDir('benchify-tarball-');
    const tarballPath = path.join(tarballDir, 'bundle.tar.zst');
    fs.writeFileSync(tarballPath, Buffer.from('dummy-bytes'));

    await expect(
      bundleAndExtract(client, {
        entrypoint: 'index.html',
        dir,
        tarballPath,
        outputDir: makeTmpDir('benchify-output-'),
      }),
    ).rejects.toThrow(/exactly one of "dir" or "tarballPath"/i);
  });

  test('throws when neither dir nor tarballPath is provided', async () => {
    await expect(
      bundleAndExtract(client, {
        entrypoint: 'index.html',
        outputDir: makeTmpDir('benchify-output-'),
      } as any),
    ).rejects.toThrow(/exactly one of "dir" or "tarballPath"/i);
  });
});


