#!/usr/bin/env node

/**
 * Check for CSS classes used in HTML files that are not defined in any stylesheet
 */

import { readFileSync, readdirSync } from 'fs';
import { join, extname } from 'path';

/**
 * Recursively find all files with a given extension
 */
function findFiles(dir, extension, fileList = []) {
  try {
    const files = readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = join(dir, file.name);
      
      if (file.isDirectory()) {
        // Skip node_modules and hidden directories
        if (!file.name.startsWith('.') && file.name !== 'node_modules') {
          findFiles(fullPath, extension, fileList);
        }
      } else if (extname(file.name) === extension) {
        fileList.push(fullPath);
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }
  
  return fileList;
}

/**
 * Extract all class names from HTML content
 */
function extractClassesFromHTML(content) {
  const classes = new Set();
  
  // Match class="..." and class='...'
  const classRegex = /class=["']([^"']+)["']/g;
  let match;
  
  while ((match = classRegex.exec(content)) !== null) {
    // Split multiple classes and add each one
    const classNames = match[1].trim().split(/\s+/);
    classNames.forEach(cls => {
      if (cls) {
        classes.add(cls);
      }
    });
  }
  
  return classes;
}

/**
 * Extract all class definitions from CSS content
 */
function extractClassesFromCSS(content) {
  const classes = new Set();
  
  // Remove comments
  content = content.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Match class selectors (.classname)
  // This regex looks for . followed by valid class name characters
  const classRegex = /\.([a-zA-Z_-][a-zA-Z0-9_-]*)/g;
  let match;
  
  while ((match = classRegex.exec(content)) !== null) {
    classes.add(match[1]);
  }
  
  return classes;
}

/**
 * Main function
 */
function main() {
  const projectRoot = process.cwd();
  
  console.log('Scanning for HTML and CSS files...\n');
  
  // Find all HTML and CSS files
  const htmlFiles = findFiles(projectRoot, '.html');
  const cssFiles = findFiles(projectRoot, '.css');
  
  console.log(`Found ${htmlFiles.length} HTML files`);
  console.log(`Found ${cssFiles.length} CSS files\n`);
  
  // Extract all used classes from HTML files
  const usedClasses = new Map(); // className -> [files using it]
  
  for (const htmlFile of htmlFiles) {
    try {
      const content = readFileSync(htmlFile, 'utf-8');
      const classes = extractClassesFromHTML(content);
      
      for (const className of classes) {
        if (!usedClasses.has(className)) {
          usedClasses.set(className, []);
        }
        usedClasses.get(className).push(htmlFile.replace(projectRoot + '/', ''));
      }
    } catch (error) {
      console.error(`Error reading ${htmlFile}:`, error.message);
    }
  }
  
  console.log(`Found ${usedClasses.size} unique classes used in HTML files\n`);
  
  // Extract all defined classes from CSS files
  const definedClasses = new Set();
  
  for (const cssFile of cssFiles) {
    try {
      const content = readFileSync(cssFile, 'utf-8');
      const classes = extractClassesFromCSS(content);
      
      for (const className of classes) {
        definedClasses.add(className);
      }
    } catch (error) {
      console.error(`Error reading ${cssFile}:`, error.message);
    }
  }
  
  console.log(`Found ${definedClasses.size} unique classes defined in CSS files\n`);
  
  // Find undefined classes
  const undefinedClasses = [];
  
  for (const [className, files] of usedClasses) {
    if (!definedClasses.has(className)) {
      undefinedClasses.push({ className, files });
    }
  }
  
  // Report results
  if (undefinedClasses.length === 0) {
    console.log('✓ All classes used in HTML files are defined in stylesheets!');
  } else {
    console.log(`✗ Found ${undefinedClasses.length} undefined classes:\n`);
    
    // Sort by class name
    undefinedClasses.sort((a, b) => a.className.localeCompare(b.className));
    
    for (const { className, files } of undefinedClasses) {
      console.log(`  .${className}`);
      console.log(`    Used in: ${files.slice(0, 3).join(', ')}${files.length > 3 ? ` (and ${files.length - 3} more)` : ''}`);
      console.log();
    }
  }
  
  process.exit(undefinedClasses.length > 0 ? 1 : 0);
}

main();
