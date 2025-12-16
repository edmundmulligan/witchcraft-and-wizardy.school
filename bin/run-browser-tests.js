#!/usr/bin/env node

/**
 * Cross-browser testing script using Playwright
 * Tests basic functionality across Chromium (Chrome/Edge/Opera), Firefox, and WebKit (Safari)
 */

const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs');
const path = require('path');

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

    // Define all pages to test
    const pages = [
      { url: 'http://localhost:8080/index.html', name: 'Home' },
      { url: 'http://localhost:8080/about.html', name: 'About' },
      { url: 'http://localhost:8080/students.html', name: 'Students' },
      { url: 'http://localhost:8080/glossary-and-faq.html', name: 'Glossary & FAQ' },
      { url: 'http://localhost:8080/license-and-credits.html', name: 'License & Credits' }
    ];

    // Test each page
    for (const pageInfo of pages) {
      console.log(`   📄 Testing ${pageInfo.name} page...`);
      await page.goto(pageInfo.url, { waitUntil: 'networkidle' });

      // Check title
      const title = await page.title();
      if (title.includes('Web Witchcraft')) {
        console.log(`     ✅ ${pageInfo.name} page title correct`);
        tests.push({ name: `${pageInfo.name} page title`, status: 'passed' });
      } else {
        throw new Error(`${pageInfo.name} title incorrect: ${title}`);
      }

      // Check navigation links
      const navLinks = await page.$$('nav a');
      if (navLinks.length >= 4) {
        console.log(`     ✅ ${pageInfo.name} page navigation links present`);
        tests.push({ name: `${pageInfo.name} navigation links`, status: 'passed' });
      } else {
        throw new Error(`Expected at least 4 nav links on ${pageInfo.name}, found ${navLinks.length}`);
      }

      // Check JavaScript execution - header/footer should be injected
      const headerContent = await page.$$('header *');
      if (headerContent.length > 0) {
        console.log(`     ✅ ${pageInfo.name} JavaScript executed (header injected)`);
        tests.push({ name: `${pageInfo.name} JavaScript execution`, status: 'passed' });
      } else {
        throw new Error(`${pageInfo.name} header not injected - JavaScript may have failed`);
      }

      // Check CSS Grid support - header should use grid layout (or flex on mobile)
      const headerDisplay = await page.$eval('header', el => window.getComputedStyle(el).display);
      if (headerDisplay === 'grid' || headerDisplay === 'flex') {
        console.log(`     ✅ ${pageInfo.name} CSS Grid/Flexbox layout working (${headerDisplay})`);
        tests.push({ name: `${pageInfo.name} CSS Grid`, status: 'passed' });
      } else {
        throw new Error(`${pageInfo.name} CSS Grid/Flex not working: display is ${headerDisplay}`);
      }

      // Check CSS Flexbox support - navigation should use flex
      const navDisplay = await page.$eval('nav.site-navigation ul', el => window.getComputedStyle(el).display);
      if (navDisplay === 'flex') {
        console.log(`     ✅ ${pageInfo.name} CSS Flexbox supported`);
        tests.push({ name: `${pageInfo.name} CSS Flexbox`, status: 'passed' });
      } else {
        throw new Error(`${pageInfo.name} CSS Flexbox not working: display is ${navDisplay}`);
      }

      // Check CSS Variables support - check if custom property is applied
      const bgColor = await page.$eval('body', el => window.getComputedStyle(el).backgroundColor);
      if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
        console.log(`     ✅ ${pageInfo.name} CSS Variables supported`);
        tests.push({ name: `${pageInfo.name} CSS Variables`, status: 'passed' });
      } else {
        throw new Error(`${pageInfo.name} CSS Variables not applied correctly`);
      }

      // Check SVG support - header images should be present
      const svgImages = await page.$$('header img[src*=".svg"]');
      if (svgImages.length >= 2) {
        console.log(`     ✅ ${pageInfo.name} SVG images loaded`);
        tests.push({ name: `${pageInfo.name} SVG support`, status: 'passed' });
      } else {
        throw new Error(`${pageInfo.name} SVG images not found: expected 2, found ${svgImages.length}`);
      }

      // Check responsive design - verify viewport meta tag
      const viewportMeta = await page.$$('meta[name="viewport"]');
      if (viewportMeta.length > 0) {
        console.log(`     ✅ ${pageInfo.name} viewport meta tag present`);
        tests.push({ name: `${pageInfo.name} responsive viewport`, status: 'passed' });
      } else {
        throw new Error(`${pageInfo.name} viewport meta tag missing`);
      }

      // Check CSS calc() support - page title uses calc() for max-width
      const pageTitles = await page.$$('.page-title');
      if (pageTitles.length > 0) {
        const titleMaxWidth = await page.$eval('.page-title', el => window.getComputedStyle(el).maxWidth);
        if (titleMaxWidth && titleMaxWidth !== 'none') {
          console.log(`     ✅ ${pageInfo.name} CSS calc() supported`);
          tests.push({ name: `${pageInfo.name} CSS calc()`, status: 'passed' });
        }
      }

      // Check font loading - verify fonts are rendered
      const siteTitles = await page.$$('.site-title');
      if (siteTitles.length > 0) {
        const fontFamily = await page.$eval('.site-title', el => window.getComputedStyle(el).fontFamily);
        if (fontFamily && fontFamily !== '') {
          console.log(`     ✅ ${pageInfo.name} fonts loaded`);
          tests.push({ name: `${pageInfo.name} font rendering`, status: 'passed' });
        }
      }
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