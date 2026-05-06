/*
 **********************************************************************
 * File       : scripts/animateWand.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Loads the wand SVG inline so sparkle paths can animate
 *   via styles/components/favicon.css.
 **********************************************************************
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', async () => {
    const containers = document.querySelectorAll('.wand-container');
    if (containers.length === 0) {
      return;
    }

    try {
      const response = await fetch('../images/icons/favicon-inline.svg');
      if (!response.ok) {
        throw new Error('Failed to load wand SVG');
      }

      const svgText = await response.text();

      // Process each container
      containers.forEach((container) => {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        const svg = svgDoc.querySelector('svg');

        if (!svg) {
          throw new Error('Wand SVG markup is missing <svg> root');
        }

        // Remove the id attribute to prevent duplicate IDs when multiple wands are on the page
        svg.removeAttribute('id');

        svg.setAttribute('width', '150');
        svg.setAttribute('height', '150');
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', 'Sparkling wand icon');

        // Make wand body/outline track effective theme/style text colour
        // while keeping sparkle fills animated.
        const effectiveTextColour = 'var(--colour-effective-page-text)';
        const paths = svg.querySelectorAll('path');
        paths.forEach((path) => {
          const isSparkle =
            path.classList.contains('sparkle-1') ||
            path.classList.contains('sparkle-2') ||
            path.classList.contains('sparkle-3');

          path.removeAttribute('style');
          path.style.stroke = effectiveTextColour;

          if (!isSparkle) {
            path.style.fill = effectiveTextColour;
          }
        });

        svg.classList.add('animated', 'wand-conclusion');

        container.appendChild(svg);
      });
    } catch (error) {
      Debug.error('Error loading wand SVG:', error);

      // Fallback for robustness if inline loading fails.
      containers.forEach((container) => {
        const fallback = document.createElement('img');
        fallback.src = '../images/icons/favicon-inline.svg';
        fallback.alt = 'Sparkling wand icon';
        fallback.width = 150;
        fallback.height = 150;
        fallback.className = 'wand-fallback';
        container.appendChild(fallback);
      });
    }
  });
})();
