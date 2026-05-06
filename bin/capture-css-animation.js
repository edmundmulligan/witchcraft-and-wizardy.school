#!/usr/bin/env node

/*
 **********************************************************************
 * File       : capture-css-animation.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License
 * Description:
 *   Automates the process of capturing a CSS animation from a webpage
 *   and converting it to an optimised GIF using Puppeteer.
 **********************************************************************
 */

/**
 * Usage:
 *   node capture-css-animation.js <url> <output-name> <duration> [options]
 *
 * Options:
 *   --click <selector>    Click element before capturing (to trigger animation)
 *   --capture <selector>  Capture only this element
 *   --delay <ms>          Delay before starting capture after click (default: 100ms)
 *
 * Examples:
 *   node bin/capture-css-animation.js http://localhost:8080/page.html animation 3000
 *   node bin/capture-css-animation.js http://localhost:8080 theme 3000 --click ".light-button"
 *   node bin/capture-css-animation.js http://localhost:8080 wand 5000 --capture ".wand-icon"
 *   node bin/capture-css-animation.js http://localhost:8080 theme 3000 --click "#theme-toggle" --delay 200
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

/**
 * Escape a string for safe use in shell commands
 * @param {string} arg - The argument to escape
 * @returns {string} - The escaped argument
 */
function escapeShellArg(arg) {
  // Replace single quotes with '\'' and wrap in single quotes
  return `'${arg.replace(/'/g, "'\\''")}'`;
}

function checkDependencies() {
  const deps = [];

  // Check if puppeteer is installed
  try {
    require.resolve('puppeteer');
  } catch (e) {
    deps.push('puppeteer');
  }

  // Check if ffmpeg is available
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
  } catch (e) {
    error('FFmpeg is not installed');
    log('\nPlease install FFmpeg:', 'yellow');
    log('  Ubuntu/Debian: sudo apt install ffmpeg');
    log('  Fedora: sudo dnf install ffmpeg');
    log('  Arch: sudo pacman -S ffmpeg');
    log('  macOS: brew install ffmpeg');
    process.exit(1);
  }

  if (deps.length > 0) {
    error(`Missing dependencies: ${deps.join(', ')}`);
    log('\nPlease install missing packages:', 'yellow');
    log(`  npm install --save-dev ${deps.join(' ')}`);
    process.exit(1);
  }

  success('All dependencies found');
}

async function captureAnimation(url, outputName, duration, options = {}) {
  const { captureSelector = null, clickSelector = null, delay = 100 } = options;

  log('\n' + '='.repeat(60), 'blue');
  log('  CSS Animation Capture', 'blue');
  log('='.repeat(60) + '\n', 'blue');

  info(`URL: ${url}`);
  info(`Output: ${outputName}`);
  info(`Duration: ${duration}ms`);
  if (captureSelector) info(`Capture selector: ${captureSelector}`);
  if (clickSelector) info(`Click trigger: ${clickSelector}`);
  if (delay && clickSelector) info(`Delay after click: ${delay}ms`);

  const puppeteer = require('puppeteer');

  log('\nLaunching browser...', 'yellow');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // Set viewport for consistent capture
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 2, // Retina display
    });

    log('Navigating to page...', 'yellow');
    await page.goto(url, {
      waitUntil: 'networkidle0',
    });

    // Wait a moment for any initial animations
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Click element to trigger animation if specified
    if (clickSelector) {
      log(`Finding click element: ${clickSelector}`, 'yellow');
      const clickElement = await page.$(clickSelector);
      if (!clickElement) {
        error(`Click element not found: ${clickSelector}`);
        await browser.close();
        process.exit(1);
      }
      log('Clicking element to trigger animation...', 'yellow');
      await clickElement.click();

      // Wait for animation to start
      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // Determine what to screenshot
    let element = null;
    if (captureSelector) {
      log(`Finding capture element: ${captureSelector}`, 'yellow');
      element = await page.$(captureSelector);
      if (!element) {
        error(`Capture element not found: ${captureSelector}`);
        await browser.close();
        process.exit(1);
      }
    }

    // Create output directory
    const outputDir = path.join(process.cwd(), 'diagnostics/screenshots');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const videoPath = path.join(outputDir, `${outputName}-temp.webm`);
    const gifPath = path.join(outputDir, `${outputName}.gif`);
    const webpPath = path.join(outputDir, `${outputName}.webp`);

    // Record video using Puppeteer's built-in screen recording
    log('Starting video capture...', 'yellow');

    // Take screenshots at intervals
    const fps = 30;
    const interval = 1000 / fps;
    const frames = Math.ceil(duration / interval);
    const framesDir = path.join(outputDir, `${outputName}-frames`);

    if (!fs.existsSync(framesDir)) {
      fs.mkdirSync(framesDir, { recursive: true });
    }

    log(`Capturing ${frames} frames at ${fps} FPS...`, 'yellow');

    for (let i = 0; i < frames; i++) {
      const framePath = path.join(framesDir, `frame-${String(i).padStart(5, '0')}.png`);

      if (element) {
        await element.screenshot({ path: framePath });
      } else {
        await page.screenshot({ path: framePath, fullPage: false });
      }

      if (i % 30 === 0) {
        process.stdout.write(`\rProgress: ${Math.round((i / frames) * 100)}%`);
      }

      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    process.stdout.write('\rProgress: 100%\n');
    success('Video capture complete');

    await browser.close();

    // Convert frames to video using FFmpeg
    log('\nConverting frames to video...', 'yellow');
    execSync(
      `ffmpeg -framerate ${fps} -pattern_type glob -i ${escapeShellArg(`${framesDir}/frame-*.png`)} ` +
        `-c:v libvpx-vp9 -pix_fmt yuva420p ${escapeShellArg(videoPath)} -y`,
      { stdio: 'ignore' }
    );
    success('Video created');

    // Convert video to optimised GIF
    log('Creating optimised GIF...', 'yellow');
    const palettePath = path.join(outputDir, `${outputName}-palette.png`);

    // Generate palette
    execSync(
      `ffmpeg -i ${escapeShellArg(videoPath)} ` +
        '-vf "fps=15,scale=800:-1:flags=lanczos,palettegen=stats_mode=diff" ' +
        `-y ${escapeShellArg(palettePath)}`,
      { stdio: 'ignore' }
    );

    // Create GIF with palette
    execSync(
      `ffmpeg -i ${escapeShellArg(videoPath)} -i ${escapeShellArg(palettePath)} ` +
        '-lavfi "fps=15,scale=800:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" ' +
        `-loop 0 ${escapeShellArg(gifPath)} -y`,
      { stdio: 'ignore' }
    );
    success('GIF created');

    // Create WebP version
    log('Creating WebP version...', 'yellow');
    execSync(
      `ffmpeg -i ${escapeShellArg(videoPath)} ` +
        '-vcodec libwebp -lossless 0 -compression_level 6 -q:v 80 -loop 0 ' +
        `${escapeShellArg(webpPath)} -y`,
      { stdio: 'ignore' }
    );
    success('WebP created');

    // Optimise GIF with gifsicle if available
    try {
      execSync('gifsicle --version', { stdio: 'ignore' });
      log('Optimising GIF with gifsicle...', 'yellow');
      const optimisedPath = path.join(outputDir, `${outputName}-optimised.gif`);
      execSync(
        `gifsicle -O3 --lossy=80 -o ${escapeShellArg(optimisedPath)} ${escapeShellArg(gifPath)}`,
        { stdio: 'ignore' }
      );
      success('GIF optimised');
    } catch (e) {
      info('gifsicle not found, skipping optimisation');
    }

    // Clean up temporary files
    log('\nCleaning up...', 'yellow');
    fs.rmSync(framesDir, { recursive: true, force: true });
    fs.unlinkSync(videoPath);
    fs.unlinkSync(palettePath);

    // Show file sizes
    log('\n' + '='.repeat(60), 'blue');
    log('  Capture Complete!', 'green');
    log('='.repeat(60), 'blue');
    log('\nOutput files:', 'cyan');

    const files = fs
      .readdirSync(outputDir)
      .filter((f) => f.startsWith(outputName))
      .map((f) => {
        const fullPath = path.join(outputDir, f);
        const stats = fs.statSync(fullPath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        return `  ${f.padEnd(40)} ${sizeMB} MB`;
      });

    files.forEach((f) => log(f));

    log('\n' + '='.repeat(60) + '\n', 'blue');
  } catch (err) {
    error(`Error during capture: ${err.message}`);
    await browser.close();
    throw err;
  }
}

// Parse command-line arguments
function main() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    log('Usage: node capture-css-animation.js <url> <output-name> <duration> [options]', 'yellow');
    log('\nOptions:');
    log('  --click <selector>    Click element before capturing (to trigger animation)');
    log('  --capture <selector>  Capture only this element');
    log('  --delay <ms>          Delay before starting capture after click (default: 100ms)');
    log('\nExamples:');
    log('  # Capture entire page');
    log('  node bin/capture-css-animation.js http://localhost:8080 animation 3000');
    log('');
    log('  # Click button to trigger theme transition');
    log(
      '  node bin/capture-css-animation.js http://localhost:8080 theme 3000 --click ".light-button"'
    );
    log('');
    log('  # Capture specific element only');
    log(
      '  node bin/capture-css-animation.js http://localhost:8080 wand 5000 --capture ".wand-icon"'
    );
    log('');
    log('  # Click with custom delay');
    log(
      '  node bin/capture-css-animation.js http://localhost:8080 menu 2000 --click "#menu-toggle" --delay 200'
    );
    log('\nArguments:');
    log('  url          - URL of the page to capture');
    log('  output-name  - Name for output files (without extension)');
    log('  duration     - Duration to capture in milliseconds');
    process.exit(1);
  }

  const url = args[0];
  const outputName = args[1];
  const duration = parseInt(args[2], 10);

  // Validate outputName to prevent command injection
  if (!/^[a-zA-Z0-9_-]+$/.test(outputName)) {
    error('Output name can only contain letters, numbers, hyphens, and underscores');
    process.exit(1);
  }

  // Parse options
  const options = {};
  for (let i = 3; i < args.length; i++) {
    if (args[i] === '--click' && args[i + 1]) {
      options.clickSelector = args[i + 1];
      i++;
    } else if (args[i] === '--capture' && args[i + 1]) {
      options.captureSelector = args[i + 1];
      i++;
    } else if (args[i] === '--delay' && args[i + 1]) {
      options.delay = parseInt(args[i + 1], 10);
      i++;
    }
  }

  if (isNaN(duration) || duration <= 0) {
    error('Duration must be a positive number');
    process.exit(1);
  }

  checkDependencies();

  captureAnimation(url, outputName, duration, options)
    .then(() => {
      success('All done! 🎬');
      process.exit(0);
    })
    .catch((err) => {
      error(`Fatal error: ${err.message}`);
      console.error(err);
      process.exit(1);
    });
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { captureAnimation };
