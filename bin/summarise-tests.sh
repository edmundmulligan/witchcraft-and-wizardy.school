#!/bin/bash

# This script summarizes all test results and exits with error code if critical/serious issues found

RESULTS_DIR="tests/results"
EXIT_CODE=0

echo "📊 Test Results Summary"
echo "======================"
echo ""

# Check if results directory exists
if [ ! -d "$RESULTS_DIR" ]; then
  echo "⚠️  No results directory found"
  exit 0
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
    
    console.log('  Pages tested: ' + data.pages.length);
    console.log('  ❌ Errors: ' + totalErrors);
    console.log('  ⚠️  Alerts: ' + totalAlerts);
    console.log('  🎨 Contrast errors: ' + totalContrast);
    console.log('  Pages with errors: ' + pagesWithErrors);
    
    if (totalErrors > 0) {
      process.exit(1);
    }
  " && echo "" || { echo ""; EXIT_CODE=1; }
else
  echo "✅ WAVE: No errors found"
  echo ""
fi

# Final summary
echo "======================"
if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ All tests passed (no critical/serious issues)"
else
  echo "❌ Critical or serious accessibility issues found"
fi

exit $EXIT_CODE
