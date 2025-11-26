#!/bin/bash

# This script validates accessibility using axe-core CLI.
# It starts a local web server if one is not running.

# Source common helper functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

# Get any command line options
TEST_URL="http://localhost:8080"
parse_test_options "$@"

# Silently install dependencies if not already installed
npm install -g @axe-core/cli serve > /dev/null 2>&1

# Start server and setup
start_server_if_needed "$TEST_URL"
setup_results_dir
discover_html_pages

# Initialize combined results
echo '{"violations":[],"passes":[],"incomplete":[]}' > "$RESULTS_DIR/axe-results.json"

# Test each page
TESTED=0
for page in $PAGES; do
  TESTED=$((TESTED + 1))
  # Convert file path to URL path
  URL_PATH="${page#./}"
  FULL_URL="$TEST_URL/$URL_PATH"
  
  echo "[$TESTED/$PAGE_COUNT] Testing $URL_PATH"
  
  # Run axe on this page
  TEMP_RESULT="$RESULTS_DIR/axe-temp-$TESTED.json"
  axe "$FULL_URL" --save "$TEMP_RESULT" 2>&1 | grep -E "(violations|Testing|Saved)" || true
  
  # Merge violations into combined results if file exists
  if [ -f "$TEMP_RESULT" ]; then
    node -e "
      try {
        const fs = require('fs');
        const combined = JSON.parse(fs.readFileSync('$RESULTS_DIR/axe-results.json'));
        const newData = JSON.parse(fs.readFileSync('$TEMP_RESULT'));
        
        // Axe saves results as an array [{violations: [...]}]
        const result = Array.isArray(newData) ? newData[0] : newData;
        
        // Add page URL to each violation
        if (result.violations && result.violations.length > 0) {
          result.violations.forEach(v => {
            v.pageUrl = '$URL_PATH';
            combined.violations.push(v);
          });
        }
        
        fs.writeFileSync('$RESULTS_DIR/axe-results.json', JSON.stringify(combined, null, 2));
        fs.unlinkSync('$TEMP_RESULT');
      } catch (e) {
        console.error('Error merging results:', e.message);
      }
    "
  fi
done

# Stop server if we started it
stop_server_if_started

# Parse and display summary of results using node
RESULT_FILE="$RESULTS_DIR/axe-results.json"
echo ""
echo "📊 Analysis Summary:"

node -e "
  const data = JSON.parse(require('fs').readFileSync('$RESULT_FILE'));
  const total = data.violations.length;
  
  // Count by impact
  const bySeverity = {
    critical: data.violations.filter(v => v.impact === 'critical').length,
    serious: data.violations.filter(v => v.impact === 'serious').length,
    moderate: data.violations.filter(v => v.impact === 'moderate').length,
    minor: data.violations.filter(v => v.impact === 'minor').length
  };
  
  // Count contrast issues
  const contrastIssues = data.violations.filter(v => v.id === 'color-contrast').length;
  
  console.log('  Total violations: ' + total);
  console.log('  🔴 Critical: ' + bySeverity.critical);
  console.log('  🟠 Serious: ' + bySeverity.serious);
  console.log('  🟡 Moderate: ' + bySeverity.moderate);
  console.log('  ⚪ Minor: ' + bySeverity.minor);
  if (contrastIssues > 0) {
    console.log('  🎨 Color Contrast Issues: ' + contrastIssues);
  }
  console.log('');
" 

if [ "$TOTAL_VIOLATIONS" -eq 0 ]; then
  echo "✅ No accessibility violations found across all pages."
else
  echo "❌ Accessibility violations found:"
  echo ""
  
  # Display violations grouped by type
  node -e "
    const data = JSON.parse(require('fs').readFileSync('$RESULT_FILE'));
    
    // Group by violation ID
    const grouped = {};
    data.violations.forEach(v => {
      if (!grouped[v.id]) {
        grouped[v.id] = {
          impact: v.impact,
          description: v.description,
          help: v.help,
          pages: []
        };
      }
      grouped[v.id].pages.push(v.pageUrl || 'unknown');
    });
    
    // Display grouped violations
    Object.keys(grouped).forEach(id => {
      const v = grouped[id];
      const icon = v.impact === 'critical' ? '🔴' : v.impact === 'serious' ? '🟠' : v.impact === 'moderate' ? '🟡' : '⚪';
      const isContrast = id === 'color-contrast' ? ' 🎨' : '';
      
      console.log(icon + isContrast + ' ' + id + ' (' + v.impact + ')');
      console.log('  Description: ' + v.description);
      console.log('  Help: ' + v.help);
      console.log('  Affected pages: ' + v.pages.join(', '));
      console.log('');
    });
  "
fi

exit 0
