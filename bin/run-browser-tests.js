#!/usr/bin/env node

/*
 **********************************************************************
 * File       : bin/run-browser-tests.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2025 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Generic cross-browser testing runner using Playwright.
 *   Loads application-specific tests from web/tests/browser-tests.js
 *   and executes them across Chromium, Firefox, and WebKit.
 **********************************************************************
 */

const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs');
const path = require('path');

// Get the folder being tested from environment variable set by shell script
const testFolderPath = process.env.BROWSER_TEST_FOLDER || process.cwd();
const browserTestsPath = path.join(testFolderPath, 'tests', 'browser-tests.js');

// Check if application-specific tests exist
if (!fs.existsSync(browserTestsPath)) {
  console.log(`ℹ️  No browser tests found at ${path.relative(process.cwd(), browserTestsPath)}`);
  console.log('✅ Skipping browser tests (no tests defined for this application)');
  process.exit(0);
}

// Load application-specific tests
const browserTests = require(browserTestsPath);

// Base URL for tests (can be overridden by TEST_URL environment variable)
const BASE_URL = process.env.TEST_URL || 'http://localhost:8080';

async function testBrowser(browserName) {
  console.log(`\n🧪 Testing ${browserName}...`);

  let browser;
  let page;
  let tests = [];
  let error = null;

  try {
    // Launch appropriate browser with Playwright
    if (browserName === 'chromium') {
      browser = await chromium.launch({ headless: true });
    } else if (browserName === 'firefox') {
      browser = await firefox.launch({ headless: true });
    } else if (browserName === 'webkit') {
      browser = await webkit.launch({ headless: true });
    } else {
      throw new Error(`Unknown browser: ${browserName}`);
    }

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    page = await context.newPage();

    // Test each page defined in application-specific tests
    for (const pageInfo of browserTests.pages) {
      console.log(`   📄 Testing ${pageInfo.name} page...`);
      const fullUrl = BASE_URL + pageInfo.url;
      await page.goto(fullUrl, { waitUntil: 'networkidle' });

      // Run application-specific tests for this page
      const pageTests = await browserTests.runPageTests(page, pageInfo);
      tests.push(...pageTests);
    }

    console.log(`     ✅ ${browserName} tests passed`);

  } catch (err) {
    // Check if it's a system dependency error
    if (err.message && err.message.includes('missing dependencies')) {
      console.log(`   ⚠️  ${browserName} skipped: System dependencies not installed`);
      console.log(`   ℹ️  To enable ${browserName}: sudo npx playwright install-deps ${browserName}`);
      return {
        name: browserName,
        status: 'skipped',
        error: 'System dependencies not installed',
        tests: []
      };
    }
    console.error(`   ❌ ${browserName} test failed:`, err.message);
    error = err.message;
    tests.push({ name: 'browser test', status: 'failed', error: err.message });
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return {
    name: browserName,
    status: error ? 'failed' : 'passed',
    error: error,
    tests: tests
  };
}

async function runTests() {
  console.log('🚀 Starting cross-browser tests...');

  const browsers = ['chromium', 'firefox', 'webkit'];

  let passed = 0;
  let failed = 0;
  let skipped = 0;
  const results = [];

  for (const browser of browsers) {
    const result = await testBrowser(browser);
    results.push(result);
    if (result.status === 'passed') {
      passed++;
    } else if (result.status === 'skipped') {
      skipped++;
    } else {
      failed++;
    }
  }

  // Get results directory from environment variable set by shell script
  const testFolderPath = process.env.BROWSER_TEST_FOLDER || process.cwd();
  const resultsDir = path.join(testFolderPath, 'test-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  // Write results to JSON file
  const resultsData = {
    browsers: results,
    summary: {
      passed: passed,
      failed: failed,
      skipped: skipped,
      total: browsers.length
    }
  };

  const resultsFile = path.join(resultsDir, 'browser-results.json');
  fs.writeFileSync(resultsFile, JSON.stringify(resultsData, null, 2));

  console.log(`\n📊 Test Results:`);
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  if (skipped > 0) {
    console.log(`  Skipped: ${skipped}`);
  }
  console.log(`  Total: ${browsers.length}`);

  if (failed > 0) {
    console.log('\n❌ Some tests failed');
    process.exit(1);
  } else {
    console.log('\n✅ All cross-browser tests passed');
    process.exit(0);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

runTests();