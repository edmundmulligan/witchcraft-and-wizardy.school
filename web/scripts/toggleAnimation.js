/*
 **********************************************************************
 * File       : scripts/toggleAnimation.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Manages the animation toggle button on the index page.
 *   Allows users to enable/disable portrait animations by storing
 *   preference in localStorage and restarting the animation system.
 *
 *   Button states:
 *   - "Disable Animation" - animations are currently enabled
 *   - "Enable Animation" - animations are currently disabled
 **********************************************************************
 */

(function () {
  'use strict';

  /**
   * Class for managing animation toggle button
   */
  class AnimationToggle {
    constructor() {
      this.button = null;
      this.STORAGE_KEY = 'animationPreference';
      this.init();
    }

    /**
     * Initialise the animation toggle
     */
    init() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setup());
      } else {
        this.setup();
      }
    }

    /**
     * Set up the button and initial state
     */
    setup() {
      this.button = document.getElementById('animations-button');

      if (!this.button) {
        Debug.log('Animation toggle button not found on this page');
        return;
      }

      // Set initial button text based on current state
      this.updateButtonText();

      // Add click handler
      this.button.addEventListener('click', () => this.toggleAnimation());
    }

    /**
     * Get current animation state
     * @returns {boolean} True if animations are enabled
     */
    isAnimationEnabled() {
      // Check query parameter first (for testing)
      const queryParam = window.QueryParams ? window.QueryParams.getAnimation() : null;
      if (queryParam === 'off') return false;
      if (queryParam === 'on') return true;

      // Check localStorage
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored === 'disabled') return false;
        if (stored === 'enabled') return true;
      } catch (error) {
        Debug.error('Error reading animation preference:', error);
      }

      // Default: check prefers-reduced-motion
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      return !prefersReducedMotion;
    }

    /**
     * Update button text based on current animation state
     */
    updateButtonText() {
      if (!this.button) return;

      const isEnabled = this.isAnimationEnabled();

      if (isEnabled) {
        this.button.textContent = 'Disable Animation';
      } else {
        this.button.textContent = 'Enable Animation';
      }
    }

    /**
     * Toggle animation state
     */
    toggleAnimation() {
      const currentlyEnabled = this.isAnimationEnabled();
      const newState = !currentlyEnabled;

      try {
        // Save new state to localStorage
        localStorage.setItem(this.STORAGE_KEY, newState ? 'enabled' : 'disabled');

        // Update button text
        this.updateButtonText();

        // Restart portrait animations with new state
        if (window.PortraitAnimator && typeof window.PortraitAnimator.restart === 'function') {
          window.PortraitAnimator.restart();
        } else {
          Debug.warn('PortraitAnimator not available or restart method not found');
        }

        // Log state change for debugging
        Debug.log(`Animations ${newState ? 'enabled' : 'disabled'}`);
      } catch (error) {
        Debug.error('Error toggling animation:', error);
      }
    }

    /**
     * Get animation preference for external use
     * @returns {string} 'enabled', 'disabled', or 'auto'
     */
    getPreference() {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored === 'disabled') return 'disabled';
        if (stored === 'enabled') return 'enabled';
      } catch (error) {
        Debug.error('Error reading animation preference:', error);
      }
      return 'auto';
    }

    /**
     * Reset to auto mode (follow system preference)
     */
    resetToAuto() {
      try {
        localStorage.removeItem(this.STORAGE_KEY);
        this.updateButtonText();

        if (window.PortraitAnimator && typeof window.PortraitAnimator.restart === 'function') {
          window.PortraitAnimator.restart();
        }

        Debug.log('Animation preference reset to auto');
      } catch (error) {
        Debug.error('Error resetting animation preference:', error);
      }
    }
  }

  // Create global instance
  window.AnimationToggle = new AnimationToggle();
})();
