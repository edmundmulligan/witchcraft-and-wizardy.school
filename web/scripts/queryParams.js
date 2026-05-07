/*
 **********************************************************************
 * File       : scripts/queryParams.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Centralised query parameter handler for the entire site.
 *   Provides a single point of access for reading URL query parameters.
 *   Used by themeSwitcher.js, debug.js, toggleHeaderAndFooter.js,
 *   animatePortraits.js, etc.
 *
 *   Supported parameters:
 *   - theme: light|dark|auto
 *   - style: normal|subdued|vibrant
 *   - debug: on|off|true|false
 *   - animation: on|off|true|false|auto
 *   - expand-header: on|off|true|false
 *   - expand-footer: on|off|true|false
 **********************************************************************
 */

(function () {
  'use strict';

  /**
   * Central query parameter parser and validator.
   *
   * @remarks
   * - Provides type-safe parameter reading with validation
   * - Single instance shared across all scripts via window.QueryParams
   * - All query parameter reading should go through this class
   * - Parameter names and values are case insensitive
   */
  class QueryParamsHandler {
    /**
     * Initialise the query parameter handler
     */
    constructor() {
      this.urlParams = new URLSearchParams(window.location.search);
    }

    /**
     * Get a raw query parameter value (case insensitive for parameter name)
     * @param {string} param - The parameter name to retrieve
     * @returns {string|null} The parameter value (lowercase) or null if not found
     */
    get(param) {
      const paramLower = param.toLowerCase();
      // Search through all parameters case-insensitively
      for (const [key, value] of this.urlParams) {
        if (key.toLowerCase() === paramLower) {
          return value.toLowerCase();
        }
      }
      return null;
    }

    /**
     * Check if a query parameter exists (case insensitive)
     * @param {string} param - The parameter name to check
     * @returns {boolean} True if the parameter exists
     */
    has(param) {
      const paramLower = param.toLowerCase();
      for (const [key] of this.urlParams) {
        if (key.toLowerCase() === paramLower) {
          return true;
        }
      }
      return false;
    }

    /**
     * Get theme parameter (light|dark|auto)
     * @returns {string|null} The theme value or null if invalid/not present
     */
    getTheme() {
      const theme = this.get('theme');
      if (theme === 'light' || theme === 'dark' || theme === 'auto') {
        return theme;
      }
      return null;
    }

    /**
     * Get style parameter (normal|subdued|vibrant)
     * @returns {string|null} The style value or null if invalid/not present
     */
    getStyle() {
      const style = this.get('style');
      if (style === 'normal' || style === 'subdued' || style === 'vibrant') {
        return style;
      }
      return null;
    }

    /**
     * Get debug mode parameter (on|off|true|false)
     * @returns {boolean|null} True if debug is on, false if off, null if not specified
     */
    getDebugMode() {
      const debug = this.get('debug');
      if (debug === 'on' || debug === 'true') {
        return true;
      }
      if (debug === 'off' || debug === 'false') {
        return false;
      }
      return null;
    }

    /**
     * Get animation parameter (on|off|true|false|auto)
     * @returns {string|null} 'on' to enable, 'off' to disable, null for auto (use prefers-reduced-motion)
     */
    getAnimation() {
      const animation = this.get('animation');
      if (animation === 'on' || animation === 'true') {
        return 'on';
      }
      if (animation === 'off' || animation === 'false') {
        return 'off';
      }
      if (animation === 'auto') {
        return null; // null means use default (prefers-reduced-motion)
      }
      return null;
    }

    /**
     * Get expand-header parameter (on|off|true|false)
     * @returns {boolean|null} True if on, false if off, null if not specified
     */
    getExpandHeader() {
      const expand = this.get('expand-header');
      if (expand === 'on' || expand === 'true') {
        return true;
      }
      if (expand === 'off' || expand === 'false') {
        return false;
      }
      return null;
    }

    /**
     * Get expand-footer parameter (on|off|true|false)
     * @returns {boolean|null} True if on, false if off, null if not specified
     */
    getExpandFooter() {
      const expand = this.get('expand-footer');
      if (expand === 'on' || expand === 'true') {
        return true;
      }
      if (expand === 'off' || expand === 'false') {
        return false;
      }
      return null;
    }

    /**
     * Get all query parameters as an object
     * @returns {Object} Object containing all parameter key-value pairs
     */
    getAll() {
      const params = {};
      for (const [key, value] of this.urlParams) {
        params[key] = value;
      }
      return params;
    }
  }

  // Create global instance
  window.QueryParams = new QueryParamsHandler();
})();
