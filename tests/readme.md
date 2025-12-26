This folder contains files pertaining to testing and validating the website.

## Browser Tests

Application-specific browser tests are defined in `web/tests/browser-tests.js`. This file exports:

- `pages`: Array of page definitions to test (url and name)
- `runPageTests(page, pageInfo)`: Function that runs tests on each page

The generic test runner in `bin/run-browser-tests.js` loads this file and executes the tests across Chromium, Firefox, and WebKit browsers.

### Customizing Tests

To modify which pages are tested or what tests run on each page, edit `web/tests/browser-tests.js`. The test runner will automatically pick up the changes.

## Test Results

New JSON files are created each time the validation scripts are run. However the
definitive JSON files are created whenever a commit to the develop or main branch is pushed to GitHub so the contents of this folder should be disregarded.

The contents of this folder are not being submitted for assessment.