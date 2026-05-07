/*
 **********************************************************************
 * File       : scripts/utils.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Centralised utility functions for common operations across the site.
 *   All methods are static and can be called directly via Utils.method()
 **********************************************************************
 */

(function () {
  'use strict';

  /**
   * Centralised utility class with static helper methods
   *
   * @remarks
   * - All methods are static - no need to instantiate the class
   * - Import this script before other scripts that use utilities
   * - Usage: Utils.escapeHtml(text), Utils.delay(ms), etc.
   */
  class Utils {
    /**
     * Escape HTML characters to prevent XSS attacks
     * @param {string} text - Text to escape
     * @returns {string} Escaped text safe for HTML insertion
     *
     * @example
     * const safe = Utils.escapeHtml('<script>alert("xss")</script>');
     * // Returns: &lt;script&gt;alert("xss")&lt;/script&gt;
     */
    static escapeHtml(text) {
      if (typeof text !== 'string') return '';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    /**
     * Check if a URL exists by making a HEAD request
     * @param {string} url - URL to check
     * @returns {Promise<boolean>} True if URL exists and is accessible
     *
     * @example
     * const exists = await Utils.fileExists('../data/lessons.json');
     */
    static async fileExists(url) {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
      } catch (error) {
        return false;
      }
    }

    /**
     * Fetch and parse JSON from a URL with error handling
     * @param {string} url - URL to fetch JSON from
     * @returns {Promise<Object|null>} Parsed JSON object or null on error
     *
     * @example
     * const data = await Utils.loadJSON('../data/lessons.json');
     * if (data) {
     *   console.log('Loaded:', data);
     * }
     */
    static async loadJSON(url) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        Debug.error(`Error loading JSON from ${url}:`, error);
        return null;
      }
    }

    /**
     * Safely parse JSON string with error handling
     * @param {string} jsonString - JSON string to parse
     * @param {*} defaultValue - Default value to return on parse error (default: null)
     * @returns {*} Parsed object or default value
     *
     * @example
     * const data = Utils.parseJSON(localStorage.getItem('key'), {});
     */
    static parseJSON(jsonString, defaultValue = null) {
      try {
        return JSON.parse(jsonString);
      } catch (error) {
        Debug.error('JSON parse error:', error);
        return defaultValue;
      }
    }

    /**
     * Safely stringify object to JSON with error handling
     * @param {*} obj - Object to stringify
     * @param {string} defaultValue - Default value to return on error (default: '{}')
     * @returns {string} JSON string or default value
     *
     * @example
     * const json = Utils.stringifyJSON({name: 'test'});
     */
    static stringifyJSON(obj, defaultValue = '{}') {
      try {
        return JSON.stringify(obj);
      } catch (error) {
        Debug.error('JSON stringify error:', error);
        return defaultValue;
      }
    }

    /**
     * Delay execution for a specified number of milliseconds
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise<void>} Promise that resolves after the delay
     *
     * @example
     * await Utils.delay(1000); // Wait 1 second
     * console.log('Delayed execution');
     */
    static delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Determine the page context (students/mentors) and base paths
     * @returns {Object} Object with context, pathPrefix, and lessonFolder
     *
     * @example
     * const { context, pathPrefix, lessonFolder } = Utils.getPageContext();
     * console.log(context); // 'students' or 'mentors'
     */
    static getPageContext() {
      const path = window.location.pathname;

      // Check if we're in a lesson page
      if (path.includes('/students/lesson-')) {
        return {
          context: 'students',
          pathPrefix: '../',
          lessonFolder: 'students',
        };
      } else if (path.includes('/mentors/lesson-')) {
        return {
          context: 'mentors',
          pathPrefix: '../',
          lessonFolder: 'mentors',
        };
      }
      // Check if we're in any pages subfolder
      else if (path.includes('/pages/')) {
        // Determine context based on specific page name if available
        if (path.includes('/pages/students')) {
          return {
            context: 'students',
            pathPrefix: '../',
            lessonFolder: 'students',
          };
        } else if (path.includes('/pages/mentors')) {
          return {
            context: 'mentors',
            pathPrefix: '../',
            lessonFolder: 'mentors',
          };
        }
        // Default for other pages folder files
        return {
          context: 'students',
          pathPrefix: '../',
          lessonFolder: 'students',
        };
      }
      // Check if we're in students or mentors folder (non-lesson pages)
      else if (path.includes('/students/')) {
        return {
          context: 'students',
          pathPrefix: '../',
          lessonFolder: 'students',
        };
      } else if (path.includes('/mentors/')) {
        return {
          context: 'mentors',
          pathPrefix: '../',
          lessonFolder: 'mentors',
        };
      }

      // Default to root level (no path prefix needed)
      return {
        context: 'students',
        pathPrefix: '',
        lessonFolder: 'students',
      };
    }

    /**
     * Debounce a function call - only execute after a delay with no new calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Milliseconds to wait before executing
     * @returns {Function} Debounced function
     *
     * @example
     * const debouncedSearch = Utils.debounce((query) => {
     *   console.log('Searching for:', query);
     * }, 300);
     *
     * input.addEventListener('input', (e) => debouncedSearch(e.target.value));
     */
    static debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }

    /**
     * Throttle a function call - limit execution to once per time period
     * @param {Function} func - Function to throttle
     * @param {number} limit - Minimum milliseconds between executions
     * @returns {Function} Throttled function
     *
     * @example
     * const throttledScroll = Utils.throttle(() => {
     *   console.log('Scroll position:', window.scrollY);
     * }, 100);
     *
     * window.addEventListener('scroll', throttledScroll);
     */
    static throttle(func, limit) {
      let inThrottle;
      return function executedFunction(...args) {
        if (!inThrottle) {
          func(...args);
          inThrottle = true;
          setTimeout(() => (inThrottle = false), limit);
        }
      };
    }

    /**
     * Clamp a number between min and max values
     * @param {number} value - Value to clamp
     * @param {number} min - Minimum allowed value
     * @param {number} max - Maximum allowed value
     * @returns {number} Clamped value
     *
     * @example
     * const opacity = Utils.clamp(userInput, 0, 1);
     */
    static clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }

    /**
     * Generate a random integer between min and max (inclusive)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random integer
     *
     * @example
     * const dice = Utils.randomInt(1, 6);
     */
    static randomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Check if a value is empty (null, undefined, empty string, empty array, empty object)
     * @param {*} value - Value to check
     * @returns {boolean} True if value is empty
     *
     * @example
     * Utils.isEmpty(null); // true
     * Utils.isEmpty([]); // true
     * Utils.isEmpty({}); // true
     * Utils.isEmpty(''); // true
     * Utils.isEmpty('text'); // false
     */
    static isEmpty(value) {
      if (value === null || value === undefined) return true;
      if (typeof value === 'string') return value.trim().length === 0;
      if (Array.isArray(value)) return value.length === 0;
      if (typeof value === 'object') return Object.keys(value).length === 0;
      return false;
    }

    /**
     * Deep clone an object (handles nested objects and arrays)
     * @param {*} obj - Object to clone
     * @returns {*} Deep cloned object
     *
     * @example
     * const original = {a: {b: 1}};
     * const clone = Utils.deepClone(original);
     * clone.a.b = 2; // original.a.b is still 1
     */
    static deepClone(obj) {
      if (obj === null || typeof obj !== 'object') return obj;
      if (obj instanceof Date) return new Date(obj);
      if (obj instanceof Array) return obj.map((item) => Utils.deepClone(item));
      if (obj instanceof Object) {
        const cloned = {};
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            cloned[key] = Utils.deepClone(obj[key]);
          }
        }
        return cloned;
      }
    }

    /**
     * Format a date to a readable string
     * @param {Date|string} date - Date to format
     * @param {Object} options - Intl.DateTimeFormat options
     * @returns {string} Formatted date string
     *
     * @example
     * Utils.formatDate(new Date()); // "12 April 2026"
     * Utils.formatDate(new Date(), { dateStyle: 'short' }); // "12/04/26"
     */
    static formatDate(date, options = { dateStyle: 'long' }) {
      const dateObj = date instanceof Date ? date : new Date(date);
      return new Intl.DateTimeFormat('en-GB', options).format(dateObj);
    }

    /**
     * Capitalise the first letter of a string
     * @param {string} str - String to capitalise
     * @returns {string} Capitalised string
     *
     * @example
     * Utils.capitalise('hello'); // "Hello"
     */
    static capitalise(str) {
      if (typeof str !== 'string' || str.length === 0) return str;
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Convert a string to kebab-case
     * @param {string} str - String to convert
     * @returns {string} Kebab-cased string
     *
     * @example
     * Utils.toKebabCase('Hello World'); // "hello-world"
     */
    static toKebabCase(str) {
      return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
    }

    /**
     * Convert a string to camelCase
     * @param {string} str - String to convert
     * @returns {string} CamelCased string
     *
     * @example
     * Utils.toCamelCase('hello-world'); // "helloWorld"
     */
    static toCamelCase(str) {
      return str
        .replace(/[-_\s](.)/g, (_, char) => char.toUpperCase())
        .replace(/^(.)/, (char) => char.toLowerCase());
    }

    /**
     * Safe logging helper that checks if Debug is available
     */
    static log(message, ...args) {
      if (typeof Debug !== 'undefined' && Debug.log) {
        Debug.log(message, ...args);
      } else {
        console.log(message, ...args);
      }
    }
  }

  // Export the Utils class to global scope
  window.Utils = Utils;
})();
