#!/usr/bin/env node

/*
 **********************************************************************
 * File       : bin/fix-html-format.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Post-processes HTML files after Prettier to fix HTML5 compliance issues:
 *   - Converts <!doctype html> to <!DOCTYPE html> (uppercase)
 *   - Removes self-closing slashes from void elements (e.g., <meta />, <link />)
 *   - Removes trailing whitespace from lines
 *   This ensures HTML files pass W3C validation.
 **********************************************************************
 */

import fs from 'fs';
import { glob } from 'glob/raw';

/**
 * Fix HTML5 compliance issues in a file
 * @param {string} filePath - Path to the HTML file
 * @returns {boolean} True if file was modified
 */
function fixHtmlFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Fix 1: Convert lowercase doctype to uppercase DOCTYPE
    content = content.replace(/<!doctype\s+html>/gi, '<!DOCTYPE html>');

    // Fix 2: Remove self-closing slashes from void elements
    // Void elements: area, base, br, col, embed, hr, img, input, link, meta, param, source, track, wbr
    const voidElements = [
      'area',
      'base',
      'br',
      'col',
      'embed',
      'hr',
      'img',
      'input',
      'link',
      'meta',
      'param',
      'source',
      'track',
      'wbr',
    ];

    voidElements.forEach((tag) => {
      // Match: <tag ... /> and replace with <tag ...>
      // This regex looks for the tag with any attributes and a self-closing slash
      const regex = new RegExp(`<${tag}([^>]*?)\\s*/>`, 'gi');
      content = content.replace(regex, `<${tag}$1>`);
    });

    // Fix 3: Remove trailing whitespace from each line
    content = content
      .split('\n')
      .map((line) => line.replace(/\s+$/, ''))
      .join('\n');

    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Main function to process all HTML files
 */
async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const folder = args[0] || '.';

  console.log(`🔧 Fixing HTML5 compliance issues in: ${folder}/`);

  // Find all HTML files in the specified folder, excluding lessons and diagnostics
  const pattern = folder === '.' ? '**/*.html' : `${folder}/**/*.html`;
  const htmlFiles = await glob(pattern, {
    ignore: ['node_modules/**', 'lessons/**', 'diagnostics/**', '**/lessons/**', '**/diagnostics/**'],
    nodir: true,
  });

  if (htmlFiles.length === 0) {
    console.log('No HTML files found to process.');
    return;
  }

  let modifiedCount = 0;

  for (const file of htmlFiles) {
    if (fixHtmlFile(file)) {
      modifiedCount++;
    }
  }

  if (modifiedCount > 0) {
    console.log(`✅ Fixed ${modifiedCount} HTML file${modifiedCount > 1 ? 's' : ''}`);
  } else {
    console.log('✅ All HTML files already compliant');
  }
}

// Run the script
main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
