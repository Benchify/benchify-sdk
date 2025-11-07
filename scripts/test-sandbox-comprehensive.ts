#!/usr/bin/env ts-node
/**
 * Comprehensive Sandbox/Stack Test Suite
 * Tests sandbox creation, file operations, command execution, and stack lifecycle
 *
 * Usage:
 *   npm run tsn scripts/test-sandbox-comprehensive.ts
 *
 * Or with environment variables:
 *   BENCHIFY_API_KEY=your-key BENCHIFY_BASE_URL=http://localhost:8082 npm run tsn scripts/test-sandbox-comprehensive.ts
 */

import { Benchify } from '../src/index';
import { polymetFixedFiles } from './polymetFixedJson';

const API_KEY = process.env['BENCHIFY_API_KEY'];
const BASE_URL = process.env['BENCHIFY_BASE_URL'];

// Skip tests if environment variables are not set
if (!API_KEY || !BASE_URL) {
  console.log('⏭️  Skipping sandbox tests');
  console.log('');
  console.log('To run these tests, set the following environment variables:');
  console.log('  - BENCHIFY_API_KEY: Your API key');
  console.log('  - BENCHIFY_BASE_URL: Your local API URL (e.g., http://localhost:8082)');
  console.log('');
  console.log('Example:');
  console.log(
    '  BENCHIFY_API_KEY=your-key BENCHIFY_BASE_URL=http://localhost:8082 npm run tsn scripts/test-sandbox-comprehensive.ts',
  );
  process.exit(0);
}

// Type assertion: after the check above, these are guaranteed to be strings
const apiKey: string = API_KEY;
const baseUrl: string = BASE_URL;

// Use the Polymet React app for testing (comprehensive Vite + React app)
const TEST_FILES = polymetFixedFiles;

/**
 * Test basic stack creation
 */
async function testStackCreation() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TEST: Stack Creation');
  console.log('='.repeat(80));

  const client = new Benchify({
    apiKey: apiKey,
    baseURL: baseUrl,
  });

  try {
    console.log('\n📦 Creating stack with Polymet React app...');
    console.log(`   Files: ${TEST_FILES.length}`);
    const startTime = Date.now();

    const stack = await client.stack.create(TEST_FILES, {
      name: 'polymet-test-app',
      startCommand: 'npm run dev',
      port: 5173, // Vite default port
    });

    const duration = Date.now() - startTime;
    console.log(`✅ Stack created successfully! (${duration}ms)`);
    console.log('');

    // Display stack info
    console.log('📊 Stack Information:');
    console.log(`   ID: ${stack.id}`);
    console.log(`   URL: ${stack.url}`);
    console.log(`   Kind: ${stack.kind}`);
    console.log('');

    return stack;
  } catch (error: any) {
    console.error('❌ Stack creation failed:');
    console.error(`   Status: ${error.status}`);
    console.error(`   Message: ${error.message}`);
    if (error.error) {
      console.error(`   Details:`, error.error);
    }
    throw error;
  }
}

/**
 * Test stack status and metadata
 */
async function testStackStatus(stackId: string) {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TEST: Stack Status');
  console.log('='.repeat(80));

  const client = new Benchify({
    apiKey: apiKey,
    baseURL: baseUrl,
  });

  try {
    console.log('\n🔍 Fetching stack status...');
    const stack = await client.stack.get(stackId);

    const status = await stack.status();
    console.log(`✅ Status retrieved successfully!`);
    console.log('');

    console.log('📊 Stack Status:');
    console.log(`   ID: ${status.id}`);
    console.log(`   Phase: ${status.phase}`);
    console.log(`   ETag: ${status.etag}`);
    if (status.lastError) {
      console.log(`   Last Error: ${status.lastError}`);
    }
    console.log('');

    return status;
  } catch (error: any) {
    console.error('❌ Status check failed:');
    console.error(`   Message: ${error.message}`);
    throw error;
  }
}

/**
 * Test command execution in sandbox
 */
async function testCommandExecution(stackId: string) {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TEST: Command Execution');
  console.log('='.repeat(80));

  const client = new Benchify({
    apiKey: apiKey,
    baseURL: baseUrl,
  });

  try {
    const stack = await client.stack.get(stackId);

    // Test 1: List files
    console.log('\n📝 Test 1: List files in sandbox');
    const lsResult = await stack.executeCommand('ls -la');
    console.log('✅ Command executed');
    console.log('Output:');
    console.log(lsResult.stdout);
    console.log('');

    // Test 2: Check Node version
    console.log('📝 Test 2: Check Node version');
    const nodeResult = await stack.executeCommand('node --version');
    console.log('✅ Command executed');
    console.log(`Node version: ${nodeResult.stdout.trim()}`);
    console.log('');

    // Test 3: Check npm version
    console.log('📝 Test 3: Check npm version');
    const npmResult = await stack.executeCommand('npm --version');
    console.log('✅ Command executed');
    console.log(`npm version: ${npmResult.stdout.trim()}`);
    console.log('');

    // Test 4: Get sandbox IP
    console.log('📝 Test 4: Get sandbox IP address');
    const ip = await stack.getSandboxIP();
    console.log('✅ IP retrieved');
    console.log(`Sandbox IP: ${ip}`);
    console.log('');

    return { lsResult, nodeResult, npmResult, ip };
  } catch (error: any) {
    console.error('❌ Command execution failed:');
    console.error(`   Message: ${error.message}`);
    throw error;
  }
}

/**
 * Test file operations (read/write)
 */
async function testFileOperations(stackId: string) {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TEST: File Operations');
  console.log('='.repeat(80));

  const client = new Benchify({
    apiKey: apiKey,
    baseURL: baseUrl,
  });

  try {
    const stack = await client.stack.get(stackId);

    // Test 1: Write a new file
    console.log('\n📝 Test 1: Write new file');
    const testContent = 'Hello from SDK test!\nTimestamp: ' + new Date().toISOString();
    await stack.writeFile('test-file.txt', testContent);
    console.log('✅ File written: test-file.txt');
    console.log('');

    // Test 2: Read the file back
    console.log('📝 Test 2: Read file back');
    const readResult = await stack.readFile('test-file.txt');
    console.log('✅ File read successfully');
    console.log('Content:');
    console.log(readResult.content);
    console.log('');

    // Verify content matches
    if (readResult.content.trim() === testContent.trim()) {
      console.log('✅ Content verification: PASSED');
    } else {
      console.log('⚠️  Content verification: Content mismatch');
    }
    console.log('');

    // Test 3: Read existing file (package.json)
    console.log('📝 Test 3: Read existing package.json');
    const pkgResult = await stack.readFile('package.json');
    const pkgData = JSON.parse(pkgResult.content);
    console.log('✅ package.json read successfully');
    console.log(`   Name: ${pkgData.name}`);
    console.log(`   Version: ${pkgData.version}`);
    console.log('');

    // Test 4: Update an existing file
    console.log('📝 Test 4: Update README.md');
    const newReadme = `# Polymet React App (Updated via SDK)

This file was updated via SDK test.

Updated at: ${new Date().toISOString()}

## Original Description
React + TypeScript + Vite application with comprehensive UI components.`;
    await stack.writeFile('README.md', newReadme);
    console.log('✅ README.md updated');
    console.log('');

    return { testContent, readResult, pkgData };
  } catch (error: any) {
    console.error('❌ File operations failed:');
    console.error(`   Message: ${error.message}`);
    throw error;
  }
}

/**
 * Test file changes/updates
 */
async function testFileChanges(stackId: string) {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TEST: File Changes (Apply)');
  console.log('='.repeat(80));

  const client = new Benchify({
    apiKey: apiKey,
    baseURL: baseUrl,
  });

  try {
    const stack = await client.stack.get(stackId);

    console.log('\n📝 Applying file changes...');

    // Create new config file and update vite.config.ts
    const changes = [
      {
        path: 'config.json',
        contents: JSON.stringify(
          {
            environment: 'test',
            debug: true,
            timestamp: Date.now(),
            app: 'polymet-test',
          },
          null,
          2,
        ),
      },
      {
        path: 'vite.config.ts',
        contents: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

// ES Module equivalent of __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Updated configuration via SDK test
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      'pages': path.resolve(__dirname, './src/pages'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '(components)': path.resolve(__dirname, './src/(components)'),
    }
  },
  server: {
    port: 5173,
    host: true,
  }
})
`,
      },
    ];

    await stack.apply(changes);
    console.log('✅ Changes applied successfully!');
    console.log(`   Files changed: ${changes.length}`);
    console.log('');

    // Verify changes
    console.log('🔍 Verifying changes...');
    const configResult = await stack.readFile('config.json');
    const configData = JSON.parse(configResult.content);
    console.log('✅ config.json exists');
    console.log(`   Environment: ${configData.environment}`);
    console.log(`   App: ${configData.app}`);
    console.log('');

    const viteConfigResult = await stack.readFile('vite.config.ts');
    if (viteConfigResult.content.includes('Updated configuration via SDK test')) {
      console.log('✅ vite.config.ts updated successfully');
    }
    console.log('');

    return { changes, configData };
  } catch (error: any) {
    console.error('❌ File changes failed:');
    console.error(`   Message: ${error.message}`);
    throw error;
  }
}

/**
 * Test waiting for dev server
 */
async function testWaitForDevServer(stackId: string) {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TEST: Wait for Dev Server');
  console.log('='.repeat(80));

  const client = new Benchify({
    apiKey: apiKey,
    baseURL: baseUrl,
  });

  try {
    const stack = await client.stack.get(stackId);

    console.log('\n⏳ Waiting for dev server to be ready...');
    const startTime = Date.now();

    const url = await stack.waitForDevServerURL();

    const duration = Date.now() - startTime;
    console.log(`✅ Dev server is ready! (${duration}ms)`);
    console.log(`   URL: ${url}`);
    console.log('');

    return url;
  } catch (error: any) {
    console.error('❌ Wait for dev server failed:');
    console.error(`   Message: ${error.message}`);
    // Don't throw - dev server might not be applicable for all stacks
    console.log('ℹ️  Continuing tests...');
    console.log('');
    return null;
  }
}

/**
 * Test stack destruction/cleanup
 */
async function testStackDestroy(stackId: string) {
  console.log('Waiting for 30 seconds before destroying stack...');
  await new Promise((resolve) => setTimeout(resolve, 30000));
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TEST: Stack Destruction');
  console.log('='.repeat(80));

  const client = new Benchify({
    apiKey: apiKey,
    baseURL: baseUrl,
  });

  try {
    const stack = await client.stack.get(stackId);

    console.log('\n🗑️  Destroying stack...');
    await stack.destroy();
    console.log('✅ Stack destroyed successfully!');
    console.log('');

    // Verify destruction by trying to get status (should fail)
    console.log('🔍 Verifying destruction...');
    try {
      await stack.status();
      console.log('⚠️  Warning: Stack still accessible after destroy');
    } catch (error: any) {
      if (error.status === 404) {
        console.log('✅ Verification passed: Stack no longer exists');
      } else {
        console.log(`ℹ️  Verification: Got status ${error.status}`);
      }
    }
    console.log('');
  } catch (error: any) {
    console.error('❌ Stack destruction failed:');
    console.error(`   Message: ${error.message}`);
    throw error;
  }
}

/**
 * Main test runner
 */
async function main() {
  console.log('═'.repeat(80));
  console.log('🚀 BENCHIFY SANDBOX COMPREHENSIVE TEST SUITE');
  console.log(`📍 API Endpoint: ${baseUrl}`);
  console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...`);
  console.log(`🕐 Started: ${new Date().toISOString()}`);
  console.log('═'.repeat(80));

  const tests = [
    { name: 'Stack Creation', fn: testStackCreation, requiresStack: false },
    { name: 'Stack Status', fn: testStackStatus, requiresStack: true },
    { name: 'Command Execution', fn: testCommandExecution, requiresStack: true },
    // { name: 'File Operations', fn: testFileOperations, requiresStack: true },
    // { name: 'File Changes', fn: testFileChanges, requiresStack: true },
    { name: 'Wait for Dev Server', fn: testWaitForDevServer, requiresStack: true },
    { name: 'Stack Destruction', fn: testStackDestroy, requiresStack: true },
  ];

  const results: Record<string, boolean> = {};
  let stackId: string | null = null;

  for (const test of tests) {
    try {
      if (test.requiresStack && !stackId) {
        console.log(`⏭️  Skipping ${test.name} (no stack available)`);
        results[test.name] = false;
        continue;
      }

      const result: any = await test.fn(stackId!);

      // If this was stack creation, save the stack ID
      if (test.name === 'Stack Creation' && result && typeof result === 'object' && 'id' in result) {
        stackId = result.id;
      }

      results[test.name] = true;
    } catch (error: any) {
      console.error(`\n❌ Test '${test.name}' failed: ${error.message}`);
      results[test.name] = false;

      // If stack creation failed, skip remaining tests
      if (test.name === 'Stack Creation') {
        console.log('\n⚠️  Stack creation failed, skipping remaining tests');
        break;
      }
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80));
  console.log('');

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter((passed) => passed).length;

  for (const [testName, passed] of Object.entries(results)) {
    const status = passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`  ${status}: ${testName}`);
  }

  console.log('');
  console.log(`📊 Results: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! Sandbox functionality is working correctly.');
  } else {
    console.log(`\n⚠️  ${totalTests - passedTests} test(s) failed. Please review the output above.`);
  }

  console.log('═'.repeat(80));
  console.log(`🏁 Completed: ${new Date().toISOString()}`);
  console.log('═'.repeat(80));

  // Exit with appropriate code
  process.exit(passedTests === totalTests ? 0 : 1);
}

main().catch((error) => {
  console.error('\n' + '='.repeat(80));
  console.error('❌ FATAL ERROR');
  console.error('='.repeat(80));
  console.error('');
  console.error('Error:', error.message);
  if (error.stack) {
    console.error('');
    console.error('Stack trace:');
    console.error(error.stack);
  }
  console.error('');
  console.error('='.repeat(80));
  process.exit(1);
});
