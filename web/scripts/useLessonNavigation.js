/* global Utils, Debug */

/*
 **********************************************************************
 * File       : scripts/useLessonNavigation.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Handles navigation functionality for lesson pages including:
 *   - Section navigation within lessons
 *   - Lesson navigation (fast forward/backward)
 *   - Progress bar updates with wand icons
 *   - Keyboard navigation support
 *   Requires: utils.js (for Utils.loadJSON and Utils.fileExists)
 **********************************************************************
 */

(function () {
  'use strict';

  /**
   * Class for managing lesson navigation
   */
  class LessonNavigator {
    constructor() {
      this.sections = [];
      this.currentSectionIndex = 0;
      this.totalSections = 0;
      this.lessonNumber = null;
      this.lessonsData = null;
      this.context = null; // 'students' or 'mentors'
      this.availableLessons = new Set(); // Set of available lesson numbers
      this.listenersSetup = false; // Track if button event listeners have been set up
      this.keyboardSetup = false; // Track if keyboard listeners have been set up

      this.init();
    }

    /**
     * Initialise the lesson navigator
     */
    init() {
      // Set up event listener immediately to avoid race condition
      document.addEventListener('lessonNavigationInjected', () => {
        // Reset button listeners flag since buttons were just recreated
        this.listenersSetup = false;
        this.setupNavigation();
      });

      // Load lessons data
      this.loadLessonsData().then(() => {
        // Check if navigation panel already exists (was injected before listener was set up)
        const navPanel = document.querySelector('.lesson-navigation-panel');
        if (navPanel) {
          // Navigation was already injected, set it up now
          this.setupNavigation();
        }
      });
    }

    /**
     * Determine the current context (students or mentors)
     */
    getContext() {
      const path = window.location.pathname;
      if (path.includes('/students/')) {
        return 'students';
      } else if (path.includes('/mentors/')) {
        return 'mentors';
      }
      return 'students'; // Default to students
    }

    /**
     * Load lessons data from lessons.json
     */
    async loadLessonsData() {
      try {
        this.context = this.getContext();
        const data = await Utils.loadJSON('../data/lessons.json');
        if (!data) {
          throw new Error('Failed to load lessons.json');
        }
        this.lessonsData = data.lessons;

        // Check which lesson files actually exist by trying to fetch them
        await this.checkAvailableLessons();

        Debug.log(
          `Loaded ${this.lessonsData.length} lessons, ${this.availableLessons.size} available in ${this.context}`
        );
      } catch (error) {
        Debug.error('Error loading lessons data:', error);
        this.lessonsData = [];
      }
    }

    /**
     * Check which lesson files exist in the current context
     */
    async checkAvailableLessons() {
      const checkPromises = this.lessonsData.map(async (lesson) => {
        if (!lesson.file) return false;

        // Extract lesson number from filename (e.g., "lesson-01.html" -> 1)
        const match = lesson.file.match(/lesson-(\d+)\.html/);
        if (!match) return false;

        const lessonNum = parseInt(match[1], 10);

        try {
          // Check if the lesson file exists
          if (await Utils.fileExists(lesson.file)) {
            this.availableLessons.add(lessonNum);
            return true;
          }
        } catch (error) {
          // File doesn't exist
          return false;
        }
        return false;
      });

      await Promise.all(checkPromises);
    }

    /**
     * Check if a lesson number exists in a specific context (students or mentors)
     */
    async lessonExistsInContext(lessonNumber, targetContext) {
      const lessonFile = `lesson-${lessonNumber.toString().padStart(2, '0')}.html`;

      try {
        // Construct the path to the target context
        const targetPath = `../${targetContext}/${lessonFile}`;
        return await Utils.fileExists(targetPath);
      } catch (error) {
        return false;
      }
    }

    /**
     * Check if a lesson number exists
     */
    lessonExists(lessonNumber) {
      return this.availableLessons.has(lessonNumber);
    }

    /**
     * Set up navigation elements and event listeners
     */
    setupNavigation() {
      // Find all lesson sections that are NOT hidden by OS filtering
      // We include sections that are hidden for navigation purposes
      const allSections = document.querySelectorAll('.lesson-section');
      const navigableSections = Array.from(allSections).filter((section) => {
        // Exclude sections that are hidden due to OS filtering
        // (sections with lesson-install-* classes that are hidden)
        const hasOSInstallClass = Array.from(section.classList).some((cls) =>
          cls.startsWith('lesson-install-')
        );
        if (hasOSInstallClass && section.classList.contains('hidden')) {
          return false; // Skip OS-filtered sections
        }
        // Include all other sections, even if they're hidden (for navigation)
        return true;
      });

      // Store previous section to try to maintain position
      const previousSectionId = this.sections[this.currentSectionIndex]?.id;

      this.sections = navigableSections;
      this.totalSections = this.sections.length;

      // Extract lesson number from URL
      this.lessonNumber = this.extractLessonNumber();

      // Set up button event listeners (only once per button creation)
      if (!this.listenersSetup) {
        this.setupButtonListeners();
        this.listenersSetup = true;
      }

      // Set up keyboard navigation (only needed on first call)
      if (!this.keyboardSetup) {
        this.setupKeyboardNavigation();
        this.keyboardSetup = true;
      }

      // Set up progress bar click listeners (needs to be updated each time)
      this.setupProgressBarListeners();

      if (this.totalSections === 0) {
        Debug.warn('No visible lesson sections found - user may need to select an option first');
        // Disable section navigation but keep lesson navigation enabled
        this.disableSectionNavigation();
        // Still update lesson-level navigation buttons
        this.updateNavigationButtons();
        return;
      }

      // Try to find the previous section in the new list
      let newIndex = 0;
      if (previousSectionId) {
        const foundIndex = this.sections.findIndex((s) => s.id === previousSectionId);
        if (foundIndex >= 0) {
          newIndex = foundIndex;
        }
      }

      // Initialise display
      this.showSection(newIndex);
      this.updateProgress();
      this.updateNavigationButtons();
    }

    /**
     * Disable section navigation buttons when no sections are visible
     */
    disableSectionNavigation() {
      const backwardBtn = document.getElementById('backwardBtn');
      const forwardBtn = document.getElementById('forwardBtn');

      if (backwardBtn) backwardBtn.disabled = true;
      if (forwardBtn) forwardBtn.disabled = true;
    }

    /**
     * Extract lesson number from current URL
     */
    extractLessonNumber() {
      const path = window.location.pathname;
      const match = path.match(/lesson-(\d+)\.html/);
      return match ? parseInt(match[1], 10) : 1;
    }

    /**
     * Set up button event listeners
     */
    setupButtonListeners() {
      // Section navigation buttons
      const backwardBtn = document.getElementById('backwardBtn');
      const forwardBtn = document.getElementById('forwardBtn');
      const fastBackwardBtn = document.getElementById('fastBackwardBtn');
      const fastForwardBtn = document.getElementById('fastForwardBtn');
      const contextSwitchBtn = document.getElementById('contextSwitchBtn');

      if (backwardBtn) {
        backwardBtn.addEventListener('click', () => this.previousSection());
      }
      if (forwardBtn) {
        forwardBtn.addEventListener('click', () => this.nextSection());
      }
      if (fastBackwardBtn) {
        fastBackwardBtn.addEventListener('click', () => this.previousLesson());
      }
      if (fastForwardBtn) {
        fastForwardBtn.addEventListener('click', () => this.nextLesson());
      }
      if (contextSwitchBtn) {
        contextSwitchBtn.addEventListener('click', () => this.switchContext());
      }
    }

    /**
     * Set up progress bar click listeners
     */
    setupProgressBarListeners() {
      const wandIcons = document.querySelectorAll('.wand-icon');
      wandIcons.forEach((wand, index) => {
        wand.addEventListener('click', () => this.goToSection(index));
        wand.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.goToSection(index);
          }
        });
        // Make wands focusable
        wand.setAttribute('tabindex', '0');
      });
    }

    /**
     * Set up keyboard navigation
     */
    setupKeyboardNavigation() {
      document.addEventListener('keydown', (event) => {
        // Only handle keyboard shortcuts if not in an input field
        if (
          event.target.tagName === 'INPUT' ||
          event.target.tagName === 'TEXTAREA' ||
          event.target.isContentEditable
        ) {
          return;
        }

        switch (event.key) {
          case 'ArrowLeft':
            event.preventDefault();
            this.previousSection();
            break;
          case 'ArrowRight':
            event.preventDefault();
            this.nextSection();
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
    }

    /**
     * Show a specific section
     */
    showSection(index) {
      if (index < 0 || index >= this.totalSections) {
        return;
      }

      // Hide all  sections using display style (not 'hidden' class)
      // We don't use the 'hidden' class here because that's reserved for OS filtering
      this.sections.forEach((section) => {
        section.style.display = 'none';
      });

      // Show the selected section
      this.sections[index].style.display = 'block';

      // Update current index
      this.currentSectionIndex = index;

      // Scroll to section accounting for sticky header
      this.scrollToSectionWithHeader(this.sections[index]);

      // Update navigation state
      this.updateProgress();
      this.updateNavigationButtons();

      // Announce to screen readers
      this.announceCurrentSection();
    }

    /**
     * Scroll to section accounting for sticky header height
     */
    scrollToSectionWithHeader(sectionElement) {
      const stickyHeader = document.querySelector('.lesson-header-fixed');
      const headerHeight = stickyHeader ? stickyHeader.offsetHeight : 0;
      const elementTop = sectionElement.offsetTop;
      const offsetPosition = elementTop - headerHeight - 20; // 20px extra spacing

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }

    /**
     * Navigate to next section
     */
    nextSection() {
      if (this.currentSectionIndex < this.totalSections - 1) {
        this.showSection(this.currentSectionIndex + 1);
      }
    }

    /**
     * Navigate to previous section
     */
    previousSection() {
      if (this.currentSectionIndex > 0) {
        this.showSection(this.currentSectionIndex - 1);
      }
    }

    /**
     * Go to specific section
     */
    goToSection(index) {
      this.showSection(index);
    }

    /**
     * Navigate to next lesson
     */
    nextLesson() {
      const nextLessonNumber = this.lessonNumber + 1;

      if (this.lessonExists(nextLessonNumber)) {
        const nextLessonUrl = `lesson-${nextLessonNumber.toString().padStart(2, '0')}.html`;
        window.location.href = nextLessonUrl;
      } else {
        this.showMessage('Next lesson not available yet!');
      }
    }

    /**
     * Navigate to previous lesson
     */
    previousLesson() {
      const prevLessonNumber = this.lessonNumber - 1;

      if (prevLessonNumber >= 0 && this.lessonExists(prevLessonNumber)) {
        const prevLessonUrl = `lesson-${prevLessonNumber.toString().padStart(2, '0')}.html`;
        window.location.href = prevLessonUrl;
      } else {
        this.showMessage('This is the first lesson!');
      }
    }

    /**
     * Switch between student and mentor contexts
     */
    async switchContext() {
      const targetContext = this.context === 'students' ? 'mentors' : 'students';
      const lessonFile = `lesson-${this.lessonNumber.toString().padStart(2, '0')}.html`;
      const targetUrl = `../${targetContext}/${lessonFile}`;

      // Check if the lesson exists in the target context
      const exists = await this.lessonExistsInContext(this.lessonNumber, targetContext);

      if (exists) {
        window.location.href = targetUrl;
      } else {
        const contextName = targetContext === 'students' ? 'student' : 'mentor';
        this.showMessage(`This lesson is not available in the ${contextName} view yet!`);
      }
    }

    /**
     * Update progress bar display
     */
    updateProgress() {
      const wandIcons = document.querySelectorAll('.wand-icon');
      const progressBar = document.querySelector('.progress-bar');

      if (progressBar && this.totalSections > 0) {
        const progressPercent = ((this.currentSectionIndex + 1) / this.totalSections) * 100;
        progressBar.style.setProperty('--progress-percent', `${progressPercent}%`);
      }

      wandIcons.forEach((wand, index) => {
        // Remove all state classes
        wand.classList.remove('current', 'previous', 'next');

        // Set appropriate class based on position relative to current section
        if (index < this.currentSectionIndex) {
          wand.classList.add('previous');
          // Update to sparkling wand for previous sections
          const img = wand.querySelector('img');
          if (img) {
            img.src = '../images/fontawesome/wand-magic-sparkles-sharp-duotone-regular-full.svg';
            img.alt = 'Completed section';
          }
        } else if (index === this.currentSectionIndex) {
          wand.classList.add('current');
          // Current section gets the sparkling wand with favicon colours
          const img = wand.querySelector('img');
          if (img) {
            img.src = '../images/icons/favicon.svg';
            img.alt = 'Current section';
          }
        } else {
          wand.classList.add('next');
          // Future sections get non-sparkling wand
          const img = wand.querySelector('img');
          if (img) {
            img.src = '../images/fontawesome/wand-magic-duotone-regular-full.svg';
            img.alt = 'Future section';
          }
        }
      });

      // Update ARIA attributes
      const progressElement = document.getElementById('progressBar');
      if (progressElement && this.totalSections > 0) {
        progressElement.setAttribute('aria-valuenow', this.currentSectionIndex + 1);
      }
    }

    /**
     * Check if an OS is selected (for lesson-00)
     */
    isOSSelected() {
      const osRadios = document.querySelectorAll('input[name="os"]');
      if (osRadios.length === 0) {
        return true; // Not on a page with OS selection
      }
      // Check if any radio is checked
      return Array.from(osRadios).some((radio) => radio.checked);
    }

    /**
     * Update navigation button states
     */
    async updateNavigationButtons() {
      // Section navigation buttons
      const backwardBtn = document.getElementById('backwardBtn');
      const forwardBtn = document.getElementById('forwardBtn');

      // Lesson navigation buttons
      const fastBackwardBtn = document.getElementById('fastBackwardBtn');
      const fastForwardBtn = document.getElementById('fastForwardBtn');

      // Context switch button
      const contextSwitchBtn = document.getElementById('contextSwitchBtn');

      // Disable section buttons if at start/end of sections
      if (backwardBtn) {
        backwardBtn.disabled = this.currentSectionIndex === 0;
      }
      if (forwardBtn) {
        // Disable if at end of sections OR if on lesson-00 with no OS selected
        const atEnd = this.currentSectionIndex === this.totalSections - 1;
        const needsOS = this.lessonNumber === 0 && !this.isOSSelected();
        forwardBtn.disabled = atEnd || needsOS;
      }

      // Disable lesson buttons if previous/next lesson doesn't exist
      if (fastBackwardBtn && this.lessonNumber !== null) {
        const prevLessonNumber = this.lessonNumber - 1;
        fastBackwardBtn.disabled = prevLessonNumber < 0 || !this.lessonExists(prevLessonNumber);
      }
      if (fastForwardBtn && this.lessonNumber !== null) {
        const nextLessonNumber = this.lessonNumber + 1;
        fastForwardBtn.disabled = !this.lessonExists(nextLessonNumber);
      }

      // Disable context switch button if target lesson doesn't exist
      if (contextSwitchBtn && this.lessonNumber !== null) {
        const targetContext = this.context === 'students' ? 'mentors' : 'students';
        const exists = await this.lessonExistsInContext(this.lessonNumber, targetContext);
        contextSwitchBtn.disabled = !exists;
      }
    }

    /**
     * Announce current section to screen readers
     */
    announceCurrentSection() {
      const currentSection = this.sections[this.currentSectionIndex];
      if (currentSection) {
        const sectionTitle = currentSection.querySelector('.lesson-title');
        if (sectionTitle) {
          const announcement = document.createElement('div');
          announcement.setAttribute('aria-live', 'polite');
          announcement.setAttribute('aria-atomic', 'true');
          announcement.className = 'sr-only';
          announcement.textContent = `Now viewing section ${this.currentSectionIndex + 1} of ${this.totalSections}: ${sectionTitle.textContent}`;

          document.body.appendChild(announcement);

          // Remove the announcement after it's been read
          setTimeout(() => {
            document.body.removeChild(announcement);
          }, 1000);
        }
      }
    }

    /**
     * Show a temporary message to the user
     */
    showMessage(message) {
      // Create a temporary message element
      const messageElement = document.createElement('div');
      messageElement.textContent = message;
      messageElement.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--colour-effective-accent);
                color: white;
                padding: 1rem;
                border-radius: var(--border-radius);
                z-index: 1000;
                font-weight: bold;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            `;

      document.body.appendChild(messageElement);

      // Remove after 3 seconds
      setTimeout(() => {
        if (messageElement.parentNode) {
          document.body.removeChild(messageElement);
        }
      }, 3000);
    }
  }

  // Initialise the lesson navigator and make it globally accessible
  window.lessonNavigator = new LessonNavigator();
})();
