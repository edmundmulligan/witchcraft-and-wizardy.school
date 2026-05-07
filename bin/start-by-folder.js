#!/usr/bin/env node

/*
 **********************************************************************
 * File       : bin/start-by-folder.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Wrapper script to start a dev server for a specific folder
 **********************************************************************
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

// Parse command line arguments
const args = process.argv.slice(2);
let folder = null;
let port = 8000;

// Valid folders that can be served
const validFolders = ['web', 'stats', 'sound', 'api'];

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg === '-h' || arg === '--help') {
    console.log('Usage: npm run start <folder> [-- -p port]');
    console.log('       npm run dev <folder> [-- -p port]');
    console.log('');
    console.log('Folders:');
    console.log('  web      Start server for web application');
    console.log('  stats    Start server for stats module');
    console.log('  sound    Start server for sound module');
    console.log('');
    console.log('Options:');
    console.log('  -p, --port   Port number (default: 8000)');
    console.log('');
    console.log('Examples:');
    console.log('  npm run start web');
    console.log('  npm run dev web -- -p 3000');
    process.exit(0);
  } else if (arg === '-p' || arg === '--port') {
    i++;
    if (i < args.length) {
      port = parseInt(args[i], 10);
      if (isNaN(port)) {
        console.error('❌ Error: Port must be a number');
        process.exit(1);
      }
    }
  } else if (!arg.startsWith('-') && !folder) {
    folder = arg;
  }
}

// Show help if no folder provided
if (!folder) {
  console.error('❌ Error: No folder specified');
  console.error('');
  console.log('Usage: npm run start <folder>');
  console.log('');
  console.log('Folders: web, stats, sound');
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

console.log(`🚀 Starting dev server for: ${folder}/`);
console.log(`📡 Server will run on: http://localhost:${port}`);
console.log('');

try {
  // Start http-server in the specified folder
  execSync(`http-server ${folder} -p ${port} -c-1`, {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
} catch (error) {
  process.exit(error.status || 1);
}
