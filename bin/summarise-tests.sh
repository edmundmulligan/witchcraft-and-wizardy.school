#!/bin/bash

# This script summarizes all test results and exits with error code if critical/serious issues found

RESULTS_DIR="tests/results"
EXIT_CODE=0
OUTPUT_FILE="$RESULTS_DIR/test-summary.txt"

# Run the main script logic in a subshell and capture output
{

echo "📊 Test Results Summary"
echo "======================"
echo ""

# Check if results directory exists
if [ ! -d "$RESULTS_DIR" ]; then
  echo "⚠️  No results directory found"
  exit 0
fi

# Check Validation results
if [ -f "$RESULTS_DIR/validation-results.json" ]; then
  echo "📄 Code Validation Results:"
  node -e "
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync('$RESULTS_DIR/validation-results.json', 'utf8'));

    const totalErrors = data.summary.htmlErrors + data.summary.cssErrors;
    const totalWarnings = data.summary.htmlWarnings + data.summary.cssWarnings;

    console.log('  Files with issues: ' + data.files.length);
    console.log('  HTML errors: ' + data.summary.htmlErrors);
    console.log('  CSS errors: ' + data.summary.cssErrors);
    console.log('  Total errors: ' + totalErrors);
    console.log('  Total warnings: ' + totalWarnings);

    if (totalErrors > 0) {
      process.exit(1);
    }
  " && echo "" || { echo ""; EXIT_CODE=1; }
else
  echo "📄 Code Validation: No errors found"
  echo ""
fi

# Check Broken Links results
if [ -f "$RESULTS_DIR/broken-links-results.json" ]; then
  echo "🔗 Broken Links Results:"
  node -e "
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync('$RESULTS_DIR/broken-links-results.json', 'utf8'));

    console.log('  Pages checked: ' + data.pages.length);
    console.log('  Total links: ' + data.summary.totalLinks);
    console.log('  Broken links: ' + data.summary.brokenLinks);

    if (data.summary.brokenLinks > 0) {
      console.log('  Pages with broken links: ' + data.pages.filter(p => p.brokenCount > 0).length);
      process.exit(1);
    }
  " && echo "" || { echo ""; EXIT_CODE=1; }
else
  echo "🔗 Broken Links: No broken links found"
  echo ""
fi

# Final summary
echo "======================"
if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ All tests passed (no critical/serious issues)"
else
  echo "❌ Critical or serious accessibility issues found"
fi

# Check Browser Compatibility results
if [ -f "$RESULTS_DIR/browser-results.json" ]; then
  echo "🌐 Browser Compatibility Results:"
  node -e "
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync('$RESULTS_DIR/browser-results.json', 'utf8'));

    console.log('  Browsers tested: ' + data.browsers.length);
    console.log('  Passed: ' + data.summary.passed);
    console.log('  Failed: ' + data.summary.failed);

    if (data.summary.failed > 0) {
      console.log('  Failed browsers:');
      data.browsers.filter(b => b.status === 'failed').forEach(b => {
        console.log('    ❌ ' + b.name + ': ' + b.error);
      });
      process.exit(1);
    }
  " && echo "" || { echo ""; EXIT_CODE=1; }
else
  echo "🌐 Browser Compatibility: Not tested"
  echo ""
fi

# Check Axe results
if [ -f "$RESULTS_DIR/axe-results.json" ]; then
  echo "🔍 Axe Accessibility Results:"
  node -e "
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync('$RESULTS_DIR/axe-results.json', 'utf8'));
    const total = data.violations.length;
    const critical = data.violations.filter(v => v.impact === 'critical').length;
    const serious = data.violations.filter(v => v.impact === 'serious').length;
    const moderate = data.violations.filter(v => v.impact === 'moderate').length;
    const minor = data.violations.filter(v => v.impact === 'minor').length;

    console.log('  Total violations: ' + total);
    console.log('  🔴 Critical: ' + critical);
    console.log('  🟠 Serious: ' + serious);
    console.log('  🟡 Moderate: ' + moderate);
    console.log('  ⚪ Minor: ' + minor);

    if (critical > 0 || serious > 0) {
      process.exit(1);
    }
  " && echo "" || { echo ""; EXIT_CODE=1; }
else
  echo "✅ Axe: No violations found"
  echo ""
fi

# Check Lighthouse results
if [ -f "$RESULTS_DIR/lighthouse-results.json" ]; then
  echo "💡 Lighthouse Accessibility Results:"
  node -e "
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync('$RESULTS_DIR/lighthouse-results.json', 'utf8'));
    const avgScore = data.pages.reduce((sum, p) => sum + p.score, 0) / data.pages.length;
    const totalFailures = data.pages.reduce((sum, p) => sum + p.failedAudits.length, 0);
    const pagesWithIssues = data.pages.filter(p => p.failedAudits.length > 0).length;

    console.log('  Pages tested: ' + data.pages.length);
    console.log('  Average score: ' + Math.round(avgScore * 100) + '%');
    console.log('  Pages with issues: ' + pagesWithIssues);
    console.log('  Total failed audits: ' + totalFailures);

    if (avgScore < 0.9) {
      process.exit(1);
    }
  " && echo "" || { echo ""; EXIT_CODE=1; }
else
  echo "✅ Lighthouse: No issues found"
  echo ""
fi

# Check Pa11y results
if [ -f "$RESULTS_DIR/pa11y-results.json" ]; then
  echo "🔬 Pa11y Accessibility Results:"
  node -e "
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync('$RESULTS_DIR/pa11y-results.json', 'utf8'));
    const totalErrors = data.pages.reduce((sum, p) => sum + p.issues.filter(i => i.type === 'error').length, 0);
    const totalWarnings = data.pages.reduce((sum, p) => sum + p.issues.filter(i => i.type === 'warning').length, 0);
    const pagesWithErrors = data.pages.filter(p => p.issues.some(i => i.type === 'error')).length;

    console.log('  Pages tested: ' + data.pages.length);
    console.log('  ❌ Errors: ' + totalErrors);
    console.log('  ⚠️  Warnings: ' + totalWarnings);
    console.log('  Pages with errors: ' + pagesWithErrors);

    if (totalErrors > 0) {
      process.exit(1);
    }
  " && echo "" || { echo ""; EXIT_CODE=1; }
else
  echo "✅ Pa11y: No errors found"
  echo ""
fi

# Check WAVE results
if [ -f "$RESULTS_DIR/wave-results.json" ]; then
  echo "🌊 WAVE Accessibility Results:"
  node -e "
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync('$RESULTS_DIR/wave-results.json', 'utf8'));
    const totalErrors = data.pages.reduce((sum, p) => sum + p.errors, 0);
    const totalAlerts = data.pages.reduce((sum, p) => sum + p.alerts, 0);
    const totalContrast = data.pages.reduce((sum, p) => sum + p.contrast, 0);
    const pagesWithErrors = data.pages.filter(p => p.errors > 0).length;
    const pagesWithAlerts = data.pages.filter(p => p.alerts > 0).length;

    console.log('  Pages tested: ' + data.pages.length);
    console.log('  ❌ Errors: ' + totalErrors);
    console.log('  ⚠️  Alerts: ' + totalAlerts);
    console.log('  🎨 Contrast errors: ' + totalContrast);

    if (totalErrors > 0) {
      console.log('  Pages with errors: ' + pagesWithErrors);
    }
    if (totalAlerts > 0) {
      console.log('  Pages with alerts: ' + pagesWithAlerts);
    }

    if (totalErrors > 0) {
      process.exit(1);
    }
  " && echo "" || { echo ""; EXIT_CODE=1; }
else
  echo "🌊 WAVE: Not tested or no errors found"
  echo ""
fi

# Check Readability results
if [ -f "$RESULTS_DIR/readability-results.json" ]; then
  echo "📖 Reading Age Results:"
  node -e "
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync('$RESULTS_DIR/readability-results.json', 'utf8'));

    if (data.pages.length === 0) {
      console.log('  No pages analyzed');
    } else {
      const avgGrade = data.pages.reduce((sum, p) => sum + p.averageGradeLevel, 0) / data.pages.length;
      const totalWords = data.pages.reduce((sum, p) => sum + p.wordCount, 0);
      const difficult = data.pages.filter(p => p.averageGradeLevel > 12);

      console.log('  Pages analyzed: ' + data.pages.length);
      console.log('  Total words: ' + totalWords);
      console.log('  Average grade level: ' + Math.round(avgGrade * 10) / 10);

      if (difficult.length > 0) {
        console.log('  ⚠️  College-level pages: ' + difficult.length);
      } else {
        console.log('  ✅ All pages at high school level or below');
      }
    }
  "
  echo ""
else
  echo "📖 Reading Age: Not tested"
  echo ""
fi

} | tee >(sed 's/📊/[Test Results]/g; s/📄/[Code]/g; s/🔗/[Links]/g; s/✅/[OK]/g; s/❌/[X]/g; s/🌐/[Browser]/g; s/🔍/[Axe]/g; s/🔴/[Critical]/g; s/🟠/[Serious]/g; s/🟡/[Moderate]/g; s/⚪/[Minor]/g; s/💡/[Lighthouse]/g; s/🔬/[Pa11y]/g; s/⚠️/[Warning]/g; s/🌊/[WAVE]/g; s/🎨/[Contrast]/g; s/📖/[Reading]/g' > "$OUTPUT_FILE")

exit $EXIT_CODE
