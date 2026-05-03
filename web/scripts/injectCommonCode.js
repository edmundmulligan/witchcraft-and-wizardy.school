/*
 **********************************************************************
 * File       : scripts/injectCommonCode.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Injects header and footer into all pages to follow DRY principle
 **********************************************************************
 */

/* jshint esversion: 11, module: true */

// Helper to access Debug from global scope
const log = (...args) => {
  if (window.Debug && window.Debug.log) {
    window.Debug.log(...args);
  }
};

/**
 * Inject shared header and footer markup so each page can reuse the same shell.
 *
 * @remarks Preconditions:
 * - The page must contain `header.header` and `footer.footer` placeholders.
 * - `Debug` must already be available because this class logs during setup.
 */
class CommonCodeInjector {
  /**
   * Create the injector and determine the resource prefix for the current page depth.
   *
   * @returns {void}
   */
  constructor() {
    log('CommonCodeInjector: Initializing...');
    this.pathPrefix = this.determinePathPrefix();
    this.headerTemplate = null;
    this.footerTemplate = null;
    this.imageModalTemplate = null;
    log('Path prefix determined:', this.pathPrefix);
  }

  /**
   * Determine path prefix based on current page location
   * @returns {string} Path prefix for resources
   */
  determinePathPrefix() {
    const pathname = window.location.pathname;
    return pathname.includes('/pages/') ||
      pathname.includes('/students/') ||
      pathname.includes('/mentors/')
      ? '../'
      : '';
  }

  /**
   * Load template data from JavaScript module files
   * @returns {Promise<void>}
   */
  async loadTemplates() {
    try {
      log('CommonCodeInjector: Loading templates...');
      // Use relative paths from the script's location (scripts/ folder)
      // This works regardless of where the site is deployed
      const [headerModule, footerModule, imageModalModule] = await Promise.all([
        import('../data/header.js'),
        import('../data/footer.js'),
        import('../data/imageModal.js'),
      ]);

      this.headerTemplate = headerModule.default.html;
      this.footerTemplate = footerModule.default.html;
      this.imageModalTemplate = imageModalModule.default.html;

      log('CommonCodeInjector: Templates loaded successfully');
    } catch (error) {
      log('CommonCodeInjector: Error loading templates', error);
      throw error;
    }
  }

  /**
   * Replace placeholders in template with actual values
   * @param {string} template - Template string with placeholders
   * @returns {string} Processed template
   */
  processTemplate(template) {
    return template.replace(/\{\{pathPrefix\}\}/g, this.pathPrefix);
  }

  /**
   * Inject header HTML into the page
   */
  injectHeader() {
    log('injectHeader: Starting header injection');
    const header = document.querySelector('header.header');
    if (!header || header.children.length > 0) {
      log('injectHeader: Header already exists or element not found');
      return;
    }

    if (!this.headerTemplate) {
      log('injectHeader: Header template not loaded');
      return;
    }

    log('injectHeader: Injecting header HTML');
    header.innerHTML = this.processTemplate(this.headerTemplate);

    // Dispatch custom event to signal header is ready
    document.dispatchEvent(new Event('headerInjected'));
  }

  /**
   * Inject footer HTML into the page
   */
  injectFooter() {
    const footer = document.querySelector('footer.footer');
    if (!footer || footer.children.length > 0) {
      return;
    }

    if (!this.footerTemplate) {
      log('injectFooter: Footer template not loaded');
      return;
    }

    footer.innerHTML = this.processTemplate(this.footerTemplate);

    // Dispatch custom event to signal footer is ready
    document.dispatchEvent(new Event('footerInjected'));
  }

  /**
   * Inject image modal HTML into the page (before closing body tag)
   */
  injectImageModal() {
    log('injectImageModal: Starting image modal injection');

    // Check if modal already exists
    if (document.getElementById('imageModal')) {
      log('injectImageModal: Modal already exists');
      return;
    }

    if (!this.imageModalTemplate) {
      log('injectImageModal: Modal template not loaded');
      return;
    }

    log('injectImageModal: Injecting modal HTML');
    // Insert before closing body tag
    document.body.insertAdjacentHTML('beforeend', this.processTemplate(this.imageModalTemplate));

    // Dispatch custom event to signal modal is ready
    document.dispatchEvent(new Event('imageModalInjected'));
  }

  /**
   * Initialise and inject all common code elements
   */
  async init() {
    try {
      await this.loadTemplates();
      this.injectHeader();
      this.injectFooter();
      this.injectImageModal();
    } catch (error) {
      log('CommonCodeInjector: Failed to initialise', error);
    }
  }
}

// Initialise on DOM ready
document.addEventListener('DOMContentLoaded', async function () {
  const injector = new CommonCodeInjector();
  await injector.init();
});
