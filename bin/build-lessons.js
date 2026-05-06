#!/usr/bin/env node
/*
 **********************************************************************
 * File       : bin/build-lessons.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *     Build script for generating lesson HTML files from Mustache templates
 *
 *     Usage: npm run build
 *
 *     This script:
 *       1. Reads template files from templates/
 *       2. Reads data files from data/
 *       3. Generates HTML output files in students/ and mentors/
 *       4. Uses Mustache for templating
 **********************************************************************
 */

import fs from 'fs';
import path from 'path';
import Mustache from 'mustache';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

async function loadData(dataPath) {
  const ext = path.extname(dataPath).toLowerCase();

  if (ext === '.cjs') {
    // For CommonJS files, use require
    const resolvedPath = path.resolve(dataPath);
    // Clear cache for fresh reads during development
    delete require.cache[require.resolve(resolvedPath)];
    return require(resolvedPath);
  } else if (ext === '.js') {
    // For ES modules, use dynamic import
    const resolvedPath = path.resolve(dataPath);
    const module = await import(`file://${resolvedPath}?update=${Date.now()}`);
    return module.default || module;
  }

  const dataStr = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(dataStr);
}

// Define the build tasks (student versions only)
const buildTasks = [
  {
    lesson: 0,
    studentTemplate: 'templates/lesson-00-student.mustache',
    studentData: 'data/lesson-00-student.cjs',
    studentOutput: 'students/lesson-00.html',
  },
  // Add more lessons as needed
];

/**
 * Preprocess data to add os_id to nested tool objects
 * This fixes Mustache scoping issues where os_id isn't accessible in nested contexts
 * @param {Object} data - The lesson data object
 * @returns {Object} The preprocessed data
 */
function preprocessData(data) {
  // Clone the data to avoid modifying the original
  const processedData = JSON.parse(JSON.stringify(data));

  // Add os_id to each tool in developer_platforms
  if (processedData.developer_platforms) {
    processedData.developer_platforms.forEach((platform) => {
      if (platform.tools && platform.os_id) {
        platform.tools.forEach((tool) => {
          tool.os_id = platform.os_id;
        });
      }
    });
  }

  return processedData;
}

/**
 * Build a single lesson (student version only)
 * @param {Object} task - The build task configuration
 */
async function buildLesson(task) {
  console.log(`Building Lesson ${task.lesson}...`);

  try {
    // Read template and data for student version
    if (fs.existsSync(task.studentTemplate) && fs.existsSync(task.studentData)) {
      const template = fs.readFileSync(task.studentTemplate, 'utf8');
      const data = await loadData(task.studentData);

      // Preprocess data to fix Mustache scoping issues
      const processedData = preprocessData(data);

      // Render using Mustache
      const output = Mustache.render(template, processedData);

      // Write output file
      fs.writeFileSync(task.studentOutput, output, 'utf8');
      console.log(`✓ Generated ${task.studentOutput}`);
    } else {
      console.log(`⚠ Skipping student version (template or data not found)`);
    }
  } catch (error) {
    console.error(`✗ Error building Lesson ${task.lesson}: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Main build function
 */
async function build() {
  console.log('🔨 Building lessons from templates...\n');

  for (const task of buildTasks) {
    await buildLesson(task);
  }

  console.log('\n✓ Build complete!');
}

// Run the build
build();
