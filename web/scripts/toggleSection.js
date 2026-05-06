/*
 **********************************************************************
 * File       : scripts/toggleSection.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Handles toggle functionality for collapsible sections.
 *   It adds event listeners to elements with the class 'magicVisible'.
 *   When clicked, it toggles the visibility of the corresponding section
 *   and changes the class of the clicked element.
 **********************************************************************
 */

(function () {
  'use strict';

  /**
   * Class for managing collapsible sections
   */
  class SectionToggler {
    /**
     * Toggle section visibility
     * @param {string} sectionId - The ID of the section to toggle
     * @param {Event} event - The triggering event
     */
    toggleSection(sectionId, event) {
      // For keyboard events, only respond to Enter or Space
      if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') {
        return;
      }

      // Prevent default for Space key to avoid page scroll
      if (event.key === ' ') {
        event.preventDefault();
      }

      const section = document.getElementById(sectionId);
      if (!section) {
        return;
      }

      const isExpanded = !section.classList.contains('hidden');

      // Toggle visibility
      section.classList.toggle('hidden');
      const isNowHidden = section.classList.contains('hidden');

      // Keep magic classes in sync with section visibility state.
      event.currentTarget.classList.toggle('magic-invisible', isNowHidden);
      event.currentTarget.classList.toggle('magic-visible', !isNowHidden);

      // Update ARIA attributes for accessibility
      event.currentTarget.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
    }

    /**
     * Collapse a section when clicking on magic-block
     * @param {string} sectionId - The ID of the section to collapse
     * @param {Event} event - The triggering event
     */
    toggleSectionCollapse(sectionId, event) {
      // For keyboard events, only respond to Enter or Space
      if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') {
        return;
      }

      // Prevent default for Space key to avoid page scroll
      if (event.key === ' ') {
        event.preventDefault();
      }

      const section = document.getElementById(sectionId);
      if (!section) {
        return;
      }

      // Hide the section
      section.classList.add('hidden');

      // Find the corresponding toggle heading and change it to magic-invisible
      const toggleHeading = document.querySelector(`[onclick*="'${sectionId}'"]`);
      if (toggleHeading) {
        toggleHeading.classList.remove('magic-visible');
        toggleHeading.classList.add('magic-invisible');
        toggleHeading.setAttribute('aria-expanded', 'false');
      }
    }

    /**
     * Initialise accessibility attributes on page load
     */
    initAccessibility() {
      // Find all toggleable headings and add proper attributes
      const toggleHeadings = document.querySelectorAll('.faq-title');
      toggleHeadings.forEach((heading) => {
        // Make keyboard focusable
        heading.setAttribute('tabindex', '0');

        // Add ARIA expanded attribute (don't override heading role)
        heading.setAttribute('aria-expanded', 'false');
      });

      // Find all magic-block elements and add proper attributes
      const magicBlocks = document.querySelectorAll('.magic-block');
      magicBlocks.forEach((block) => {
        // Make keyboard focusable
        block.setAttribute('tabindex', '0');
        block.setAttribute('role', 'button');
        block.setAttribute('aria-label', 'Collapse section');
      });
    }

    /**
     * Initialise the section toggler
     */
    init() {
      this.initAccessibility();
    }
  }

  // Create global instance
  const toggler = new SectionToggler();

  // Expose functions globally for inline handlers
  window.toggleSection = (sectionId, event) => toggler.toggleSection(sectionId, event);
  window.toggleSectionCollapse = (sectionId, event) =>
    toggler.toggleSectionCollapse(sectionId, event);

  // Initialise on DOM ready
  document.addEventListener('DOMContentLoaded', () => toggler.init());
})();
