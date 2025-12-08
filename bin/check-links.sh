#!/bin/bash

# This script checks for broken links on all HTML pages

# Source common helper functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

# Get any command line options
TEST_URL="http://localhost:8080"
parse_test_options "$@"

# Install dependencies
echo "Installing dependencies..."
npm install broken-link-checker cheerio > /dev/null 2>&1

# Start server and setup
start_server_if_needed "$TEST_URL"
setup_results_dir
discover_html_pages

# Wait for server to be ready
echo "Waiting for server to be ready..."
for i in {1..10}; do
  if curl -s -f "$TEST_URL" > /dev/null 2>&1; then
    echo "✓ Server is responding"
    break
  fi
  echo "  Waiting... ($i/10)"
  sleep 1
done

if ! curl -s -f "$TEST_URL" > /dev/null 2>&1; then
  echo "❌ Server failed to start or is not responding"
  exit 1
fi

RESULT_FILE="$RESULTS_DIR/broken-links-results.json"

# Initialize results
echo '{"pages":[],"summary":{"totalLinks":0,"brokenLinks":0,"excludedLinks":0}}' > "$RESULT_FILE"

echo ""
echo "🔗 Checking links on HTML pages..."
echo ""

# Check each page
TESTED=0
for page in $PAGES; do
  TESTED=$((TESTED + 1))
  URL_PATH="${page#./}"
  FULL_URL="$TEST_URL/$URL_PATH"
  
  echo "[$TESTED/$PAGE_COUNT] Checking $URL_PATH"
  
  # Use the Node.js helper script to check links
  node "$SCRIPT_DIR/check-links-helper.js" "$FULL_URL" "$URL_PATH" "$RESULT_FILE"
  
  echo ""
done

# Stop server if we started it
stop_server_if_started

# Display summary
echo "======================================"
echo "🔗 Link Check Summary"
echo "======================================"

node -e "
  const fs = require('fs');
  const data = JSON.parse(fs.readFileSync('$RESULT_FILE', 'utf8'));
  
  console.log('Pages checked: ' + data.pages.length);
  console.log('Total links: ' + data.summary.totalLinks);
  console.log('Broken links: ' + data.summary.brokenLinks);
  console.log('');
  
  if (data.summary.brokenLinks === 0) {
    console.log('✅ No broken links found!');
  } else {
    console.log('❌ Broken links found:');
    console.log('');
    
    data.pages.filter(p => p.brokenCount > 0).forEach(page => {
      console.log('📄 ' + page.url + ' (' + page.brokenCount + ' broken link(s))');
      page.links.forEach(link => {
        console.log('  ❌ ' + link.url);
        if (link.original && link.original !== link.url) {
          console.log('     Original: ' + link.original);
        }
        if (link.text) {
          console.log('     Text: ' + link.text);
        }
        if (link.statusCode) {
          console.log('     Status: ' + link.statusCode);
        }
        if (link.error) {
          console.log('     Error: ' + link.error);
        }
        console.log('     Tag: <' + link.tagName + '>');
      });
      console.log('');
    });
  }
"

# Check if we should delete the file
HAS_BROKEN=$(node -p "const fs = require('fs'); const data = JSON.parse(fs.readFileSync('$RESULT_FILE', 'utf8')); data.summary.brokenLinks > 0 ? 1 : 0")

if [ "$HAS_BROKEN" -eq 0 ]; then
  echo ""
  echo "✅ No broken links found!"
  exit 0
else
  echo ""
  echo "❌ Broken links found!"
  echo "Detailed results saved to: $RESULT_FILE"
  exit 1
fi
