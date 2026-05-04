#!/usr/bin/env node

/*
 **********************************************************************
 * File       : bin/run-tests-by-folder.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Wrapper script to run tests for a specific folder (web, stats, sound)
 *   and output results to that folder's diagnostics directory.
 **********************************************************************
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

// Get folder argument
const args = process.argv.slice(2);
const folder = args[0];

// Valid folders that can be tested
const validFolders = ['web', 'stats', 'sound'];

// Show help if no folder provided or invalid folder
if (!folder || folder === '-h' || folder === '--help') {
  console.log('Usage: npm run tests <folder> [options]');
  console.log('');
  console.log('Folders:');
  console.log('  web      Run tests for web application');
  console.log('  stats    Run tests for stats module');
  console.log('  sound    Run tests for sound module');
  console.log('');
  console.log('Options (passed through to run-all-tests.js):');
  console.log('  -c, --continue   Continue from last interrupted test run');
  console.log('  -q, --quick      Quick mode: skip Lighthouse and Wave tests');
  console.log('  -w, --run-wave   Include Wave accessibility tests');
  console.log('');
  console.log('Examples:');
  console.log('  npm run tests web');
  console.log('  npm run tests web -- -q');
  console.log('  npm run tests stats -- -c');
  process.exit(folder === '-h' || folder === '--help' ? 0 : 1);
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

// Ensure diagnostics folder exists
const diagnosticsPath = path.join(folderPath, 'diagnostics');
if (!fs.existsSync(diagnosticsPath)) {
  console.log(`📁 Creating diagnostics folder: ${folder}/diagnostics/`);
  fs.mkdirSync(diagnosticsPath, { recursive: true });
}

// Build command with remaining arguments passed through
const remainingArgs = args.slice(1).join(' ');
const excludeArgs = '-x lessons diagnostics';
const command = `node bin/run-all-tests.js ${folder} ${excludeArgs} ${remainingArgs}`;

console.log(`🧪 Running tests for: ${folder}/`);
console.log(`📊 Results will be saved to: ${folder}/diagnostics/`);
console.log('');

try {
  execSync(command, {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
} catch (error) {
  process.exit(error.status || 1);
}
