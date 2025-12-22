#!/bin/bash

# This script runs WAVE accessibility tests using the WAVE API
# Requires: WAVE_API_KEY environment variable set
# Note: WAVE requires a publicly accessible URL (use ngrok for localhost)

# Source common helper functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

# Change to project root directory
cd "$SCRIPT_DIR/.."

# Check for API key
if [ -z "$WAVE_API_KEY" ]; then
  echo "❌ Error: WAVE_API_KEY environment variable not set"
  echo "   Get your key from: https://wave.webaim.org/api/"
  echo "   Then run: export WAVE_API_KEY='your-key-here'"
  exit 0
fi

# Check for ngrok authtoken
if [ -z "$NGROK_AUTHTOKEN" ]; then
  echo "❌ Error: NGROK_AUTHTOKEN environment variable not set"
  echo "   Get your token from: https://dashboard.ngrok.com/get-started/your-authtoken"
  echo "   Then run: export NGROK_AUTHTOKEN='your-token-here'"
  exit 0
fi

# Get any command line options
TEST_URL=""
parse_test_options "$@"

# Start server
start_server_if_needed "$TEST_URL"

# Install and run ngrok
# this is needed to run WAVE as it exposes localhost to the internet
if ! command -v ngrok &> /dev/null; then
  echo "Downloading and installing ngrok..."

  # Use official ngrok installation method for Ubuntu
  curl -fsSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc | \
    sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null

  echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | \
    sudo tee /etc/apt/sources.list.d/ngrok.list

  sudo apt update > /dev/null 2>&1
  sudo apt install -y ngrok > /dev/null 2>&1

  if [ $? -ne 0 ]; then
    echo "❌ Failed to install ngrok"
    exit 0
  fi

  echo "✓ Ngrok installed"
fi

# Configure ngrok authtoken
echo "Configuring ngrok authtoken..."
ngrok config add-authtoken $NGROK_AUTHTOKEN

if [ $? -ne 0 ]; then
  echo "❌ Failed to configure ngrok authtoken"
  exit 0
fi

# Stop any existing ngrok tunnels
echo "Stopping any existing ngrok tunnels..."
# Kill all ngrok processes
pkill -9 -f ngrok || true
sleep 2

# Start ngrok tunnel
echo "Starting ngrok tunnel..."
ngrok http 8080 > /dev/null &
NGROK_PID=$!
sleep 3

# Get the public URL from ngrok API
export NGROK_URL=$(curl -s localhost:4040/api/tunnels 2>/dev/null | node -e "
  try {
    const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));
    if (data.tunnels && data.tunnels.length > 0) {
      console.log(data.tunnels[0].public_url);
    } else {
      process.exit(1);
    }
  } catch (e) {
    process.exit(1);
  }
" 2>/dev/null)

if [ -z "$NGROK_URL" ]; then
  echo "❌ Failed to get ngrok URL"
  kill $NGROK_PID 2>/dev/null
  exit 0
fi
echo "✓ Ngrok tunnel created: $NGROK_URL"

# Set TEST_URL to the ngrok URL
TEST_URL="$NGROK_URL"

# Cleanup ngrok on exit
cleanup_ngrok() {
  if [ ! -z "$NGROK_PID" ]; then
    echo "Stopping ngrok..."
    kill $NGROK_PID 2>/dev/null
  fi
}
trap cleanup_ngrok EXIT

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

  # Call WAVE API (reporttype=4 returns detailed JSON)
  TEMP_RESULT="$RESULTS_DIR/wave-temp-$TESTED.json"
  curl -s "https://wave.webaim.org/api/request?key=$WAVE_API_KEY&reporttype=4&url=$(echo $FULL_URL | sed 's/:/%3A/g; s/\//%2F/g')" > "$TEMP_RESULT"

  # Merge results
  if [ -f "$TEMP_RESULT" ]; then
    node -e "
      try {
        const fs = require('fs');
        const combined = JSON.parse(fs.readFileSync('$RESULT_FILE', 'utf8'));
        const newData = JSON.parse(fs.readFileSync('$TEMP_RESULT', 'utf8'));

        // Check for API errors
        if (newData.status && newData.status.success === false) {
          console.log('  ❌ API Error: ' + (newData.status.error || 'Unknown error'));
          fs.unlinkSync('$TEMP_RESULT');
          process.exit(1);
        }

        if (newData.categories) {
          const pageResult = {
            url: '$URL_PATH',
            errors: newData.categories.error?.count || 0,
            alerts: newData.categories.alert?.count || 0,
            features: newData.categories.feature?.count || 0,
            structural: newData.categories.structure?.count || 0,
            contrast: newData.categories.contrast?.count || 0,
            errorItems: [],
            alertItems: [],
            contrastItems: []
          };

          // Extract actual error details
          if (newData.categories.error?.items) {
            Object.entries(newData.categories.error.items).forEach(([key, item]) => {
              pageResult.errorItems.push({
                id: item.id,
                description: item.description,
                count: item.count,
                selectors: item.selectors || []
              });
            });
          }

          // Store WAVE report URL for detailed information
          if (newData.statistics && newData.statistics.waveurl) {
            pageResult.waveUrl = newData.statistics.waveurl;
          }

          // Extract actual alert details (if available in API response)
          if (newData.categories.alert?.items) {
            Object.entries(newData.categories.alert.items).forEach(([key, item]) => {
              pageResult.alertItems.push({
                id: item.id,
                description: item.description,
                count: item.count
              });
            });
          }

          // Extract error details (if available)
          if (newData.categories.error?.items) {
            Object.entries(newData.categories.error.items).forEach(([key, item]) => {
              pageResult.errorItems.push({
                id: item.id,
                description: item.description,
                count: item.count
              });
            });
          }

          // Extract contrast details (if available)
          if (newData.categories.contrast?.items) {
            Object.entries(newData.categories.contrast.items).forEach(([key, item]) => {
              pageResult.contrastItems.push({
                id: item.id,
                description: item.description,
                count: item.count
              });
            });
          }

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

      // Show error details if available
      if (page.errorItems && page.errorItems.length > 0) {
        console.log('');
        console.log('   Error details:');
        page.errorItems.forEach(err => {
          console.log('   • ' + err.description + ' (' + err.count + ' instance(s))');
        });
      } else if (page.waveUrl) {
        console.log('   View detailed report: ' + page.waveUrl);
      }
    });
  }

  // Show pages with alerts (but no errors)
  const pagesWithAlerts = data.pages.filter(p => p.errors === 0 && p.alerts > 0);
  if (pagesWithAlerts.length > 0) {
    console.log('');
    console.log('  Pages with alerts:');
    pagesWithAlerts.forEach(page => {
      console.log('');
      console.log('⚠️  ' + page.url);
      console.log('   Alerts: ' + page.alerts);

      // Show alert details if available
      if (page.alertItems && page.alertItems.length > 0) {
        console.log('');
        console.log('   Alert details:');
        page.alertItems.slice(0, 5).forEach(alert => {
          console.log('   • ' + alert.description + ' (' + alert.count + ' instance(s))');
        });
        if (page.alertItems.length > 5) {
          console.log('   ... and ' + (page.alertItems.length - 5) + ' more alert(s)');
        }
      } else if (page.waveUrl) {
        console.log('   View detailed report: ' + page.waveUrl);
      }
    });
  }
"

# Check if we should delete the file (only if no errors AND no alerts)
HAS_ISSUES=$(node -p "const fs = require('fs'); const data = JSON.parse(fs.readFileSync('$RESULT_FILE', 'utf8')); data.pages.some(p => p.errors > 0 || p.alerts > 0 || p.contrast > 0) ? 1 : 0")

if [ "$HAS_ISSUES" -eq 0 ]; then
  echo ""
  echo "✅ All pages passed WAVE tests (no errors, alerts, or contrast issues)."
  exit 0
else
  HAS_ERRORS=$(node -p "const fs = require('fs'); const data = JSON.parse(fs.readFileSync('$RESULT_FILE', 'utf8')); data.pages.some(p => p.errors > 0) ? 1 : 0")

  if [ "$HAS_ERRORS" -eq 0 ]; then
    echo ""
    echo "⚠️  Pages have alerts or contrast issues (but no errors)."
    exit 0
  else
    echo ""
    echo "❌ Some pages have accessibility errors."
    exit 1
  fi
fi
