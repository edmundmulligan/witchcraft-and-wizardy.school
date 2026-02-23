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

(function() {
    'use strict';

    /**
     * Class for managing image modal functionality
     */
    class ImageModal {
        constructor() {
            this.modal = null;
            this.modalImg = null;
            this.captionText = null;
            this.originalOverflow = null;
            this.initElements();
            this.setupEventListeners();
        }

        /**
         * Initialize DOM element references
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
            // Close modal when pressing Escape key
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') {
                    this.close();
                }
            });
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

            this.modal.style.display = 'block';
            this.modalImg.src = imageSrc;
            this.modalImg.alt = imageAlt;
            this.captionText.textContent = imageAlt;
        
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
