# Web Witchcraft and Wizardry

## Project Overview

Web Witchcraft and Wizardry is an educational website designed to teach HTML, CSS, and JavaScript to students through a series of interactive lessons. The site features a whimsical, magical theme inspired by wizardry and witchcraft.

## Technical Requirements

### Standards Compliance
- **HTML5**: Use semantic HTML elements and follow W3C standards
- **CSS3**: Modern CSS with custom properties (CSS variables)
- **JavaScript**: ES6+ syntax, vanilla JavaScript (no frameworks)
- **Accessibility**: WCAG 2.1 AA compliance
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
│   ├── students.html       # Student dashboard
│   ├── mentors.html        # Mentor resources
│   ├── gallery.html        # Gallery of examples
│   └── ...
├── students/               # Student lesson pages
│   ├── lesson-00.html
│   ├── lesson-01.html
│   └── ...
├── mentors/                # Mentor lesson pages
├── styles/                 # CSS stylesheets
│   ├── globals.css         # CSS custom properties
│   ├── main.css            # Base styles
│   ├── components/         # Component-specific styles
│   └── media-queries.css   # Responsive breakpoints
├── scripts/                # JavaScript files
│   ├── debug.js            # Debugging utilities
│   ├── injectCommonCode.js # DRY principle for header/footer
│   └── ...
├── data/                   # JSON data files
└── images/                 # SVG and image assets
```

### CSS Architecture

#### Style Loading Order (Critical)
1. `globals.css` - CSS custom properties (must load first)
2. `main.css` - Base styles
3. Component stylesheets (buttons, navigation, etc.)
4. Page-specific styles
5. `media-queries.css` (must load last)

#### CSS Custom Properties
All colors, fonts, spacing, and common values are defined as CSS custom properties in `globals.css`. Always use these variables rather than hard-coded values.

Example:
```css
color: var(--color-headings-text);
border: var(--border-weight) var(--border-style) var(--color-headings-text);
font-family: var(--font-main);
```

#### Responsive Design
- Use `clamp()` for fluid typography and spacing
- Use relative units (rem, em, %) over absolute pixels
- Media query breakpoints:
  - Very small: `width < 200px`
  - Small (mobile): `width < 800px`
  - Large: `width < 1200px`
  - Very large: `width >= 1200px`
- Support touch devices: `(hover:none) and (pointer:coarse)`

### JavaScript Architecture

#### Principles
- Use ES6+ features (classes, arrow functions, const/let)
- No external dependencies or frameworks
- Module pattern with IIFE for encapsulation
- Event delegation where appropriate
- localStorage for client-side persistence

#### Common Patterns
```javascript
// Module pattern
(function() {
    'use strict';
    
    class MyComponent {
        constructor() {
            // Initialization
        }
        
        init() {
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
A global `Debug` object is available for logging when debug mode is enabled via localStorage.

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
- Mobile-first approach (base styles for mobile, progressively enhance)
- BEM-like naming for components (e.g., `.lesson-nav`, `.lesson-nav__item`)
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
Header and footer HTML are injected via JavaScript (`injectCommonCode.js`) to maintain consistency across all pages and follow DRY principles.

### Component Reuse
Reusable components (buttons, navigation, forms) are styled once in component stylesheets and reused across pages.

## File Headers

All files should include a header comment:
```javascript
/*
 **********************************************************************
 * File       : filename.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2025 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Brief description of file purpose
 **********************************************************************
 */
```

## Testing

- Manual testing in all supported browsers
- Accessibility testing with screen readers
- Responsive testing at various viewport sizes
- Performance testing (minimize reflows/repaints)
- Automated tests where applicable (located in `tests/` directory)

## Theme System

The site supports light and dark themes:
- Theme preference stored in localStorage
- CSS custom properties change based on theme
- Theme switcher available on all pages
- Logo changes based on theme

## Key Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Accessibility**: WCAG 2.1 AA compliant
- **Theme Switcher**: Light/dark mode support
- **Student Dashboard**: Avatar selection, form persistence
- **Collapsible Header/Footer**: Toggle between minimal and full views
- **Lesson Navigation**: Sidebar navigation for easy lesson access
- **Progressive Enhancement**: Works without JavaScript (with reduced functionality)

## Performance Considerations

- Minimize DOM manipulations
- Use CSS transforms over position changes
- Lazy load images where appropriate
- Minimize reflows and repaints
- Use event delegation for repeated elements
- Cache DOM queries in variables

## Accessibility

- Keyboard navigation support
- Screen reader friendly
- Proper heading hierarchy
- Focus indicators visible
- Color contrast meets WCAG AA
- `prefers-reduced-motion` support
- Semantic HTML
- ARIA labels where needed

## Browser Testing Checklist

- [ ] Layout renders correctly
- [ ] Fonts load properly
- [ ] CSS animations work
- [ ] JavaScript interactivity functions
- [ ] Forms work correctly
- [ ] LocalStorage persists data
- [ ] Theme switching works
- [ ] Responsive breakpoints trigger correctly
- [ ] Touch gestures work on mobile
- [ ] No console errors
