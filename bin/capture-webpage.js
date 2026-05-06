#!/usr/bin/env node

/*
 **********************************************************************
 * File       : capture-webpage.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License
 * Description:
 *   Captures entire web page as PNG, including content beyond viewport.
 *   Supports clicking elements to reveal hidden content before capturing.
 **********************************************************************
 */

/**
 * Usage:
 *   node capture-webpage.js <url> <output-name> [options]
 *
 * Options:
 *   --width <pixels>            Viewport width (default: 1920)
 *   --height <pixels>           Viewport height (default: 1080)
 *   --scale <factor>            Device scale factor for retina (default: 2)
 *   --selector <css>            Capture specific element only
 *   --wait <ms>                 Wait time after page load (default: 500ms)
 *   --no-full-page              Capture viewport only (not full page)
 *   --fill-text <sel> <value>   Fill text input field (repeatable)
 *   --check <selector>          Check checkbox/radio button (repeatable)
 *   --click <selector>          Click element before capturing (repeatable)
 *   --click-delay <ms>          Delay after each click (default: 300ms)
 *   --wait-for <selector>       Wait for element to be visible before capturing
 *   --wait-for-content          Wait for element to have content (use with --wait-for)
 *   --wait-timeout <ms>         Timeout for wait-for (default: 5000ms)
 *   --mock-student-data <name> <avatar> <gender> <age>
 *                               Mock student localStorage for lesson pages
 *   --iterate-sections <count>  Capture screenshot for each section (0 to count-1)
 *   --section-delay <ms>        Delay after clicking section (default: 500ms)
 *
 * Examples:
 *   # Capture full page
 *   node bin/capture-webpage.js http://localhost:8080 homepage
 *
 *   # Fill form and wait for result
 *   node bin/capture-webpage.js http://localhost:8080/form form-filled \
 *     --fill-text "#name" "John" --check "#agree" --click "#submit" \
 *     --wait-for "#result" --wait-for-content
 *
 *   # Lesson page with mocked student avatar
 *   node bin/capture-webpage.js http://localhost:8080/students/lesson-01.html lesson \
 *     --mock-student-data "Edmund" "wizard" "male" "young"
 *
 *   # Iterate through lesson sections (captures section-0.png, section-1.png, etc.)
 *   node bin/capture-webpage.js http://localhost:8080/students/lesson-01.html lesson-01 \
 *     --mock-student-data "Edmund" "wizard" "male" "young" --iterate-sections 6
 *
 *   # Click button to reveal hidden content
 *   node bin/capture-webpage.js http://localhost:8080 modal --click "#open-modal"
 *
 *   # Click multiple buttons in sequence
 *   node bin/capture-webpage.js http://localhost:8080 nested --click "#tab1" --click "#subtab"
 *
 *   # Click and wait for specific element to appear
 *   node bin/capture-webpage.js http://localhost:8080 menu --click "#menu-btn" --wait-for ".menu-panel"
 *
 *   # Capture specific element after clicking
 *   node bin/capture-webpage.js http://localhost:8080 dropdown --click ".dropdown-toggle" --selector ".dropdown-menu"
 */

const fs = require('fs');
const path = require('path');

// ANSI colour codes
const colours = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, colour = 'reset') {
  console.log(`${colours[colour]}${message}${colours.reset}`);
}

function error(message) {
  log(`✗ ${message}`, 'red');
}

function success(message) {
  log(`✓ ${message}`, 'green');
}

function info(message) {
  log(`ℹ ${message}`, 'cyan');
}

function checkDependencies() {
  try {
    require.resolve('puppeteer');
    success('Puppeteer found');
  } catch (e) {
    error('Puppeteer is not installed');
    log('\nPuppeteer should already be installed (used by pa11y)', 'yellow');
    log('If not, install with: npm install --save-dev puppeteer');
    process.exit(1);
  }
}

async function captureWebpage(url, outputName, options = {}) {
  const {
    width = 1920,
    height = 1080,
    scale = 2,
    selector = null,
    wait = 500,
    fullPage = true,
    fillText = [],
    checkSelectors = [],
    clickSelectors = [],
    clickDelay = 300,
    waitForSelector = null,
    waitForContent = false,
    waitTimeout = 5000,
    mockStudentData = null,
    iterateSections = null,
    sectionDelay = 500,
  } = options;

  log('\n' + '='.repeat(60), 'blue');
  log('  Web Page Screenshot Capture', 'blue');
  log('='.repeat(60) + '\n', 'blue');

  info(`URL: ${url}`);
  info(`Output: ${outputName}.png`);
  info(`Viewport: ${width}x${height} @ ${scale}x scale`);
  if (selector) info(`Capture selector: ${selector}`);
  info(`Full page: ${fullPage ? 'Yes' : 'No (viewport only)'}`);
  if (fillText.length > 0) {
    info(`Fill text fields: ${fillText.length} field(s)`);
    fillText.forEach((item, i) => log(`  ${i + 1}. ${item.selector} = "${item.value}"`, 'cyan'));
  }
  if (checkSelectors.length > 0) {
    info(`Check inputs: ${checkSelectors.length} input(s)`);
    checkSelectors.forEach((sel, i) => log(`  ${i + 1}. ${sel}`, 'cyan'));
  }
  if (clickSelectors.length > 0) {
    info(`Click sequence: ${clickSelectors.length} element(s)`);
    clickSelectors.forEach((sel, i) => log(`  ${i + 1}. ${sel}`, 'cyan'));
  }
  if (mockStudentData) {
    info(
      `Mock student data: ${mockStudentData.name} (${mockStudentData.avatar}, ${mockStudentData.gender}, ${mockStudentData.age})`
    );
  }
  if (iterateSections !== null) {
    info(`Iterate sections: 0 to ${iterateSections - 1} (${iterateSections} total)`);
  }
  if (waitForSelector)
    info(`Wait for: ${waitForSelector}${waitForContent ? ' (with content)' : ''}`);

  const puppeteer = require('puppeteer');

  log('\nLaunching browser...', 'yellow');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // Emulate media features to ensure animations run normally
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);

    // Capture console messages for debugging
    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      // Ignore console errors about 404s for lesson files (expected)
      if (type === 'error' && !text.includes('Failed to load resource') && !text.includes('404')) {
        log(`[Browser ${type}] ${text}`, 'red');
      } else if (type === 'warning') {
        log(`[Browser ${type}] ${text}`, 'yellow');
      } else if (
        type === 'log' &&
        (text.includes('Theme') || text.includes('Style') || text.includes('Query'))
      ) {
        // Log theme/style/query related messages for debugging
        log(`[Browser] ${text}`, 'cyan');
      }
    });

    // Capture failed requests with URLs (but ignore expected lesson file checks)
    page.on('requestfailed', (request) => {
      const failure = request.failure();
      const url = request.url();
      // Ignore failed requests for lesson files (expected when checking file existence)
      if (!url.match(/\/(students|mentors)\/lesson-\d+/)) {
        log(`[Request failed] ${url} - ${failure ? failure.errorText : 'Unknown error'}`, 'red');
      }
    });

    // Capture response errors (404, 500, etc.)
    page.on('response', (response) => {
      const status = response.status();
      const url = response.url();
      // Ignore 404s for lesson files (expected when checking file existence)
      if (status >= 400 && !url.match(/\/(students|mentors)\/lesson-\d+/)) {
        log(`[${status}] ${url}`, 'yellow');
      }
    });

    // Set viewport
    await page.setViewport({
      width: width,
      height: height,
      deviceScaleFactor: scale,
    });

    log('Navigating to page...', 'yellow');
    await page.goto(url, {
      waitUntil: 'networkidle0',
    });

    // Clear localStorage to ensure query parameters take precedence
    // This prevents theme/style from previous screenshots persisting
    log('Clearing localStorage to respect query parameters...', 'yellow');
    await page.evaluate(() => {
      localStorage.clear();
    });

    // Navigate again (not reload) to preserve query parameters while starting fresh
    log('Re-navigating with clean localStorage...', 'yellow');
    await page.goto(url, {
      waitUntil: 'networkidle0',
    });

    // Wait for any animations or dynamic content
    if (wait > 0) {
      log(`Waiting ${wait}ms for page to settle...`, 'yellow');
      await new Promise((resolve) => setTimeout(resolve, wait));
    }

    // For homepage, wait for portrait animations to be visible (only at >= 400px)
    const isHomepage =
      url.includes('localhost:8080?') ||
      url.endsWith('localhost:8080') ||
      url.includes('index.html');
    if (isHomepage && width >= 400) {
      log('Waiting for portrait to be visible...', 'yellow');
      try {
        await page.waitForFunction(
          () => {
            const portrait = document.querySelector('.portrait-image');
            if (!portrait) return false;
            const opacity = window.getComputedStyle(portrait).opacity;
            return parseFloat(opacity) > 0.5; // Wait for at least 50% opacity
          },
          { timeout: 15000 } // 15 second timeout
        );
        // Wait additional 500ms to ensure stable display
        await new Promise((resolve) => setTimeout(resolve, 500));
        success('Portrait is visible');
      } catch (err) {
        error(`Portrait did not become visible within 15s`);
      }
    }

    // Mock student data if specified
    if (mockStudentData) {
      log('Mocking student data in localStorage...', 'yellow');
      try {
        await page.evaluate((data) => {
          // Access the StudentFormManager through the global API
          if (!window.LocalStorageManager) {
            console.error('LocalStorageManager not available');
            return;
          }

          // Create the form data object
          const formData = {
            name: data.name,
            avatarChoice: data.avatar,
            genderChoice: data.gender,
            ageChoice: data.age,
            themeChoice: data.theme || '',
            elementChoice: data.element || '',
          };

          // Get the storage manager
          const storage = new window.LocalStorage();

          // Set the current profile
          const profileIdentifier = (data.name.trim() || 'Student').toLowerCase();
          localStorage.setItem('studentFormData_currentProfile', profileIdentifier);

          // Save the data (this returns a Promise, but we'll wait for it)
          const storageKey = 'studentFormData_' + profileIdentifier;
          const dataWithTimestamp = {
            ...formData,
            savedAt: new Date().toISOString(),
          };

          // Encrypt and save
          return storage.encryptData(JSON.stringify(dataWithTimestamp)).then((encryptedData) => {
            localStorage.setItem(storageKey, encryptedData);

            // Call populateStudentImage if available
            if (window.LocalStorageManager && window.LocalStorageManager.populateStudentImage) {
              return window.LocalStorageManager.populateStudentImage();
            }
          });
        }, mockStudentData);

        // Wait a moment for the image to load
        await new Promise((resolve) => setTimeout(resolve, 500));
        success('Student data mocked and avatar populated');
      } catch (error) {
        error(`Error mocking student data: ${error.message}`);
      }
    }

    // Fill text fields if specified
    if (fillText.length > 0) {
      log('Filling text fields...', 'yellow');
      for (let i = 0; i < fillText.length; i++) {
        const { selector, value } = fillText[i];
        log(`  Filling: ${selector} = "${value}"`, 'cyan');

        const inputElement = await page.$(selector);
        if (!inputElement) {
          error(`Input element not found: ${selector}`);
          await browser.close();
          process.exit(1);
        }

        await inputElement.type(value);
      }
      success('All text fields filled');
    }

    // Check checkboxes/radio buttons if specified
    if (checkSelectors.length > 0) {
      log('Checking inputs...', 'yellow');
      for (let i = 0; i < checkSelectors.length; i++) {
        const checkSel = checkSelectors[i];
        log(`  Checking: ${checkSel}`, 'cyan');

        const checkElement = await page.$(checkSel);
        if (!checkElement) {
          error(`Checkbox/radio element not found: ${checkSel}`);
          await browser.close();
          process.exit(1);
        }

        // Check if already checked
        const isChecked = await page.$eval(checkSel, (el) => el.checked);
        if (!isChecked) {
          await checkElement.click();
        }
      }
      success('All inputs checked');
    }

    // Click elements in sequence if specified
    if (clickSelectors.length > 0) {
      log('Clicking elements...', 'yellow');
      for (let i = 0; i < clickSelectors.length; i++) {
        const clickSel = clickSelectors[i];
        log(`  Clicking: ${clickSel}`, 'cyan');

        const clickElement = await page.$(clickSel);
        if (!clickElement) {
          error(`Click element not found: ${clickSel}`);
          await browser.close();
          process.exit(1);
        }

        // Scroll element into view and wait for it
        await page.evaluate((selector) => {
          const el = document.querySelector(selector);
          if (el) {
            el.scrollIntoView({ behavior: 'auto', block: 'center' });
          }
        }, clickSel);

        // Wait a moment for scroll to complete
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Try clicking with element handle
        try {
          await clickElement.click();
        } catch (err) {
          // If direct click fails, try evaluating click in browser context
          log('  Direct click failed, trying JS click...', 'yellow');
          await page.evaluate((selector) => {
            document.querySelector(selector).click();
          }, clickSel);
        }

        // Wait after clicking
        if (clickDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, clickDelay));
        }
      }
      success('All clicks completed');
    }

    // Wait for specific element to appear if specified
    if (waitForSelector) {
      if (waitForContent) {
        log(`Waiting for element to have content: ${waitForSelector}`, 'yellow');
        try {
          await page.waitForFunction(
            (selector) => {
              const el = document.querySelector(selector);
              if (!el) return false;
              // Check if element has children (like an img tag) or text content
              return el.children.length > 0 || el.textContent.trim().length > 0;
            },
            { timeout: waitTimeout },
            waitForSelector
          );
          success('Element has content');
        } catch (err) {
          error(`Element did not have content within ${waitTimeout}ms: ${waitForSelector}`);
          await browser.close();
          process.exit(1);
        }
      } else {
        log(`Waiting for element to appear: ${waitForSelector}`, 'yellow');
        try {
          await page.waitForSelector(waitForSelector, {
            visible: true,
            timeout: waitTimeout,
          });
          success('Element appeared');
        } catch (err) {
          error(`Element did not appear within ${waitTimeout}ms: ${waitForSelector}`);
          await browser.close();
          process.exit(1);
        }
      }
    }

    // Create output directory
    const outputDir = path.join(process.cwd(), 'diagnostics/screenshots');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Check if we should iterate through sections
    if (iterateSections !== null && iterateSections > 0) {
      log(`Iterating through ${iterateSections} sections...`, 'yellow');
      const capturedFiles = [];

      for (let sectionNum = 0; sectionNum < iterateSections; sectionNum++) {
        log(`\nSection ${sectionNum}:`, 'cyan');

        // Click the wand icon for this section
        const wandSelector = `.wand-icon[data-section="${sectionNum}"]`;
        log(`  Clicking: ${wandSelector}`, 'cyan');

        try {
          const wandElement = await page.$(wandSelector);
          if (!wandElement) {
            error(`  Wand icon not found: ${wandSelector}`);
            continue;
          }

          // Scroll into view and click
          await page.evaluate((selector) => {
            const el = document.querySelector(selector);
            if (el) {
              el.scrollIntoView({ behavior: 'auto', block: 'center' });
            }
          }, wandSelector);

          await new Promise((resolve) => setTimeout(resolve, 100));

          try {
            await wandElement.click();
          } catch (err) {
            // Try JS click if direct click fails
            await page.evaluate((selector) => {
              document.querySelector(selector).click();
            }, wandSelector);
          }

          // Wait for section to load
          if (sectionDelay > 0) {
            await new Promise((resolve) => setTimeout(resolve, sectionDelay));
          }

          // Capture screenshot with section number suffix
          const sectionOutputName = `${outputName}-section-${sectionNum}`;
          const sectionOutputPath = path.join(outputDir, `${sectionOutputName}.png`);

          log(`  Capturing: ${sectionOutputName}.png`, 'cyan');

          if (selector) {
            const element = await page.$(selector);
            if (element) {
              await element.screenshot({ path: sectionOutputPath });
            }
          } else {
            await page.screenshot({
              path: sectionOutputPath,
              fullPage: fullPage,
            });
          }

          const stats = fs.statSync(sectionOutputPath);
          const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
          success(`  Captured (${sizeMB} MB)`);
          capturedFiles.push({ path: sectionOutputPath, size: sizeMB });
        } catch (err) {
          error(`  Error capturing section ${sectionNum}: ${err.message}`);
        }
      }

      await browser.close();

      // Show summary
      log('\n' + '='.repeat(60), 'blue');
      log('  Capture Complete!', 'green');
      log('='.repeat(60), 'blue');
      log(`\nCaptured ${capturedFiles.length} section(s):`, 'cyan');
      capturedFiles.forEach((file, idx) => {
        log(`  ${idx}. ${path.basename(file.path)} (${file.size} MB)`, 'cyan');
      });
      log('\n' + '='.repeat(60) + '\n', 'blue');
    } else {
      // Single screenshot mode (original behavior)
      const outputPath = path.join(outputDir, `${outputName}.png`);

      log('Capturing screenshot...', 'yellow');

      if (selector) {
        // Capture specific element
        const element = await page.$(selector);
        if (!element) {
          error(`Element not found: ${selector}`);
          await browser.close();
          process.exit(1);
        }
        await element.screenshot({ path: outputPath });
      } else {
        // Capture page or viewport
        await page.screenshot({
          path: outputPath,
          fullPage: fullPage,
        });
      }

      success('Screenshot captured');

      await browser.close();

      // Show file info
      const stats = fs.statSync(outputPath);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

      log('\n' + '='.repeat(60), 'blue');
      log('  Capture Complete!', 'green');
      log('='.repeat(60), 'blue');
      log('\nOutput file:', 'cyan');
      log(`  ${outputPath}`, 'cyan');
      log(`  Size: ${sizeMB} MB`);
      log('\n' + '='.repeat(60) + '\n', 'blue');
    }
  } catch (err) {
    error(`Error during capture: ${err.message}`);
    await browser.close();
    throw err;
  }
}

// Parse command-line arguments
function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    log('Usage: node capture-webpage.js <url> <output-name> [options]', 'yellow');
    log('\nOptions:');
    log('  --width <pixels>            Viewport width (default: 1920)');
    log('  --height <pixels>           Viewport height (default: 1080)');
    log('  --scale <factor>            Device scale factor (default: 2)');
    log('  --selector <css>            Capture specific element only');
    log('  --wait <ms>                 Wait time after page load (default: 500ms)');
    log('  --no-full-page              Capture viewport only (not full page)');
    log('  --fill-text <sel> <value>   Fill text input (repeatable)');
    log('  --check <selector>          Check checkbox/radio (repeatable)');
    log('  --click <selector>          Click element (repeatable)');
    log('  --click-delay <ms>          Delay after each click (default: 300ms)');
    log('  --wait-for <selector>       Wait for element to be visible');
    log('  --wait-for-content          Wait for element to have content (use with --wait-for)');
    log('  --wait-timeout <ms>         Timeout for wait-for (default: 5000ms)');
    log('  --mock-student-data <name> <avatar> <gender> <age>');
    log(
      '                              Mock student localStorage (avatar: wizard|witch, gender: male|female, age: young|old)'
    );
    log('  --iterate-sections <count>  Capture each section (0 to count-1) in lesson pages');
    log('  --section-delay <ms>        Delay after clicking each section (default: 500ms)');
    log('\nExamples:');
    log('  # Capture full page at default resolution');
    log('  node bin/capture-webpage.js http://localhost:8080 homepage');
    log('');
    log('  # Fill form and wait for result');
    log('  node bin/capture-webpage.js http://localhost:8080/form form-filled \\');
    log('    --fill-text "#name" "John" --check "#agree" --click "#submit" \\');
    log('    --wait-for "#result" --wait-for-content');
    log('');
    log('  # Click button to reveal modal, then capture');
    log('  node bin/capture-webpage.js http://localhost:8080 modal --click "#open-modal-btn"');
    log('');
    log('  # Click multiple buttons in sequence');
    log(
      '  node bin/capture-webpage.js http://localhost:8080 nested --click "#tab1" --click "#subtab2"'
    );
    log('');
    log('  # Click and wait for element to appear');
    log(
      '  node bin/capture-webpage.js http://localhost:8080 menu --click "#menu-btn" --wait-for ".menu-panel"'
    );
    log('');
    log('  # Click, wait, then capture specific element');
    log(
      '  node bin/capture-webpage.js http://localhost:8080 dropdown --click ".toggle" --selector ".dropdown-menu"'
    );
    log('');
    log('  # Mobile viewport with click');
    log(
      '  node bin/capture-webpage.js http://localhost:8080 mobile --width 375 --height 667 --click "#hamburger"'
    );
    log('');
    log('  # Lesson page with mocked student avatar');
    log('  node bin/capture-webpage.js http://localhost:8080/students/lesson-01.html lesson-01 \\');
    log('    --mock-student-data "Edmund" "wizard" "male" "young"');
    log('');
    log('  # Iterate through lesson sections');
    log('  node bin/capture-webpage.js http://localhost:8080/students/lesson-01.html lesson-01 \\');
    log('    --mock-student-data "Edmund" "wizard" "male" "young" --iterate-sections 6');
    log('\nArguments:');
    log('  url          - URL of the page to capture');
    log('  output-name  - Name for output file (without .png extension)');
    process.exit(1);
  }

  const url = args[0];
  const outputName = args[1];

  // Parse options
  const options = {
    fillText: [], // Array to store text input fills
    checkSelectors: [], // Array to store checkbox/radio selectors
    clickSelectors: [], // Array to store multiple click selectors
  };

  for (let i = 2; i < args.length; i++) {
    if (args[i] === '--width' && args[i + 1]) {
      options.width = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--height' && args[i + 1]) {
      options.height = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--scale' && args[i + 1]) {
      options.scale = parseFloat(args[i + 1]);
      i++;
    } else if (args[i] === '--selector' && args[i + 1]) {
      options.selector = args[i + 1];
      i++;
    } else if (args[i] === '--wait' && args[i + 1]) {
      options.wait = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--fill-text' && args[i + 1] && args[i + 2]) {
      options.fillText.push({ selector: args[i + 1], value: args[i + 2] });
      i += 2;
    } else if (args[i] === '--check' && args[i + 1]) {
      options.checkSelectors.push(args[i + 1]);
      i++;
    } else if (args[i] === '--click' && args[i + 1]) {
      options.clickSelectors.push(args[i + 1]);
      i++;
    } else if (args[i] === '--click-delay' && args[i + 1]) {
      options.clickDelay = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--wait-for' && args[i + 1]) {
      options.waitForSelector = args[i + 1];
      i++;
    } else if (args[i] === '--wait-for-content') {
      options.waitForContent = true;
    } else if (args[i] === '--wait-timeout' && args[i + 1]) {
      options.waitTimeout = parseInt(args[i + 1], 10);
      i++;
    } else if (
      args[i] === '--mock-student-data' &&
      args[i + 1] &&
      args[i + 2] &&
      args[i + 3] &&
      args[i + 4]
    ) {
      options.mockStudentData = {
        name: args[i + 1],
        avatar: args[i + 2],
        gender: args[i + 3],
        age: args[i + 4],
      };
      i += 4;
    } else if (args[i] === '--iterate-sections' && args[i + 1]) {
      options.iterateSections = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--section-delay' && args[i + 1]) {
      options.sectionDelay = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--no-full-page') {
      options.fullPage = false;
    }
  }

  checkDependencies();

  captureWebpage(url, outputName, options)
    .then(() => {
      success('All done! 📸');
      process.exit(0);
    })
    .catch((err) => {
      error(`Fatal error: ${err.message}`);
      console.error(err);
      process.exit(1);
    });
}

main();
