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

import path from 'path';
import fs from 'fs';
import express from 'express';

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

// Default to the web app when no folder is provided.
if (!folder) {
  folder = 'web';
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

const app = express();

const staticOptions = {
  etag: false,
  lastModified: false,
  maxAge: 0,
  setHeaders(res) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  },
};

// Serve the selected app folder at root (/) as the canonical path.
app.use(express.static(folderPath, staticOptions));

// Also serve it at /<folder>/ so old bookmarks and habits still work.
app.use(`/${folder}`, express.static(folderPath, staticOptions));

app.listen(port, '0.0.0.0', () => {
  console.log(`Serving ${folderPath}`);
  console.log('Available on:');
  console.log(`  http://127.0.0.1:${port}`);
  console.log('Hit CTRL-C to stop the server');
});
