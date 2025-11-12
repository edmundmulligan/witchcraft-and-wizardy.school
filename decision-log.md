# Decision log for Assignment 2

This log records any design and development decisions and any coding standards to be followd

## HTML

### Scope
- 1 landing page - index.html
- 1 student home page - students/index.html
- 2 student lesson pages - students/lesson{1,2}.html
- 1 mentor home page - mentors/index.html
- 1 about page - about.html

## CSS
- 1 css file for all media queries
- 2 css files for light and dark theme
- use anchor links to toggle between themes to avoid JavaScript
- all colours used by name, not hex codes
- px only used in media queries, em used everywhere else

## JS
- No JavaScr    ipt, except for a message box to alert users that content is out of scope for this iteration of the project

## Testing, Validation and compliance
- Test all pages with main browsers
  - firefox
  - chrome
  - safaris
- Write functional tests in playwright
- Validate all HTML pages
- Validate all CSS files
- Validate for WGAC 2.2 compliance using 
  - axe
  - lighthouse
  - pa11y

