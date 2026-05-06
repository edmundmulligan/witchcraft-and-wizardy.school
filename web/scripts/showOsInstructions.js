/*
 **********************************************************************
 * File       : scripts/showOsInstructions.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 6 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Shows OS-specific instructions based on radio button selection
 **********************************************************************
 */

(function () {
  'use strict';

  /**
   * Show or hide OS-specific lesson instructions in response to the selected radio button.
   *
   * @remarks Preconditions:
   * - The page must use `input[name="os"]` radio controls.
   * - OS-specific sections must follow the `lesson-install-<os>` class naming convention.
   */
  class OSInstructionSwitcher {
    /**
     * Create the instruction switcher and initialise its cached radio collection.
     *
     * @returns {void}
     */
    constructor() {
      this.osRadios = null;
    }

    /**
     * Hide all OS-specific instruction sections
     */
    hideAllInstructions() {
      // Find all sections with lesson-install-* classes
      const allOSSections = document.querySelectorAll('[class*="lesson-install-"]');
      allOSSections.forEach((section) => {
        section.classList.add('hidden');
        // Clear any inline display style that might override the hidden class
        section.style.display = '';
      });
    }

    /**
     * Show instructions for a specific OS
     * @param {string} osValue - The OS value (e.g., 'windows', 'macos', 'linux')
     */
    showInstructions(osValue) {
      // First hide all OS-specific sections
      this.hideAllInstructions();

      // Then show all sections for the selected OS
      const selectedSections = document.querySelectorAll(`.lesson-install-${osValue}`);
      selectedSections.forEach((section) => {
        section.classList.remove('hidden');
        // Clear any inline display style so CSS can take over
        section.style.display = '';
      });

      // Reinitialise lesson navigation to update the progress bar
      // for the new set of visible sections
      if (window.lessonNavigationInjector) {
        window.lessonNavigationInjector.reinitialise();
      }
    }

    /**
     * Set up event listeners for OS radio buttons
     */
    setupListeners() {
      this.osRadios = document.querySelectorAll('input[name="os"]');

      if (this.osRadios.length === 0) {
        return; // Not on a page with OS selection
      }

      // Add change event listener to all OS radio buttons
      this.osRadios.forEach((radio) => {
        radio.addEventListener('change', () => {
          this.showInstructions(radio.value);
        });
      });
    }

    /**
     * Initialise the OS instruction switcher
     */
    init() {
      this.setupListeners();

      // Check if an OS is already selected (e.g., from form restoration) and show its instructions
      const selectedRadio = document.querySelector('input[name="os"]:checked');
      if (selectedRadio) {
        this.showInstructions(selectedRadio.value);
      }
    }
  }

  // Initialise on DOM ready
  document.addEventListener('DOMContentLoaded', function () {
    const switcher = new OSInstructionSwitcher();
    switcher.init();
  });
})();
