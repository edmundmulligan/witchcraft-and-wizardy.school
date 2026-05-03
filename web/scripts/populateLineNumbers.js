/*
 **********************************************************************
 * File       : scripts/populateLineNumbers.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   This script populates code snippets with line numbers.
 *   Uses a table layout so line numbers stay aligned even when code wraps.
 *   Usage: Add a .code-snippet-container with either:
 *   1. A script[type="text/plain"].code-snippet-source containing the code
 *   2. A data-src attribute pointing to an external file
 *   Both require an empty .code-snippet-table div that will be populated.
 **********************************************************************
 */

(function () {
  'use strict';

  /**
   * Populate plain-text code snippets with aligned line numbers.
   *
   * @remarks Preconditions:
   * - Each snippet container must include either:
   *   - A `script[type="text/plain"].code-snippet-source` element, OR
   *   - A `data-src` attribute pointing to an external file
   * - Each snippet container must also include an empty `.code-snippet-table` target element.
   */
  class CodeSnippetPopulator {
    /**
     * Build a snippet container element that matches the existing site markup.
     * @param {string} codeText - Plain-text code to display
     * @returns {HTMLDivElement} Snippet container element
     */
    createSnippetContainer(codeText) {
      const container = document.createElement('div');
      container.className = 'code-snippet-container';

      const sourceElement = document.createElement('script');
      sourceElement.type = 'text/plain';
      sourceElement.className = 'code-snippet-source';
      sourceElement.textContent = codeText;

      const tableElement = document.createElement('div');
      tableElement.className = 'code-snippet-table';

      container.appendChild(sourceElement);
      container.appendChild(tableElement);

      return container;
    }

    /**
     * Fetch code from an external file
     * @param {string} filePath - Path to the file containing code
     * @returns {Promise<string>} The file contents
     */
    async fetchCodeFromFile(filePath) {
      try {
        const response = await fetch(filePath);

        if (!response.ok) {
          throw new Error(`Failed to fetch ${filePath}: ${response.status} ${response.statusText}`);
        }

        return await response.text();
      } catch (error) {
        console.error(`Error loading code snippet from ${filePath}:`, error);
        return `// Error loading code from ${filePath}\n// ${error.message}`;
      }
    }

    /**
     * Decode HTML entities from snippet source text.
     * @param {string} text - Source snippet text
     * @returns {string} Decoded snippet text
     */
    decodeHtmlEntities(text) {
      if (typeof text !== 'string' || text.length === 0) {
        return '';
      }

      // Decode numeric entities (decimal and hex) and a small named-entity set.
      const named = {
        amp: '&',
        lt: '<',
        gt: '>',
        quot: '"',
        apos: "'",
        nbsp: ' ',
      };

      return text
        .replace(/&#(\d+);/g, (_match, dec) => String.fromCodePoint(Number.parseInt(dec, 10)))
        .replace(/&#x([\da-fA-F]+);/g, (_match, hex) =>
          String.fromCodePoint(Number.parseInt(hex, 16))
        )
        .replace(/&([a-zA-Z]+);/g, (match, entity) => named[entity] ?? match);
    }

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
      tableElement.textContent = '';

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
     * Replace raw pre > code blocks with the shared snippet-container markup.
     *
     * @remarks Preconditions:
     * - Skip any code block that already lives inside a `.code-snippet-container`.
     */
    upgradePreCodeBlocks() {
      const rawBlocks = document.querySelectorAll('pre > code');

      rawBlocks.forEach((codeElement) => {
        if (codeElement.closest('.code-snippet-container')) {
          return;
        }

        const preElement = codeElement.parentElement;

        if (!(preElement instanceof HTMLElement)) {
          return;
        }

        const snippetContainer = this.createSnippetContainer(codeElement.textContent || '');

        if (preElement.id) {
          snippetContainer.id = preElement.id;
        }

        if (preElement.className) {
          snippetContainer.classList.add(...preElement.className.split(/\s+/).filter(Boolean));
        }

        preElement.replaceWith(snippetContainer);
      });
    }

    /**
     * Process a single code snippet container
     * @param {HTMLElement} container - The code snippet container element
     * @returns {Promise<void>}
     */
    async processContainer(container) {
      const tableElement = container.querySelector('.code-snippet-table');

      if (!tableElement) {
        return;
      }

      // Check if container has a data-src attribute pointing to an external file
      const fileSrc = container.dataset.src;

      if (fileSrc) {
        // Load code from external file
        const codeText = await this.fetchCodeFromFile(fileSrc);
        this.populate(tableElement, codeText);
      } else {
        // Fall back to existing behavior: read from script element
        const sourceElement = container.querySelector(
          'script[type="text/plain"].code-snippet-source'
        );

        if (sourceElement) {
          const codeText = this.decodeHtmlEntities(sourceElement.textContent);
          this.populate(tableElement, codeText);
        }
      }
    }

    /**
     * Initialise all code snippets on the page
     */
    async init() {
      this.upgradePreCodeBlocks();

      // Find all code snippet containers
      const containers = document.querySelectorAll('.code-snippet-container');

      // Process all containers (handling both inline and external sources)
      const promises = Array.from(containers).map((container) => this.processContainer(container));

      await Promise.all(promises);
    }
  }

  // Run when DOM is ready
  /**
   * Create and run the snippet populator once the DOM is available.
   *
   * @returns {void}
   */
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
