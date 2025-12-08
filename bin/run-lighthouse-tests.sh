#!/bin/bash

# This script validates accessibility using lighthouse.
# It starts a local web server if one is not running.

# Source common helper functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

# Get any command line options
TEST_URL="http://localhost:8080"
parse_test_options "$@"

# Silently install dependencies if not already installed
npm install -g lighthouse serve > /dev/null 2>&1

# Start server and setup
start_server_if_needed "$TEST_URL"
setup_results_dir
discover_html_pages

# Initialize combined results
echo '{"pages":[]}' > "$RESULTS_DIR/lighthouse-results.json"

# Test each page
TESTED=0
for page in $PAGES; do
  TESTED=$((TESTED + 1))
  # Convert file path to URL path
  URL_PATH="${page#./}"
  FULL_URL="$TEST_URL/$URL_PATH"
  
  echo "[$TESTED/$PAGE_COUNT] Testing $URL_PATH"
  
  # Run lighthouse on this page
  TEMP_RESULT="$RESULTS_DIR/lighthouse-temp-$TESTED.json"
  npx lighthouse "$FULL_URL" --output=json --output-path=$TEMP_RESULT --chrome-flags="--headless --no-sandbox" --quiet 2>&1 | grep -E "(Testing|Runtime)" || true
  
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
      console.log(icon + ' ' + page.url + ' - ' + scorePercent + '%');
      
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
