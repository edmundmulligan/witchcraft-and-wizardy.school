/*
 **********************************************************************
 * File       : themeSwitcher.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Handles switching between light and dark themes based on user
 *   preference. Saves the theme choice to localStorage and loads it
 *   when pages load. Falls back to browser/system preference if no
 *   user choice is saved. Also allows for theme to be set via URL
 *   parameter for testing purposes. This allows accessibility testing 
 *   for different themes.
 **********************************************************************
*/

/* global Debug, URLSearchParams */

(function() {
    'use strict';

    /**
     * Class for managing theme switching functionality
     */
    class ThemeSwitcher {
        constructor() {
            this.THEME_STORAGE_KEY = 'themePreference';
        }

        /**
         * Apply the theme to the page
         * @param {string} theme - 'light', 'dark', or 'auto'
         */
        applyTheme(theme) {
            Debug.methodEntry('ThemeSwitcher', 'applyTheme', { theme });
            
            const root = document.documentElement;

            let effectiveTheme = theme;
        
            // If auto, use system preference
            if (theme === 'auto') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                effectiveTheme = prefersDark ? 'dark' : 'light';
                Debug.log('Auto theme resolved to:', effectiveTheme);
            }

            Debug.log('Applying theme:', effectiveTheme);

            // Apply the theme by setting CSS custom properties
            if (effectiveTheme === 'dark') {
                root.style.setProperty('--color-page-background', 'var(--color-dark-page-background)');
                root.style.setProperty('--color-page-text', 'var(--color-dark-page-text)');
                root.style.setProperty('--color-headings-background', 'var(--color-dark-headings-background)');
                root.style.setProperty('--color-headings-text', 'var(--color-dark-headings-text)');
                root.style.setProperty('--color-link-text', 'var(--color-dark-link-text)');
                root.style.setProperty('--color-link-text-hover', 'var(--color-dark-link-text-hover)');
                root.style.setProperty('--color-link-text-visited', 'var(--color-dark-link-text-visited)');
                root.style.setProperty('--color-link-text-focus', 'var(--color-dark-link-text-focus)');
                root.style.setProperty('--color-error-background', 'var(--color-dark-error-background)');
                root.style.setProperty('--color-error-text', 'var(--color-dark-error-text)');
                root.style.setProperty('--color-warning-background', 'var(--color-dark-warning-background)');
                root.style.setProperty('--color-warning-text', 'var(--color-dark-warning-text)');
                root.style.setProperty('--color-code-background', 'var(--color-dark-code-background)');
                root.style.setProperty('--color-code-text', 'var(--color-dark-code-text)');
                root.style.setProperty('--bg-landscape', 'var(--bg-landscape-dark)');
                root.style.setProperty('--bg-portrait', 'var(--bg-portrait-dark)');
                root.style.setProperty('--svg-filter', 'var(--svg-filter-dark)');
                root.style.setProperty('--header-svg-filter', 'var(--header-svg-filter-dark)');
                root.setAttribute('data-theme', 'dark');

                // Update logo if present
                this.updateLogo('dark');
            } else {
                root.style.setProperty('--color-page-background', 'var(--color-light-page-background)');
                root.style.setProperty('--color-page-text', 'var(--color-light-page-text)');
                root.style.setProperty('--color-headings-background', 'var(--color-light-headings-background)');
                root.style.setProperty('--color-headings-text', 'var(--color-light-headings-text)');
                root.style.setProperty('--color-link-text', 'var(--color-light-link-text)');
                root.style.setProperty('--color-link-text-hover', 'var(--color-light-link-text-hover)');
                root.style.setProperty('--color-link-text-visited', 'var(--color-light-link-text-visited)');
                root.style.setProperty('--color-link-text-focus', 'var(--color-light-link-text-focus)');
                root.style.setProperty('--color-error-background', 'var(--color-light-error-background)');
                root.style.setProperty('--color-error-text', 'var(--color-light-error-text)');
                root.style.setProperty('--color-warning-background', 'var(--color-light-warning-background)');
                root.style.setProperty('--color-warning-text', 'var(--color-light-warning-text)');
                root.style.setProperty('--color-code-background', 'var(--color-light-code-background)');
                root.style.setProperty('--color-code-text', 'var(--color-light-code-text)');
                root.style.setProperty('--bg-landscape', 'var(--bg-landscape-light)');
                root.style.setProperty('--bg-portrait', 'var(--bg-portrait-light)');
                root.style.setProperty('--svg-filter', 'var(--svg-filter-light)');
                root.style.setProperty('--header-svg-filter', 'var(--header-svg-filter-light)');
                root.setAttribute('data-theme', 'light');

                // Update logo if present
                this.updateLogo('light');
            }
            
            Debug.methodExit('ThemeSwitcher', 'applyTheme');
        }

        /**
         * Update the Embodied Mind logo based on theme
         * @param {string} effectiveTheme - 'light' or 'dark'
         */
        updateLogo(effectiveTheme) {
            const logo = document.getElementById('embodied-mind-logo');
            if (!logo) return;

            const lightLogo = logo.dataset.lightLogo;
            const darkLogo = logo.dataset.darkLogo;

            if (effectiveTheme === 'dark' && darkLogo) {
                logo.src = darkLogo;
            } else if (lightLogo) {
                logo.src = lightLogo;
            }
        }

        /**
         * Get the current theme preference
         * @returns {string} - 'light', 'dark', or 'auto'
         */
        getThemePreference() {
            // Check URL parameter first (for testing purposes)
            const urlParams = new URLSearchParams(window.location.search);
            const themeParam = urlParams.get('theme');
            if (themeParam === 'light' || themeParam === 'dark' || themeParam === 'auto') {
                Debug.log('Theme from URL parameter:', themeParam);
                return themeParam;
            }

            // Check localStorage
            try {
                const saved = localStorage.getItem(this.THEME_STORAGE_KEY);
                if (saved) {
                    Debug.log('Theme from localStorage:', saved);
                    return saved;
                }
            } catch (error) {
                Debug.error('Error reading theme preference:', error);
            }

            Debug.log('Theme preference retrieved:', 'auto (default)');
            // Default to auto
            return 'auto';
        }

        /**
         * Save theme preference to localStorage
         * @param {string} theme - 'light', 'dark', or 'auto'
         */
        saveThemePreference(theme) {
            Debug.log('Saving theme preference:', theme);
            try {
                localStorage.setItem(this.THEME_STORAGE_KEY, theme);
                Debug.log('Theme preference saved successfully');
            } catch (error) {
                Debug.error('Error saving theme preference:', error);
            }
        }

        /**
         * Handle theme change from radio button
         * @param {string} theme - 'light' or 'dark'
         */
        handleThemeChange(theme) {
            Debug.methodEntry('ThemeSwitcher', 'handleThemeChange', { theme });
            this.saveThemePreference(theme);
            this.applyTheme(theme);
            this.updateThemeButtons(theme);
            Debug.methodExit('ThemeSwitcher', 'handleThemeChange');
        }

        /**
         * Update the visual state of theme buttons
         * @param {string} theme - 'light', 'dark', or 'auto'
         */
        updateThemeButtons(theme) {
            Debug.methodEntry('ThemeSwitcher', 'updateThemeButtons', { theme });
            
            const lightButton = document.getElementById('light-button');
            const darkButton = document.getElementById('dark-button');

            Debug.log('Light button element:', lightButton);
            Debug.log('Dark button element:', darkButton);

            if (lightButton && darkButton) {
                let effectiveTheme = theme;
                
                // If auto, determine effective theme from system preference
                if (theme === 'auto') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    effectiveTheme = prefersDark ? 'dark' : 'light';
                }
                
                Debug.log('Effective theme for buttons:', effectiveTheme);
                
                if (effectiveTheme === 'light') {
                    lightButton.classList.add('pressed');
                    darkButton.classList.remove('pressed');
                    Debug.log('✓ Light button set to pressed, dark unpressed');
                } else if (effectiveTheme === 'dark') {
                    darkButton.classList.add('pressed');
                    lightButton.classList.remove('pressed');
                    Debug.log('✓ Dark button set to pressed, light unpressed');
                }
                
                Debug.log('Button states - Light:', lightButton.className, '| Dark:', darkButton.className);
            } else {
                Debug.warn('Theme buttons not found on this page');
            }
            
            Debug.methodExit('ThemeSwitcher', 'updateThemeButtons');
        }

        /**
         * Set up theme radio button listeners
         */
        setupThemeListeners() {
            Debug.log('Checking for theme radio buttons...');
            
            const lightRadio = document.getElementById('theme-choice-light');
            const darkRadio = document.getElementById('theme-choice-dark');

            if (lightRadio) {
                Debug.log('✓ Light radio button found, adding listener');
                lightRadio.addEventListener('change', () => {
                    if (lightRadio.checked) {
                        Debug.log('→ Light radio selected by user');
                        this.handleThemeChange('light');
                    }
                });
            } else {
                Debug.log('Light radio button not found on this page');
            }

            if (darkRadio) {
                Debug.log('✓ Dark radio button found, adding listener');
                darkRadio.addEventListener('change', () => {
                    if (darkRadio.checked) {
                        Debug.log('→ Dark radio selected by user');
                        this.handleThemeChange('dark');
                    }
                });
            } else {
                Debug.log('Dark radio button not found on this page');
            }
        }

        /**
         * Set up theme button click listeners for index page
         */
        setupThemeButtonListeners() {
            Debug.log('Setting up theme button listeners...');
            
            const lightButton = document.getElementById('light-button');
            const darkButton = document.getElementById('dark-button');

            if (lightButton) {
                Debug.log('✓ Light button found, adding click listener');
                lightButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    Debug.log('→ Light button clicked by user');
                    this.handleThemeChange('light');
                });
            } else {
                Debug.log('Light button not found on this page');
            }

            if (darkButton) {
                Debug.log('✓ Dark button found, adding click listener');
                darkButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    Debug.log('→ Dark button clicked by user');
                    this.handleThemeChange('dark');
                });
            } else {
                Debug.log('Dark button not found on this page');
            }
        }

        /**
         * Initialize theme on page load
         */
        init() {
            Debug.log('=== ThemeSwitcher Initializing ===');
            
            // Get saved preferences or use defaults
            const theme = this.getThemePreference();
        
            // Apply the theme immediately to prevent flash
            this.applyTheme(theme);

            // Update button states if they exist
            this.updateThemeButtons(theme);

            // Listen for system theme changes if using auto
            if (theme === 'auto') {
                Debug.log('Setting up system theme change listener');
                const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                mediaQuery.addEventListener('change', () => {
                    Debug.log('System theme preference changed');
                    if (this.getThemePreference() === 'auto') {
                        this.applyTheme('auto');
                    }
                });
            }

            // Listen for footer injection to update logo
            document.addEventListener('footerInjected', () => {
                Debug.log('Footer injected, updating logo');
                const currentTheme = this.getThemePreference();
                const effectiveTheme = (currentTheme === 'auto') ?
                    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') :
                    currentTheme;
                this.updateLogo(effectiveTheme);
            });
            
            Debug.log('=== ThemeSwitcher Initialization Complete ===');
        }

        /**
         * Set up interactive listeners after DOM is ready
         */
        setupInteractiveListeners() {
            Debug.log('=== Setting up interactive listeners (DOM ready) ===');
            
            // Set up listeners for theme radio buttons if they exist
            this.setupThemeListeners();
            // Set up listeners for theme buttons (index page)
            this.setupThemeButtonListeners();
            // Update button states now that DOM is ready
            const theme = this.getThemePreference();
            this.updateThemeButtons(theme);
            
            Debug.log('=== Interactive listeners setup complete ===');
        }
    }

    // Create a global instance
    const themeSwitcher = new ThemeSwitcher();

    // Apply theme as early as possible to prevent flash
    themeSwitcher.init();

    // Set up interactive listeners when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => themeSwitcher.setupInteractiveListeners());
    } else {
        // DOM is already ready
        themeSwitcher.setupInteractiveListeners();
    }

    // Export functions for use by other scripts
    window.ThemeSwitcher = {
        get: () => themeSwitcher.getThemePreference(),
        set: (theme) => themeSwitcher.handleThemeChange(theme),
        apply: (theme) => themeSwitcher.applyTheme(theme),
    };
})();
