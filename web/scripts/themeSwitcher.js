/*
 **********************************************************************
 * File       : themeSwitcher.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Handles switching between light and dark themes and style variants
 *   (normal, subdued, vibrant) based on user preference. Saves choices
 *   to localStorage and loads them when pages load. Falls back to
 *   browser/system preference if no user choice is saved. Also allows
 *   for theme/style to be set via URL parameter for testing purposes.
 *   All color combinations meet WCAG 2.2 AAA standards.
 **********************************************************************
*/

/* global Debug, URLSearchParams */

(function() {
    'use strict';

    /**
     * Class for managing theme and style switching functionality
     */
    class ThemeSwitcher {
        constructor() {
            this.THEME_STORAGE_KEY = 'themePreference';
            this.STYLE_STORAGE_KEY = 'stylePreference';
        }

        /**
         * Apply the theme and style to the page
         * @param {string} theme - 'light', 'dark', or 'auto'
         * @param {string} style - 'normal', 'subdued', or 'vibrant' (optional, defaults to saved or 'normal')
         */
        applyTheme(theme, style = null) {
            Debug.methodEntry('ThemeSwitcher', 'applyTheme', { theme, style });
            
            const root = document.documentElement;

            // Get style preference if not provided
            if (!style) {
                style = this.getStylePreference();
            }

            let effectiveTheme = theme;
        
            // If auto, use system preference
            if (theme === 'auto') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                effectiveTheme = prefersDark ? 'dark' : 'light';
                Debug.log('Auto theme resolved to:', effectiveTheme);
            }

            Debug.log('Applying theme:', effectiveTheme, 'with style:', style);

            // Build the color variable prefix based on style and theme
            const prefix = `--color-${style}-${effectiveTheme}`;

            // Apply theme-specific colors (from colours.css)
            root.style.setProperty('--color-page-background', `var(${prefix}-page-background)`);
            root.style.setProperty('--color-page-text', `var(${prefix}-page-text)`);
            root.style.setProperty('--color-headings-background', `var(${prefix}-headings-background)`);
            root.style.setProperty('--color-headings-text', `var(${prefix}-headings-text)`);
            root.style.setProperty('--color-link-text', `var(${prefix}-link-text)`);
            root.style.setProperty('--color-link-text-hover', `var(${prefix}-link-text-hover)`);
            root.style.setProperty('--color-link-text-visited', `var(${prefix}-link-text-visited)`);
            root.style.setProperty('--color-link-text-focus', `var(${prefix}-link-text-focus)`);
            root.style.setProperty('--color-code-background', `var(${prefix}-code-background)`);
            root.style.setProperty('--color-code-text', `var(${prefix}-code-text)`);
            
            // Apply global non-theme colors (from colours.css)
            // These are the same across all themes for consistency
            root.style.setProperty('--color-error-background', 'var(--color-error-background)');
            root.style.setProperty('--color-error-text', 'var(--color-error-text)');
            root.style.setProperty('--color-warning-background', 'var(--color-warning-background)');
            root.style.setProperty('--color-warning-text', 'var(--color-warning-text)');
            
            // Background images are both style and theme dependent
            const bgPrefix = `--bg-landscape-${style}-${effectiveTheme}`;
            const bgPortraitPrefix = `--bg-portrait-${style}-${effectiveTheme}`;
            
            root.style.setProperty('--bg-landscape', `var(${bgPrefix})`);
            root.style.setProperty('--bg-portrait', `var(${bgPortraitPrefix})`);
            
            // SVG filters and other theme-specific settings
            if (effectiveTheme === 'dark') {
                root.style.setProperty('--svg-filter', 'var(--svg-filter-dark)');
                root.style.setProperty('--header-svg-filter', 'var(--header-svg-filter-dark)');
                root.setAttribute('data-theme', 'dark');
                this.updateLogo('dark');
            } else {
                root.style.setProperty('--svg-filter', 'var(--svg-filter-light)');
                root.style.setProperty('--header-svg-filter', 'var(--header-svg-filter-light)');
                root.setAttribute('data-theme', 'light');
                this.updateLogo('light');
            }
            
            root.setAttribute('data-style', style);
            
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
         * Get the current style preference
         * @returns {string} - 'normal', 'subdued', or 'vibrant'
         */
        getStylePreference() {
            // Check URL parameter first (for testing purposes)
            const urlParams = new URLSearchParams(window.location.search);
            const styleParam = urlParams.get('style');
            if (styleParam === 'normal' || styleParam === 'subdued' || styleParam === 'vibrant') {
                Debug.log('Style from URL parameter:', styleParam);
                return styleParam;
            }

            // Check localStorage
            try {
                const saved = localStorage.getItem(this.STYLE_STORAGE_KEY);
                if (saved) {
                    Debug.log('Style from localStorage:', saved);
                    return saved;
                }
            } catch (error) {
                Debug.error('Error reading style preference:', error);
            }

            Debug.log('Style preference retrieved:', 'normal (default)');
            // Default to normal
            return 'normal';
        }

        /**
         * Save style preference to localStorage
         * @param {string} style - 'normal', 'subdued', or 'vibrant'
         */
        saveStylePreference(style) {
            Debug.log('Saving style preference:', style);
            try {
                localStorage.setItem(this.STYLE_STORAGE_KEY, style);
                Debug.log('Style preference saved successfully');
            } catch (error) {
                Debug.error('Error saving style preference:', error);
            }
        }

        /**
         * Handle theme change from radio button or button click
         * @param {string} theme - 'light' or 'dark'
         */
        handleThemeChange(theme) {
            Debug.methodEntry('ThemeSwitcher', 'handleThemeChange', { theme });
            this.saveThemePreference(theme);
            const style = this.getStylePreference();
            this.applyTheme(theme, style);
            this.updateThemeButtons(theme);
            Debug.methodExit('ThemeSwitcher', 'handleThemeChange');
        }

        /**
         * Handle style change from button click
         * @param {string} style - 'normal', 'subdued', or 'vibrant'
         */
        handleStyleChange(style) {
            Debug.methodEntry('ThemeSwitcher', 'handleStyleChange', { style });
            this.saveStylePreference(style);
            const theme = this.getThemePreference();
            this.applyTheme(theme, style);
            this.updateStyleButtons(style);
            Debug.methodExit('ThemeSwitcher', 'handleStyleChange');
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
         * Update the visual state of style buttons
         * @param {string} style - 'normal', 'subdued', or 'vibrant'
         */
        updateStyleButtons(style) {
            Debug.methodEntry('ThemeSwitcher', 'updateStyleButtons', { style });
            
            const normalButton = document.getElementById('normal-button');
            const subduedButton = document.getElementById('subdued-button');
            const vibrantButton = document.getElementById('vibrant-button');

            Debug.log('Normal button element:', normalButton);
            Debug.log('Subdued button element:', subduedButton);
            Debug.log('Vibrant button element:', vibrantButton);

            if (normalButton && subduedButton && vibrantButton) {
                // Remove pressed class from all buttons
                normalButton.classList.remove('pressed');
                subduedButton.classList.remove('pressed');
                vibrantButton.classList.remove('pressed');
                
                // Add pressed class to the active style button
                if (style === 'normal') {
                    normalButton.classList.add('pressed');
                    Debug.log('✓ Normal button set to pressed');
                } else if (style === 'subdued') {
                    subduedButton.classList.add('pressed');
                    Debug.log('✓ Subdued button set to pressed');
                } else if (style === 'vibrant') {
                    vibrantButton.classList.add('pressed');
                    Debug.log('✓ Vibrant button set to pressed');
                }
                
                Debug.log('Button states - Normal:', normalButton.className, 
                    '| Subdued:', subduedButton.className,
                    '| Vibrant:', vibrantButton.className);
            } else {
                Debug.warn('Style buttons not found on this page');
            }
            
            Debug.methodExit('ThemeSwitcher', 'updateStyleButtons');
        }

        /**
         * Set up style button click listeners for index page
         */
        setupStyleButtonListeners() {
            Debug.log('Setting up style button listeners...');
            
            const normalButton = document.getElementById('normal-button');
            const subduedButton = document.getElementById('subdued-button');
            const vibrantButton = document.getElementById('vibrant-button');

            if (normalButton) {
                Debug.log('✓ Normal button found, adding click listener');
                normalButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    Debug.log('→ Normal button clicked by user');
                    this.handleStyleChange('normal');
                });
            } else {
                Debug.log('Normal button not found on this page');
            }

            if (subduedButton) {
                Debug.log('✓ Subdued button found, adding click listener');
                subduedButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    Debug.log('→ Subdued button clicked by user');
                    this.handleStyleChange('subdued');
                });
            } else {
                Debug.log('Subdued button not found on this page');
            }

            if (vibrantButton) {
                Debug.log('✓ Vibrant button found, adding click listener');
                vibrantButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    Debug.log('→ Vibrant button clicked by user');
                    this.handleStyleChange('vibrant');
                });
            } else {
                Debug.log('Vibrant button not found on this page');
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
            // Set up listeners for style buttons (index page)
            this.setupStyleButtonListeners();
            // Update button states now that DOM is ready
            const theme = this.getThemePreference();
            const style = this.getStylePreference();
            this.updateThemeButtons(theme);
            this.updateStyleButtons(style);
            
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
        getStyle: () => themeSwitcher.getStylePreference(),
        setStyle: (style) => themeSwitcher.handleStyleChange(style),
    };
})();
