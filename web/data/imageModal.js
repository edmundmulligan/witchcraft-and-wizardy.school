/*
 **********************************************************************
 * File       : data/imageModal.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   This module defines the image modal (lightbox) HTML template used across all pages
 **********************************************************************
 */

export default {
  html: `<!-- Image Modal -->
<div
  id="imageModal"
  class="image-modal"
  onclick="if (event.target === this) closeImageModal();"
  style="display: none"
>
  <button
    type="button"
    class="image-modal-close"
    onclick="closeImageModal()"
    onkeydown="
      if (event.key === 'Enter' || event.key === ' ') {
        closeImageModal();
        event.preventDefault();
      }
    "
    tabindex="0"
    aria-label="Close modal"
  >
    &times;
  </button>
  <img
    class="image-modal-content"
    id="modalImage"
    src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
    alt=""
  >
  <div class="image-modal-caption" id="modalCaption"></div>
</div>`,
};
