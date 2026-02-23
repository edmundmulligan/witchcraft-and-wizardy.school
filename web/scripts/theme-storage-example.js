/*
 **********************************************************************
 * File       : theme-storage-example.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Example of using the generic FormDataStorage class for a theme
 *   settings form. Shows how to store and retrieve theme preferences
 *   independently from other form data.
 **********************************************************************
*/
/* global FormDataStorage, FormData, Debug */
/* jshint esversion: 8 */

(function() {
    'use strict';

    /**
     * Example class for managing theme preferences using the generic FormDataStorage
     */
    class ThemePreferencesManager {
        constructor() {
            this.storage = new FormDataStorage();
            this.THEME_STORAGE_KEY = 'themePreferences';
            this.formId = 'theme-preferences-form';
        }

        /**
         * Save theme preferences
         */
        async savePreferences(event) {
            if (event) {
                event.preventDefault();
            }

            const form = document.getElementById(this.formId);
            if (!form) {
                return;
            }

            const formData = new FormData(form);
            const preferences = {
                theme: formData.get('theme') || 'auto',
                fontSize: formData.get('fontSize') || 'medium',
                highContrast: formData.get('highContrast') === 'on'
            };

            const success = await this.storage.save(this.THEME_STORAGE_KEY, preferences);
            
            if (success) {
                console.log('Theme preferences saved successfully');
                // Apply theme if ThemeSwitcher is available
                if (window.ThemeSwitcher && preferences.theme) {
                    window.ThemeSwitcher.set(preferences.theme);
                }
            }

            return success;
        }

        /**
         * Load theme preferences
         */
        async loadPreferences() {
            const preferences = await this.storage.load(this.THEME_STORAGE_KEY);
            
            if (!preferences) {
                return null;
            }

            // Populate form if it exists
            const form = document.getElementById(this.formId);
            if (form) {
                if (preferences.theme) {
                    const themeRadio = form.querySelector(`input[name="theme"][value="${preferences.theme}"]`);
                    if (themeRadio) {
                        themeRadio.checked = true;
                    }
                }

                if (preferences.fontSize) {
                    const fontSizeSelect = form.querySelector('select[name="fontSize"]');
                    if (fontSizeSelect) {
                        fontSizeSelect.value = preferences.fontSize;
                    }
                }

                if (preferences.highContrast !== undefined) {
                    const highContrastCheckbox = form.querySelector('input[name="highContrast"]');
                    if (highContrastCheckbox) {
                        highContrastCheckbox.checked = preferences.highContrast;
                    }
                }
            }

            return preferences;
        }

        /**
         * Clear theme preferences
         */
        clearPreferences() {
            this.storage.clear(this.THEME_STORAGE_KEY);
        }

        /**
         * Check if preferences exist
         */
        hasPreferences() {
            return this.storage.exists(this.THEME_STORAGE_KEY);
        }

        /**
         * Initialize the manager
         */
        init() {
            const form = document.getElementById(this.formId);
            if (!form) {
                // Form doesn't exist on this page
                // But we can still load preferences for other uses
                this.loadPreferences();
                return;
            }

            // Load saved preferences
            this.loadPreferences();

            // Set up form submission handler
            form.addEventListener('submit', (event) => this.savePreferences(event));
        }
    }

    // Example usage: Create and initialize the manager
    const themeManager = new ThemePreferencesManager();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => themeManager.init());
    } else {
        themeManager.init();
    }

    // Export for use by other scripts
    window.ThemePreferencesManager = themeManager;
})();
