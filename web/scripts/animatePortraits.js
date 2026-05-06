/* global Utils, Debug */

/*
 **********************************************************************
 * File       : scripts/animatePortraits.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Manages animated portrait blocks on the index page.
 *   - Selects random portraits from images/portraits directory
 *   - Uses CSS animations for fade transitions (2s in, 5s display, 2s out)
 *   - Responsive: hidden <400px, single between blocks 400-800px, sides >800px
 *   - Cross-fading alternation at >800px
 *   Requires: utils.js (for Utils.randomInt)
 *
 *   Animation preference priority (first match wins):
 *   1. ?animation=on|off|auto query parameter (for testing)
 *   2. localStorage 'animationPreference' (user's toggle button choice)
 *   3. prefers-reduced-motion media query (system accessibility setting)
 **********************************************************************
 */

(function () {
  'use strict';

  /**
   * Class for managing animated portrait blocks
   */
  class PortraitAnimator {
    constructor() {
      this.portraits = [
        'rachel-mulligan-witch-old-female.png',
        'rachel-mulligan-wizard-old-female.png',
        'rachel-mulligan-wizard-young-male.png',
        'rachel-mulligan-wizard-old-male.png',
        'rachel-mulligan-wizard-young-female.png',
        'rachel-mulligan-witch-old-male.png',
        'rachel-mulligan-witch-young-female.png',
        'rachel-mulligan-witch-young-male.png',
      ];
      this.portraitPath = 'images/portraits/';
      this.cycleDuration = 9000; // 2s fade in + 5s display + 2s fade out
      this.usedPortraits = new Set();
      this.timers = [];

      this.init();
    }

    /**
     * Initialise the portrait animator
     */
    init() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setupPortraits());
      } else {
        this.setupPortraits();
      }
    }

    /**
     * Get a random portrait that hasn't been used recently
     * @returns {string} Portrait filename
     */
    getRandomPortrait() {
      // Reset used portraits if we've used them all
      if (this.usedPortraits.size >= this.portraits.length) {
        this.usedPortraits.clear();
      }

      // Get available portraits
      const available = this.portraits.filter((p) => !this.usedPortraits.has(p));

      // Pick random from available
      const portrait = available[Utils.randomInt(0, available.length - 1)];
      this.usedPortraits.add(portrait);

      return portrait;
    }

    /**
     * Create and insert a portrait image with CSS animation
     * @param {HTMLElement} container - The portrait block container
     * @param {string} portrait - Portrait filename
     */
    setPortraitImage(container, portrait) {
      const img = container.querySelector('.portrait-image');

      // Randomly decide whether to flip the image horizontally
      const shouldFlip = Math.random() < 0.5;

      if (!img) {
        // Create initial image
        const newImg = document.createElement('img');
        newImg.src = `${this.portraitPath}${portrait}`;
        newImg.alt = 'Character portrait';
        newImg.className = 'portrait-image';
        if (shouldFlip) {
          newImg.style.transform = 'scaleX(-1)';
        }
        container.appendChild(newImg);
      } else {
        // Update existing image - CSS animation handles the transition
        img.src = `${this.portraitPath}${portrait}`;

        // Apply or remove flip
        if (shouldFlip) {
          img.style.transform = 'scaleX(-1)';
        } else {
          img.style.transform = '';
        }

        // Force reflow to restart animation
        container.classList.remove('animating');
        void container.offsetWidth; // Trigger reflow
        container.classList.add('animating');
      }

      // Set new random position with each image change (will jump instantly, no transition)
      this.setRandomPortraitPosition(container);
    }

    /**
     * Cycle portraits for a given block
     * @param {HTMLElement} container - The portrait block container
     */
    startPortraitCycle(container) {
      // Set initial portrait
      const initialPortrait = this.getRandomPortrait();
      this.setPortraitImage(container, initialPortrait);
      container.classList.add('animating');

      // Set up interval to change portraits
      const timer = setInterval(() => {
        const newPortrait = this.getRandomPortrait();
        this.setPortraitImage(container, newPortrait);
      }, this.cycleDuration);

      this.timers.push(timer);
    }

    /**
     * Set random vertical position for a specific portrait block
     * Ensures portrait stays within visible viewport, avoiding header/footer overlap
     * @param {HTMLElement} container - The portrait block container
     */
    setRandomPortraitPosition(container) {
      if (!container) return;

      // Only apply random positions at >800px
      if (window.innerWidth <= 800) {
        container.style.removeProperty('--portrait-offset');
        return;
      }

      // Get actual portrait size and position
      const portraitRect = container.getBoundingClientRect();
      const portraitSize = portraitRect.height;

      if (portraitSize === 0) {
        container.style.removeProperty('--portrait-offset');
        return;
      }

      // Current center position in viewport
      const portraitCenterY = portraitRect.top + portraitSize / 2;

      // Get viewport dimensions and element positions
      const viewportHeight = window.innerHeight;
      const header = document.querySelector('header');
      const footer = document.querySelector('footer');
      const main = document.querySelector('main');

      // Calculate boundaries
      const headerRect = header ? header.getBoundingClientRect() : null;
      const headerHeight = headerRect ? headerRect.height : 0;
      const footerRect = footer ? footer.getBoundingClientRect() : null;
      const footerHeight = footerRect ? footerRect.height : 60;
      const footerTop = footerRect ? footerRect.top : viewportHeight;
      const mainRect = main ? main.getBoundingClientRect() : null;
      const mainTop = mainRect ? mainRect.top : headerHeight;
      const mainBottom = mainRect ? mainRect.bottom : viewportHeight - footerHeight;
      const padding = 40; // Safety padding from edges

      // Log dimensions for debugging
      Debug.log('Portrait Position Calculation:', {
        viewportHeight,
        header: { height: headerHeight },
        footer: { height: footerHeight, top: footerTop },
        main: { top: mainTop, bottom: mainBottom, height: mainBottom - mainTop },
        portrait: { centerY: portraitCenterY, size: portraitSize },
        padding,
      });

      // Calculate safe range for offset
      // Portrait top edge = portraitCenterY - portraitSize/2 + offset
      // Portrait bottom edge = portraitCenterY + portraitSize/2 + offset

      // Constraints:
      // Top edge >= max(headerHeight, mainTop) + padding:
      const topBoundary = Math.max(headerHeight, mainTop) + padding;
      const minOffset = Math.ceil(topBoundary - portraitCenterY + portraitSize / 2);

      // Bottom edge <= min(viewportHeight - footerHeight, footerTop, mainBottom) - padding:
      const bottomBoundary =
        Math.min(viewportHeight - footerHeight, footerTop, mainBottom) - padding;
      const maxOffset = Math.floor(bottomBoundary - portraitCenterY - portraitSize / 2);

      Debug.log('Boundary Calculations:', {
        topBoundary,
        bottomBoundary,
        minOffset,
        maxOffset,
        hasRoom: maxOffset > minOffset + 20,
      });

      // Check if there's room to move
      if (maxOffset <= minOffset + 20) {
        // Not enough room for meaningful randomisation, stay centred
        container.style.removeProperty('--portrait-offset');
        return;
      }

      // Generate random vertical offset within safe range
      const offset = Utils.randomInt(minOffset, maxOffset);

      // Set CSS custom property
      container.style.setProperty('--portrait-offset', `${offset}px`);
    }

    /**
     * Set random vertical position for portrait blocks at desktop widths
     * Ensures portraits fit within viewport
     */
    setRandomPortraitPositions() {
      const portrait1 = document.getElementById('portrait-block-1');
      const portrait2 = document.getElementById('portrait-block-2');

      this.setRandomPortraitPosition(portrait1);
      this.setRandomPortraitPosition(portrait2);
    }

    /**
     * Set up portrait blocks with animations
     */
    setupPortraits() {
      const portrait1 = document.getElementById('portrait-block-1');
      const portrait2 = document.getElementById('portrait-block-2');

      if (!portrait1 || !portrait2) {
        Debug.log('Portrait blocks not found on this page');
        return;
      }

      // Check animation preference in this order:
      // 1. Query parameter (for testing/screenshots)
      // 2. localStorage (user's button toggle preference)
      // 3. prefers-reduced-motion (system accessibility setting)
      const animationParam = window.QueryParams ? window.QueryParams.getAnimation() : null;
      let shouldAnimate;

      if (animationParam === 'off') {
        // Explicitly disabled via query parameter
        shouldAnimate = false;
      } else if (animationParam === 'on') {
        // Explicitly enabled via query parameter
        shouldAnimate = true;
      } else {
        // Check localStorage for user's toggle preference
        try {
          const storedPref = localStorage.getItem('animationPreference');
          if (storedPref === 'disabled') {
            shouldAnimate = false;
          } else if (storedPref === 'enabled') {
            shouldAnimate = true;
          } else {
            // Auto mode: check user's prefers-reduced-motion setting
            const prefersReducedMotion = window.matchMedia(
              '(prefers-reduced-motion: reduce)'
            ).matches;
            shouldAnimate = !prefersReducedMotion;
          }
        } catch (error) {
          // If localStorage fails, fall back to prefers-reduced-motion
          const prefersReducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
          ).matches;
          shouldAnimate = !prefersReducedMotion;
        }
      }

      if (!shouldAnimate) {
        // Show static portraits without animation
        const staticPortrait1 = this.getRandomPortrait();
        const staticPortrait2 = this.getRandomPortrait();

        this.setPortraitImage(portrait1, staticPortrait1);
        this.setPortraitImage(portrait2, staticPortrait2);

        // Remove 'animating' class if present and add 'static' class
        portrait1.classList.remove('animating');
        portrait1.classList.add('static');
        portrait2.classList.remove('animating');
        portrait2.classList.add('static');

        return; // Exit early, no animation cycles
      }

      // Ensure 'static' class is removed before starting animations
      portrait1.classList.remove('static');
      portrait2.classList.remove('static');

      // Clear any existing timers
      this.timers.forEach((timer) => clearInterval(timer));
      this.timers = [];

      // Set initial random vertical positions for desktop
      this.setRandomPortraitPositions();

      // Update positions on resize
      window.addEventListener('resize', () => {
        this.setRandomPortraitPositions();
      });

      // Start portrait cycle for block 1
      this.startPortraitCycle(portrait1);

      // Start portrait cycle for block 2, offset by half cycle for alternating effect
      Utils.delay(this.cycleDuration / 2).then(() => {
        this.startPortraitCycle(portrait2);
      });
    }

    /**
     * Restart portrait animations (used when toggling animation preference)
     */
    restart() {
      // Get portrait elements
      const portrait1 = document.getElementById('portrait-block-1');
      const portrait2 = document.getElementById('portrait-block-2');

      // Clear existing timers
      this.timers.forEach((timer) => clearInterval(timer));
      this.timers = [];

      // Reset used portraits
      this.usedPortraits.clear();

      // Clean up existing state from portrait blocks
      if (portrait1) {
        portrait1.classList.remove('static', 'animating');
        const img1 = portrait1.querySelector('.portrait-image');
        if (img1) img1.style.opacity = '0';
      }
      if (portrait2) {
        portrait2.classList.remove('static', 'animating');
        const img2 = portrait2.querySelector('.portrait-image');
        if (img2) img2.style.opacity = '0';
      }

      // Re-setup portraits with new preference
      this.setupPortraits();
    }
  }

  // Create global instance
  window.PortraitAnimator = new PortraitAnimator();
})();
