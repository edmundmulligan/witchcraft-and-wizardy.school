#!/bin/bash

# This script checks for broken links on all HTML pages

# Source common helper functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

print_usage() {
  print_standard_usage "$0 [folder] [options]" help url exclude-discovery
}

TEST_URL="http://localhost:8080"
EXCLUDE_LIST=""
FOLDER=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      print_usage
      exit 0
      ;;
    -u|--url)
      shift
      if [ $# -eq 0 ] || [[ "$1" == -* ]]; then
        echo "❌ Error: --url requires a URL argument"
        exit 1
      fi
      TEST_URL="$1"
      shift
      ;;
    -x|--exclude)
      shift
      if [ $# -eq 0 ] || [[ "$1" == -* ]]; then
        echo "❌ Error: --exclude requires at least one file or folder"
        exit 1
      fi
      while [[ $# -gt 0 ]] && [[ "$1" != -* ]]; do
        EXCLUDE_LIST="$(normalise_exclude_list "$EXCLUDE_LIST" "$1")"
        shift
      done
      ;;
    *)
      if [ -z "$FOLDER" ]; then
        FOLDER="$1"
      else
        echo "❌ Error: Unexpected argument '$1'"
        exit 1
      fi
      shift
      ;;
  esac
done

[ -z "$FOLDER" ] && FOLDER="."

# Validate folder parameter
ORIGINAL_DIR=$(pwd)
if [ ! -d "$FOLDER" ]; then
  echo "❌ Error: '$FOLDER' is not a valid directory"
  exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install broken-link-checker cheerio > /dev/null 2>&1

# Setup results directory in application folder
RESULTS_DIR="$ORIGINAL_DIR/$FOLDER/diagnostics/test-results"
mkdir -p "$RESULTS_DIR"

# Change to the specified folder to serve files from there
cd "$FOLDER" || exit 1

# Start server and setup
start_server_if_needed "$TEST_URL"
discover_html_pages "." "$EXCLUDE_LIST"

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

# Initialise results
echo '{"pages":[],"summary":{"totalLinks":0,"brokenLinks":0,"timeoutLinks":0,"excludedLinks":0}}' > "$RESULT_FILE"

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
  if (data.summary.timeoutLinks > 0) {
    console.log('Timeout warnings: ' + data.summary.timeoutLinks);
  }
  console.log('');

  if (data.summary.brokenLinks === 0 && data.summary.timeoutLinks === 0) {
    console.log('✅ No broken links found!');
  } else {
    if (data.summary.brokenLinks > 0) {
      console.log('❌ Broken links found:');
      console.log('');

      data.pages.filter(p => p.brokenCount > 0).forEach(page => {
        console.log('📄 ' + page.url + ' (' + page.brokenCount + ' broken link(s))');
        page.links.filter(link => link.error).forEach(link => {
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
    
    if (data.summary.timeoutLinks > 0) {
      console.log('⚠️  Link timeout warnings:');
      console.log('');
      
      data.pages.filter(p => p.timeoutCount > 0).forEach(page => {
        console.log('📄 ' + page.url + ' (' + page.timeoutCount + ' timeout(s))');
        page.links.filter(link => link.warning === 'timeout').forEach(link => {
          console.log('  ⚠️  ' + link.url);
          if (link.original && link.original !== link.url) {
            console.log('     Original: ' + link.original);
          }
          if (link.text) {
            console.log('     Text: ' + link.text);
          }
          console.log('     Tag: <' + link.tagName + '>');
        });
        console.log('');
      });
    }
  }
"

# Check if we should delete the file
HAS_BROKEN=$(node -p "const fs = require('fs'); const data = JSON.parse(fs.readFileSync('$RESULT_FILE', 'utf8')); data.summary.brokenLinks > 0 ? 1 : 0")

if [ "$HAS_BROKEN" -eq 0 ]; then
  echo ""
  echo "✅ No broken links found!"
  
  # Check if there are timeout warnings
  HAS_TIMEOUTS=$(node -p "const fs = require('fs'); const data = JSON.parse(fs.readFileSync('$RESULT_FILE', 'utf8')); data.summary.timeoutLinks > 0 ? 1 : 0")
  if [ "$HAS_TIMEOUTS" -eq 1 ]; then
    echo "⚠️  Some links timed out (see warnings above)"
  fi
  exit 0
else
  echo ""
  echo "❌ Broken links found!"
  echo "Detailed results saved to: $RESULT_FILE"
  exit 1
fi
