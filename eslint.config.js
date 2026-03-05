/*
 **********************************************************************
 * File       : eslint.config.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2025 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   ESLint configuration for JavaScript files
 **********************************************************************
 */

'use strict';

// ESLint flat config for v9+
/** @type {import('eslint').FlatConfig[]} */
module.exports = [
  // Node.js scripts configuration (bin directory)
  {
    files: ["bin/**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "commonjs",
      globals: {
        console: "readonly",
        process: "readonly",
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        Buffer: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearTimeout: "readonly",
        clearInterval: "readonly"
      }
    },
    rules: {
      "indent": ["error", 4],
      "linebreak-style": ["error", "unix"],
      "quotes": ["error", "single"],
      "semi": ["error", "always"],
      "no-undef": "error",
      "no-unused-expressions": "error"
    }
  },
  // Browser JavaScript configuration (web directory)
  {
    files: ["web/**/*.js", "sound/**/*.js", "stats/**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        alert: "readonly",
        localStorage: "readonly",
        btoa: "readonly",
        atob: "readonly"
      }
    },
    rules: {
      "indent": ["error", 4],
      "linebreak-style": ["error", "unix"],
      "quotes": ["error", "single"],
      "semi": ["error", "always"],
      "no-undef": "error",
      "no-unused-expressions": "error"
    }
  }
];
