#!/bin/bash
# This script runs all tests: accessibility, HTML/CSS validation, broken links

bin/clear-tests.sh
bin/validate-code.sh "$@"
bin/check-links.sh "$@"
bin/run-axe-tests.sh "$@"
bin/run-lighthouse-tests.sh "$@"
bin/run-pa11y-tests.sh "$@"
bin/check-reading-age.sh "$@"
bin/summarise-tests.sh
