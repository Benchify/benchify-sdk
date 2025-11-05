#!/usr/bin/env ts-node
/**
 * Test script for local SDK development
 * Tests runFixer against your local API
 *
 * Usage:
 *   npm run tsn scripts/test-local.ts
 *
 * Or with custom port:
 *   LOCAL_API_PORT=4000 npm run tsn scripts/test-local.ts
 */

import { Benchify } from '../src/index';
import { R18T4ExampleFiles } from './r18t4Json.ts';

const API_KEY = process.env['BENCHIFY_API_KEY'];
const BASE_URL = process.env['BENCHIFY_BASE_URL'];

// Skip tests if environment variables are not set
if (!API_KEY || !BASE_URL) {
  console.log('⏭️  Skipping local API tests');
  console.log('');
  console.log('To run these tests, set the following environment variables:');
  console.log('  - BENCHIFY_API_KEY: Your API key');
  console.log('  - BENCHIFY_BASE_URL: Your local API URL (e.g., http://localhost:8082)');
  console.log('');
  console.log('Example:');
  console.log('  BENCHIFY_API_KEY=your-key BENCHIFY_BASE_URL=http://localhost:8082 npm run test:local');
  process.exit(0);
}

// Type assertion: after the check above, these are guaranteed to be strings
const apiKey: string = API_KEY;
const baseUrl: string = BASE_URL;

async function testRunFixer() {
  console.log('🚀 Testing local SDK against local API...');
  console.log(`   Base url: ${baseUrl}`);
  console.log(`   API Key: ${apiKey.substring(0, 10)}...`);
  console.log('');

  const client = new Benchify({
    apiKey: apiKey,
    baseURL: baseUrl,
  });

  try {
    console.log('🔧 Running fixer with multipart/tar.zst format...');
    const startTime = Date.now();

    const result = await client.runFixer(R18T4ExampleFiles);

    const duration = Date.now() - startTime;
    console.log(`✅ Success! (${duration}ms)`);
    console.log('');

    // Display results
    console.log('📄 Files returned:', result.files.length);
    if (Array.isArray(result.files)) {
      result.files.forEach((file: any, idx: number) => {
        console.log(`   ${idx + 1}. ${file.path} (${file.contents.length} bytes)`);
      });
    } else {
      console.log('   (DIFF format)');
      console.log(result.files);
    }
    console.log('');

    // Display diagnostics
    if (result.initial_diagnostics) {
      const initialCount = Object.keys(
        result.initial_diagnostics.requested?.file_to_diagnostics || {},
      ).length;
      console.log(`📊 Initial diagnostics: ${initialCount} files with issues`);
    }

    if (result.final_diagnostics) {
      const finalCount = Object.keys(result.final_diagnostics.requested?.file_to_diagnostics || {}).length;
      console.log(`📊 Final diagnostics: ${finalCount} files with issues`);
    }
    console.log('');

    // Display first file content preview
    if (Array.isArray(result.files) && result.files.length > 0) {
      const firstFile = result.files[0] as any;
      console.log(`📝 Preview of ${firstFile.path}:`);
      console.log('─'.repeat(60));
      console.log(firstFile.contents.substring(0, 300));
      if (firstFile.contents.length > 300) {
        console.log('...');
      }
      console.log('─'.repeat(60));
    }

    return result;
  } catch (error: any) {
    console.error('❌ Error running fixer:');
    console.error('');

    if (error.status) {
      console.error(`   Status: ${error.status}`);
    }

    if (error.message) {
      console.error(`   Message: ${error.message}`);
    }

    if (error.error) {
      console.error(`   Details:`, error.error);
    }

    console.error('');
    console.error('Stack trace:', error.stack);

    process.exit(1);
  }
}

// Test with bundle enabled
async function testWithBundle() {
  console.log('');
  console.log('═'.repeat(60));
  console.log('🎁 Testing with bundle enabled...');
  console.log('═'.repeat(60));
  console.log('');

  const client = new Benchify({
    apiKey: apiKey,
    baseURL: baseUrl,
  });

  const files = [{ path: 'src/test.ts', contents: 'export const test = "hello";' }];

  try {
    const result = await client.runFixer(files, {
      response_format: 'ALL_FILES',
      bundle: true,
    });

    console.log('✅ Bundle test success!');
    console.log(`   Files: ${result.files.length}`);

    if ('bundled_files' in result && result.bundled_files) {
      console.log(`   Bundled files: ${result.bundled_files.length}`);
      result.bundled_files.forEach((file, idx) => {
        console.log(`      ${idx + 1}. ${file.path}`);
      });
    }
  } catch (error: any) {
    console.error('❌ Bundle test failed:', error.message);
  }
}

// Test DIFF format
async function testDiffFormat() {
  console.log('');
  console.log('═'.repeat(60));
  console.log('📝 Testing DIFF format...');
  console.log('═'.repeat(60));
  console.log('');

  const client = new Benchify({
    apiKey: apiKey,
    baseURL: baseUrl,
  });

  const files = [
    { path: 'src/test.ts', contents: 'const x: string = 1;' }, // type error
  ];

  try {
    const result = await client.runFixer(files, {
      response_format: 'DIFF',
      fixes: ['types'],
    });

    console.log('✅ DIFF format test success!');
    console.log('');
    console.log('Diff output:');
    console.log('─'.repeat(60));
    console.log(result.files);
    console.log('─'.repeat(60));
  } catch (error: any) {
    console.error('❌ DIFF test failed:', error.message);
  }
}

// Run all tests
async function main() {
  console.log('═'.repeat(60));
  console.log('🧪 Local SDK Test Suite');
  console.log('═'.repeat(60));
  console.log('');

  await testRunFixer();
  await testWithBundle();
  await testDiffFormat();

  console.log('');
  console.log('═'.repeat(60));
  console.log('✨ All tests completed!');
  console.log('═'.repeat(60));
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
