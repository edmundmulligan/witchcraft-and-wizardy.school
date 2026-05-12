/**
 * **********************************************************************
 * File       : feedbackNavigation.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Handles navigation functionality for the feedback form including:
 *   - Section navigation within the form
 *   - Progress bar updates with wand icons
 *   - Keyboard navigation support
 * **********************************************************************
 */

(function () {
  'use strict';

  /**
   * Class for managing feedback form navigation
   */
  class FeedbackNavigator {
    constructor() {
      this.sections = [];
      this.currentSectionIndex = 0;
      this.totalSections = 0;
      this.listenersSetup = false;
      this.keyboardSetup = false;

      this.init();
    }

    /**
     * Initialize the feedback navigator
     */
    init() {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setupNavigation());
      } else {
        this.setupNavigation();
      }
    }

    /**
     * Get section information from feedback-section elements
     */
    getSectionInfo() {
      const sections = document.querySelectorAll('.feedback-section');
      const sectionInfo = [];

      sections.forEach((section, index) => {
        let title = '';
        const h3 = section.querySelector('h3.lesson-title, h3');

        if (h3) {
          title = h3.textContent.trim();
        } else {
          title = section.id
            ? section.id.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
            : `Section ${sectionInfo.length + 1}`;
        }

        sectionInfo.push({
          index: sectionInfo.length,
          title,
          id: section.id || `section-${index}`,
        });
      });

      return sectionInfo;
    }

    /**
     * Generate wand icons HTML for progress bar
     */
    generateWandIcons(sections) {
      if (sections.length === 0) return '';

      return sections
        .map((section, index) => {
          const iconClass = index === 0 ? 'current' : 'next';
          const imgSrc =
            index === 0
              ? '../images/fontawesome/wand-magic-sparkles-sharp-duotone-regular-full.svg'
              : '../images/fontawesome/wand-magic-duotone-regular-full.svg';
          const altText = index === 0 ? 'Current section' : 'Next section';
          const imgClass = index === 0 ? 'wand-current' : 'wand-next';

          return `
                    <span class="feedback-wand-icon ${iconClass}" data-section="${index}" title="${section.title}">
                        <img src="${imgSrc}" alt="${altText}" class="${imgClass}">
                    </span>`;
        })
        .join('');
    }

    /**
     * Generate the complete navigation panel HTML
     */
    generateNavigationPanelHTML(sections) {
      const wandIcons = this.generateWandIcons(sections);
      const maxSections = Math.max(sections.length, 1);

      return `
            <nav class="feedback-navigation-panel" aria-label="Form section navigation">
                <div class="feedback-navigation-controls">
                    <!-- Backward -->
                    <button type="button" id="backwardBtn" class="feedback-nav-button feedback-section-nav" 
                            title="Go to previous section" aria-label="Previous section" disabled>
                        <i class="fa-duotone fa-regular fa-backward-step" aria-hidden="true"></i>
                    </button>

                    <!-- Progress Bar with Wand Icons -->
                    <div class="feedback-progress-container">
                        <div id="progressBar" class="feedback-progress-bar" role="progressbar" 
                             aria-valuenow="1" aria-valuemin="1" aria-valuemax="${maxSections}" 
                             aria-label="Section progress">
                            ${wandIcons}
                        </div>
                    </div>

                    <!-- Forward -->
                    <button type="button" id="forwardBtn" class="feedback-nav-button feedback-section-nav" 
                            title="Go to next section" aria-label="Next section">
                        <i class="fa-duotone fa-regular fa-forward-step" aria-hidden="true"></i>
                    </button>
                </div>
            </nav>`;
    }

    /**
     * Inject the navigation panel into the page
     */
    injectNavigation() {
      this.sections = this.getSectionInfo();
      this.totalSections = this.sections.length;

      if (this.totalSections === 0) {
        console.warn('No feedback sections found');
        return;
      }

      const navigationHTML = this.generateNavigationPanelHTML(this.sections);
      const pageTitle = document.querySelector('.page-title');

      if (pageTitle) {
        pageTitle.insertAdjacentHTML('afterend', navigationHTML);
      }
    }

    /**
     * Set up all navigation functionality
     */
    setupNavigation() {
      this.injectNavigation();
      this.setupButtonListeners();
      this.setupProgressBarListeners();
      this.setupKeyboardNavigation();
      this.updateProgress();
    }

    /**
     * Set up button click listeners
     */
    setupButtonListeners() {
      if (this.listenersSetup) return;

      const forwardBtn = document.getElementById('forwardBtn');
      const backwardBtn = document.getElementById('backwardBtn');

      if (forwardBtn) {
        forwardBtn.addEventListener('click', () => this.goToNextSection());
      }

      if (backwardBtn) {
        backwardBtn.addEventListener('click', () => this.goToPreviousSection());
      }

      this.listenersSetup = true;
    }

    /**
     * Set up progress bar click listeners
     */
    setupProgressBarListeners() {
      const wandIcons = document.querySelectorAll('.feedback-wand-icon');
      wandIcons.forEach((wand, index) => {
        wand.addEventListener('click', () => this.goToSection(index));
        wand.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.goToSection(index);
          }
        });
        wand.setAttribute('tabindex', '0');
      });
    }

    /**
     * Set up keyboard navigation
     */
    setupKeyboardNavigation() {
      if (this.keyboardSetup) return;

      document.addEventListener('keydown', (event) => {
        // Don't interfere if user is typing in a form field
        if (
          event.target.matches('input, textarea, select') ||
          event.target.isContentEditable
        ) {
          return;
        }

        switch (event.key) {
          case 'ArrowRight':
          case 'PageDown':
            event.preventDefault();
            this.goToNextSection();
            break;
          case 'ArrowLeft':
          case 'PageUp':
            event.preventDefault();
            this.goToPreviousSection();
            break;
          case 'Home':
            event.preventDefault();
            this.goToSection(0);
            break;
          case 'End':
            event.preventDefault();
            this.goToSection(this.totalSections - 1);
            break;
        }
      });

      this.keyboardSetup = true;
    }

    /**
     * Navigate to a specific section
     */
    goToSection(index) {
      if (index < 0 || index >= this.totalSections) return;

      // Hide all sections
      const allSections = document.querySelectorAll('.feedback-section');
      allSections.forEach((section) => section.classList.add('hidden'));

      // Show the target section
      if (allSections[index]) {
        allSections[index].classList.remove('hidden');
        this.currentSectionIndex = index;
        this.updateProgress();
        this.updateButtons();

        // Scroll to top of form
        const form = document.getElementById('feedback-form');
        if (form) {
          form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }

    /**
     * Go to the next section
     */
    goToNextSection() {
      if (this.currentSectionIndex < this.totalSections - 1) {
        this.goToSection(this.currentSectionIndex + 1);
      }
    }

    /**
     * Go to the previous section
     */
    goToPreviousSection() {
      if (this.currentSectionIndex > 0) {
        this.goToSection(this.currentSectionIndex - 1);
      }
    }

    /**
     * Update progress bar display
     */
    updateProgress() {
      const wandIcons = document.querySelectorAll('.feedback-wand-icon');
      const progressBar = document.querySelector('.feedback-progress-bar');

      if (progressBar && this.totalSections > 0) {
        const progressPercent = ((this.currentSectionIndex + 1) / this.totalSections) * 100;
        progressBar.style.setProperty('--progress-percent', `${progressPercent}%`);
      }

      wandIcons.forEach((wand, index) => {
        wand.classList.remove('current', 'previous', 'next');

        if (index < this.currentSectionIndex) {
          wand.classList.add('previous');
          const img = wand.querySelector('img');
          if (img) {
            img.src = '../images/fontawesome/wand-magic-sparkles-sharp-duotone-regular-full.svg';
            img.alt = 'Completed section';
          }
        } else if (index === this.currentSectionIndex) {
          wand.classList.add('current');
          const img = wand.querySelector('img');
          if (img) {
            img.src = '../images/icons/favicon.svg';
            img.alt = 'Current section';
          }
        } else {
          wand.classList.add('next');
          const img = wand.querySelector('img');
          if (img) {
            img.src = '../images/fontawesome/wand-magic-duotone-regular-full.svg';
            img.alt = 'Future section';
          }
        }
      });

      // Update ARIA attributes
      if (progressBar) {
        progressBar.setAttribute('aria-valuenow', this.currentSectionIndex + 1);
      }
    }

    /**
     * Update button states
     */
    updateButtons() {
      const forwardBtn = document.getElementById('forwardBtn');
      const backwardBtn = document.getElementById('backwardBtn');

      if (backwardBtn) {
        backwardBtn.disabled = this.currentSectionIndex === 0;
      }

      if (forwardBtn) {
        forwardBtn.disabled = this.currentSectionIndex >= this.totalSections - 1;
      }
    }
  }

  // Initialize the feedback navigator and make it globally accessible
  window.feedbackNavigator = new FeedbackNavigator();
})();
