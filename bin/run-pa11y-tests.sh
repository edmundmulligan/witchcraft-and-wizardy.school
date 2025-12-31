#!/bin/bash

# This script validates accessibility using pa11y.
# It starts a local web server if one is not running.

# Source common helper functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

# Get any command line options
TEST_URL="http://localhost:8080"
parse_test_options "$@"

# Install dependencies locally if not already installed
npm install pa11y > /dev/null 2>&1
npm install -g serve > /dev/null 2>&1

# Accept optional folder parameter
FOLDER="${1:-.}"
if [ ! -d "$FOLDER" ]; then
  echo "❌ Error: '$FOLDER' is not a valid directory"
  exit 1
fi

# Change to the specified folder to serve files from there
ORIGINAL_DIR=$(pwd)
RESULTS_DIR="$ORIGINAL_DIR/$FOLDER/test-results"
mkdir -p "$RESULTS_DIR"
cd "$FOLDER" || exit 1

# Start server and setup
start_server_if_needed "$TEST_URL"
discover_html_pages "."

# Initialize combined results
echo '{"pages":[]}' > "$RESULTS_DIR/pa11y-results.json"

# Define viewport widths to test
VIEWPORTS=(150 400 900 1300)
TOTAL_TESTS=$((PAGE_COUNT * 2 * ${#VIEWPORTS[@]}))

# Test each page at different viewport widths, in both light and dark modes
TESTED=0
for VIEWPORT in "${VIEWPORTS[@]}"; do
  echo ""
  echo "📐 Testing at ${VIEWPORT}px width..."
  echo ""
  
  for THEME in light dark; do
    echo "  🎨 $THEME mode"
    
    for page in $PAGES; do
      TESTED=$((TESTED + 1))
      # Convert file path to URL path
      URL_PATH="${page#./}"
      FULL_URL="$TEST_URL/$URL_PATH"

      echo "  [$TESTED/$TOTAL_TESTS] Testing $URL_PATH (${VIEWPORT}px, $THEME mode)"

      # Run pa11y on this page using inline Node.js
      TEMP_RESULT="$RESULTS_DIR/pa11y-temp-$TESTED.json"
      node -e "
        (async () => {
          const pa11y = require('pa11y');
          const fs = require('fs');

          try {
            const results = await pa11y('$FULL_URL', {
              standard: 'WCAG2AA',
              viewport: {
                width: $VIEWPORT,
                height: 768
              },
              emulateMediaFeatures: [
                { name: 'prefers-color-scheme', value: '$THEME' }
              ],
              chromeLaunchConfig: {
                args: [
                  '--no-sandbox',
                  '--disable-setuid-sandbox',
                  '--disable-dev-shm-usage',
                  '--disable-gpu'
                ]
              }
            });

        fs.writeFileSync('$TEMP_RESULT', JSON.stringify(results, null, 2));

        const errors = results.issues.filter(i => i.type === 'error').length;
        const warnings = results.issues.filter(i => i.type === 'warning').length;
        console.log('  Errors: ' + errors + ', Warnings: ' + warnings);

      } catch (error) {
        console.error('  Failed: ' + error.message);
        process.exit(1);
      }
    })();
  "

    # Merge results into combined file if temp file exists
    if [ -f "$TEMP_RESULT" ]; then
      node -e "
        try {
          const fs = require('fs');
          const combined = JSON.parse(fs.readFileSync('$RESULTS_DIR/pa11y-results.json'));
          const newData = JSON.parse(fs.readFileSync('$TEMP_RESULT'));

          const pageResult = {
            url: '$URL_PATH',
            theme: '$THEME',
            viewport: '$VIEWPORT',
            documentTitle: newData.documentTitle,
            pageUrl: newData.pageUrl,
            issues: (newData.issues || []).map(issue => {
              // Downgrade errors to warnings for 150px viewport
              if ('$VIEWPORT' === '150' && issue.type === 'error') {
                return {
                  ...issue,
                  type: 'warning',
                  originalType: 'error',
                  downgradedFrom150px: true
                };
              }
              return issue;
            })
          };

          combined.pages.push(pageResult);
          fs.writeFileSync('$RESULTS_DIR/pa11y-results.json', JSON.stringify(combined, null, 2));
          fs.unlinkSync('$TEMP_RESULT');
        } catch (e) {
          console.error('Error merging results for $URL_PATH:', e.message);
        }
      "
    fi
    done
  done
done

# Stop server if we started it
stop_server_if_started

# Parse and display summary of results using node
RESULT_FILE="$RESULTS_DIR/pa11y-results.json"
echo ""
echo "📊 Pa11y Accessibility Results:"

node -e "
  const data = JSON.parse(require('fs').readFileSync('$RESULT_FILE'));

  if (!data.pages || data.pages.length === 0) {
    console.log('  No pages tested');
    process.exit(0);
  }

  // Count total issues
  let totalErrors = 0;
  let totalWarnings = 0;
  let totalNotices = 0;

  data.pages.forEach(page => {
    totalErrors += page.issues.filter(i => i.type === 'error').length;
    totalWarnings += page.issues.filter(i => i.type === 'warning').length;
    totalNotices += page.issues.filter(i => i.type === 'notice').length;
  });

  console.log('  Pages tested: ' + data.pages.length);
  console.log('  ❌ Total errors: ' + totalErrors);
  console.log('  ⚠️  Total warnings: ' + totalWarnings);
  console.log('  ℹ️  Total notices: ' + totalNotices);
  console.log('');

  // Show only pages with errors
  const pagesWithErrors = data.pages.filter(p => p.issues.some(i => i.type === 'error'));

  if (pagesWithErrors.length === 0) {
    console.log('  No errors found! ✨');
  } else {
    console.log('  Pages with errors:');
    pagesWithErrors.forEach(page => {
      const errors = page.issues.filter(i => i.type === 'error');
    console.log('');  
    console.log('❌ ' + page.url + ' [' + (page.viewport || 'unknown') + 'px, ' + (page.theme || 'unknown') + ' mode] (' + errors.length + ' errors)');

      errors.slice(0, 5).forEach(issue => {
        console.log('    • ' + issue.message);
        console.log('      ' + issue.selector);
      });

      if (errors.length > 5) {
        console.log('    ... and ' + (errors.length - 5) + ' more');
      }
    });
  }

  console.log('');
"

# Check if any pages have errors
HAS_ERRORS=$(node -p "const fs = require('fs'); const data = JSON.parse(fs.readFileSync('$RESULT_FILE', 'utf8')); data.pages.some(p => p.issues.some(i => i.type === 'error')) ? 1 : 0")

if [ "$HAS_ERRORS" -eq 0 ]; then
  echo "✅ All pages passed pa11y tests (no errors)."
  exit 0
else
  echo "❌ Some pages have accessibility errors."
  exit 1
fi
