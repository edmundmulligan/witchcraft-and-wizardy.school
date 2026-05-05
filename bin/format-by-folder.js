#!/usr/bin/env node

/*
 **********************************************************************
 * File       : bin/format-by-folder.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Wrapper script to format code for a specific folder (web, stats, sound, api)
 *   Supports different formatting modes: all, html, css, js, check
 **********************************************************************
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

// Parse command line arguments
const args = process.argv.slice(2);
let folder = null;
let mode = 'all'; // default: format everything

// Valid folders that can be formatted
const validFolders = ['web', 'stats', 'sound', 'api'];
const validModes = ['all', 'html', 'css', 'js', 'check'];

// Detect mode from npm lifecycle event (e.g., format:html -> html)
const npmEvent = process.env.npm_lifecycle_event;
if (npmEvent && npmEvent.startsWith('format:')) {
  const detectedMode = npmEvent.split(':')[1];
  if (validModes.includes(detectedMode)) {
    mode = detectedMode;
  }
}

// First pass: look for mode in arguments (overrides lifecycle detection)
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg === '-h' || arg === '--help') {
    console.log('Usage: npm run format <folder>');
    console.log('       npm run format:html <folder>');
    console.log('       npm run format:css <folder>');
    console.log('       npm run format:js <folder>');
    console.log('       npm run format:check <folder>');
    console.log('');
    console.log('Folders:');
    console.log('  web      Format web application files');
    console.log('  stats    Format stats module files');
    console.log('  sound    Format sound module files');
    console.log('  api      Format API server files');
    console.log('');
    console.log('Modes:');
    console.log('  all      Format HTML, CSS, and JS (default)');
    console.log('  html     Format only HTML files');
    console.log('  css      Format only CSS files');
    console.log('  js       Format only JS files');
    console.log('  check    Check formatting without writing');
    console.log('');
    console.log('Examples:');
    console.log('  npm run format web');
    console.log('  npm run format:html api');
    console.log('  npm run format:check web');
    process.exit(0);
  } else if (validModes.includes(arg)) {
    mode = arg;
  } else if (!arg.startsWith('-') && !folder) {
    folder = arg;
  }
}

// Show help if no folder provided
if (!folder) {
  console.error('❌ Error: No folder specified');
  console.error('');
  console.log('Usage: npm run format <folder>');
  console.log('');
  console.log('Folders: web, stats, sound, api');
  console.log('Run with --help for more information');
  process.exit(1);
}

// Validate folder
if (!validFolders.includes(folder)) {
  console.error(`❌ Error: Invalid folder "${folder}"`);
  console.error(`   Valid folders are: ${validFolders.join(', ')}`);
  process.exit(1);
}

// Check if folder exists
const folderPath = path.join(process.cwd(), folder);
if (!fs.existsSync(folderPath)) {
  console.error(`❌ Error: Folder "${folder}" does not exist`);
  process.exit(1);
}

const modeLabel = mode === 'all' ? 'all formats' : mode.toUpperCase();
console.log(`🎨 Formatting ${modeLabel} in: ${folder}/`);
console.log('');

try {
  if (mode === 'check') {
    // Check formatting without writing
    console.log('🔍 Checking CSS and JavaScript formatting...');
    execSync(`prettier --check --ignore-path .prettierignore "${folder}/**/*.{css,js}"`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    console.log('');
    console.log('✅ Formatting check passed!');
  } else if (mode === 'html') {
    // Format only HTML
    console.log('📝 Formatting HTML...');
    execSync(`node bin/fix-html-format.js ${folder}`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    console.log('');
    console.log('✅ HTML formatting complete!');
  } else if (mode === 'css') {
    // Format only CSS
    console.log('📝 Formatting CSS...');
    execSync(`prettier --write --ignore-path .prettierignore "${folder}/**/*.css"`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    console.log('');
    console.log('✅ CSS formatting complete!');
  } else if (mode === 'js') {
    // Format only JS
    console.log('📝 Formatting JavaScript...');
    execSync(`prettier --write --ignore-path .prettierignore "${folder}/**/*.js"`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    console.log('');
    console.log('✅ JavaScript formatting complete!');
  } else {
    // Format everything (default)
    console.log('📝 Formatting CSS and JavaScript...');
    execSync(`prettier --write --ignore-path .prettierignore "${folder}/**/*.{css,js}"`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    console.log('📝 Formatting HTML...');
    execSync(`node bin/fix-html-format.js ${folder}`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    console.log('');
    console.log('✅ Formatting complete!');
  }
} catch (error) {
  process.exit(error.status || 1);
}
