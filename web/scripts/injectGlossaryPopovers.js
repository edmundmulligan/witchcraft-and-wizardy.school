/*
 **********************************************************************
 * File       : scripts/injectGlossaryPopovers.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Dynamically loads glossary definitions from glossary.html into
 *   popover elements to follow DRY principle. Used in all lessons.
 **********************************************************************
 */

/* jshint esversion: 8 */
/* global Debug, fetch, DOMParser */

(function() {
    'use strict';

    /**
     * Class for injecting glossary definitions into popovers
     */
    class GlossaryPopoverInjector {
        constructor() {
            this.glossaryDoc = null;
        }

        /**
         * Fetch the glossary page and parse it
         * @returns {Promise<Document>} Parsed glossary document
         */
        async fetchGlossary() {
            if (this.glossaryDoc) {
                return this.glossaryDoc;
            }

            const response = await fetch('../pages/glossary.html');
            if (!response.ok) {
                throw new Error('Failed to fetch glossary');
            }

            const html = await response.text();
            const parser = new DOMParser();
            this.glossaryDoc = parser.parseFromString(html, 'text/html');
            return this.glossaryDoc;
        }

        /**
         * Sanitise text content to prevent XSS attacks
         * @param {string} text - Text to sanitise
         * @returns {string} Sanitised text
         */
        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        /**
         * Extract term ID from popover ID
         * @param {string} popoverId - The popover element ID
         * @returns {string|null} The term identifier or null
         */
        extractTermFromId(popoverId) {
            const match = popoverId.match(/^glossary-(.+)-popover$/);
            return match ? match[1] : null;
        }

        /**
         * Populate a single popover with glossary content
         * @param {HTMLElement} popover - The popover element to populate
         */
        populatePopover(popover) {
            const popoverId = popover.id;
            const term = this.extractTermFromId(popoverId);
            
            if (!term) {
                return;
            }

            const glossaryId = `glossary-${term}`;

            // Find the term and definition in the glossary
            const dt = this.glossaryDoc.getElementById(glossaryId);
            if (!dt) {
                console.warn(`Glossary term not found: ${glossaryId}`);
                return;
            }

            const termText = dt.textContent.trim();

            // Get the next sibling dd element (definition)
            const dd = dt.nextElementSibling;
            if (!dd || dd.tagName !== 'DD') {
                console.warn(`Definition not found for term: ${glossaryId}`);
                return;
            }

            const definition = dd.textContent.trim();

            // Populate the popover with sanitised content
            popover.innerHTML = `
<h2>${this.escapeHtml(termText)}</h2>
<p>${this.escapeHtml(definition)}</p>
<button type="button" popovertarget="${popoverId}" popovertargetaction="hide">Close</button>
`;
        }

        /**
         * Find and populate all glossary popovers on the page
         */
        async init() {
            const glossaryPopovers = document.querySelectorAll('.glossary-popover');
    
            if (glossaryPopovers.length === 0) {
                return;
            }

            try {
                await this.fetchGlossary();
                glossaryPopovers.forEach(popover => this.populatePopover(popover));
            } catch (error) {
                console.error('Error loading glossary:', error);
            }
        }
    }

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', async function() {
        const injector = new GlossaryPopoverInjector();
        await injector.init();
    });
})();
