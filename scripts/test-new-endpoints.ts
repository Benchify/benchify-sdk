#!/usr/bin/env ts-node
/**
 * Test script for new endpoints
 * Tests fixParsingAndDiagnose and AI fallback endpoints
 *
 * Usage:
 *   npm run tsn scripts/test-new-endpoints.ts
 *
 * Or with environment variables:
 *   BENCHIFY_API_KEY=your-key BENCHIFY_BASE_URL=http://localhost:8082 npm run tsn scripts/test-new-endpoints.ts
 */

import { Benchify } from '../src/index';
import { TestFixParsingFiles } from './test-fix-parsing-data';
import {
  TestAIFallbackFiles,
  TestAIFallbackDiagnostics,
  TestAIFallbackConfig,
} from './test-ai-fallback-data';

const API_KEY = process.env['BENCHIFY_API_KEY'];
const BASE_URL = process.env['BENCHIFY_BASE_URL'];

// Skip tests if environment variables are not set
if (!API_KEY || !BASE_URL) {
  console.log('⏭️  Skipping new endpoints tests');
  console.log('');
  console.log('To run these tests, set the following environment variables:');
  console.log('  - BENCHIFY_API_KEY: Your API key');
  console.log('  - BENCHIFY_BASE_URL: Your local API URL (e.g., http://localhost:8082)');
  console.log('');
  console.log('Example:');
  console.log(
    '  BENCHIFY_API_KEY=your-key BENCHIFY_BASE_URL=http://localhost:8082 npm run tsn scripts/test-new-endpoints.ts',
  );
  process.exit(0);
}

// Type assertion: after the check above, these are guaranteed to be strings
const apiKey: string = API_KEY;
const baseUrl: string = BASE_URL;

async function testFixParsingAndDiagnose() {
  console.log('🚀 Testing fix parsing and diagnose...');
  console.log(`   Base url: ${baseUrl}`);
  console.log(`   API Key: ${apiKey.substring(0, 10)}...`);
  console.log('');

  const client = new Benchify({
    apiKey: apiKey,
    baseURL: baseUrl,
  });

  try {
    console.log('🔍 Detecting parsing and diagnostic issues...');
    const startTime = Date.now();

    const result = await client.fixParsingAndDiagnose.detectIssues({
      files: TestFixParsingFiles,
      template_path: 'benchify/default-template',
      event_id: 'test-detect-001',
    });

    const duration = Date.now() - startTime;
    console.log(`✅ Success! (${duration}ms)`);
    console.log('');

    // Display diagnostics found
    const diagnostics = result.data.diagnostics;
    const requestedDiagnostics = diagnostics.requested?.file_to_diagnostics || {};
    const notRequestedDiagnostics = diagnostics.not_requested?.file_to_diagnostics || {};

    if (Object.keys(requestedDiagnostics).length > 0) {
      console.log('📊 Requested diagnostics (fixable):');
      Object.entries(requestedDiagnostics).forEach(([filePath, issues]) => {
        console.log(`   ${filePath}: ${issues.length} issues`);
        issues.forEach((issue: any, idx: number) => {
          console.log(`      ${idx + 1}. [${issue.type}] ${issue.message.substring(0, 80)}`);
        });
      });
      console.log('');
    }

    if (Object.keys(notRequestedDiagnostics).length > 0) {
      console.log('📋 Other diagnostics (not requested):');
      Object.entries(notRequestedDiagnostics).forEach(([filePath, issues]) => {
        console.log(`   ${filePath}: ${issues.length} issues`);
      });
      console.log('');
    }

    // Display statistics
    console.log('📈 Statistics:');
    console.log(`   Total issues: ${result.data.total_issues}`);
    console.log(`   Fixable issues: ${result.data.fixable_issues}`);
    console.log(`   Files analyzed: ${result.data.files_analyzed}`);
    console.log(`   Detection time: ${result.data.detection_time}s`);
    if (result.data.estimated_total_fix_time) {
      console.log(`   Estimated total fix time: ${result.data.estimated_total_fix_time}s`);
    }
    console.log('');

    // Display available fix types
    if (result.data.fix_types_available && result.data.fix_types_available.length > 0) {
      console.log('🔧 Available fix types:');
      result.data.fix_types_available.forEach((fixType) => {
        console.log(
          `   - ${fixType.fix_type}: ${fixType.issue_count} issues (${fixType.estimated_time_seconds}s, priority: ${fixType.priority})`,
        );
      });
      console.log('');
    }

    return result;
  } catch (error: any) {
    console.error('❌ Error in fix parsing and diagnose:');
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

async function testAiFallback() {
  console.log('🚀 Testing AI fallback...');
  console.log(`   Base url: ${baseUrl}`);
  console.log(`   API Key: ${apiKey.substring(0, 10)}...`);
  console.log('');

  const client = new Benchify({
    apiKey: apiKey,
    baseURL: baseUrl,
  });

  try {
    console.log('🤖 Running AI fallback to fix remaining issues...');
    const startTime = Date.now();

    const result = await client.fix.createAIFallback({
      files: TestAIFallbackFiles,
      remaining_diagnostics: TestAIFallbackDiagnostics,
      template_path: TestAIFallbackConfig.template_path,
      event_id: TestAIFallbackConfig.event_id,
      max_attempts: TestAIFallbackConfig.max_attempts,
      include_context: TestAIFallbackConfig.include_context,
    });

    const duration = Date.now() - startTime;
    console.log(`✅ Success! (${duration}ms)`);
    console.log('');

    // Display overall results
    console.log('🎯 AI Fallback Results:');
    console.log(`   Success: ${result.data.success}`);
    console.log(`   Files fixed: ${result.data.files_fixed}`);
    console.log(`   Issues resolved: ${result.data.issues_resolved}`);
    console.log(`   Issues remaining: ${result.data.issues_remaining}`);
    if (result.data.execution_time) {
      console.log(`   Execution time: ${result.data.execution_time}s`);
    }
    console.log('');

    // Display per-file results
    const fileResultsEntries = Object.entries(result.data.file_results);
    if (fileResultsEntries.length > 0) {
      console.log('📋 Per-file results:');
      fileResultsEntries.forEach(([filePath, fileResult], idx) => {
        console.log(`   ${idx + 1}. ${filePath}:`);
        console.log(`      Status: ${fileResult.status}`);
        console.log(`      Fixes applied: ${fileResult.fixes_applied}`);
        console.log(`      Remaining issues: ${fileResult.remaining_issues}`);
        if (fileResult.confidence_scores.length > 0) {
          const avgConfidence =
            fileResult.confidence_scores.reduce((a, b) => a + b, 0) / fileResult.confidence_scores.length;
          console.log(`      Average confidence: ${avgConfidence.toFixed(2)}`);
        }
      });
      console.log('');

      // Display first fixed file preview
      const firstEntry = fileResultsEntries[0];
      if (firstEntry) {
        const [firstPath, firstResult] = firstEntry;
        if (firstResult.fixed_content) {
          console.log(`📝 Preview of ${firstPath}:`);
          console.log('─'.repeat(60));
          console.log(firstResult.fixed_content.substring(0, 300));
          if (firstResult.fixed_content.length > 300) {
            console.log('...');
          }
          console.log('─'.repeat(60));
          console.log('');
        }
      }
    }

    // Display AI suggestions if available
    if (result.data.ai_suggestions) {
      console.log('💡 AI Suggestions:');
      console.log('─'.repeat(60));
      console.log(result.data.ai_suggestions.substring(0, 300));
      if (result.data.ai_suggestions.length > 300) {
        console.log('...');
      }
      console.log('─'.repeat(60));
      console.log('');
    }

    return result;
  } catch (error: any) {
    console.error('❌ Error in AI fallback:');
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

// Run all tests
async function main() {
  console.log('═'.repeat(60));
  console.log('🧪 New Endpoints Test Suite');
  console.log('═'.repeat(60));
  console.log('');

  await testFixParsingAndDiagnose();

  console.log('');
  console.log('═'.repeat(60));
  console.log('');

  await testAiFallback();

  console.log('');
  console.log('═'.repeat(60));
  console.log('✨ All tests completed!');
  console.log('═'.repeat(60));
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
