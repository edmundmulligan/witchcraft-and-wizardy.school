#!/usr/bin/env node

/*
 **********************************************************************
 * File       : test-browser-contrast-display.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License
 * Description:
 *   Test colourPalette.html in a browser context to verify
 *   all contrasts display correctly
 **********************************************************************
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

/**
 * Run the colour palette diagnostic page inside JSDOM and verify that each rendered
 * contrast summary both parses successfully and meets WCAG expectations.
 *
 * @remarks Preconditions:
 * - The referenced diagnostic HTML, CSS, and JavaScript files must exist on disk.
 * - `jsdom` must be installed and able to execute the dashboard script in a DOM context.
 * - The diagnostic page is expected to render `.contrast-info` elements after initialization.
 *
 * @returns {Promise<void>} Resolves after printing a summary and exiting the process.
 */
async function testColourPalette() {
  console.log('\n' + '='.repeat(100));
  console.log('BROWSER CONTEXT COLOUR CONTRAST VERIFICATION');
  console.log('Testing colourPalette.html with actual JavaScript parsing');
  console.log('='.repeat(100) + '\n');

  // Read the HTML file
  const htmlPath = path.join(__dirname, '../diagnostics/colourPalette.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  // Read the CSS files
  const coloursCssPath = path.join(__dirname, '../styles/colours.css');
  const coloursCss = fs.readFileSync(coloursCssPath, 'utf8');

  const globalsCssPath = path.join(__dirname, '../styles/globals.css');
  const globalsCss = fs.readFileSync(globalsCssPath, 'utf8');

  const paletteCssPath = path.join(__dirname, '../styles/colourPalette.css');
  const paletteCss = fs.readFileSync(paletteCssPath, 'utf8');

  // Read the JavaScript file
  const jsPath = path.join(__dirname, '../scripts/diagnostics/colourPalette.js');
  const jsContent = fs.readFileSync(jsPath, 'utf8');

  // Create JSDOM instance
  const dom = new JSDOM(htmlContent, {
    runScripts: 'outside-only',
    resources: 'usable',
  });

  const { window } = dom;
  const { document } = window;

  // Inject CSS
  const styleElement = document.createElement('style');
  styleElement.textContent = coloursCss + '\n' + globalsCss + '\n' + paletteCss;
  document.head.appendChild(styleElement);

  // Make getComputedStyle available globally
  global.window = window;
  global.document = document;

  // Execute the JavaScript
  try {
    const script = new vm.Script(jsContent);
    const context = vm.createContext({
      window,
      document,
      console,
      getComputedStyle: window.getComputedStyle.bind(window),
    });
    script.runInContext(context);
  } catch (e) {
    // Try alternative approach - just eval in window context
    window.eval(jsContent);
  }

  // Wait for initialization
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Check all contrast-info divs
  const contrastDivs = document.querySelectorAll('.contrast-info');

  console.log(`Found ${contrastDivs.length} contrast check elements\n`);

  let passing = 0;
  let failing = 0;
  let errors = 0;
  const results = [];

  contrastDivs.forEach((div, index) => {
    const bgVar = div.getAttribute('data-bg-var');
    const fgVar = div.getAttribute('data-fg-var');
    const ratioText = div.querySelector('.ratio')?.textContent || '';
    const wcagBadges = Array.from(div.querySelectorAll('.wcag-badge')).map((b) => b.textContent);

    // Check if there's an error or fail status
    const hasError = div.textContent.includes('Error') || div.textContent.includes('NaN');
    const hasFail = div.classList.contains('fail') || div.textContent.includes('Fail');

    const result = {
      index: index + 1,
      bgVar,
      fgVar,
      ratio: ratioText,
      wcag: wcagBadges.join(' '),
      status: hasError ? 'ERROR' : hasFail ? 'FAIL' : 'PASS',
    };

    if (result.status === 'ERROR') {
      errors++;
    } else if (result.status === 'FAIL') {
      failing++;
    } else {
      passing++;
    }

    results.push(result);
  });

  // Display results grouped by status
  const errorResults = results.filter((r) => r.status === 'ERROR');
  const failResults = results.filter((r) => r.status === 'FAIL');
  const passResults = results.filter((r) => r.status === 'PASS');

  if (errorResults.length > 0) {
    console.log('❌ ERRORS (JavaScript parsing failed):\n');
    errorResults.forEach((r) => {
      console.log(`  [${r.index}] ${r.bgVar} / ${r.fgVar}`);
      console.log(`      Ratio: ${r.ratio || 'Not computed'}`);
      console.log('');
    });
  }

  if (failResults.length > 0) {
    console.log('⚠️  WCAG FAILURES (<4.5:1):\n');
    failResults.forEach((r) => {
      console.log(`  [${r.index}] ${r.bgVar} / ${r.fgVar}`);
      console.log(`      Ratio: ${r.ratio}`);
      console.log(`      WCAG: ${r.wcag || 'None'}`);
      console.log('');
    });
  }

  console.log('✅ PASSING:\n');
  const samplePassing = passResults.slice(0, 10);
  samplePassing.forEach((r) => {
    console.log(`  [${r.index}] ${r.bgVar} / ${r.fgVar}`);
    console.log(`      Ratio: ${r.ratio}, WCAG: ${r.wcag}`);
    console.log('');
  });

  if (passResults.length > 10) {
    console.log(`  ... and ${passResults.length - 10} more passing checks\n`);
  }

  console.log('='.repeat(100));
  console.log('SUMMARY');
  console.log('='.repeat(100));
  console.log(`Total contrast checks: ${results.length}`);
  console.log(`Passing: ${passing} (${((passing / results.length) * 100).toFixed(1)}%)`);
  console.log(`Failing WCAG: ${failing} (${((failing / results.length) * 100).toFixed(1)}%)`);
  console.log(`Errors (parsing): ${errors} (${((errors / results.length) * 100).toFixed(1)}%)`);
  console.log('='.repeat(100) + '\n');

  if (errors > 0 || failing > 0) {
    console.error('❌ VERIFICATION FAILED\n');
    process.exit(1);
  } else {
    console.log(
      '✅ VERIFICATION PASSED: All colour pair parse correctly and meet WCAG standards\n'
    );
    process.exit(0);
  }
}

// Check if jsdom is available
try {
  require.resolve('jsdom');
} catch (e) {
  console.error('Error: jsdom is not installed.');
  console.error('Please run: npm install --save-dev jsdom');
  console.error(
    '\nAlternatively, open diagnostics/colourPalette.html in your browser to manually verify.'
  );
  process.exit(1);
}

// Check if vm is available
try {
  global.vm = require('vm');
} catch (e) {
  // vm not available, will use eval instead
}

testColourPalette().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
