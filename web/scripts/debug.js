/*
 **********************************************************************
 * File       : debug.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Centralized debug utility for conditional console logging.
 *   Controls logging across all scripts via ?debug=on|off query parameter.
 *   Usage: Debug.log('message'), Debug.warn('warning'), Debug.error('error')
 **********************************************************************
*/

/* global console, URLSearchParams */

(function() {
    'use strict';

    /**
     * Debug utility class for conditional logging
     */
    class DebugLogger {
        constructor() {
            this.enabled = this.checkDebugMode();
            this.logDebugStatus();
        }

        /**
         * Check if debug mode is enabled via query parameter or localStorage
         * @returns {boolean} True if debug mode is enabled
         */
        checkDebugMode() {
            // Check URL parameter first
            const urlParams = new URLSearchParams(window.location.search);
            const debugParam = urlParams.get('debug');

            if (debugParam === 'on' || debugParam === 'true') {
                // Save to localStorage for persistence
                try {
                    localStorage.setItem('debugMode', 'on');
                } catch (error) {
                    console.error('Failed to save debug mode to localStorage:', error);
                }
                return true;
            }

            if (debugParam === 'off' || debugParam === 'false') {
                // Remove from localStorage
                try {
                    localStorage.removeItem('debugMode');
                } catch (error) {
                    console.error('Failed to remove debug mode from localStorage:', error);
                }
                return false;
            }

            // Fall back to localStorage if no URL parameter
            try {
                const stored = localStorage.getItem('debugMode');
                return stored === 'on';
            } catch (error) {
                console.error('Failed to read debug mode from localStorage:', error);
                return false;
            }
        }

        /**
         * Log the current debug status
         */
        logDebugStatus() {
            if (this.enabled) {
                console.log('%c[DEBUG MODE ON]', 'background: #4CAF50; color: white; padding: 2px 8px; border-radius: 3px; font-weight: bold;');
                console.log('Debug logging is enabled. Use ?debug=off to disable.');
            }
        }

        /**
         * Conditional console.log
         * @param {...any} args - Arguments to log
         */
        log(...args) {
            if (this.enabled) {
                console.log(...args);
            }
        }

        /**
         * Conditional console.warn
         * @param {...any} args - Arguments to log
         */
        warn(...args) {
            if (this.enabled) {
                console.warn(...args);
            }
        }

        /**
         * Conditional console.error (always logs, but adds context in debug mode)
         * @param {...any} args - Arguments to log
         */
        error(...args) {
            console.error(...args);
        }

        /**
         * Conditional console.info
         * @param {...any} args - Arguments to log
         */
        info(...args) {
            if (this.enabled) {
                console.info(...args);
            }
        }

        /**
         * Conditional console.debug
         * @param {...any} args - Arguments to log
         */
        debug(...args) {
            if (this.enabled) {
                console.debug(...args);
            }
        }

        /**
         * Conditional console.table
         * @param {any} data - Data to display in table
         */
        table(data) {
            if (this.enabled) {
                console.table(data);
            }
        }

        /**
         * Log method entry with parameters
         * @param {string} className - Name of the class
         * @param {string} methodName - Name of the method
         * @param {object} params - Parameters passed to method
         */
        methodEntry(className, methodName, params = {}) {
            if (this.enabled) {
                console.group(`${className}.${methodName}()`);
                if (Object.keys(params).length > 0) {
                    console.log('Parameters:', params);
                }
            }
        }

        /**
         * Log method exit
         * @param {string} className - Name of the class
         * @param {string} methodName - Name of the method
         * @param {any} returnValue - Value being returned (optional)
         */
        methodExit(className, methodName, returnValue) {
            if (this.enabled) {
                if (returnValue !== undefined) {
                    console.log('Returns:', returnValue);
                }
                console.groupEnd();
            }
        }

        /**
         * Check if debug mode is currently enabled
         * @returns {boolean} True if debug mode is enabled
         */
        isEnabled() {
            return this.enabled;
        }

        /**
         * Programmatically enable debug mode
         */
        enable() {
            this.enabled = true;
            try {
                localStorage.setItem('debugMode', 'on');
            } catch (error) {
                console.error('Failed to enable debug mode:', error);
            }
            this.logDebugStatus();
        }

        /**
         * Programmatically disable debug mode
         */
        disable() {
            this.enabled = false;
            try {
                localStorage.removeItem('debugMode');
            } catch (error) {
                console.error('Failed to disable debug mode:', error);
            }
            console.log('%c[DEBUG MODE OFF]', 'background: #f44336; color: white; padding: 2px 8px; border-radius: 3px; font-weight: bold;');
        }
    }

    // Create global instance
    window.Debug = new DebugLogger();
})();
