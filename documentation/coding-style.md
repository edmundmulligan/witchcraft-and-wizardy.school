# Web Witchcraft and Wizardry

## Project Overview

Web Witchcraft and Wizardry is an educational website designed to teach HTML, CSS, and JavaScript to students through a series of interactive lessons. The site features a whimsical, magical theme inspired by wizardry and witchcraft.

## Technical Requirements

### Standards Compliance
- **HTML5**: Use semantic HTML elements and follow W3C standards
- **CSS3**: Modern CSS with custom properties (CSS variables)
- **JavaScript**: ES6+ syntax, vanilla JavaScript (no frameworks)
- **Accessibility**: WCAG 2.2 AA compliance
- **Cross-browser**: Must work in all modern browsers (Chrome, Firefox, Safari, Edge)

### Browser Support
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Architecture

### File Structure
```
web/
├── index.html              # Landing page
├── pages/                  # Static content pages
│   ├── start.html          # Getting started guide
│   ├── students.html       # Student dashboard
│   ├── mentors.html        # Mentor resources
│   ├── gallery.html        # Gallery of examples
│   ├── glossary.html       # Glossary of terms
│   ├── facts.html          # Web development facts
│   ├── faq.html            # Frequently asked questions
│   ├── license.html        # License information
│   └── credits.html        # Credits and acknowledgments
├── students/               # Student lesson pages
│   ├── lesson-00.html      # Generated from templates
│   ├── lesson-01.html
│   └── ...
├── mentors/                # Mentor lesson pages
│   ├── lesson-00.html
│   └── ...
├── templates/              # Mustache templates for lesson-00 generation
│   └── lesson-00-student.mustache
├── data/                   # Data files for template rendering
│   ├── lessons.json        # Lesson metadata
│   └── lesson-00-student.js
├── styles/                 # CSS stylesheets (layer-based architecture)
│   ├── globals.css         # Imports all CSS variable definitions
│   ├── main.css            # Main stylesheet with @layer structure
│   ├── definitions/        # CSS custom properties only
│   │   ├── colours.css     # Colour variables and theme definitions
│   │   ├── typography.css  # Font and text variables
│   │   ├── layout.css      # Spacing and layout variables
│   │   ├── animation.css   # Animation timing variables
│   │   └── keyframes.css   # Global @keyframes definitions
│   ├── layouts/            # Element selectors only (no classes/IDs)
│   │   ├── page-layout.css
│   │   ├── text.css
│   │   └── images.css
│   ├── components/         # Class selectors only (no elements/IDs)
│   │   ├── buttons.css
│   │   ├── code.css
│   │   ├── header-and-footer.css
│   │   ├── lesson-navigation.css
│   │   ├── lessons-sidebar.css
│   │   ├── navigation.css
│   │   ├── popover.css
│   │   ├── theme-switcher.css
│   │   └── ...
│   ├── pages/              # Page-specific styles (all selectors allowed)
│   │   ├── index.css
│   │   ├── lesson.css
│   │   ├── gallery.css
│   │   └── ...
│   ├── utilities/          # Utility classes and helpers
│   │   ├── utilities.css
│   │   └── toggle.css
│   └── diagnostics/        # Testing and diagnostic styles
├── scripts/                # JavaScript files
│   └── ...
├── bin/                    # Build and test scripts
│   └── ...
├── diagnostics/            # Diagnostic pages and test results
│   └── ...
├── images/                 # SVG and image assets
└── documentation/          # Project documentation
    ├── coding-style.md     # This document
    └── ...
```

### CSS Architecture

#### Style Loading Order (Critical)
All HTML pages must load stylesheets in this exact order:

1. **`globals.css`** - CSS custom properties (MUST load first)
   - Imports from `definitions/` folder: colours, typography, layout, animation, keyframes
2. **`main.css`** - Main stylesheet with @layer cascade structure
   - Imports all layout, component, and utility styles
   - Uses @layer for predictable cascade management
3. **Page-specific stylesheets** - Only when needed (e.g., `pages/lesson.css`)

#### CSS Layer System
The project uses CSS `@layer` to manage cascade precedence and avoid specificity conflicts:

```css
@layer reset, layouts, pages, components, utilities;
```

**Layer purposes:**
- **reset**: Browser default overrides (e.g., `font: inherit` for form elements)
- **layouts**: Element selectors only (body, h1, p, img, etc.)
- **pages**: Page-specific styles (can use any selector type)
- **components**: Class selectors only (`.button`, `.header`, etc.)
- **utilities**: Utility classes (`.hidden`, `.toggle`, etc.)

**Important rules:**
- Files in `layouts/` contain **ONLY element selectors** (no classes or IDs)
- Files in `components/` contain **ONLY class selectors** (no elements or IDs)
- Files in `pages/` can contain **all selector types** but are page-specific

#### CSS Custom Properties
All colours, fonts, spacing, and common values are defined as CSS custom properties in files within the `styles/definitions/` folder. The `globals.css` file imports all of these. Always use these variables rather than hard-coded values.

**Variable categories:**
- **Colours**: `definitions/colours.css` - theme-aware colour variables
- **Typography**: `definitions/typography.css` - font families, sizes, weights
- **Layout**: `definitions/layout.css` - spacing, borders, radii
- **Animation**: `definitions/animation.css` - timing, duration, easing
- **Keyframes**: `definitions/keyframes.css` - global animation keyframes

Example usage:
```css
color: var(--colour-effective-page-text);
background-color: var(--colour-effective-page-background);
border: var(--border-weight) var(--border-style) var(--colour-effective-headings-text);
font-family: var(--font-family-main);
font-size: var(--font-size-body);
padding: var(--spacing-medium);
```

#### Modern Media Query Syntax
The project uses modern CSS range syntax for media queries:

```css
/* Modern syntax (preferred) */
@media (width < 800px) { /* Mobile styles */ }
@media (width >= 800px) and (width < 1200px) { /* Tablet styles */ }
@media (width >= 1200px) { /* Desktop styles */ }

/* NOT the old syntax */
@media (max-width: 800px) { /* Don't use this */ }
```

#### Responsive Design
- Use `clamp()` for fluid typography and spacing
- Use relative units (rem, em, %) over absolute pixels
- **Media query breakpoints:**
  - Tiny: `width < 200px`
  - Small: `width < 400px`
  - Medium: `width < 800px`
  - Large: `width < 1200px`
  - Very Large: `width >= 1200`
- **Touch device support**: `@media (hover: none) and (pointer: coarse)`
- **Reduced motion**: `@media (prefers-reduced-motion: reduce)`

### JavaScript Architecture

#### Principles
- Use ES6+ features (classes, arrow functions, const/let)
- Vanilla JavaScript only (no frameworks or external libraries in production code)
- Module pattern with IIFE for encapsulation
- Event delegation where appropriate
- localStorage for client-side persistence
- JSDoc comments for class methods and complex functions

#### Script Loading Order
Core scripts must be loaded in this order (before other scripts):

1. **`queryParams.js`** - URL parameter parsing (required by debug.js and themeSwitcher.js)
2. **`debug.js`** - Debugging utilities (depends on queryParams.js)
3. **`themeSwitcher.js`** - Theme management (depends on queryParams.js)
4. Other scripts (can use `defer` attribute)

#### Core Dependencies
- **queryParams.js**: Provides `window.QueryParams` for parsing URL parameters
- **debug.js**: Provides global `Debug` object for conditional logging
- Both are required by multiple other scripts

#### Common Patterns
```javascript
// Module pattern with IIFE
(function() {
    'use strict';
    
    /**
     * Brief class description
     *
     * @remarks Preconditions and assumptions
     */
    class MyComponent {
        /**
         * Constructor description
         *
         * @returns {void}
         */
        constructor() {
            Debug.methodEntry('MyComponent', 'constructor');
            // Initialisation
        }
        
        /**
         * Initialisation method
         */
        init() {
            Debug.methodEntry('MyComponent', 'init');
            // Setup
        }
    }
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new MyComponent().init();
        });
    } else {
        new MyComponent().init();
    }
})();
```

#### Global Debug Object
The global `Debug` object provides conditional logging controlled via URL parameter or localStorage:

- **Enable**: Add `?debug=on` to URL
- **Disable**: Add `?debug=off` to URL
- **Persist**: Setting persists in localStorage across pages

**Available methods:**
```javascript
Debug.log('message', data);           // Conditional console.log
Debug.warn('warning');                // Conditional console.warn
Debug.error('error');                 // Conditional console.error
Debug.methodEntry('Class', 'method'); // Log method entry
```

## Animation Guidelines

### Prefer CSS Animations
- Use CSS transitions and animations over JavaScript where possible
- Use `transform` and `opacity` for better performance
- Respect `prefers-reduced-motion` media query

Example:
```css
.button {
    transition: transform 0.2s ease, opacity 0.3s ease;
}

.button:hover {
    transform: scale(1.2);
    opacity: 0.8;
}

@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
}
```

### JavaScript Animation
Only use JavaScript for:
- Complex interactive animations
- Animations that respond to user input calculations
- Coordinating multiple animation sequences

## Code Style

### HTML
- Use semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<footer>`, `<article>`, `<section>`)
- Include proper ARIA labels for accessibility
- All images must have `alt` attributes (even decorative images with empty alt)
- Use `<button>` for actions, `<a>` for navigation

### CSS
- Group related properties (positioning, box model, typography, visual)
- Comment complex calculations and layout decisions
- Avoid `!important` unless absolutely necessary

### JavaScript
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Handle errors gracefully
- Use `addEventListener` not inline event handlers
- Clean up event listeners when appropriate

## DRY Principle

### Common Code Injection
Header and footer HTML are injected dynamically via JavaScript (`injectCommonCode.js`) to maintain consistency across all pages. This ensures:
- Single source of truth for navigation and page structure
- Easy updates to site-wide elements
- Automatic path resolution based on page location

### Template System (Mustache)
Lesson 0 is generated from templates to avoid duplication:
- Templates stored in `templates/` directory (e.g., `lesson-00-student.mustache`)
- Data files in `data/` directory (e.g., `lesson-00-student.js`)
- Build command: `npm run build` (runs `bin/build-lessons.js`)
- Generates HTML files in `students/` and `mentors/` directories

### Component Reuse
Reusable components are:
- Styled once in `styles/components/` directory
- Imported via `main.css` @import statements
- Organised by @layer for predictable cascade
- Reused across all pages without duplication

## File Headers

All files should include a header comment:
```javascript
/*
 **********************************************************************
 * File       : filename.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Brief description of file purpose
 **********************************************************************
 */
```

## Testing

The project includes comprehensive automated testing:

### Test Scripts (in `bin/` directory)
- **`run-all-tests.sh`** - Run all test suites (accessibility, validation, links)
- **`run-axe-tests.sh`** - Accessibility testing with axe-core
- **`run-pa11y-tests.sh`** - Accessibility testing with Pa11y
- **`run-lighthouse-tests.sh`** - Performance and best practices (Lighthouse)
- **`run-wave-tests.sh`** - WAVE accessibility testing
- **`validate-code.sh`** - Code validation (ESLint, Stylelint, HTML Validate)
- **`check-links.sh`** - Broken link detection
- **`check-reading-age.sh`** - Content readability analysis
- **`summarise-tests.sh`** - Generate test summary reports

### Testing Tools (from package.json)
- **ESLint** - JavaScript linting and code quality
- **Stylelint** - CSS linting and conformance
- **html-validate** - HTML validation
- **Pa11y** - Automated accessibility testing
- **Playwright** - Browser automation for testing
- **broken-link-checker** - Link validation
- **text-readability** - Reading age calculation

### Test Results
- Test outputs stored in `diagnostics/test-results/`
- View results at `diagnostics/test-results.html`
- Diagnostic dashboard at `diagnostics/index.html`

### Manual Testing
- Browser testing in all supported browsers (Chrome, Firefox, Safari, Edge)
- Screen reader testing
- Responsive testing at various viewport sizes
- Touch device testing (tablets, mobile)
- Theme and colour contrast verification

## Build System

The project uses Node.js and npm for building and development:

### Available Commands
```bash
npm run build    # Build lesson pages from Mustache templates
npm start        # Start local development server (port 8000)
npm run dev      # Same as npm start
```

### Template Build Process
1. Templates in `templates/` directory use Mustache syntax
2. Data files in `data/` define content and structure
3. `bin/build-lessons.js` renders templates with data
4. Generates HTML files in `students/` and `mentors/` directories

### Development Dependencies
- **mustache** - Template rendering engine
- **http-server** - Local development server

## Theme System

The site supports multiple themes and colour styles:

### Theme Options
- **Light** - Light background with dark text
- **Dark** - Dark background with light text
- **Auto** - Follows system/browser preference via `prefers-color-scheme`

### Style Variants (within each theme)
- **Normal** - Standard colour palette
- **Subdued** - Reduced contrast and saturation
- **Vibrant** - Enhanced colours and contrast

### Theme Management
- Controlled by `themeSwitcher.js`
- Preferences stored in localStorage
- Can be set via URL parameters for testing (e.g., `?theme=dark&style=vibrant`)
- CSS variables in `definitions/colours.css` define all theme colours
- All colour combinations meet WCAG 2.2 AA standards
- Theme switcher controls available on all pages
- SVG images (logo, icons) adapt to current theme

## Key Features

### User-Facing Features
- **Responsive Design**: Fluid layouts work on desktop, tablet, and mobile
- **Accessibility**: WCAG 2.2 AA colour contrast, keyboard navigation, screen reader support
- **Multi-Theme Support**: Light/dark themes with normal/subdued/vibrant colour styles
- **Student Dashboard**: Avatar selection, form persistence via localStorage
- **Collapsible Header/Footer**: Toggle between minimal and full views for more screen space
- **Lesson Navigation**: Sidebar navigation with progress tracking
- **Interactive Glossary**: Popover definitions for technical terms
- **Progressive Enhancement**: Basic functionality works without JavaScript

### Developer Features
- **Debug Mode**: Conditional logging via `?debug=on` URL parameter
- **Theme Testing**: Set theme/style via URL parameters
- **Template System**: Mustache templates for DRY lesson generation
- **Automated Testing**: Comprehensive test suite for accessibility, validation, performance
- **Diagnostic Tools**: Colour palette viewer, typography samples, DOM tree visualisation
- **Code Validation**: ESLint, Stylelint, HTML validation in build process

## Diagnostic Tools

The `diagnostics/` directory contains development tools:

- **`index.html`** - Diagnostic dashboard with links to all tools
- **`colourPalette.html`** - Visual display of all theme colour combinations
- **`colourSwatches.html`** - Individual colour swatches for reference
- **`typography.html`** - Font specimens and text styling examples
- **`test-results.html`** - Test results viewer
- **`test-js-parsing.html`** - JavaScript code parsing diagnostics
- **`prototypes.html`** - Component prototypes and experiments
- **`dom-trees/`** - Generated DOM structure visualisations
- **`screenshots/`** - Automated screenshot captures
- **`test-results/`** - Test output files

## Performance Considerations

- Minimise DOM manipulations
- Use CSS transforms over position changes
- Lazy load images where appropriate
- Minimise reflows and repaints
- Use event delegation for repeated elements
- Cache DOM queries in variables

## Accessibility

The project strives for WCAG 2.2 AAA compliance:

### Colour and Contrast
- All colour combinations meet **WCAG 2.2 AA** contrast requirements
- Theme variants (normal/subdued/vibrant) all maintain AA compliance
- Colour is never the only means of conveying information

### Keyboard Navigation
- All interactive elements accessible via keyboard
- Logical tab order throughout pages
- Visible focus indicators on all focusable elements
- Skip links for navigation

### Screen Reader Support
- Semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<article>`, etc.)
- Proper heading hierarchy (h1 → h2 → h3, no skipped levels)
- ARIA labels where semantic HTML is insufficient
- Alternative text for all images (decorative images use empty alt="")
- Live regions for dynamic content updates

### Motion and Animation
- Respects `prefers-reduced-motion` media query
- Animations disabled or greatly reduced when motion preference is reduce
- No auto-playing animations or videos
- User control over all animations

### Testing
- Automated testing with Pa11y and axe-core
- Manual screen reader testing (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation testing
- Colour contrast verification tools

## Browser Testing Checklist

### Functional Testing
- [ ] Layout renders correctly on all breakpoints
- [ ] Fonts load properly (Google Fonts and Font Awesome)
- [ ] CSS animations work smoothly
- [ ] JavaScript interactivity functions as expected
- [ ] Forms work correctly and validate properly
- [ ] localStorage persists data across page loads
- [ ] Theme switching works (light/dark, normal/subdued/vibrant)
- [ ] Responsive breakpoints trigger at correct widths
- [ ] Touch gestures work on mobile devices
- [ ] No console errors or warnings

### Accessibility Testing
- [ ] Keyboard navigation works throughout
- [ ] Screen reader announces content correctly
- [ ] Focus indicators are visible
- [ ] Colour contrast passes WCAG AAA
- [ ] `prefers-reduced-motion` respected
- [ ] All images have appropriate alt text

### Performance Testing
- [ ] Page load time < 3 seconds
- [ ] No layout shifts during load
- [ ] Animations run at 60fps
- [ ] No memory leaks in long sessions
- [ ] Images optimised and properly sized

### Cross-Browser Testing
Test in latest 2 versions of:
- [ ] Chrome (desktop and mobile)
- [ ] Firefox (desktop and mobile)
- [ ] Safari (desktop and iOS)
- [ ] Edge (desktop)

## Asset Generation and Artwork

The `bin/` directory contains scripts for generating and managing assets:

### Image Generation
- **`generate-all-images.sh`** - Generate all image assets
- **`generate-web-backgrounds.py`** - Create background images
- **`generate-colours-from-css.py`** - Extract colour palette from CSS
- **`build-background.sh`** - Build background variations

### Animation Tools
- **`create-animation.sh`** - Create new CSS animations
- **`capture-css-animation.js`** - Capture CSS animations as files
- **`convert-animation-formats.sh`** - Convert animations between formats
- **`adjust-animation-speed.sh`** - Modify animation timing
- **`video-to-gif.sh`** - Convert videos to GIF format

### Screenshot and Capture
- **`capture-screenshots.sh`** - Automated screenshot generation
- **`capture-webpage.js`** - Capture webpage states
- **`capture-responsive.sh`** - Capture at different viewport sizes

### Artwork Directories
- **`artwork/source/`** - Original source files (Blender, SVG sources)
- **`artwork/common/`** - Shared artwork assets
- **`artwork/generated/`** - Generated output files

### Documentation
All documentation resides in the documentation folder
