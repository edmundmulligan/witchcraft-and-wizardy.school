#!/usr/bin/env node

/*
 **********************************************************************
 * File       : bin/build-by-folder.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Wrapper script to build assets for a specific folder
 **********************************************************************
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

// Parse command line arguments
const args = process.argv.slice(2);
let folder = null;

// Valid folders that can be built
const validFolders = ['web', 'stats', 'sound'];

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg === '-h' || arg === '--help') {
    console.log('Usage: npm run build <folder>');
    console.log('');
    console.log('Folders:');
    console.log('  web      Build web application assets');
    console.log('  stats    Build stats module assets');
    console.log('  sound    Build sound module assets');
    console.log('');
    console.log('Examples:');
    console.log('  npm run build web');
    console.log('  npm run build stats');
    process.exit(0);
  } else if (!arg.startsWith('-') && !folder) {
    folder = arg;
  }
}

// Show help if no folder provided
if (!folder) {
  console.error('❌ Error: No folder specified');
  console.error('');
  console.log('Usage: npm run build <folder>');
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

console.log(`🔨 Building assets for: ${folder}/`);
console.log('');

try {
  // Generate colors from CSS (only for web)
  if (folder === 'web') {
    console.log('🎨 Generating colors...');
    execSync('bin/generate-colours-from-css.py web/styles/definitions/colours.css artwork/common/colours.tex', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    console.log('🖼️  Generating backgrounds...');
    execSync('bin/generate-web-backgrounds.py', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    console.log('🖼️  Generating images...');
    execSync('bin/generate-all-images.sh', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    console.log('📚 Building lessons...');
    execSync('node bin/build-lessons.js', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
  }

  // Format code after building
  console.log('🎨 Formatting code...');
  execSync(`node bin/format-by-folder.js ${folder}`, {
    stdio: 'inherit',
    cwd: process.cwd(),
  });

  console.log('');
  console.log('✅ Build complete!');
} catch (error) {
  console.error('');
  console.error('❌ Build failed');
  process.exit(error.status || 1);
}
