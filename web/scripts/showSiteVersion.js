/*
 **********************************************************************
 * File       : scripts/showSiteVersion.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 6 The Embodied Mind
 * License    : MIT License (see license.html page)
 * Description:
 *   Displays the current site version by reading the VERSION file
 **********************************************************************
 */

(function () {
  'use strict';

  async function loadSiteVersion() {
    const versionElement = document.getElementById('site-version-value');

    if (!versionElement) {
      return;
    }

    try {
      const response = await fetch('../VERSION', { cache: 'no-store' });

      if (!response.ok) {
        throw new Error('Failed to load VERSION file');
      }

      const versionText = await response.text();
      const version = versionText.trim();

      versionElement.textContent = version || 'unknown';
    } catch (error) {
      versionElement.textContent = 'unknown';
    }
  }

  document.addEventListener('DOMContentLoaded', loadSiteVersion);
})();
