#!/bin/bash

# This script validates accessibility using axe-core CLI.
# It assumes that a local web server is running to serve the website.

# Define function to parse command line options
getopt() {
  local OPTIND
  while getopts ":hu:" opt
  do
    case $opt in
      h)
        echo "Usage: $0 [-h] [-u URL]"
        echo "  -h        Show this help message and exit"
        echo "  -u URL    Specify the URL of the local web server to test (default: http://localhost:8080)"
        exit 0
        ;;
      u)
        TEST_URL="$OPTARG"
        ;;
      \?)
        echo "Invalid option: -$OPTARG" >&2
        exit 1
        ;;

    esac
  done
}

# Get any command line options
TEST_URL="http://localhost:8080"
getopt "$@"

# Silently install dependencies if not already installed
npm install -g @axe-core/cli > /dev/null 2>&1

# Check if server is running
if ! curl -s -f "$TEST_URL" > /dev/null 2>&1
then
  echo "⚠️  No server detected at $TEST_URL"
  echo "Starting local server..."
  npx serve . -l 8080 > /dev/null 2>&1 &
  SERVER_PID=$!
  sleep 2
  STOP_SERVER=true
else
  echo "✓ Server is running at $TEST_URL"
  STOP_SERVER=false
fi

# Discover all HTML pages to test
RESULTS_DIR="tests/results"
mkdir -p "$RESULTS_DIR"
echo "Discovering pages to test..."

# Find all HTML files
PAGES=$(find . -name "*.html" -not -path "./node_modules/*" -not -path "./tests/*" -print)
PAGE_COUNT=$(echo "$PAGES" | wc -l)
echo "Found $PAGE_COUNT pages to test"

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
        
        // Add page URL to each violation
        if (newData.violations) {
          newData.violations.forEach(v => {
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
if [ "$STOP_SERVER" = true ]; then
  echo "Stopping local server..."
  kill $SERVER_PID 2>/dev/null
fi

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
  
  process.exit(total > 0 ? 1 : 0);
" && VIOLATIONS_FOUND=0 || VIOLATIONS_FOUND=1

if [ "$VIOLATIONS_FOUND" -eq 0 ]; then
  echo "✅ No accessibility violations found across all pages."
  exit 0
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
  exit 1
fi
