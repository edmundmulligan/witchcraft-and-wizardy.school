#!/bin/bash
# This script runs all tests: accessibility, HTML/CSS validation, broken links

bin/clear-tests.sh

# Run all tests and collect exit codes
echo "Running all tests..."
echo ""

FAILED=0

echo "📄 Running code validation..."
bin/validate-code.sh "$@" || FAILED=1

echo ""
echo "🔗 Running link checks..."
bin/check-links.sh "$@" || FAILED=1

echo ""
echo "🪓 Running axe accessibility tests..."
bin/run-axe-tests.sh "$@" || FAILED=1

echo ""
echo "🏮 Running lighthouse accessibility tests..."
bin/run-lighthouse-tests.sh "$@" || FAILED=1

echo ""
echo "🦜 Running pa11y accessibility tests..."
bin/run-pa11y-tests.sh "$@" || FAILED=1

echo ""
echo "📖 Running reading age checks..."
bin/check-reading-age.sh "$@" || FAILED=1

echo ""
echo "🌐 Running cross-browser tests..."
bin/run-browser-tests.js "$@" || FAILED=1

echo ""
echo "📊 Generating test summary..."
bin/summarise-tests.sh

if [ "$FAILED" -eq 1 ]; then
  echo ""
  echo "❌ Some tests failed!"
  exit 1
else
  echo ""
  echo "✅ All tests passed!"
  exit 0
fi
