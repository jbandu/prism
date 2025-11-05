/**
 * Generate Enhanced Test Report
 * Processes Playwright test results and creates a detailed summary
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface TestResult {
  stats: {
    expected: number;
    unexpected: number;
    flaky: number;
    skipped: number;
    ok: boolean;
  };
  suites: Array<{
    title: string;
    tests: Array<{
      title: string;
      status: string;
      duration: number;
      projectName?: string;
      errors?: Array<{ message: string }>;
    }>;
  }>;
}

function generateReport() {
  const resultsPath = join(process.cwd(), 'test-results', 'results.json');

  if (!existsSync(resultsPath)) {
    console.error('❌ No test results found at:', resultsPath);
    process.exit(1);
  }

  const results: TestResult = JSON.parse(readFileSync(resultsPath, 'utf-8'));

  console.log('\n' + '='.repeat(80));
  console.log('📊 E2E TEST REPORT SUMMARY');
  console.log('='.repeat(80) + '\n');

  // Overall Stats
  console.log('📈 Overall Statistics:\n');
  console.log(`   ✅ Passed:  ${results.stats.expected}`);
  console.log(`   ❌ Failed:  ${results.stats.unexpected}`);
  console.log(`   🔄 Flaky:   ${results.stats.flaky}`);
  console.log(`   ⏭️  Skipped: ${results.stats.skipped}`);
  console.log(`   📊 Status:  ${results.stats.ok ? '✅ ALL PASSED' : '❌ SOME FAILED'}\n`);

  // Test Suites
  console.log('📋 Test Suite Breakdown:\n');

  let totalDuration = 0;
  const failedTests: Array<{ suite: string; test: string; project: string; error: string }> = [];

  results.suites.forEach((suite) => {
    const passed = suite.tests.filter(t => t.status === 'passed').length;
    const failed = suite.tests.filter(t => t.status === 'failed').length;
    const skipped = suite.tests.filter(t => t.status === 'skipped').length;

    const icon = failed > 0 ? '❌' : passed > 0 ? '✅' : '⏭️';
    console.log(`   ${icon} ${suite.title}`);
    console.log(`      Passed: ${passed}, Failed: ${failed}, Skipped: ${skipped}`);

    suite.tests.forEach((test) => {
      totalDuration += test.duration;

      if (test.status === 'failed') {
        const error = test.errors?.[0]?.message || 'Unknown error';
        failedTests.push({
          suite: suite.title,
          test: test.title,
          project: test.projectName || 'unknown',
          error: error.substring(0, 200)
        });
      }
    });
  });

  // Failed Test Details
  if (failedTests.length > 0) {
    console.log('\n❌ Failed Test Details:\n');
    failedTests.forEach((failure, idx) => {
      console.log(`   ${idx + 1}. ${failure.suite} → ${failure.test}`);
      console.log(`      Browser: ${failure.project}`);
      console.log(`      Error: ${failure.error}...\n`);
    });
  }

  // Performance Stats
  console.log('\n⚡ Performance:\n');
  console.log(`   Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
  console.log(`   Average per Test: ${(totalDuration / (results.stats.expected + results.stats.unexpected + results.stats.flaky)).toFixed(0)}ms\n`);

  console.log('='.repeat(80) + '\n');

  // Generate Markdown Report
  const markdown = generateMarkdownReport(results, failedTests, totalDuration);
  const mdPath = join(process.cwd(), 'test-results', 'report.md');
  writeFileSync(mdPath, markdown);
  console.log(`📄 Markdown report generated: ${mdPath}\n`);

  // Exit with failure code if tests failed
  process.exit(results.stats.ok ? 0 : 1);
}

function generateMarkdownReport(
  results: TestResult,
  failedTests: Array<{ suite: string; test: string; project: string; error: string }>,
  totalDuration: number
): string {
  const timestamp = new Date().toISOString();

  let md = `# 🎭 E2E Test Report\n\n`;
  md += `**Generated:** ${timestamp}\n\n`;
  md += `---\n\n`;

  // Summary Table
  md += `## 📊 Summary\n\n`;
  md += `| Metric | Count |\n`;
  md += `|--------|-------|\n`;
  md += `| ✅ Passed | ${results.stats.expected} |\n`;
  md += `| ❌ Failed | ${results.stats.unexpected} |\n`;
  md += `| 🔄 Flaky | ${results.stats.flaky} |\n`;
  md += `| ⏭️ Skipped | ${results.stats.skipped} |\n`;
  md += `| ⚡ Duration | ${(totalDuration / 1000).toFixed(2)}s |\n`;
  md += `| 📊 Status | ${results.stats.ok ? '✅ PASSED' : '❌ FAILED'} |\n\n`;

  // Test Suites
  md += `## 📋 Test Suites\n\n`;
  results.suites.forEach((suite) => {
    const passed = suite.tests.filter(t => t.status === 'passed').length;
    const failed = suite.tests.filter(t => t.status === 'failed').length;
    const skipped = suite.tests.filter(t => t.status === 'skipped').length;

    const icon = failed > 0 ? '❌' : passed > 0 ? '✅' : '⏭️';
    md += `### ${icon} ${suite.title}\n\n`;
    md += `- **Passed:** ${passed}\n`;
    md += `- **Failed:** ${failed}\n`;
    md += `- **Skipped:** ${skipped}\n\n`;

    if (failed > 0) {
      md += `**Failed Tests:**\n\n`;
      suite.tests.filter(t => t.status === 'failed').forEach((test) => {
        md += `- ❌ ${test.title} (${test.projectName || 'unknown'})\n`;
      });
      md += `\n`;
    }
  });

  // Failed Test Details
  if (failedTests.length > 0) {
    md += `## ❌ Failure Details\n\n`;
    failedTests.forEach((failure, idx) => {
      md += `### ${idx + 1}. ${failure.suite} → ${failure.test}\n\n`;
      md += `**Browser:** ${failure.project}\n\n`;
      md += `**Error:**\n\`\`\`\n${failure.error}\n\`\`\`\n\n`;
    });
  }

  return md;
}

// Run if called directly
if (require.main === module) {
  generateReport();
}
