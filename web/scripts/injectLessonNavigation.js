/*
 **********************************************************************
 * File       : scripts/injectLessonNavigation.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Dynamically generates and injects the lesson navigation panel
 *   based on the number of lesson-section elements on the page.
 *   Allows for dynamic updates when sections are added or removed.
 *
 * Usage:
 *   - Automatically injects navigation on page load
 *   - Counts all .lesson-section elements (excluding hidden OS-specific sections)
 *   - Generates appropriate number of wand icons for progress bar
 *   - To update when sections change: window.lessonNavigationInjector.reinitialise()
 *   - Dispatches 'lessonNavigationInjected' event when complete
 **********************************************************************
 */

(function () {
  'use strict';

  /**
   * Build and inject the lesson navigation panel based on visible lesson sections.
   *
   * @remarks Preconditions:
   * - Lesson pages must use the `.lesson-section` convention.
   * - Hidden OS-specific sections must keep the `lesson-install-` naming scheme so they can be excluded.
   */
  class LessonNavigationInjector {
    /**
     * Create the injector, reset derived state, and begin initialization.
     *
     * @returns {void}
     */
    constructor() {
      this.lessonNumber = null;
      this.pageTitle = '';
      this.init();
    }

    /**
     * Initialise the injector
     */
    init() {
      // Wait for DOM to be fully loaded
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.injectNavigation());
      } else {
        this.injectNavigation();
      }
    }

    /**
     * Extract lesson number from current URL
     */
    extractLessonNumber() {
      const path = window.location.pathname;
      const match = path.match(/lesson-(\d+)\.html/);
      return match ? parseInt(match[1], 10) : 0;
    }

    /**
     * Get section information from lesson-section elements
     * Only includes non-hidden sections (for dynamic content like OS-specific sections)
     */
    getSectionInfo() {
      // Get all lesson-sections that are not hidden
      const sections = document.querySelectorAll('.lesson-section');
      const sectionInfo = [];

      sections.forEach((section, index) => {
        // Skip hidden sections (especially OS-specific installation sections)
        // These sections have classes like lesson-install-windows, lesson-install-macos, etc.
        // and will be counted when they become visible after OS selection
        const hasOSInstallClass = Array.from(section.classList).some((cls) =>
          cls.startsWith('lesson-install-')
        );
        if (hasOSInstallClass && section.classList.contains('hidden')) {
          return; // Skip this section
        }

        // Try to find a title in the section (h2, h3, or .lesson-title)
        let title = '';
        const h2 = section.querySelector('h2');
        const h3 = section.querySelector('h3.lesson-title');
        const lessonTitle = section.querySelector('.lesson-title');

        if (h2) {
          title = h2.textContent.trim();
        } else if (h3) {
          title = h3.textContent.trim();
        } else if (lessonTitle) {
          title = lessonTitle.textContent.trim();
        } else {
          // Use section ID as fallback
          title = section.id
            ? section.id.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
            : `Section ${sectionInfo.length + 1}`;
        }

        sectionInfo.push({
          index: sectionInfo.length, // Use the index in the filtered array
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
                    <span class="wand-icon ${iconClass}" data-section="${index}" title="${section.title}">
                        <img src="${imgSrc}" alt="${altText}" class="${imgClass}">
                    </span>`;
        })
        .join('');
    }

    /**
     * Generate the complete navigation panel HTML
     */
    generateNavigationPanelHTML(sections) {
      const lessonNumber = this.lessonNumber;
      const isFirstLesson = lessonNumber === 0;
      const disabledAttr = isFirstLesson ? 'disabled' : '';

      // Determine context (students or mentors) from URL
      const path = window.location.pathname;
      const isStudent = path.includes('/students/');
      const contextLetter = isStudent ? 'M' : 'S';
      const contextTitle = isStudent ? 'Switch to mentor view' : 'Switch to student view';

      const wandIcons = this.generateWandIcons(sections);
      const maxSections = Math.max(sections.length, 1); // Ensure at least 1 for aria-valuemax

      return `
            <!-- Lesson Navigation Panel -->
            <nav class="lesson-navigation-panel" aria-label="Section navigation">
                <div class="navigation-controls">
                    <!-- Fast Rewind -->
                    <button type="button" id="fastBackwardBtn" class="nav-button section-nav" 
                            title="Go to previous lesson" aria-label="Previous lesson" ${disabledAttr}>
                        <i class="fa-duotone fa-regular fa-backward-fast" aria-hidden="true"></i>
                    </button>

                    <!-- Rewind -->
                    <button type="button" id="backwardBtn" class="nav-button section-nav" 
                            title="Go to previous section" aria-label="Previous section" disabled>
                        <i class="fa-duotone fa-regular fa-backward-step" aria-hidden="true"></i>
                    </button>

                    <!-- Progress Bar with Wand Icons -->
                    <div class="progress-container">
                        <div id="progressBar" class="progress-bar" role="progressbar" 
                             aria-valuenow="1" aria-valuemin="1" aria-valuemax="${maxSections}" 
                             aria-label="Section progress">
                            ${wandIcons}
                        </div>
                    </div>

                    <!-- Forward -->
                    <button type="button" id="forwardBtn" class="nav-button section-nav" 
                            title="Go to next section" aria-label="Next section">
                        <i class="fa-duotone fa-regular fa-forward-step" aria-hidden="true"></i>
                    </button>

                    <!-- Fast Forward -->
                    <button type="button" id="fastForwardBtn" class="nav-button section-nav" 
                            title="Go to next lesson" aria-label="Next lesson">
                        <i class="fa-duotone fa-regular fa-forward-fast" aria-hidden="true"></i>
                    </button>
                    
                    <!-- Context Switch Button -->
                    <button type="button" id="contextSwitchBtn" class="nav-button context-switch-btn" 
                            title="${contextTitle}" aria-label="${contextTitle}">
                        <span class="context-letter">${contextLetter}</span>
                    </button>
                </div>
            </nav>`;
    }

    /**
     * Inject the navigation panel into the page
     */
    injectNavigation() {
      // Extract lesson information
      this.lessonNumber = this.extractLessonNumber();

      // Get page title
      const pageTitleElement = document.querySelector('.page-title');
      this.pageTitle = pageTitleElement ? pageTitleElement.textContent : '';

      // Get section information
      const sections = this.getSectionInfo();

      // Always inject navigation panel, even if there are no sections yet
      // (user may need to select an option first, but can still navigate between lessons)

      // Find or create the lesson-header-fixed container
      let headerFixed = document.querySelector('.lesson-header-fixed');

      if (!headerFixed) {
        // Create the container if it doesn't exist
        headerFixed = document.createElement('div');
        headerFixed.className = 'lesson-header-fixed';

        // Add page title if it exists
        if (pageTitleElement) {
          // Move the page title into the fixed header
          const titleClone = pageTitleElement.cloneNode(true);
          headerFixed.appendChild(titleClone);
          pageTitleElement.style.display = 'none'; // Hide the original
        }

        // Insert at the beginning of main content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
          mainContent.insertBefore(headerFixed, mainContent.firstChild);
        } else {
          Debug.error('Could not find .main-content element');
          return;
        }
      }

      // Check if navigation panel already exists
      let navPanel = headerFixed.querySelector('.lesson-navigation-panel');

      // Generate navigation HTML
      const navHTML = this.generateNavigationPanelHTML(sections);

      if (navPanel) {
        // Replace existing navigation
        navPanel.outerHTML = navHTML;
      } else {
        // Insert new navigation
        headerFixed.insertAdjacentHTML('beforeend', navHTML);
      }

      // Ensure lesson-content wrapper exists
      this.ensureLessonContentWrapper();

      // Dispatch custom event to notify that navigation has been injected
      document.dispatchEvent(
        new CustomEvent('lessonNavigationInjected', {
          detail: { sectionCount: sections.length },
        })
      );
    }

    /**
     * Ensure all lesson sections are wrapped in lesson-content div
     */
    ensureLessonContentWrapper() {
      const mainContent = document.querySelector('.main-content');
      if (!mainContent) return;

      let lessonContent = mainContent.querySelector('.lesson-content');

      if (!lessonContent) {
        // Create lesson-content wrapper
        lessonContent = document.createElement('div');
        lessonContent.className = 'lesson-content';

        // Move all children after lesson-header-fixed into lesson-content
        const headerFixed = mainContent.querySelector('.lesson-header-fixed');
        const childrenToMove = [];

        let currentNode = headerFixed ? headerFixed.nextSibling : mainContent.firstChild;
        while (currentNode) {
          childrenToMove.push(currentNode);
          currentNode = currentNode.nextSibling;
        }

        childrenToMove.forEach((child) => {
          lessonContent.appendChild(child);
        });

        mainContent.appendChild(lessonContent);
      }
    }

    /**
     * Reinitialise navigation (call this when sections change)
     */
    reinitialise() {
      this.injectNavigation();

      // Note: No need to call setupNavigation() directly here
      // The lessonNavigationInjected event will trigger it automatically
    }
  }

  // Create global instance
  window.lessonNavigationInjector = new LessonNavigationInjector();
})();
