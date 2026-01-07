#!/bin/bash

# This script validates accessibility using lighthouse.
# It starts a local web server if one is not running.

# Source common helper functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

# Initialize variables
TEST_URL="http://localhost:8080"
QUICK_MODE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -q|--quick)
      QUICK_MODE=true
      shift
      ;;
    -u)
      TEST_URL="$2"
      shift 2
      ;;
    *)
      FOLDER="$1"
      shift
      ;;
  esac
done

# Silently install dependencies if not already installed
npm install -g lighthouse serve > /dev/null 2>&1


# Accept optional folder parameter
FOLDER="${FOLDER:-.}"
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
echo '{"pages":[]}' > "$RESULTS_DIR/lighthouse-results.json"

# Define viewport widths to test
if [ "$QUICK_MODE" = true ]; then
  VIEWPORTS=(900)
  echo "⚡ Quick mode: Testing only at 900px viewport width"
else
  VIEWPORTS=(150 400 900 1300)
fi
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

      # Run lighthouse on this page with emulated color scheme and viewport
      TEMP_RESULT="$RESULTS_DIR/lighthouse-temp-$TESTED.json"
      npx lighthouse "$FULL_URL" --output=json --output-path=$TEMP_RESULT \
        --emulated-form-factor=desktop \
        --screen-emulation-width=$VIEWPORT \
        --screen-emulation-height=768 \
        --chrome-flags="--headless --no-sandbox --force-prefers-color-scheme=$THEME --window-size=${VIEWPORT},768" \
        --quiet 2>&1 | grep -E "(Testing|Runtime)" || true

    # Merge results into combined file if temp file exists
    if [ -f "$TEMP_RESULT" ]; then
      node -e "
        try {
          const fs = require('fs');
          const combined = JSON.parse(fs.readFileSync('$RESULTS_DIR/lighthouse-results.json'));
          const newData = JSON.parse(fs.readFileSync('$TEMP_RESULT'));

          // Extract accessibility score and failed audits
          const accessibility = newData.categories?.accessibility;
          const audits = newData.audits || {};

          const pageResult = {
            url: '$URL_PATH',
            theme: '$THEME',
            viewport: '$VIEWPORT',
            score: accessibility?.score || 0,
            failedAudits: []
          };

        // Find failed accessibility audits (score < 1 means failed, null means not applicable)
        if (accessibility?.auditRefs) {
          accessibility.auditRefs.forEach(ref => {
            const audit = audits[ref.id];
            // Only count as failed if score exists and is less than 1
            if (audit && audit.score !== null && audit.score < 1) {
              pageResult.failedAudits.push({
                id: ref.id,
                title: audit.title,
                description: audit.description,
                score: audit.score
              });
            }
          });
        }

        combined.pages.push(pageResult);
        fs.writeFileSync('$RESULTS_DIR/lighthouse-results.json', JSON.stringify(combined, null, 2));
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
RESULT_FILE="$RESULTS_DIR/lighthouse-results.json"
echo ""
echo "📊 Lighthouse Accessibility Results:"

node -e "
  const data = JSON.parse(require('fs').readFileSync('$RESULT_FILE'));

  if (!data.pages || data.pages.length === 0) {
    console.log('  No pages tested');
    process.exit(0);
  }

  // Calculate average score
  const avgScore = data.pages.reduce((sum, p) => sum + p.score, 0) / data.pages.length;
  const totalFailures = data.pages.reduce((sum, p) => sum + p.failedAudits.length, 0);

  console.log('  Pages tested: ' + data.pages.length);
  console.log('  Average accessibility score: ' + Math.round(avgScore * 100) + '%');
  console.log('  Total failed audits: ' + totalFailures);
  console.log('');

  // Show only pages with problems
  const pagesWithIssues = data.pages.filter(p => p.failedAudits.length > 0);

  if (pagesWithIssues.length === 0) {
    console.log('  No issues found! ✨');
  } else {
    console.log('  Pages with issues:');
    pagesWithIssues.forEach(page => {
      const scorePercent = Math.round(page.score * 100);
      const icon = scorePercent === 100 ? '⚠️' : '❌';
      console.log('');
      console.log(icon + ' ' + page.url + ' [' + (page.viewport || 'unknown') + 'px, ' + (page.theme || 'unknown') + ' mode] - ' + scorePercent + '%');

      page.failedAudits.forEach(audit => {
        console.log('    • ' + audit.title);
      });
    });
  }

  console.log('');
"

# Check if any pages have issues
HAS_ISSUES=$(node -p "const fs = require('fs'); const data = JSON.parse(fs.readFileSync('$RESULT_FILE', 'utf8')); data.pages.some(p => p.failedAudits.length > 0) ? 1 : 0")

if [ "$HAS_ISSUES" -eq 0 ]; then
  echo "✅ All pages meet 100% accessibility threshold."
  exit 0
else
  echo "❌ Some pages below 100% accessibility threshold."
  exit 1
fi
