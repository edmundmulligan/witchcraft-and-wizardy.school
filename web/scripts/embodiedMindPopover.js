/*
 **********************************************************************
 * File       : scripts/embodiedMindPopover.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Creates an interactive popover for the Embodied Mind logo in the footer.
 *   Clicking the logo displays information about The Embodied Mind.
 **********************************************************************
 */

(function () {
  'use strict';

  /**
   * Class for managing the Embodied Mind logo popover
   */
  class EmbodiedMindPopover {
    /**
     * Initialise the popover manager
     */
    constructor() {
      this.popover = null;
      this.logo = null;
      this.backdrop = null;
      this.data = null;
      this.supportsPopoverAPI = this.checkPopoverAPISupport();
    }

    /**
     * Check if the browser supports the Popover API
     * @returns {boolean} True if Popover API is supported
     */
    checkPopoverAPISupport() {
      return typeof HTMLElement.prototype.showPopover === 'function';
    }

    /**
     * Load the popover content data from JSON file
     * @returns {Promise<Object>} The loaded data
     */
    async loadData() {
      try {
        // Get the correct path prefix based on current page location
        const { pathPrefix } = Utils.getPageContext();
        const dataPath = `${pathPrefix}data/embodied-mind.json`;

        const response = await fetch(dataPath);
        if (!response.ok) {
          throw new Error(`Failed to load data: ${response.status}`);
        }
        this.data = await response.json();
        Utils.log('EmbodiedMindPopover: Data loaded successfully');
        return this.data;
      } catch (error) {
        Utils.log('EmbodiedMindPopover: Error loading data', error);
        throw error;
      }
    }

    /**
     * Create the popover element with content about The Embodied Mind
     * @returns {HTMLElement} The popover element
     */
    createPopover() {
      if (!this.data) {
        Utils.log('EmbodiedMindPopover: Data not loaded, cannot create popover');
        return null;
      }
      const popover = document.createElement('div');
      popover.id = 'embodied-mind-popover';
      popover.className = 'popover info-popover embodied-mind-popover';

      // Use Popover API if supported, otherwise use display toggle
      if (this.supportsPopoverAPI) {
        popover.popover = 'auto';
      } else {
        popover.style.display = 'none';
        popover.style.position = 'fixed';
        popover.style.zIndex = '1000';

        // Create backdrop for non-Popover API browsers
        this.backdrop = document.createElement('div');
        this.backdrop.className = 'embodied-mind-popover-backdrop';
        this.backdrop.addEventListener('click', () => this.hidePopover());
        document.body.appendChild(this.backdrop);
      }

      // Build paragraphs from data
      const paragraphsHTML = this.data.paragraphs
        .map((p) => `<p>${p.content}</p>`)
        .join('\n                ');

      popover.innerHTML = `
                <h3>${this.data.title}</h3>
                ${paragraphsHTML}
                <p>
                    <a href="${this.data.link.url}" target="_blank" rel="noopener noreferrer">
                        ${this.data.link.text}
                    </a>
                </p>
                <button id="embodied-mind-popover-close">${this.data.closeButtonText}</button>
            `;

      document.body.appendChild(popover);

      // Set up close button
      const closeBtn = popover.querySelector('#embodied-mind-popover-close');
      closeBtn.addEventListener('click', () => this.hidePopover());

      Utils.log('EmbodiedMindPopover: Popover created', { supportsAPI: this.supportsPopoverAPI });
      return popover;
    }

    /**
     * Show the popover
     */
    showPopover() {
      if (!this.popover) return;

      if (this.supportsPopoverAPI) {
        try {
          this.popover.showPopover();
        } catch (error) {
          Utils.log('EmbodiedMindPopover: Error showing popover', error);
          // Fallback to display toggle
          this.popover.style.display = 'block';
        }
      } else {
        this.popover.style.display = 'block';
        if (this.backdrop) {
          this.backdrop.classList.add('active');
        }
      }
      Utils.log('EmbodiedMindPopover: Popover shown');
    }

    /**
     * Hide the popover
     */
    hidePopover() {
      if (!this.popover) return;

      if (this.supportsPopoverAPI) {
        try {
          this.popover.hidePopover();
        } catch (error) {
          Utils.log('EmbodiedMindPopover: Error hiding popover', error);
          this.popover.style.display = 'none';
        }
      } else {
        this.popover.style.display = 'none';
        if (this.backdrop) {
          this.backdrop.classList.remove('active');
        }
      }
      Utils.log('EmbodiedMindPopover: Popover hidden');
    }

    /**
     * Set up the logo as a clickable trigger for the popover
     */
    setupLogoTrigger() {
      this.logo = document.getElementById('embodied-mind-logo');

      if (!this.logo) {
        Utils.log('EmbodiedMindPopover: Logo not found');
        return;
      }

      // Make the logo clickable
      this.logo.style.cursor = 'pointer';
      this.logo.setAttribute('role', 'button');
      this.logo.setAttribute('tabindex', '0');
      this.logo.setAttribute('aria-label', 'Click to learn more about The Embodied Mind');

      // Add click handler
      this.logo.addEventListener('click', () => {
        Utils.log('EmbodiedMindPopover: Logo clicked');
        this.showPopover();
      });

      // Also support keyboard interaction
      this.logo.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          Utils.log('EmbodiedMindPopover: Logo activated via keyboard');
          this.showPopover();
        }
      });

      Utils.log('EmbodiedMindPopover: Logo click handler set up');
    }

    /**
     * Initialise the popover system
     */
    async init() {
      Utils.log('EmbodiedMindPopover: Initialising...');

      // Set up listener for footer injection BEFORE loading data
      // to avoid missing the event if it fires while we're loading
      let footerInjectedPromise = null;
      if (!document.getElementById('embodied-mind-logo')) {
        Utils.log('EmbodiedMindPopover: Logo not found yet, setting up listener');
        footerInjectedPromise = new Promise((resolve) => {
          document.addEventListener('footerInjected', resolve, { once: true });
        });
      }

      // Load data
      try {
        await this.loadData();
      } catch (error) {
        Utils.log('EmbodiedMindPopover: Failed to load data, cannot initialise');
        return;
      }

      // Wait for footer if it wasn't ready before
      if (footerInjectedPromise && !document.getElementById('embodied-mind-logo')) {
        Utils.log('EmbodiedMindPopover: Waiting for footer injection');
        await footerInjectedPromise;
        Utils.log('EmbodiedMindPopover: Footer injected event received');
      } else {
        Utils.log('EmbodiedMindPopover: Logo is ready');
      }

      // Set up popover
      this.popover = this.createPopover();
      if (this.popover) {
        this.setupLogoTrigger();
        Utils.log('EmbodiedMindPopover: Setup complete');
      }
    }
  }

  // Initialise on DOM ready
  document.addEventListener('DOMContentLoaded', async function () {
    Utils.log('EmbodiedMindPopover: DOM ready, creating instance');
    const popoverManager = new EmbodiedMindPopover();
    await popoverManager.init();
  });
})();
