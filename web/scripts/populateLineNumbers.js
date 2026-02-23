/*
 **********************************************************************
 * File       : populateLineNumbers.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   This script populates code snippets with line numbers.
 *   Uses a table layout so line numbers stay aligned even when code wraps.
 *   Usage: Add a .code-snippet-container with a script[type="text/plain"]
 *   .code-snippet-source containing the code, and an empty 
 *   .code-snippet-table div that will be populated.
 **********************************************************************
 */

(function() {
    'use strict';

    /**
     * Class for populating code snippets with line numbers
     */
    class CodeSnippetPopulator {
        /**
         * Remove leading and trailing empty lines from code
         * @param {Array<string>} lines - Array of code lines
         * @returns {Array<string>} Trimmed array of lines
         */
        trimEmptyLines(lines) {
            // Remove leading empty lines
            while (lines.length > 0 && lines[0].trim() === '') {
                lines.shift();
            }

            // Remove trailing empty lines
            while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
                lines.pop();
            }

            return lines;
        }

        /**
         * Populate a single code snippet with line numbers using table layout
         * @param {HTMLElement} tableElement - The table element to populate
         * @param {string} codeText - The code text to display
         */
        populate(tableElement, codeText) {
            // Split code into lines and remove empty first/last lines
            let lines = codeText.split('\n');
            lines = this.trimEmptyLines(lines);

            // Create table rows for each line
            lines.forEach((line, index) => {
                const row = document.createElement('div');
                row.className = 'code-line';

                const lineNumber = document.createElement('span');
                lineNumber.className = 'line-number';
                lineNumber.textContent = index + 1;

                const codeContent = document.createElement('span');
                codeContent.className = 'code-content';

                // Use textContent to properly display all content including HTML entities
                codeContent.textContent = line;

                row.appendChild(lineNumber);
                row.appendChild(codeContent);
                tableElement.appendChild(row);
            });
        }

        /**
         * Initialize all code snippets on the page
         */
        init() {
            // Find all code snippet containers
            const containers = document.querySelectorAll('.code-snippet-container');

            containers.forEach(container => {
                // Find the source code
                const sourceElement = container.querySelector('script[type="text/plain"].code-snippet-source');
                const tableElement = container.querySelector('.code-snippet-table');

                if (sourceElement && tableElement) {
                    const codeText = sourceElement.textContent;
                    this.populate(tableElement, codeText);
                }
            });
        }
    }

    // Run when DOM is ready
    const initPopulator = () => {
        const populator = new CodeSnippetPopulator();
        populator.init();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPopulator);
    } else {
        // DOM already loaded
        initPopulator();
    }
})();


