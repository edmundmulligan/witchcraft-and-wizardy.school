/* global Utils */

/*
 **********************************************************************
 * File       : scripts/carouselNavigation.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license.html page)
 * Description:
 *   Handles carousel navigation button functionality for gallery.html
 *   Requires: utils.js (for Utils.delay)
 **********************************************************************
 */

document.addEventListener('DOMContentLoaded', () => {
  // Find all carousel containers
  const carouselWrappers = document.querySelectorAll('.carousel-wrapper');

  carouselWrappers.forEach((wrapper) => {
    const carousel = wrapper.querySelector('.carousel');
    const prevButton = wrapper.querySelector('.carousel-nav-button.prev');
    const nextButton = wrapper.querySelector('.carousel-nav-button.next');

    if (!carousel || !prevButton || !nextButton) return;

    // Get the width to scroll (one item width + gap)
    const getScrollAmount = () => {
      const firstItem = carousel.querySelector('.portrait-item, .accessory-item');
      if (!firstItem) return 300; // fallback
      const style = window.getComputedStyle(carousel);
      const gap = parseFloat(style.gap) || 0;
      return firstItem.offsetWidth + gap;
    };

    // Scroll to previous items
    prevButton.addEventListener('click', () => {
      const scrollAmount = getScrollAmount();
      carousel.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth',
      });
    });

    // Scroll to next items
    nextButton.addEventListener('click', () => {
      const scrollAmount = getScrollAmount();
      carousel.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    });

    // Update button states based on scroll position
    const updateButtonStates = () => {
      const scrollLeft = carousel.scrollLeft;
      const scrollWidth = carousel.scrollWidth;
      const clientWidth = carousel.clientWidth;

      // Account for padding - carousel starts at scrollLeft ~16 due to padding
      const isAtStart = scrollLeft < 20;
      const isAtEnd = scrollLeft >= scrollWidth - clientWidth - 20;

      // Update disabled state
      if (isAtStart) {
        prevButton.setAttribute('disabled', 'disabled');
        prevButton.style.cursor = 'not-allowed';
      } else {
        prevButton.removeAttribute('disabled');
        prevButton.style.cursor = 'pointer';
      }

      if (isAtEnd) {
        nextButton.setAttribute('disabled', 'disabled');
        nextButton.style.cursor = 'not-allowed';
      } else {
        nextButton.removeAttribute('disabled');
        nextButton.style.cursor = 'pointer';
      }
    };

    // Listen for scroll events
    carousel.addEventListener('scroll', updateButtonStates);

    // Initial button state - with slight delay to ensure carousel is rendered
    Utils.delay(100).then(updateButtonStates);

    // Update on resize
    window.addEventListener('resize', () => {
      Utils.delay(100).then(updateButtonStates);
    });
  });
});
