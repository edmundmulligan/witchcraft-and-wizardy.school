/*
 **********************************************************************
 * File       : scripts/injectGlossaryPopovers.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Dynamically loads glossary definitions from glossary.html into
 *   popover elements to follow DRY principle. Used in all lessons.
 *
 *   Supports two modes:
 *   1. Individual popovers with IDs like glossary-{term}-popover
 *   2. Shared popover (glossary-popover) with buttons having data-glossary-term attribute
 **********************************************************************
 */

(function () {
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
     * Check whether a link target is safe to copy into the live DOM
     * @param {string} href - Link target to validate
     * @returns {boolean} True when the link protocol is allowed
     */
    isSafeHref(href) {
      try {
        const url = new URL(href, window.location.href);
        return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol);
      } catch (error) {
        return false;
      }
    }

    /**
     * Clone glossary markup using a small allowlist so fetched HTML is not injected directly
     * @param {Node} node - Node to clone
     * @returns {Node|null} Safe cloned node
     */
    cloneSafeNode(node) {
      const elementNodeType = 1;
      const textNodeType = 3;
      const allowedTags = new Set([
        'A',
        'B',
        'BR',
        'CODE',
        'EM',
        'I',
        'LI',
        'OL',
        'P',
        'SPAN',
        'STRONG',
        'UL',
      ]);

      if (node.nodeType === textNodeType) {
        return document.createTextNode(node.textContent || '');
      }

      if (node.nodeType !== elementNodeType) {
        return null;
      }

      const tagName = node.tagName.toUpperCase();
      if (!allowedTags.has(tagName)) {
        const fragment = document.createDocumentFragment();
        Array.from(node.childNodes).forEach((childNode) => {
          const safeChild = this.cloneSafeNode(childNode);
          if (safeChild) {
            fragment.appendChild(safeChild);
          }
        });
        return fragment;
      }

      const safeElement = document.createElement(node.tagName.toLowerCase());

      if (tagName === 'A') {
        const href = node.getAttribute('href');
        if (href && this.isSafeHref(href)) {
          safeElement.setAttribute('href', href);
        }

        if (node.getAttribute('target') === '_blank') {
          safeElement.setAttribute('target', '_blank');
          safeElement.setAttribute('rel', 'noopener noreferrer');
        }
      }

      Array.from(node.childNodes).forEach((childNode) => {
        const safeChild = this.cloneSafeNode(childNode);
        if (safeChild) {
          safeElement.appendChild(safeChild);
        }
      });

      return safeElement;
    }

    /**
     * Build a safe definition fragment from glossary markup
     * @param {HTMLElement} definitionElement - Source glossary definition element
     * @returns {DocumentFragment} Safe fragment for insertion into the live DOM
     */
    buildSafeDefinition(definitionElement) {
      const fragment = document.createDocumentFragment();

      Array.from(definitionElement.childNodes).forEach((childNode) => {
        const safeChild = this.cloneSafeNode(childNode);
        if (safeChild) {
          fragment.appendChild(safeChild);
        }
      });

      return fragment;
    }

    /**
     * Replace popover contents with safe glossary content
     * @param {HTMLElement} popover - Popover element to populate
     * @param {string} popoverTargetId - Popover id used by the close button
     * @param {Object} content - Glossary content object
     */
    renderPopoverContent(popover, popoverTargetId, content) {
      const heading = document.createElement('h2');
      heading.textContent = content.termText;

      const definitionContainer = document.createElement('p');
      definitionContainer.appendChild(this.buildSafeDefinition(content.definitionElement));

      const closeButton = document.createElement('button');
      closeButton.type = 'button';
      closeButton.setAttribute('popovertarget', popoverTargetId);
      closeButton.setAttribute('popovertargetaction', 'hide');
      closeButton.className = 'popover-close-button';
      closeButton.textContent = 'Close';

      popover.replaceChildren(heading, definitionContainer, closeButton);
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
     * Get glossary term and definition content
     * @param {string} term - The term identifier (e.g., 'html', 'css')
     * @returns {Object|null} Object with termText and definitionElement, or null if not found
     */
    getGlossaryContent(term) {
      const glossaryId = `glossary-${term}`;

      // Find the term and definition in the glossary
      const dt = this.glossaryDoc.getElementById(glossaryId);
      if (!dt) {
        Debug.warn(`Glossary term not found: ${glossaryId}`);
        return null;
      }

      const termText = dt.textContent.trim();

      // Get the next sibling dd element (definition)
      const dd = dt.nextElementSibling;
      if (!dd || dd.tagName !== 'DD') {
        Debug.warn(`Definition not found for term: ${glossaryId}`);
        return null;
      }

      return { termText, definitionElement: dd };
    }

    /**
     * Populate shared popover with glossary content for a specific term
     * @param {HTMLElement} popover - The shared popover element
     * @param {string} term - The term to display
     */
    populateSharedPopover(popover, term) {
      const content = this.getGlossaryContent(term);
      if (!content) {
        return;
      }

      this.renderPopoverContent(popover, popover.id, content);
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

      const content = this.getGlossaryContent(term);
      if (!content) {
        return;
      }

      this.renderPopoverContent(popover, popoverId, content);
    }

    /**
     * Setup event listeners for glossary icon buttons that use a shared popover
     */
    setupSharedPopover() {
      const sharedPopover = document.getElementById('glossary-popover');
      if (!sharedPopover) {
        return;
      }

      // Find all glossary icon buttons with data-glossary-term attribute
      const glossaryButtons = document.querySelectorAll(
        '.glossary-icon-button[data-glossary-term]'
      );

      glossaryButtons.forEach((button) => {
        button.addEventListener('click', () => {
          const term = button.getAttribute('data-glossary-term');
          if (term) {
            this.populateSharedPopover(sharedPopover, term);
          }
        });
      });
    }

    /**
     * Find and populate all glossary popovers on the page
     */
    async init() {
      try {
        await this.fetchGlossary();

        // Setup shared popover if it exists
        this.setupSharedPopover();

        // Also support individual popovers (legacy)
        const glossaryPopovers = document.querySelectorAll('.glossary-popover');
        glossaryPopovers.forEach((popover) => {
          // Only populate if it has a term-specific ID
          if (this.extractTermFromId(popover.id)) {
            this.populatePopover(popover);
          }
        });
      } catch (error) {
        Debug.error('Error loading glossary:', error);
      }
    }
  }

  // Initialise on DOM ready
  document.addEventListener('DOMContentLoaded', async function () {
    const injector = new GlossaryPopoverInjector();
    await injector.init();
  });
})();
