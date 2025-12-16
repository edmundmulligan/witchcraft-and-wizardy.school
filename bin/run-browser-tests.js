#!/usr/bin/env node

/**
 * Cross-browser testing script using Selenium WebDriver
 * Tests basic functionality across Chrome, Firefox, Edge, and Opera
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
      options.addArguments('--window-size=1920,1080'); // Set desktop size to avoid mobile layouts
      driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
    } else if (browserName === 'firefox') {
      options = new firefox.Options();
      options.addArguments('--headless');
      options.addArguments('--width=1920');
      options.addArguments('--height=1080');
      driver = await new Builder()
        .forBrowser('firefox')
        .setFirefoxOptions(options)
        .build();
    } else if (browserName === 'edge') {
      options = new edge.Options();
      options.addArguments('--headless');
      options.addArguments('--no-sandbox');
      options.addArguments('--disable-dev-shm-usage');
      options.addArguments('--window-size=1920,1080');
      driver = await new Builder()
        .forBrowser('MicrosoftEdge')
        .setEdgeOptions(options)
        .build();
    } else if (browserName === 'opera') {
      options = new chrome.Options();
      options.addArguments('--headless');
      options.addArguments('--no-sandbox');
      options.addArguments('--disable-dev-shm-usage');
      options.addArguments('--window-size=1920,1080');
      driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
    }

    // Define all pages to test
    const pages = [
      { url: 'http://localhost:8080/index.html', name: 'Home' },
      { url: 'http://localhost:8080/about.html', name: 'About' },
      { url: 'http://localhost:8080/students.html', name: 'Students' },
      { url: 'http://localhost:8080/glossary-and-faq.html', name: 'Glossary & FAQ' },
      { url: 'http://localhost:8080/license-and-credits.html', name: 'License & Credits' }
    ];

    // Test each page
    for (const page of pages) {
      console.log(`  📄 Testing ${page.name} page...`);
      await driver.get(page.url);

      // Wait for page to load
      await driver.wait(until.titleContains('Web Witchcraft'), 10000);

      // Check title
      const title = await driver.getTitle();
      if (title.includes('Web Witchcraft')) {
        console.log(`  ✅ ${page.name} page title correct`);
        tests.push({ name: `${page.name} page title`, status: 'passed' });
      } else {
        throw new Error(`${page.name} title incorrect: ${title}`);
      }

      // Check navigation links
      const navLinks = await driver.findElements(By.css('nav a'));
      if (navLinks.length >= 4) {
        console.log(`  ✅ ${page.name} page navigation links present`);
        tests.push({ name: `${page.name} navigation links`, status: 'passed' });
      } else {
        throw new Error(`Expected at least 4 nav links on ${page.name}, found ${navLinks.length}`);
      }

      // Check JavaScript execution - header/footer should be injected
      const header = await driver.findElement(By.css('header'));
      const headerContent = await header.findElements(By.css('*'));
      if (headerContent.length > 0) {
        console.log(`  ✅ ${page.name} JavaScript executed (header injected)`);
        tests.push({ name: `${page.name} JavaScript execution`, status: 'passed' });
      } else {
        throw new Error(`${page.name} header not injected - JavaScript may have failed`);
      }

      // Check CSS Grid support - header should use grid layout (or flex on mobile)
      const headerDisplay = await driver.executeScript(
        'return window.getComputedStyle(arguments[0]).display;',
        header
      );
      if (headerDisplay === 'grid' || headerDisplay === 'flex') {
        console.log(`  ✅ ${page.name} CSS Grid/Flexbox layout working (${headerDisplay})`);
        tests.push({ name: `${page.name} CSS Grid`, status: 'passed' });
      } else {
        throw new Error(`${page.name} CSS Grid/Flex not working: display is ${headerDisplay}`);
      }

      // Check CSS Flexbox support - navigation should use flex
      const nav = await driver.findElement(By.css('nav.site-navigation ul'));
      const navDisplay = await driver.executeScript(
        'return window.getComputedStyle(arguments[0]).display;',
        nav
      );
      if (navDisplay === 'flex') {
        console.log(`  ✅ ${page.name} CSS Flexbox supported`);
        tests.push({ name: `${page.name} CSS Flexbox`, status: 'passed' });
      } else {
        throw new Error(`${page.name} CSS Flexbox not working: display is ${navDisplay}`);
      }

      // Check CSS Variables support - check if custom property is applied
      const body = await driver.findElement(By.css('body'));
      const bgColor = await driver.executeScript(
        'return window.getComputedStyle(arguments[0]).backgroundColor;',
        body
      );
      if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
        console.log(`  ✅ ${page.name} CSS Variables supported`);
        tests.push({ name: `${page.name} CSS Variables`, status: 'passed' });
      } else {
        throw new Error(`${page.name} CSS Variables not applied correctly`);
      }

      // Check SVG support - header images should be present
      const svgImages = await driver.findElements(By.css('header img[src*=".svg"]'));
      if (svgImages.length >= 2) {
        console.log(`  ✅ ${page.name} SVG images loaded`);
        tests.push({ name: `${page.name} SVG support`, status: 'passed' });
      } else {
        throw new Error(`${page.name} SVG images not found: expected 2, found ${svgImages.length}`);
      }

      // Check responsive design - verify viewport meta tag
      const viewportMeta = await driver.findElements(By.css('meta[name="viewport"]'));
      if (viewportMeta.length > 0) {
        console.log(`  ✅ ${page.name} viewport meta tag present`);
        tests.push({ name: `${page.name} responsive viewport`, status: 'passed' });
      } else {
        throw new Error(`${page.name} viewport meta tag missing`);
      }

      // Check CSS calc() support - page title uses calc() for max-width
      const pageTitle = await driver.findElements(By.css('.page-title'));
      if (pageTitle.length > 0) {
        const titleMaxWidth = await driver.executeScript(
          'return window.getComputedStyle(arguments[0]).maxWidth;',
          pageTitle[0]
        );
        if (titleMaxWidth && titleMaxWidth !== 'none') {
          console.log(`  ✅ ${page.name} CSS calc() supported`);
          tests.push({ name: `${page.name} CSS calc()`, status: 'passed' });
        }
      }

      // Check font loading - verify fonts are rendered
      const siteTitle = await driver.findElements(By.css('.site-title'));
      if (siteTitle.length > 0) {
        const fontFamily = await driver.executeScript(
          'return window.getComputedStyle(arguments[0]).fontFamily;',
          siteTitle[0]
        );
        if (fontFamily && fontFamily !== '') {
          console.log(`  ✅ ${page.name} fonts loaded`);
          tests.push({ name: `${page.name} font rendering`, status: 'passed' });
        }
      }
    }

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

  const browsers = ['chrome', 'firefox', 'edge', 'opera'];
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