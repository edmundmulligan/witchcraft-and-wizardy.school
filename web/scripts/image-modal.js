/*
 **********************************************************************
 * File       : scripts/image-modal.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2025 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *  Functions to handle image modal functionality across the site
 **********************************************************************
 */

'use strict';

// Add event listeners to all clickable images when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const imageButtons = document.querySelectorAll('.image-button[data-image-src]');
    
    imageButtons.forEach(button => {
        button.addEventListener('click', function() {
            const imageSrc = this.getAttribute('data-image-src');
            const caption = this.getAttribute('data-image-caption');
            openImageModal(imageSrc, caption);
        });
        
        button.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                const imageSrc = this.getAttribute('data-image-src');
                const caption = this.getAttribute('data-image-caption');
                openImageModal(imageSrc, caption);
                event.preventDefault();
            }
        });
    });
});

// Image Modal Functions
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

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    modal.style.display = 'none';
            
    // Restore body scroll
    document.body.style.overflow = 'auto';
}

// Close modal when pressing Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeImageModal();
    }
});
