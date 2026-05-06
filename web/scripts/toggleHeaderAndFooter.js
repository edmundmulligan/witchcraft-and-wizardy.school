/*
 **********************************************************************
 * File       : scripts/toggleHeaderAndFooter.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Handles toggle functionality for collapsible header and footer
 *   sections. Works with both header-minimal/header-full and
 *   footer-minimal/footer-full elements.
 *   This script sets up listeners after the header and footer are injected.
 *   Saves state to localStorage to persist across pages.
 *   Requires: queryParams.js (for window.QueryParams)
 **********************************************************************
 */

(function () {
  'use strict';

  /**
   * Manage expand/collapse behaviour for injected header and footer variants.
   *
   * @remarks Preconditions:
   * - `injectCommonCode.js` must dispatch the `headerInjected` and `footerInjected` events.
   * - The generated markup must contain the expected minimal/full wrappers and toggle buttons.
   * - Animation classes and transitions are defined in `styles/components/header-and-footer.css`.
   * - Animation timing variables are defined in `styles/definitions/animation.css` (`--toggle-duration` and `--toggle-timing-function`).
   * - `queryParams.js` must be loaded for query parameter support.
   */
  class HeaderFooterToggler {
    /**
     * Create storage keys used to persist header and footer state between page loads.
     *
     * @returns {void}
     */
    constructor() {
      this.HEADER_STATE_KEY = 'headerState';
      this.FOOTER_STATE_KEY = 'footerState';
    }

    /**
     * Set up header toggle functionality
     */
    setupHeaderToggle() {
      const header = document.querySelector('header.header');
      if (!header) {
        return;
      }

      const headerMinimal = header.querySelector('.header-minimal');
      const headerFull = header.querySelector('.header-full');
      const headerButtons = header.querySelectorAll('.header-button button');

      // Check URL query parameter first (overrides localStorage)
      const expandParam = window.QueryParams.getExpandHeader();
      let initialState;

      if (expandParam === true) {
        initialState = 'expanded';
      } else if (expandParam === false) {
        initialState = 'compact';
      } else {
        // Fall back to saved state from localStorage
        initialState = localStorage.getItem(this.HEADER_STATE_KEY);
      }

      if (initialState === 'expanded') {
        headerMinimal.classList.remove('visible');
        headerMinimal.classList.add('hidden');
        headerFull.classList.remove('hidden');
        headerFull.classList.add('visible');
      } else if (initialState === 'compact') {
        headerMinimal.classList.remove('hidden');
        headerMinimal.classList.add('visible');
        headerFull.classList.remove('visible');
        headerFull.classList.add('hidden');
      } else {
        // Default state
        headerMinimal.classList.add('visible');
        headerFull.classList.add('hidden');
      }

      headerButtons.forEach((button) => {
        button.addEventListener('click', () => {
          const icon = button.querySelector('i');

          if (icon.classList.contains('fa-chevron-down')) {
            // Down arrow clicked - show full header
            headerMinimal.classList.remove('visible');
            headerMinimal.classList.add('hidden');
            headerFull.classList.remove('hidden');
            headerFull.classList.add('visible');
            localStorage.setItem(this.HEADER_STATE_KEY, 'expanded');
          } else {
            // Up arrow clicked - show minimal header
            headerMinimal.classList.remove('hidden');
            headerMinimal.classList.add('visible');
            headerFull.classList.remove('visible');
            headerFull.classList.add('hidden');
            localStorage.setItem(this.HEADER_STATE_KEY, 'compact');
          }
        });
      });
    }

    /**
     * Set up footer toggle functionality
     */
    setupFooterToggle() {
      const footer = document.querySelector('footer.footer');
      if (!footer) {
        return;
      }

      const footerMinimal = footer.querySelector('.footer-minimal');
      const footerFull = footer.querySelector('.footer-full');
      const footerButtons = footer.querySelectorAll('.footer-button button');

      // Check URL query parameter first (overrides localStorage)
      const expandParam = window.QueryParams.getExpandFooter();
      let initialState;

      if (expandParam === true) {
        initialState = 'expanded';
      } else if (expandParam === false) {
        initialState = 'compact';
      } else {
        // Fall back to saved state from localStorage
        initialState = localStorage.getItem(this.FOOTER_STATE_KEY);
      }

      if (initialState === 'expanded') {
        footerMinimal.classList.remove('visible');
        footerMinimal.classList.add('hidden');
        footerFull.classList.remove('hidden');
        footerFull.classList.add('visible');
      } else if (initialState === 'compact') {
        footerMinimal.classList.remove('hidden');
        footerMinimal.classList.add('visible');
        footerFull.classList.remove('visible');
        footerFull.classList.add('hidden');
      } else {
        // Default state
        footerMinimal.classList.add('visible');
        footerFull.classList.add('hidden');
      }

      footerButtons.forEach((button) => {
        button.addEventListener('click', () => {
          const icon = button.querySelector('i');

          if (icon.classList.contains('fa-chevron-up')) {
            // Up arrow clicked - show full footer
            footerMinimal.classList.remove('visible');
            footerMinimal.classList.add('hidden');
            footerFull.classList.remove('hidden');
            footerFull.classList.add('visible');
            localStorage.setItem(this.FOOTER_STATE_KEY, 'expanded');
          } else {
            // Down arrow clicked - show minimal footer
            footerMinimal.classList.remove('hidden');
            footerMinimal.classList.add('visible');
            footerFull.classList.remove('visible');
            footerFull.classList.add('hidden');
            localStorage.setItem(this.FOOTER_STATE_KEY, 'compact');
          }
        });
      });
    }

    /**
     * Initialise the toggler
     */
    init() {
      // Listen for custom events from inject scripts
      document.addEventListener('headerInjected', () => this.setupHeaderToggle());
      document.addEventListener('footerInjected', () => this.setupFooterToggle());
    }
  }

  // Create instance and initialise
  const toggler = new HeaderFooterToggler();
  toggler.init();
})();
