/*
 **********************************************************************
 * File       : eslint.config.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   ESLint configuration for JavaScript files
 **********************************************************************
 */

'use strict';

// ESLint flat config for v9+
/** @type {import('eslint').FlatConfig[]} */
module.exports = [
  // API server configuration (Node.js ESM)
  {
    files: ['api/**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
      },
    },
    rules: {
      indent: ['error', 2],
      'linebreak-style': ['error', 'unix'],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'no-undef': 'error',
      'no-unused-expressions': 'error',
      'no-unexpected-multiline': 'off',
    },
  },

  // Node.js scripts configuration (bin directory)
  {
    files: ['bin/**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'commonjs',
      globals: {
        console: 'readonly',
        process: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
      },
    },
    rules: {
      indent: ['error', 2],
      'linebreak-style': ['error', 'unix'],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'no-undef': 'error',
      'no-unused-expressions': 'error',
      'no-unexpected-multiline': 'off',
    },
  },
  // CommonJS data modules used by the lesson build pipeline
  {
    files: ['data/**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'commonjs',
      globals: {
        console: 'readonly',
        process: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
      },
    },
    rules: {
      indent: ['error', 2],
      'linebreak-style': ['error', 'unix'],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'no-undef': 'error',
      'no-unused-expressions': 'error',
      'no-unexpected-multiline': 'off',
    },
  },
  // Browser JavaScript configuration
  {
    files: ['scripts/**/*.js', 'pages/**/*.js', 'students/**/*.js', 'mentors/**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'script',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        alert: 'readonly',
        localStorage: 'readonly',
        btoa: 'readonly',
        atob: 'readonly',
        Debug: 'readonly',
        fetch: 'readonly',
        DOMParser: 'readonly',
        FormData: 'readonly',
        LocalStorage: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
        URLSearchParams: 'readonly',
        Event: 'readonly',
        HTMLElement: 'readonly',
        Utils: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
      },
    },
    rules: {
      indent: ['error', 2],
      'linebreak-style': ['error', 'unix'],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'no-undef': 'error',
      'no-unused-expressions': 'error',
      'no-unexpected-multiline': 'off',
    },
  },
];
