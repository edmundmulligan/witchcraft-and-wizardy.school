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
  
  # Use Node.js to check links on this page
  node -e "
    const blc = require('broken-link-checker');
    const fs = require('fs');
    
    const pageResult = {
      url: '$URL_PATH',
      links: [],
      brokenCount: 0,
      totalCount: 0
    };
    
    const urlChecker = new blc.UrlChecker({
      excludeExternalLinks: false,
      filterLevel: 3,
      honorRobotExclusions: false,
      maxSocketsPerHost: 10
    }, {
      link: (result) => {
        // Skip preconnect, dns-prefetch, and prefetch links (they're not meant to be loaded)
        const rel = result.html.attrs && result.html.attrs.rel;
        if (rel && (rel === 'preconnect' || rel === 'dns-prefetch' || rel === 'prefetch')) {
          return;
        }
        
        pageResult.totalCount++;
        
        if (result.broken) {
          pageResult.brokenCount++;
          pageResult.links.push({
            url: result.url.resolved,
            baseUrl: result.base.resolved,
            html: {
              text: result.html.text || '',
              tagName: result.html.tagName,
              attrName: result.html.attrName
            },
            brokenReason: result.brokenReason,
            excludedReason: result.excludedReason
          });
        }
      },
      end: () => {
        // Add to results file
        const combined = JSON.parse(fs.readFileSync('$RESULT_FILE', 'utf8'));
        combined.pages.push(pageResult);
        combined.summary.totalLinks += pageResult.totalCount;
        combined.summary.brokenLinks += pageResult.brokenCount;
        
        fs.writeFileSync('$RESULT_FILE', JSON.stringify(combined, null, 2));
        
        if (pageResult.brokenCount > 0) {
          console.log('  ❌ Found ' + pageResult.brokenCount + ' broken link(s)');
        } else {
          console.log('  ✅ All ' + pageResult.totalCount + ' links OK');
        }
      }
    });
    
    urlChecker.enqueue('$FULL_URL');
  " 2>/dev/null
  
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
        console.log('     Text: ' + (link.html.text || '(no text)'));
        console.log('     Reason: ' + link.brokenReason);
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
  rm -f "$RESULT_FILE"
  exit 0
else
  echo ""
  echo "❌ Broken links found!"
  echo "Detailed results saved to: $RESULT_FILE"
  exit 1
fi
