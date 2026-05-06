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
const validFolders = ['web', 'stats', 'sound', 'api'];

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg === '-h' || arg === '--help') {
    console.log('Usage: npm run build <folder>');
    console.log('');
    console.log('Folders:');
    console.log('  web      Build web application assets');
    console.log('  stats    Build stats module assets');
    console.log('  sound    Build sound module assets');
    console.log('  api      Build API server assets');
    console.log('');
    console.log('Examples:');
    console.log('  npm run build web');
    console.log('  npm run build stats');
    console.log('  npm run build sound');
    console.log('  npm run build api');
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

console.log(`🔨 Building assets for: ${folder}`);
console.log('');

// first generate the colours. This uses web colours as the source of truth, so it needs to be done before building any other assets
try {
  // Generate latex colours from CSS
  console.log('🎨 Generating latex colours...');
  execSync('bin/generate-colours-from-css.py web/styles/definitions/colours.css artwork/common/colours.tex', {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
} catch (error) {
  console.error('');
  console.error('❌ Generating latex colours from CSS failed');
  process.exit(error.status || 1);
}
console.log('');

// generate embodied mind logos
try {
  console.log('🖼️  Generating embodied mind logos...');
  execSync('bin/generate-logo-images.sh', {
    stdio: 'inherit',
    cwd: process.cwd(),
  });

  // copy generated logos to application folders if building web
  if (folder === 'web') {
    console.log('📁 Copying generated SVG logos to application folder...');
    const sourceDir = path.join(process.cwd(), 'artwork/generated/logos');
    const destDir = path.join(process.cwd(), folder, 'images', 'logos');
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.readdirSync(sourceDir).forEach(file => {
      if (file.endsWith('.svg')) {
        const sourceFile = path.join(sourceDir, file);
        const destFile = path.join(destDir, file);
        fs.copyFileSync(sourceFile, destFile);
      }
    });
  }
} catch (error) {
  console.error('');
  console.error('❌ Generating embodied mind logos failed');
  process.exit(error.status || 1);
}
console.log('');

if (folder === 'web') {
  try {
    // Generate backgrounds
    console.log('🖼️  Generating web backgrounds...');
    execSync('bin/generate-web-backgrounds.py', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
  } catch (error) {
    console.error('');
    console.error('❌ Generating web backgrounds failed');
    process.exit(error.status || 1);
  }

  // compile backgrounds
  try {
    console.log('🖼️  Compiling web backgrounds...');
    for (const orientation of ['landscape', 'portrait']) {
      for (const style of ['normal', 'subdued', 'vibrant']) {
        for (const mode of ['dark', 'light']) {
          const sourceFile = `background-web-${orientation}-${style}-${mode}`;
          execSync(`bin/tex-to-svg.sh artwork/source/backgrounds/web/${sourceFile} artwork/generated/web`, {
            stdio: 'inherit',
            cwd: process.cwd(),
          });
        }
      }
    }

  // copy generated backgrounds to application folders
  console.log('📁 Copying generated SVG backgrounds to application folder...');
    const sourceDir = path.join(process.cwd(), 'artwork/generated/web');
    const destDir = path.join(process.cwd(), folder, 'images', 'backgrounds');
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.readdirSync(sourceDir).forEach(file => {
      if (file.endsWith('.svg')) {
        const sourceFile = path.join(sourceDir, file);
        const destFile = path.join(destDir, file);
        fs.copyFileSync(sourceFile, destFile);
      }
    });
  } catch (error) {
    console.error('');
    console.error('❌ Compiling web backgrounds failed');
    process.exit(error.status || 1);
  }
}

// Build lessons
try {
  console.log('📚 Building lessons...');
  execSync(`node bin/build-lessons.js ${folder}`, {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
} catch (error) {
  console.error('');
  console.error('❌ Building lessons failed');
  process.exit(error.status || 1);
}

console.log('');
console.log('✅ Build complete!');
process.exit(0);