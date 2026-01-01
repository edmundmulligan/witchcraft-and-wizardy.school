/* global */
/*
 **********************************************************************
 * File       : theme-switcher.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2025 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Handles switching between light and dark themes based on user
 *   preference. Saves the theme choice to localStorage and loads it
 *   when pages load. Falls back to browser/system preference if no
 *   user choice is saved.
 **********************************************************************
*/

(function() {
    'use strict';

    const THEME_STORAGE_KEY = 'themePreference';

    /**
     * Apply the theme to the page
     * @param {string} theme - 'light', 'dark', or 'auto'
     */
    function applyTheme(theme) {
        const root = document.documentElement;
        
        let effectiveTheme = theme;
        
        // If auto, use system preference
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            effectiveTheme = prefersDark ? 'dark' : 'light';
        }

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
            root.style.setProperty('--bg-landscape', 'var(--bg-landscape-dark)');
            root.style.setProperty('--bg-portrait', 'var(--bg-portrait-dark)');
            root.style.setProperty('--svg-filter', 'var(--svg-filter-dark)');
            root.style.setProperty('--header-svg-filter', 'var(--header-svg-filter-dark)');
            root.setAttribute('data-theme', 'dark');
            
            // Update logo if present
            updateLogo('dark');
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
            root.style.setProperty('--bg-landscape', 'var(--bg-landscape-light)');
            root.style.setProperty('--bg-portrait', 'var(--bg-portrait-light)');
            root.style.setProperty('--svg-filter', 'var(--svg-filter-light)');
            root.style.setProperty('--header-svg-filter', 'var(--header-svg-filter-light)');
            root.setAttribute('data-theme', 'light');
            
            // Update logo if present
            updateLogo('light');
        }
    }

    /**
     * Update the Embodied Mind logo based on theme
     * @param {string} effectiveTheme - 'light' or 'dark'
     */
    function updateLogo(effectiveTheme) {
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
    function getThemePreference() {
        // Check URL parameter first (for testing purposes)
        const urlParams = new URLSearchParams(window.location.search);
        const themeParam = urlParams.get('theme');
        if (themeParam === 'light' || themeParam === 'dark' || themeParam === 'auto') {
            return themeParam;
        }
        
        try {
            const saved = localStorage.getItem(THEME_STORAGE_KEY);
            if (saved) {
                return saved;
            }
        } catch (error) {
            console.error('Error reading theme preference:', error);
        }
        return 'auto'; // Default to browser preference
    }

    /**
     * Save theme preference to localStorage
     * @param {string} theme - 'light', 'dark', or 'auto'
     */
    function saveThemePreference(theme) {
        try {
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
    }

    /**
     * Handle theme change from radio button
     * @param {string} theme - 'light' or 'dark'
     */
    function handleThemeChange(theme) {
        saveThemePreference(theme);
        applyTheme(theme);
    }

    /**
     * Set up theme radio button listeners
     */
    function setupThemeListeners() {
        const lightRadio = document.getElementById('theme-choice-light');
        const darkRadio = document.getElementById('theme-choice-dark');

        if (lightRadio) {
            lightRadio.addEventListener('change', function() {
                if (this.checked) {
                    handleThemeChange('light');
                }
            });
        }

        if (darkRadio) {
            darkRadio.addEventListener('change', function() {
                if (this.checked) {
                    handleThemeChange('dark');
                }
            });
        }
    }

    /**
     * Initialize theme on page load
     */
    function init() {
        // Get saved preference or use auto
        const theme = getThemePreference();
        
        // Apply the theme immediately to prevent flash
        applyTheme(theme);

        // Set up listeners for theme radio buttons if they exist
        setupThemeListeners();

        // Listen for system theme changes if using auto
        if (theme === 'auto') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', () => {
                if (getThemePreference() === 'auto') {
                    applyTheme('auto');
                }
            });
        }

        // Listen for footer injection to update logo
        document.addEventListener('footerInjected', () => {
            const currentTheme = getThemePreference();
            const effectiveTheme = (currentTheme === 'auto') ?
                (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') :
                currentTheme;
            updateLogo(effectiveTheme);
        });
    }

    // Apply theme as early as possible to prevent flash
    init();

    // Export functions for use by other scripts
    window.ThemeSwitcher = {
        get: getThemePreference,
        set: handleThemeChange,
        apply: applyTheme
    };
})();
