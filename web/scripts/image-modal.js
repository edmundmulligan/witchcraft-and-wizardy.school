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

    /**
     * Opens the image modal with the specified image
     * @param {string} imageSrc - The source URL of the image to display
     * @param {string} imageAlt - The alt text for the image
     */
    function openImageModal(imageSrc, imageAlt) {
        const modal = document.getElementById('imageModal');
        const modalImg = document.getElementById('modalImage');
        const captionText = document.getElementById('modalCaption');
        
        modal.style.display = 'block';
        modalImg.src = imageSrc;
        modalImg.alt = imageAlt;
        captionText.textContent = imageAlt;
        
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
    }

    /**
     * Closes the image modal and restores page scroll
     */
    function closeImageModal() {
        const modal = document.getElementById('imageModal');
        modal.style.display = 'none';
        
        // Restore body scroll
        document.body.style.overflow = 'auto';
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
