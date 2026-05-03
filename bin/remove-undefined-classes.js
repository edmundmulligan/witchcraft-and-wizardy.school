#!/usr/bin/env node

/**
 * Remove CSS classes that are not defined in any stylesheet
 * Keeps FontAwesome classes and JavaScript-dependent classes
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, extname } from 'path';

// Classes to keep even though not defined locally
const KEEP_CLASSES = new Set([
  // FontAwesome classes (external library)
  'fas', 'fa-duotone', 'fa-spinner', 'fa-sync-alt', 'fa-spin',
  'fa-chart-line', 'fa-code', 'fa-font', 'fa-images', 'fa-palette',
  'fa-swatchbook', 'fa-wrench', 'fa-circle-question', 'fa-play',
  
  // JavaScript-dependent classes
  'code-snippet-container'
]);

// Classes to remove (undefined and not needed)
const REMOVE_CLASSES = new Set([
  'about-course', 'about-sender', 'sender-feedback',
  'be-curious',
  'challenges-content', 'learning-outcomes-content', 'resources-content',
  'tools-content', 'warnings-content',
  'conclusion', 'introduction',
  'credits', 'license',
  'description-lists', 'ordered-lists', 'unordered-lists', 'lists', 'lists-code',
  'downloading-images', 'images', 'images-code', 'types-of-images',
  'exploring-vsc', 'first-code', 'your-first-web-page',
  'feedback-form', 'feedback-form-item',
  'fourth-web-page', 'second-web-page', 'third-web-page',
  'gallery', 'familiar-name', 'prev',
  'faq-question-title', 'faq-section-title',
  'hover-state',
  'hyperlink-code', 'hyperlinks', 'types-of-hyperlinks',
  'landmark-elements', 'landmark-elements-code', 'landmark-elements-types',
  'lesson-install-android', 'lesson-install-chromebook', 'lesson-install-ios',
  'lesson-install-linux', 'lesson-install-macos', 'lesson-install-windows',
  'platform-description',
  'student-information',
  'table-code', 'tables',
  'tool-content',
  'warning-container', 'warning-content',
  'what-does-it-mean',
  'why-use-lists'
]);

/**
 * Recursively find all HTML files
 */
function findHTMLFiles(dir, fileList = []) {
  try {
    const files = readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = join(dir, file.name);
      
      if (file.isDirectory()) {
        if (!file.name.startsWith('.') && file.name !== 'node_modules') {
          findHTMLFiles(fullPath, fileList);
        }
      } else if (extname(file.name) === '.html') {
        fileList.push(fullPath);
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }
  
  return fileList;
}

/**
 * Remove specified classes from class attribute
 */
function removeClassesFromAttribute(classAttr, classesToRemove) {
  const classes = classAttr.split(/\s+/).filter(cls => cls && !classesToRemove.has(cls));
  return classes.join(' ');
}

/**
 * Process HTML file and remove unused classes
 */
function processHTMLFile(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  let modified = false;
  let removedCount = 0;
  
  // Replace class attributes
  content = content.replace(/class=["']([^"']+)["']/g, (match, classAttr) => {
    const newClassAttr = removeClassesFromAttribute(classAttr, REMOVE_CLASSES);
    
    if (newClassAttr !== classAttr) {
      modified = true;
      const oldClasses = classAttr.split(/\s+/);
      const newClasses = newClassAttr.split(/\s+/);
      removedCount += oldClasses.length - newClasses.length;
      
      // If no classes remain, remove the attribute entirely
      if (newClassAttr === '') {
        return '';
      }
      
      // Preserve quote style
      const quote = match.includes('"') ? '"' : "'";
      return `class=${quote}${newClassAttr}${quote}`;
    }
    
    return match;
  });
  
  // Clean up empty class attributes that might remain
  content = content.replace(/\s+class=["']["']/g, '');
  
  if (modified) {
    writeFileSync(filePath, content, 'utf-8');
    return removedCount;
  }
  
  return 0;
}

/**
 * Main function
 */
function main() {
  const projectRoot = process.cwd();
  
  console.log('Finding HTML files...\n');
  
  const htmlFiles = findHTMLFiles(projectRoot);
  console.log(`Found ${htmlFiles.length} HTML files\n`);
  
  console.log(`Removing ${REMOVE_CLASSES.size} undefined classes...\n`);
  
  let totalRemoved = 0;
  let filesModified = 0;
  
  for (const htmlFile of htmlFiles) {
    const removed = processHTMLFile(htmlFile);
    if (removed > 0) {
      filesModified++;
      totalRemoved += removed;
      const relativePath = htmlFile.replace(projectRoot + '/', '');
      console.log(`  ✓ ${relativePath} - removed ${removed} class reference${removed > 1 ? 's' : ''}`);
    }
  }
  
  console.log(`\n✓ Complete!`);
  console.log(`  Modified: ${filesModified} files`);
  console.log(`  Removed: ${totalRemoved} class references`);
}

main();
