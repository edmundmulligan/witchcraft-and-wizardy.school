/*
 **********************************************************************
 * File       : scripts/image-modal.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2025 The Embodied Mind
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

    // Cache DOM elements and original overflow value
    let modal;
    let modalImg;
    let captionText;
    let originalOverflow;

    /**
     * Opens the image modal with the specified image
     * @param {string} imageSrc - The source URL of the image to display
     * @param {string} imageAlt - The alt text for the image
     */
    function openImageModal(imageSrc, imageAlt) {
        // Initialize elements if not already cached
        if (!modal) {
            modal = document.getElementById('imageModal');
            modalImg = document.getElementById('modalImage');
            captionText = document.getElementById('modalCaption');
        }

        modal.style.display = 'block';
        modalImg.src = imageSrc;
        modalImg.alt = imageAlt;
        captionText.textContent = imageAlt;
        
        // Store original overflow and prevent body scroll when modal is open
        originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
    }

    /**
     * Closes the image modal and restores page scroll
     */
    function closeImageModal() {
        if (!modal) {
            modal = document.getElementById('imageModal');
        }

        modal.style.display = 'none';
        
        // Restore original body scroll
        document.body.style.overflow = originalOverflow || '';
    }

    // Make functions globally available for inline handlers
    window.openImageModal = openImageModal;
    window.closeImageModal = closeImageModal;

    // Close modal when pressing Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeImageModal();
        }
    });
})();
