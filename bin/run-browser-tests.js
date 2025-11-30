#!/usr/bin/env node

/**
 * Cross-browser testing script using Selenium WebDriver
 * Tests basic functionality across Chrome, Firefox, and Edge
 */

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const edge = require('selenium-webdriver/edge');
const fs = require('fs');
const path = require('path');

async function testBrowser(browserName) {
  console.log(`\n🧪 Testing ${browserName}...`);

  let driver;
  let tests = [];
  let error = null;

  try {
    // Configure browser options
    let options;
    if (browserName === 'chrome') {
      options = new chrome.Options();
      options.addArguments('--headless'); // Run headless for CI
      options.addArguments('--no-sandbox');
      options.addArguments('--disable-dev-shm-usage');
      driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
    } else if (browserName === 'firefox') {
      options = new firefox.Options();
      options.addArguments('--headless');
      driver = await new Builder()
        .forBrowser('firefox')
        .setFirefoxOptions(options)
        .build();
    } else if (browserName === 'edge') {
      options = new edge.Options();
      options.addArguments('--headless');
      options.addArguments('--no-sandbox');
      options.addArguments('--disable-dev-shm-usage');
      driver = await new Builder()
        .forBrowser('MicrosoftEdge')
        .setEdgeOptions(options)
        .build();
    }

    // Test home page
    console.log('  📄 Testing home page...');
    await driver.get('http://localhost:8080');

    // Wait for page to load
    await driver.wait(until.titleContains('Web Witchcraft'), 10000);

    // Check title
    const title = await driver.getTitle();
    if (title.includes('Web Witchcraft')) {
      console.log('  ✅ Title correct');
      tests.push({ name: 'home page title', status: 'passed' });
    } else {
      throw new Error(`Title incorrect: ${title}`);
    }

    // Check navigation links
    const navLinks = await driver.findElements(By.css('nav a'));
    if (navLinks.length >= 4) {
      console.log('  ✅ Navigation links present');
      tests.push({ name: 'navigation links', status: 'passed' });
    } else {
      throw new Error(`Expected at least 4 nav links, found ${navLinks.length}`);
    }

    // Test students page
    console.log('  📄 Testing students page...');
    const studentsLink = await driver.findElement(By.linkText('Students'));
    await studentsLink.click();

    await driver.wait(until.titleContains('Web Witchcraft'), 10000);
    const studentsTitle = await driver.getTitle();
    if (studentsTitle.includes('Web Witchcraft')) {
      console.log('  ✅ Students page loads');
      tests.push({ name: 'students page', status: 'passed' });
    }

    // Test back to home
    const homeLink = await driver.findElement(By.linkText('Home'));
    await homeLink.click();
    await driver.wait(until.titleContains('Web Witchcraft'), 10000);

    console.log(`  ✅ ${browserName} tests passed`);

  } catch (err) {
    console.error(`  ❌ ${browserName} test failed:`, err.message);
    error = err.message;
    tests.push({ name: 'browser test', status: 'failed', error: err.message });
  } finally {
    if (driver) {
      await driver.quit();
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

  const browsers = ['chrome', 'firefox', 'edge'];
  let passed = 0;
  let failed = 0;
  const results = [];

  for (const browser of browsers) {
    const result = await testBrowser(browser);
    results.push(result);
    if (result.status === 'passed') {
      passed++;
    } else {
      failed++;
    }
  }

  // Create results directory if it doesn't exist
  const resultsDir = path.join(__dirname, '..', 'tests', 'results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  // Write results to JSON file
  const resultsData = {
    browsers: results,
    summary: {
      passed: passed,
      failed: failed,
      total: browsers.length
    }
  };

  const resultsFile = path.join(resultsDir, 'browser-results.json');
  fs.writeFileSync(resultsFile, JSON.stringify(resultsData, null, 2));

  console.log(`\n📊 Test Results:`);
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
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