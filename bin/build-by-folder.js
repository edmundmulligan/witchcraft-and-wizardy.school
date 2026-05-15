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

function copySharedStylesToApp(folder) {
  if (!['web', 'stats', 'sound'].includes(folder)) {
    return;
  }

  const repoRoot = process.cwd();
  const commonStylesDir = path.join(repoRoot, 'common', 'styles');
  const appStylesDir = path.join(repoRoot, folder, 'styles');

  if (!fs.existsSync(commonStylesDir)) {
    console.error(`❌ Error: Shared styles folder does not exist: ${commonStylesDir}`);
    process.exit(1);
  }

  fs.mkdirSync(path.join(appStylesDir, 'definitions'), { recursive: true });
  fs.mkdirSync(path.join(appStylesDir, 'utilities'), { recursive: true });

  fs.copyFileSync(
    path.join(commonStylesDir, 'globals.css'),
    path.join(appStylesDir, 'globals.css'),
  );

  const definitionFiles = fs.readdirSync(path.join(commonStylesDir, 'definitions'));
  definitionFiles.forEach((file) => {
    fs.copyFileSync(
      path.join(commonStylesDir, 'definitions', file),
      path.join(appStylesDir, 'definitions', file),
    );
  });

  const utilityFiles = fs.readdirSync(path.join(commonStylesDir, 'utilities'));
  utilityFiles.forEach((file) => {
    fs.copyFileSync(
      path.join(commonStylesDir, 'utilities', file),
      path.join(appStylesDir, 'utilities', file),
    );
  });

  if (folder === 'stats' || folder === 'sound') {
    fs.copyFileSync(
      path.join(commonStylesDir, 'main.css'),
      path.join(appStylesDir, 'main.css'),
    );
  }
}

function copyCleanUrlHtmlFiles(rootDir) {
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      copyCleanUrlHtmlFiles(entryPath);
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith('.html')) {
      continue;
    }

    const cleanUrlPath = path.join(rootDir, entry.name.replace(/\.html$/, ''));

    if (fs.existsSync(cleanUrlPath) && fs.statSync(cleanUrlPath).isDirectory()) {
      continue;
    }

    fs.copyFileSync(entryPath, cleanUrlPath);
  }
}

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

try {
  console.log('🎨 Syncing shared styles...');
  copySharedStylesToApp(folder);
} catch (error) {
  console.error('');
  console.error('❌ Syncing shared styles failed');
  process.exit(error.status || 1);
}
console.log('');

// first generate the colours. This uses common styles as the source of truth, so it needs to be done before building any other assets
try {
  // Generate latex colours from CSS
  console.log('🎨 Generating latex colours...');
  execSync('bin/generate-colours-from-css.py common/styles/definitions/colours.css artwork/common/colours.tex', {
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
  } catch (error) {
    console.error('');
    console.error('❌ Compiling web backgrounds failed');
    process.exit(error.status || 1);
  }
}

// Copy generated background SVGs to the application folder.
// All three apps (web, stats, sound) share the same background artwork.
// The SVGs are compiled once (by `npm run build web`) into artwork/generated/web/,
// then distributed here to whichever app is being built.
if (['web', 'stats', 'sound'].includes(folder)) {
  try {
    console.log('📁 Copying generated SVG backgrounds to application folder...');
    const backgroundSourceDir = path.join(process.cwd(), 'artwork/generated/web');
    const svgFiles = fs.existsSync(backgroundSourceDir)
      ? fs.readdirSync(backgroundSourceDir).filter((f) => f.endsWith('.svg'))
      : [];
    if (svgFiles.length === 0) {
      console.error('');
      console.error('❌ No background SVGs found in artwork/generated/web/');
      console.error('   Run `npm run build web` first to compile the background artwork.');
      process.exit(1);
    }
    const backgroundDestDir = path.join(process.cwd(), folder, 'images', 'backgrounds');
    fs.mkdirSync(backgroundDestDir, { recursive: true });
    svgFiles.forEach((file) => {
      fs.copyFileSync(path.join(backgroundSourceDir, file), path.join(backgroundDestDir, file));
    });
  } catch (error) {
    console.error('');
    console.error('❌ Copying background SVGs failed');
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

if (folder === 'web') {
  try {
    console.log('🔗 Creating clean URL HTML copies...');
    copyCleanUrlHtmlFiles(path.join(process.cwd(), folder));
  } catch (error) {
    console.error('');
    console.error('❌ Creating clean URL HTML copies failed');
    process.exit(error.status || 1);
  }
}

console.log('');
console.log('✅ Build complete!');
process.exit(0);