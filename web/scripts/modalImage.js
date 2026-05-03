/*
 **********************************************************************
 * File       : scripts/modalImage.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Handles image modal functionality for displaying images in a
 *   fullscreen overlay. Provides functions to open and close the modal,
 *   handles keyboard navigation (Escape key to close), and prevents
 *   body scroll when the modal is open.
 **********************************************************************
 */

(function () {
  'use strict';

  /**
   * Display safe same-origin images inside the shared modal overlay.
   *
   * @remarks Preconditions:
   * - The page must define `#imageModal`, `#modalImage`, and `#modalCaption` elements.
   * - Clickable triggers are expected to use the `.image-button` convention with `data-image-src`.
   */
  class ImageModal {
    /**
     * Create the modal controller, cache DOM references, and register global listeners.
     *
     * @returns {void}
     */
    constructor() {
      this.modal = null;
      this.modalImg = null;
      this.captionText = null;
      this.originalOverflow = null;
      this.initElements();
      this.setupEventListeners();
    }

    /**
     * Initialise DOM element references
     */
    initElements() {
      this.modal = document.getElementById('imageModal');
      this.modalImg = document.getElementById('modalImage');
      this.captionText = document.getElementById('modalCaption');
    }

    /**
     * Set up event listeners for modal functionality
     */
    setupEventListeners() {
      // Open modal when clicking a configured image button.
      // Event delegation keeps this working for dynamically injected content.
      document.addEventListener('click', (event) => {
        const target = event.target;
        if (!target || typeof target !== 'object' || typeof target.closest !== 'function') {
          return;
        }

        const imageButton = target.closest('.image-button');
        if (!imageButton || typeof imageButton.getAttribute !== 'function') {
          return;
        }

        const imageSrc = imageButton.getAttribute('data-image-src');
        if (!imageSrc) {
          return;
        }

        const nestedImage = imageButton.querySelector('img');
        const imageCaption =
          imageButton.getAttribute('data-image-caption') ||
          nestedImage?.getAttribute('alt') ||
          'Image preview';
        this.open(imageSrc, imageCaption);
      });

      // Close modal when pressing Escape key
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          this.close();
        }
      });
    }

    /**
     * Validate that the modal image source is safe before assigning it to the DOM.
     * @param {string} imageSrc - Candidate image source URL
     * @returns {string|null} Safe absolute URL or null
     */
    getSafeImageSource(imageSrc) {
      const trimmedSrc = typeof imageSrc === 'string' ? imageSrc.trim() : '';
      if (!trimmedSrc) {
        return null;
      }

      try {
        const parsedUrl = new window.URL(trimmedSrc, window.location.href);
        const allowedProtocols = ['http:', 'https:'];
        const hasAllowedProtocol = allowedProtocols.includes(parsedUrl.protocol);
        const isSameOrigin = parsedUrl.origin === window.location.origin;
        const hasImageExtension = /\.(?:avif|bmp|gif|ico|jpe?g|png|svg|webp)(?:$|[?#])/i.test(
          parsedUrl.pathname
        );

        if (!hasAllowedProtocol || !isSameOrigin || !hasImageExtension) {
          return null;
        }

        return parsedUrl.href;
      } catch (error) {
        return null;
      }
    }

    /**
     * Normalise user-provided caption text for safe plain-text rendering.
     * @param {string} imageAlt - Candidate caption text
     * @returns {string} Safe caption text
     */
    getSafeCaption(imageAlt) {
      const normalisedCaption = typeof imageAlt === 'string' ? imageAlt.trim() : '';
      return normalisedCaption || 'Image preview';
    }

    /**
     * Opens the image modal with the specified image
     * @param {string} imageSrc - The source URL of the image to display
     * @param {string} imageAlt - The alt text for the image
     */
    open(imageSrc, imageAlt) {
      if (!this.modal) {
        this.initElements();
      }

      if (!this.modal || !this.modalImg || !this.captionText) {
        Debug.error('Image modal elements are missing from the page.');
        return;
      }

      const safeImageSrc = this.getSafeImageSource(imageSrc);
      if (!safeImageSrc) {
        Debug.warn('Blocked unsafe image source for modal preview.');
        return;
      }

      const safeCaption = this.getSafeCaption(imageAlt);

      this.modal.style.display = 'block';
      this.modalImg.src = safeImageSrc;
      this.modalImg.alt = safeCaption;
      this.captionText.textContent = safeCaption;

      // Store original overflow and prevent body scroll when modal is open
      this.originalOverflow = document.body.style.overflow || 'auto';
      document.body.style.overflow = 'hidden';
    }

    /**
     * Closes the image modal and restores page scroll
     */
    close() {
      if (!this.modal) {
        this.initElements();
      }

      if (!this.modal) {
        return;
      }

      this.modal.style.display = 'none';

      // Restore original body scroll
      document.body.style.overflow = this.originalOverflow || 'auto';
    }
  }

  // Create a global instance
  const imageModal = new ImageModal();

  // Expose functions globally for inline handlers
  window.openImageModal = (imageSrc, imageAlt) => imageModal.open(imageSrc, imageAlt);
  window.closeImageModal = () => imageModal.close();
})();
