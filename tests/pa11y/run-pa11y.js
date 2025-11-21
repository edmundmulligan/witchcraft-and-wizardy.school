// tests/pa11y/run-pa11y.js

// Script to run pa11y accessibility tests and save results to a JSON file

const pa11y = require('pa11y');
const fs = require('fs');

const testurl = 'http://localhost:8080';
const standard = 'WCAG2AA';
const resultsFile = 'tests/results/pa11y-results.json';

(async () => {
    // run pa11y tests using try and catch to handle errors
    try {
        const results = await pa11y(
            testurl, 
            {
                standard: standard,
                chromeLaunchConfig: {
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-gpu'
                    ]
                }
            }
        );
    
        // write results to JSON file
        fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));

        // Count issues by type
        const errors = results.issues.filter(issue => issue.type === 'error').length;
        const warnings = results.issues.filter(issue => issue.type === 'warning').length;
        const notices = results.issues.filter(issue => issue.type === 'notice').length;

        console.log('🔍 Pa11y Results:');
        console.log(`  Errors: ${errors}`);
        console.log(`  Warnings: ${warnings}`);
        console.log(`  Notices: ${notices}`);

        // Fail if any errors found
        if (errors > 0) {
            console.error('❌ Pa11y found accessibility errors');
            process.exit(1);
        }

        console.log('✅ Pa11y tests passed - no errors found');
    } catch (error) {
        // if pa11y fails, log error and exit with failure code
        console.error('✗ Pa11y failed:', error.message);
        process.exit(1);
    }
})();
