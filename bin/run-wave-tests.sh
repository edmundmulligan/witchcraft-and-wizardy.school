#!/bin/bash

# This script runs WAVE accessibility tests using the WAVE API
# Requires: WAVE_API_KEY environment variable set
# Note: WAVE requires a publicly accessible URL (use ngrok for localhost)

# Source common helper functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

# Check for API key
if [ -z "$WAVE_API_KEY" ]; then
  echo "❌ Error: WAVE_API_KEY environment variable not set"
  echo "   Get your key from: https://wave.webaim.org/api/"
  echo "   Then run: export WAVE_API_KEY='your-key-here'"
  exit 1
fi

# Get any command line options
TEST_URL=""
parse_test_options "$@"

# Start server
start_server_if_needed "$TEST_URL"

# Install and run ngrok 
# this is needed to run WAVE as it exposes localhost to the internet
if [ ! -f /usr/local/bin/ngrok ]
then
  echo "Downloading and installing ngrok..."    
  wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
  tar -xvzf ngrok-v3-stable-linux-amd64.tgz
  sudo mv ngrok /usr/local/bin/
  sudo chmod +x /usr/local/bin/ngrok
fi

ngrok config add-authtoken $NGROK_AUTHTOKEN
ngrok http 8080 &
sleep 2

export NGROK_URL=$(curl -s localhost:4040/api/tunnels | node -e "console.log(JSON.parse(require('fs').readFileSync(0)).tunnels[0].public_url)")
echo "✓ Ngrok tunnel created: $NGROK_URL"

# Set TEST_URL to the ngrok URL
TEST_URL="$NGROK_URL"

# Setup results directory
setup_results_dir
RESULT_FILE="$RESULTS_DIR/wave-results.json"

# Initialize combined results
echo '{"pages":[]}' > "$RESULT_FILE"

# Find all HTML pages
discover_html_pages

# Test each page
TESTED=0
for page in $PAGES; do
  TESTED=$((TESTED + 1))
  URL_PATH="${page#./}"
  FULL_URL="$TEST_URL/$URL_PATH"
  
  echo "[$TESTED/$PAGE_COUNT] Testing $URL_PATH"
  
  # Call WAVE API
  TEMP_RESULT="$RESULTS_DIR/wave-temp-$TESTED.json"
  curl -s "https://wave.webaim.org/api/request?key=$WAVE_API_KEY&url=$(echo $FULL_URL | sed 's/:/%3A/g; s/\//%2F/g')" > "$TEMP_RESULT"
  
  # Merge results
  if [ -f "$TEMP_RESULT" ]; then
    node -e "
      try {
        const fs = require('fs');
        const combined = JSON.parse(fs.readFileSync('$RESULT_FILE', 'utf8'));
        const newData = JSON.parse(fs.readFileSync('$TEMP_RESULT', 'utf8'));
        
        if (newData.categories) {
          const pageResult = {
            url: '$URL_PATH',
            errors: newData.categories.error?.count || 0,
            alerts: newData.categories.alert?.count || 0,
            features: newData.categories.feature?.count || 0,
            structural: newData.categories.structure?.count || 0,
            contrast: newData.categories.contrast?.count || 0
          };
          
          combined.pages.push(pageResult);
          console.log('  Errors: ' + pageResult.errors + ', Alerts: ' + pageResult.alerts + ', Contrast: ' + pageResult.contrast);
        } else if (newData.message) {
          console.error('  API Error: ' + newData.message);
        }
        
        fs.writeFileSync('$RESULT_FILE', JSON.stringify(combined, null, 2));
        fs.unlinkSync('$TEMP_RESULT');
      } catch (e) {
        console.error('Error processing results: ' + e.message);
      }
    "
  fi
done

# Display summary
echo ""
echo "📊 WAVE Accessibility Results:"

node -e "
  const fs = require('fs');
  const data = JSON.parse(fs.readFileSync('$RESULT_FILE', 'utf8'));
  
  if (!data.pages || data.pages.length === 0) {
    console.log('  No pages tested');
    process.exit(0);
  }
  
  const totalErrors = data.pages.reduce((sum, p) => sum + p.errors, 0);
  const totalAlerts = data.pages.reduce((sum, p) => sum + p.alerts, 0);
  const totalContrast = data.pages.reduce((sum, p) => sum + p.contrast, 0);
  
  console.log('  Pages tested: ' + data.pages.length);
  console.log('  ❌ Total errors: ' + totalErrors);
  console.log('  ⚠️  Total alerts: ' + totalAlerts);
  console.log('  🎨 Contrast errors: ' + totalContrast);
  console.log('');
  
  // Show pages with errors
  const pagesWithErrors = data.pages.filter(p => p.errors > 0);
  if (pagesWithErrors.length === 0) {
    console.log('  No errors found! ✨');
  } else {
    console.log('  Pages with errors:');
    pagesWithErrors.forEach(page => {
      console.log('');
      console.log('❌ ' + page.url);
      console.log('   Errors: ' + page.errors + ', Alerts: ' + page.alerts + ', Contrast: ' + page.contrast);
    });
  }
"

# Check if we should delete the file
HAS_ERRORS=$(node -p "const fs = require('fs'); const data = JSON.parse(fs.readFileSync('$RESULT_FILE', 'utf8')); data.pages.some(p => p.errors > 0) ? 1 : 0")

if [ "$HAS_ERRORS" -eq 0 ]; then
  echo ""
  echo "✅ All pages passed WAVE tests (no errors)."
  rm -f "$RESULT_FILE"
else
  echo ""
  echo "❌ Some pages have accessibility errors."
fi

exit 0
