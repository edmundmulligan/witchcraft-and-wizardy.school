#!/usr/bin/env node

/*
 **********************************************************************
 * File       : audit-colour-usage.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License
 * Description:
 *   Audit all HTML and CSS files for colour usage
 *   Identifies hardcoded colours and non-theme-compliant colour references
 **********************************************************************
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Direct use of theme-specific variables is allowed in:
const THEME_SPECIFIC_ALLOWED_FILES = [
  'styles/definitions/colours.css', // Defines them
  'scripts/themeSwitcher.js', // Maps them
  'diagnostics/colourPalette.html', // Shows them
  'scripts/diagnostics/colourPalette.js', // Analyses them
  'styles/diagnostics/colourPalette.css', // Diagnostic stylesheet
];

// Files/folders exempt from colour compliance checks (diagnostic/test files)
const EXEMPT_FROM_COLOUR_CHECKS = [
  'diagnostics/', // All diagnostic/test pages
  'bin/', // Build and test scripts
  'styles/diagnostics', // Diagnostics/test styles
];

/**
 * Parse CLI arguments for this script.
 *
 * @returns {{excludeList: string[]}}
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const excludeItems = [];
  let folder = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '-h' || arg === '--help') {
      console.log('Usage: node bin/audit-colour-usage.js [folder] [options]');
      console.log('');
      console.log('Arguments:');
      console.log('  folder               Subfolder to audit (e.g. web, api). Defaults to entire repo.');
      console.log('');
      console.log('Options:');
      console.log('  -h, --help           Show this help message and exit');
      console.log('  -x, --exclude VALUE  Exclude one or more files/folders from the audit');
      process.exit(0);
    }

    if (arg === '-x' || arg === '--exclude') {
      i++;
      if (i >= args.length || args[i].startsWith('-')) {
        console.error('❌ Error: --exclude requires at least one file or folder');
        process.exit(1);
      }

      while (i < args.length && !args[i].startsWith('-')) {
        const splitItems = args[i]
          .split(/[\s,]+/)
          .map((item) => item.trim())
          .filter(Boolean);
        excludeItems.push(...splitItems);
        i++;
      }
      i--;
      continue;
    }

    if (!arg.startsWith('-')) {
      if (folder !== null) {
        console.error(`❌ Error: Unexpected argument '${arg}'`);
        process.exit(1);
      }
      folder = arg.replace(/\/+$/, '');
      continue;
    }

    console.error(`❌ Error: Unexpected argument '${arg}'`);
    process.exit(1);
  }

  const excludeList = excludeItems
    .map((item) => item.replace(/^\.\//, '').replace(/\/+$/, ''))
    .filter(Boolean);

  return { folder, excludeList };
}

/**
 * Check whether a file should be excluded by CLI exclude rules.
 *
 * @param {string} relativePath - Path relative to repository root.
 * @param {string[]} excludeList - Normalised exclude entries.
 * @returns {boolean}
 */
function matchesExcludeList(relativePath, excludeList) {
  if (excludeList.length === 0) {
    return false;
  }

  const normalisedPath = relativePath.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, '');
  const baseName = path.basename(normalisedPath);

  return excludeList.some((exclude) => {
    const normalisedExclude = exclude.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, '');
    const excludeBase = path.basename(normalisedExclude);
    return (
      normalisedPath === normalisedExclude ||
      normalisedPath.startsWith(`${normalisedExclude}/`) ||
      baseName === path.basename(normalisedExclude)
    );
  });
}

/**
 * Check if a file should be exempt from colour compliance checks
 * @param {string} filePath - Relative path to file
 * @returns {boolean} - True if file is exempt
 */
function isExemptFromColourChecks(filePath) {
  return EXEMPT_FROM_COLOUR_CHECKS.some((exempt) => filePath.startsWith(exempt));
}

/**
 * Check if a CSS file has an "Audit Colours: false" directive in its header comment
 * @param {string} content - File contents
 * @returns {boolean} - True if audit should be skipped
 */
function hasCssAuditSkip(content) {
  // Only check the leading header comment block
  const headerMatch = content.match(/^\s*\/\*[\s\S]*?\*\//);
  if (!headerMatch) return false;

  // Matches "Audit Colours: false" with arbitrary spacing (case-insensitive)
  return /Audit\s*Colours\s*:\s*false/i.test(headerMatch[0]);
}

/**
 * Check if an HTML file has a meta tag to skip the audit
 * @param {string} content - File contents
 * @returns {boolean} - True if audit should be skipped
 */
function hasHtmlAuditSkip(content) {
  // Find all meta tags
  const metaTags = content.match(/<meta\b[^>]*>/gi) || [];

  // Check if any meta tag has name="audit-colour-usage" and content="false"
  return metaTags.some((tag) => {
    const hasName = /\bname\s*=\s*["']audit-colour-usage["']/i.test(tag);
    const hasFalseContent = /\bcontent\s*=\s*["']false["']/i.test(tag);
    return hasName && hasFalseContent;
  });
}

/**
 * Scan a file for hardcoded colour literals that bypass the theme system.
 *
 * @remarks Preconditions:
 * - `content` should be the full text of the file referenced by `filePath`.
 * - The scan is heuristic and assumes one file can be processed entirely in memory.
 *
 * @param {string} filePath - Relative path used for reporting and exemption checks.
 * @param {string} content - File contents to analyse.
 * @returns {Array<object>} List of hardcoded-colour findings.
 */
function findHardcodedColours(filePath, content) {
  const issues = [];

  // Skip files exempt from colour checks
  if (isExemptFromColourChecks(filePath)) {
    return issues;
  }

  // Check for skip directives in the file content
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.css' && hasCssAuditSkip(content)) {
    return issues;
  }
  if ((ext === '.html' || ext === '.htm') && hasHtmlAuditSkip(content)) {
    return issues;
  }

  const lines = content.split('\n');

  // Regex patterns for hardcoded colours
  const patterns = [
    { type: 'Hex Colour', regex: /#[0-9a-fA-F]{3,6}(?![0-9a-fA-F])/g },
    { type: 'RGB', regex: /\brgb\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g },
    { type: 'RGBA', regex: /\brgba\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/g },
    { type: 'HSL', regex: /\bhsl\s*\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)/g },
    { type: 'HSLA', regex: /\bhsla\s*\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\)/g },
    {
      type: 'Named Colour',
      regex:
        /:\s*(black|white|red|blue|green|yellow|orange|purple|pink|gray|grey|cyan|magenta)\s*[;}]/gi,
    },
  ];

  patterns.forEach(({ type, regex }) => {
    let match;
    lines.forEach((line, lineNum) => {
      // Skip comments
      if (
        line.trim().startsWith('//') ||
        line.trim().startsWith('/*') ||
        line.trim().startsWith('*')
      ) {
        return;
      }

      regex.lastIndex = 0;
      while ((match = regex.exec(line)) !== null) {
        // Allow rgba/rgb for shadows and overlays with transparency
        if (
          (type === 'RGB' || type === 'RGBA') &&
          (line.includes('shadow') ||
            line.includes('overlay') ||
            line.includes('rgba(0 0 0') ||
            line.includes('rgb(0 0 0'))
        ) {
          continue;
        }

        // Allow #fff and #000 in some special cases
        if (
          type === 'Hex Colour' &&
          (match[0] === '#fff' || match[0] === '#000') &&
          line.includes('fallback')
        ) {
          continue;
        }

        // Skip hex patterns that are part of CSS ID selectors
        // ID selectors have additional identifier characters after the hex portion
        if (type === 'Hex Colour') {
          const matchEnd = match.index + match[0].length;
          const nextChar = line[matchEnd];
          // If followed by -, _, or any letter, it's likely an ID selector, not a colour
          if (nextChar && /[-_a-zA-Z]/.test(nextChar)) {
            continue;
          }
        }

        issues.push({
          file: filePath,
          line: lineNum + 1,
          type,
          value: match[0],
          context: line.trim(),
        });
      }
    });
  });

  return issues;
}

/**
 * Identify direct usage of theme-specific CSS variables outside the approved files.
 *
 * @remarks Preconditions:
 * - `content` should match the file referenced by `filePath`.
 * - The caller is responsible for excluding generated or third-party files.
 *
 * @param {string} filePath - Relative file path used for allow-list checks.
 * @param {string} content - File contents to analyse.
 * @returns {Array<object>} Theme-specific variable usage findings.
 */
function findThemeSpecificVars(filePath, content) {
  const issues = [];

  // Skip files exempt from colour checks
  if (isExemptFromColourChecks(filePath)) {
    return issues;
  }

  // Check for skip directives in the file content
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.css' && hasCssAuditSkip(content)) {
    return issues;
  }
  if ((ext === '.html' || ext === '.htm') && hasHtmlAuditSkip(content)) {
    return issues;
  }

  const lines = content.split('\n');

  // Check if this file is allowed to use theme-specific variables
  const isAllowed = THEME_SPECIFIC_ALLOWED_FILES.some((allowed) =>
    filePath.includes(allowed.replace('/', path.sep))
  );

  if (isAllowed) {
    return issues;
  }

  // Pattern for theme-specific variables
  const themeVarPattern = /--colour-(normal|subdued|vibrant)-(light|dark)-/g;

  lines.forEach((line, lineNum) => {
    if (
      line.trim().startsWith('//') ||
      line.trim().startsWith('/*') ||
      line.trim().startsWith('*')
    ) {
      return;
    }

    let match;
    themeVarPattern.lastIndex = 0;
    while ((match = themeVarPattern.exec(line)) !== null) {
      issues.push({
        file: filePath,
        line: lineNum + 1,
        type: 'Theme-Specific Variable',
        value: match[0] + '...',
        context: line.trim(),
        suggestion: 'Use generic variable from themeSwitcher instead',
      });
    }
  });

  return issues;
}

/**
 * Verify that an HTML page includes the CSS and JavaScript needed for theme switching.
 *
 * @remarks Preconditions:
 * - This function is intended for HTML files only.
 * - `content` should contain the complete HTML source for the page.
 *
 * @param {string} filePath - Relative HTML file path.
 * @param {string} content - HTML source to inspect.
 * @returns {{file: string, missing: {globals: boolean, themeSwitcher: boolean}}|null}
 * Missing-theme report or `null` when the page looks compliant.
 */
function checkFileLoadsThemeSystem(filePath, content) {
  if (!filePath.endsWith('.html')) {
    return null;
  }

  // Skip files exempt from colour checks
  if (isExemptFromColourChecks(filePath)) {
    return null;
  }

  // Check for skip directive in HTML content
  if (hasHtmlAuditSkip(content)) {
    return null;
  }

  const hasGlobalsCSS =
    content.includes('styles/globals.css') || content.includes('styles/colours.css');
  const hasThemeSwitcher = content.includes('scripts/themeSwitcher.js');

  if (!hasGlobalsCSS || !hasThemeSwitcher) {
    return {
      file: filePath,
      missing: {
        globals: !hasGlobalsCSS,
        themeSwitcher: !hasThemeSwitcher,
      },
    };
  }

  return null;
}

/**
 * Recursively collect files beneath a directory that match a set of extensions.
 *
 * @remarks Preconditions:
 * - `dir` must exist and be readable.
 * - The traversal intentionally skips large/generated directories listed in the function body.
 *
 * @param {string} dir - Root directory to walk.
 * @param {string[]} extensions - Allowed filename suffixes.
 * @returns {string[]} Matching file paths.
 */
function getAllFiles(dir, extensions, excludeList, rootDir, stats) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      // Skip node_modules, .git, diagnostics/test-results, etc.
      if (!['node_modules', '.git', 'diagnostics', 'artwork'].includes(file)) {
        // Check if directory matches exclude list
        const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');
        if (matchesExcludeList(relativePath, excludeList)) {
          // Don't increment stats.excluded here - we'll count files when we skip them
          return;
        }
        results = results.concat(getAllFiles(filePath, extensions, excludeList, rootDir, stats));
      }
    } else {
      if (extensions.some((ext) => file.endsWith(ext))) {
        const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');
        if (matchesExcludeList(relativePath, excludeList)) {
          stats.excluded++;
        } else {
          results.push(filePath);
        }
      }
    }
  });

  return results;
}

/**
 * Run the full colour-usage audit, print a human-readable summary, and write a JSON report.
 *
 * @remarks Preconditions:
 * - The repository root is assumed to be the parent of this script's directory.
 * - The caller must be able to write to `diagnostics/test-results/colour-audit-report.json`.
 *
 * @returns {void}
 */
function main() {
  const { folder, excludeList } = parseArgs();

  console.log('\n' + '='.repeat(100));
  console.log('colour usage AUDIT - Theme Compliance Check');
  console.log('='.repeat(100) + '\n');

  const rootDir = path.join(__dirname, '..');
  const scanDir = folder ? path.join(rootDir, folder) : rootDir;

  if (folder && !fs.existsSync(scanDir)) {
    console.error(`❌ Error: Folder '${folder}' does not exist.`);
    process.exit(1);
  }

  // Find all CSS and HTML files
  const stats = { excluded: 0 };
  const cssFiles = getAllFiles(scanDir, ['.css'], excludeList, rootDir, stats);
  const htmlFiles = getAllFiles(scanDir, ['.html'], excludeList, rootDir, stats);

  if (excludeList.length > 0) {
    console.log(`Excluding files/folders matching: ${excludeList.join(', ')}`);
    console.log(`Excluded files from scan: ${stats.excluded}\n`);
  }

  console.log(`Scanning ${cssFiles.length} CSS files and ${htmlFiles.length} HTML files...\n`);

  const allIssues = {
    hardcodedColours: [],
    themeSpecificVars: [],
    missingThemeSystem: [],
  };

  // Check CSS files
  cssFiles.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(rootDir, file);

    allIssues.hardcodedColours.push(...findHardcodedColours(relativePath, content));
    allIssues.themeSpecificVars.push(...findThemeSpecificVars(relativePath, content));
  });

  // Check HTML files
  htmlFiles.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(rootDir, file);

    allIssues.hardcodedColours.push(...findHardcodedColours(relativePath, content));
    allIssues.themeSpecificVars.push(...findThemeSpecificVars(relativePath, content));

    const missing = checkFileLoadsThemeSystem(relativePath, content);
    if (missing) {
      allIssues.missingThemeSystem.push(missing);
    }
  });

  // Report findings
  console.log('='.repeat(100));
  console.log('RESULTS');
  console.log('='.repeat(100) + '\n');

  if (allIssues.hardcodedColours.length > 0) {
    console.log(`❌ Found ${allIssues.hardcodedColours.length} hardcoded colour(s):\n`);
    allIssues.hardcodedColours.slice(0, 20).forEach((issue) => {
      console.log(`  ${issue.file}:${issue.line}`);
      console.log(`    Type: ${issue.type}`);
      console.log(`    Value: ${issue.value}`);
      console.log(`    Context: ${issue.context.substring(0, 80)}...`);
      console.log('');
    });
    if (allIssues.hardcodedColours.length > 20) {
      console.log(`  ... and ${allIssues.hardcodedColours.length - 20} more\n`);
    }
  } else {
    console.log('✅ No hardcoded colours found\n');
  }

  if (allIssues.themeSpecificVars.length > 0) {
    console.log(
      `⚠️  Found ${allIssues.themeSpecificVars.length} direct theme-specific variable usage(s):\n`
    );
    allIssues.themeSpecificVars.slice(0, 10).forEach((issue) => {
      console.log(`  ${issue.file}:${issue.line}`);
      console.log(`    Found: ${issue.value}`);
      console.log(`    Suggestion: ${issue.suggestion}`);
      console.log('');
    });
    if (allIssues.themeSpecificVars.length > 10) {
      console.log(`  ... and ${allIssues.themeSpecificVars.length - 10} more\n`);
    }
  } else {
    console.log('✅ No improper theme-specific variable usage found\n');
  }

  if (allIssues.missingThemeSystem.length > 0) {
    console.log(`⚠️  Found ${allIssues.missingThemeSystem.length} page(s) missing theme system:\n`);
    allIssues.missingThemeSystem.forEach((issue) => {
      console.log(`  ${issue.file}`);
      if (issue.missing.globals) {
        console.log(`    ❌ Missing: globals.css or colours.css`);
      }
      if (issue.missing.themeSwitcher) {
        console.log(`    ❌ Missing: themeSwitcher.js`);
      }
      console.log('');
    });
  } else {
    console.log('✅ All HTML pages load theme system correctly\n');
  }

  console.log('='.repeat(100));
  console.log('SUMMARY');
  console.log('='.repeat(100));
  console.log(`hardcoded colours: ${allIssues.hardcodedColours.length}`);
  console.log(`Theme-specific var usage: ${allIssues.themeSpecificVars.length}`);
  console.log(`Missing theme system: ${allIssues.missingThemeSystem.length}`);
  if (excludeList.length > 0) {
    console.log(`Excluded files: ${stats.excluded}`);
  }
  console.log('='.repeat(100) + '\n');

  // Write detailed report to file
  const reportBase = folder ? path.join(rootDir, folder) : rootDir;
  const reportDir = path.join(reportBase, 'diagnostics/test-results');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  const reportPath = path.join(reportDir, 'colour-audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(allIssues, null, 2));
  console.log(`Detailed report written to: ${reportPath}\n`);

  process.exit(
    allIssues.hardcodedColours.length +
      allIssues.themeSpecificVars.length +
      allIssues.missingThemeSystem.length
  );
}

main();
