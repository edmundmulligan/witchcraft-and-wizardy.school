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

// Parse command line arguments
const args = process.argv.slice(2);
let folder = null;
let excludeList = ['lessons', 'diagnostics']; // Default exclusions
let quickMode = false;
let runWave = false;
let continueMode = false;

// Valid folders that can be tested
const validFolders = ['web', 'stats', 'sound', 'api'];

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg === '-h' || arg === '--help') {
    console.log('Usage: npm run tests <folder> [options]');
    console.log('');
    console.log('Folders:');
    console.log('  web      Run tests for web application');
    console.log('  stats    Run tests for stats module');
    console.log('  sound    Run tests for sound module');
    console.log('  api      Run tests for API module');
    console.log('');
    console.log('Options:');
    console.log('  -c, --continue   Continue from last interrupted test run');
    console.log('  -q, --quick      Quick mode: skip Lighthouse and Wave tests');
    console.log('  -w, --run-wave   Include Wave accessibility tests');
    console.log('  -x, --exclude    Exclude specific files/folders (default: lessons diagnostics)');
    console.log('');
    console.log('Examples:');
    console.log('  npm run tests web');
    console.log('  npm run tests web -- -q');
    console.log('  npm run tests stats -- -c');
    console.log('  npm run tests web -- -x lessons diagnostics node_modules');
    process.exit(0);
  } else if (arg === '-c' || arg === '--continue') {
    continueMode = true;
  } else if (arg === '-q' || arg === '--quick') {
    quickMode = true;
  } else if (arg === '-w' || arg === '--run-wave') {
    runWave = true;
  } else if (arg === '-x' || arg === '--exclude') {
    i++;
    excludeList = [];
    while (i < args.length && !args[i].startsWith('-')) {
      excludeList.push(args[i]);
      i++;
    }
    i--; // Back up one since the loop will increment
  } else if (!arg.startsWith('-') && !folder) {
    folder = arg;
  }
}

// Show help if no folder provided
if (!folder) {
  console.error('❌ Error: No folder specified');
  console.error('');
  console.log('Usage: npm run tests <folder> [options]');
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

// Ensure diagnostics folder exists
const diagnosticsPath = path.join(folderPath, 'diagnostics');
if (!fs.existsSync(diagnosticsPath)) {
  console.log(`📁 Creating diagnostics folder: ${folder}/diagnostics/`);
  fs.mkdirSync(diagnosticsPath, { recursive: true });
}

// Build command with all flags
const commandParts = ['node', 'bin/run-all-tests.js', folder];

// Add exclude flag
if (excludeList.length > 0) {
  commandParts.push('-x', ...excludeList);
}

// Add other flags
if (continueMode) commandParts.push('-c');
if (quickMode) commandParts.push('-q');
if (runWave) commandParts.push('-w');

const command = commandParts.join(' ');

console.log(`🧪 Running tests for: ${folder}/`);
console.log(`📊 Results will be saved to: ${folder}/diagnostics/`);
if (excludeList.length > 0) {
  console.log(`🚫 Excluding: ${excludeList.join(', ')}`);
}
if (quickMode) console.log('⚡ Quick mode enabled');
if (continueMode) console.log('🔄 Continue mode enabled');
if (runWave) console.log('🌊 Wave tests included');
console.log('');

try {
  execSync(command, {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
} catch (error) {
  process.exit(error.status || 1);
}
