#!/usr/bin/env ts-node
/**
 * Comprehensive test script for 3-phase fixer architecture
 * Tests all 3 phases: detection → standard fixes → AI fallback
 * Mirrors test_comprehensive.py functionality
 *
 * Usage:
 *   npm run tsn scripts/test-new-endpoints.ts
 *
 * Or with environment variables:
 *   BENCHIFY_API_KEY=your-key BENCHIFY_BASE_URL=http://localhost:8082 npm run tsn scripts/test-new-endpoints.ts
 */

import { Benchify } from '../src/index';
import { TestFixParsingFiles } from './test-fix-parsing-data';

const API_KEY = process.env['BENCHIFY_API_KEY'];
const BASE_URL = process.env['BENCHIFY_BASE_URL'];

// Skip tests if environment variables are not set
if (!API_KEY || !BASE_URL) {
  console.log('⏭️  Skipping 3-phase fixer tests');
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

/**
 * Test the full 3-phase chain: detection → standard fixes → AI fallback
 */
async function test3PhaseChain() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TESTING 3-PHASE CHAIN');
  console.log('='.repeat(80));

  const client = new Benchify({
    apiKey: apiKey,
    baseURL: baseUrl,
  });

  const eventId = `test_3phase_${Date.now()}`;
  const files = TestFixParsingFiles;

  // ============================================================================
  // PHASE 1: Detection
  // ============================================================================
  console.log('\n📌 PHASE 1: Parsing & Diagnosis');
  console.log('-'.repeat(60));

  let step1Result;
  try {
    console.log('🔍 Detecting parsing and diagnostic issues...');
    const startTime = Date.now();

    step1Result = await client.fixParsingAndDiagnose.detectIssues({
      files: files,
      template_path: 'benchify/default-template',
      event_id: eventId,
    });

    const duration = Date.now() - startTime;
    console.log(`✅ Phase 1 completed (${duration}ms)`);
    console.log('');

    // Display statistics
    console.log('📈 Detection Results:');
    console.log(`   Total issues: ${step1Result.data.total_issues}`);
    console.log(`   Fixable issues: ${step1Result.data.fixable_issues}`);
    console.log(`   Files analyzed: ${step1Result.data.files_analyzed}`);
    console.log(`   Detection time: ${step1Result.data.detection_time}s`);
    console.log('');

    // Display diagnostics found
    const diagnostics = step1Result.data.diagnostics;
    const requestedDiagnostics = diagnostics.requested?.file_to_diagnostics || {};

    if (Object.keys(requestedDiagnostics).length > 0) {
      console.log('📊 Requested diagnostics (fixable):');
      Object.entries(requestedDiagnostics).forEach(([filePath, issues]: [string, any]) => {
        console.log(`   ${filePath}: ${issues.length} issues`);
        issues.slice(0, 3).forEach((issue: any, idx: number) => {
          const msg = issue.message.substring(0, 60);
          console.log(`      ${idx + 1}. [${issue.type}] ${msg}${issue.message.length > 60 ? '...' : ''}`);
        });
        if (issues.length > 3) {
          console.log(`      ... and ${issues.length - 3} more`);
        }
      });
      console.log('');
    }

    // Display available fix types
    if (step1Result.data.fix_types_available && step1Result.data.fix_types_available.length > 0) {
      console.log('🔧 Available fix types:');
      step1Result.data.fix_types_available.forEach((fixType) => {
        console.log(
          `   - ${fixType.fix_type}: ${fixType.issue_count} issues (${fixType.estimated_time_seconds}s, priority: ${fixType.priority})`,
        );
      });
      console.log('');
    }
  } catch (error: any) {
    console.error('❌ Phase 1 failed:');
    console.error(`   Status: ${error.status}`);
    console.error(`   Message: ${error.message}`);
    if (error.error) {
      console.error(`   Details:`, error.error);
    }
    process.exit(1);
  }

  // Prepare data for Phase 2
  const requestedDiagnostics = step1Result.data.diagnostics.requested?.file_to_diagnostics || {};
  const remainingDiagnosticsForStep2 = {
    file_to_diagnostics: requestedDiagnostics,
  };

  // ============================================================================
  // PHASE 2: Standard Fixes
  // ============================================================================
  console.log('\n📌 PHASE 2: Standard Fixes');
  console.log('-'.repeat(60));

  let step2Result;
  try {
    console.log('🔧 Applying standard fixes (CSS, dependencies, types, UI)...');
    const startTime = Date.now();

    step2Result = await client.fix.standard.create({
      files: files,
      remaining_diagnostics: remainingDiagnosticsForStep2,
      fix_types: ['css', 'ui', 'dependency', 'types'],
      template_path: 'benchify/default-template',
      event_id: eventId,
      mode: 'project',
    });

    const duration = Date.now() - startTime;
    console.log(`✅ Phase 2 completed (${duration}ms)`);
    console.log('');

    // Display results
    console.log('📈 Standard Fix Results:');
    console.log(`   Success: ${step2Result.data.success}`);
    console.log(`   Fix types applied: ${step2Result.data.fix_types_applied.join(', ')}`);
    console.log(`   Issues resolved: ${step2Result.data.issues_resolved}`);
    console.log(`   Issues remaining: ${step2Result.data.issues_remaining}`);
    console.log(`   Files changed: ${step2Result.data.changed_files.length}`);
    console.log(`   Execution time: ${step2Result.data.execution_time}s`);
    console.log('');

    if (step2Result.data.changed_files.length > 0) {
      console.log('📝 Files modified by standard fixes:');
      step2Result.data.changed_files.forEach((file, idx) => {
        console.log(`   ${idx + 1}. ${file.path}`);
      });
      console.log('');
    }

    // Display remaining diagnostics
    const remaining = step2Result.data.remaining_diagnostics.file_to_diagnostics || {};
    const remainingCount = Object.values(remaining).reduce(
      (sum: number, diags: any) => sum + diags.length,
      0,
    );
    console.log(`📋 Remaining issues: ${remainingCount}`);
    if (remainingCount > 0) {
      Object.entries(remaining).forEach(([filePath, issues]: [string, any]) => {
        console.log(`   ${filePath}: ${issues.length} issues`);
      });
    }
    console.log('');
  } catch (error: any) {
    console.error('❌ Phase 2 failed:');
    console.error(`   Status: ${error.status}`);
    console.error(`   Message: ${error.message}`);
    if (error.error) {
      console.error(`   Details:`, error.error);
    }
    process.exit(1);
  }

  // Prepare files for Phase 3
  const step3Files: Array<{ path: string; contents: string }> = [];
  const changedPaths = new Set(step2Result.data.changed_files.map((f) => f.path));

  // Add changed files from step 2
  step3Files.push(...step2Result.data.changed_files);

  // Add original files that weren't changed
  for (const f of files) {
    if (!changedPaths.has(f.path)) {
      step3Files.push(f);
    }
  }

  // ============================================================================
  // PHASE 3: AI Fallback
  // ============================================================================
  const remainingDiags = step2Result.data.remaining_diagnostics.file_to_diagnostics || {};
  const hasRemainingIssues = Object.keys(remainingDiags).length > 0;

  if (hasRemainingIssues) {
    console.log('\n📌 PHASE 3: AI Fallback');
    console.log('-'.repeat(60));

    try {
      console.log('🤖 Running AI fallback for remaining issues...');
      const startTime = Date.now();

      const step3Result = await client.fix.createAIFallback({
        files: step3Files,
        remaining_diagnostics: step2Result.data.remaining_diagnostics,
        template_path: 'benchify/default-template',
        event_id: eventId,
        max_attempts: 3,
        include_context: true,
      });

      const duration = Date.now() - startTime;
      console.log(`✅ Phase 3 completed (${duration}ms)`);
      console.log('');

      // Display overall results
      console.log('🎯 AI Fallback Results:');
      console.log(`   Success: ${step3Result.data.success}`);
      console.log(`   Files fixed: ${step3Result.data.files_fixed}`);
      console.log(`   Issues resolved: ${step3Result.data.issues_resolved}`);
      console.log(`   Issues remaining: ${step3Result.data.issues_remaining}`);
      console.log(`   Execution time: ${step3Result.data.execution_time}s`);
      console.log('');

      // Display per-file results
      const fileResultsEntries = Object.entries(step3Result.data.file_results);
      if (fileResultsEntries.length > 0) {
        console.log('📋 Per-file AI results:');
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
      }
    } catch (error: any) {
      console.error('❌ Phase 3 failed:');
      console.error(`   Status: ${error.status}`);
      console.error(`   Message: ${error.message}`);
      if (error.error) {
        console.error(`   Details:`, error.error);
      }
      process.exit(1);
    }
  } else {
    console.log('\n📌 PHASE 3: AI Fallback');
    console.log('-'.repeat(60));
    console.log('ℹ️  No remaining issues, skipping Phase 3 (AI Fallback)');
    console.log('');
  }

  // ============================================================================
  // Summary
  // ============================================================================
  console.log('\n' + '='.repeat(80));
  console.log('💡 3-PHASE CHAIN SUMMARY');
  console.log('='.repeat(80));
  console.log('');
  console.log('✅ Phase 1 (Detection): Found issues and categorized them');
  console.log('✅ Phase 2 (Standard Fixes): Applied deterministic fixes');
  console.log(
    hasRemainingIssues ?
      '✅ Phase 3 (AI Fallback): Handled complex issues'
    : 'ℹ️  Phase 3 (AI Fallback): Skipped (no remaining issues)',
  );
  console.log('');
  console.log('🎉 All 3 phases completed successfully!');
  console.log('='.repeat(80));
}

// Run all tests
async function main() {
  console.log('═'.repeat(80));
  console.log('🧪 3-Phase Fixer Test Suite (SDK)');
  console.log(`📍 API Endpoint: ${baseUrl}`);
  console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...`);
  console.log('═'.repeat(80));

  // Test the full 3-phase chain
  await test3PhaseChain();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
