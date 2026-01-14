# Copilot Instructions for Web Witchcraft and Wizardry

## Project Overview

This is a web-based learning platform for teaching HTML, CSS, and JavaScript. The project is structured as a static website with separate sections for students and mentors, focusing on accessibility, web standards, and best practices.

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Server**: http-server for local development
- **Testing**: Playwright for browser testing, Pa11y and axe for accessibility
- **Validation**: html-validate, ESLint, Stylelint
- **Build Tools**: Node.js scripts in the `bin/` directory

## Project Structure

```
web/                    # Main website files
├── index.html         # Landing page
├── pages/             # Content pages
├── students/          # Student-specific content
├── mentors/           # Mentor-specific content
├── scripts/           # JavaScript files
├── styles/            # CSS stylesheets
├── images/            # Image assets
└── tests/             # Browser test definitions

bin/                   # Build and test scripts
tests/                 # Test configuration and results
sound/                 # Sound-related application
stats/                 # Statistics application
```

## Code Style and Conventions

### HTML
- Use semantic HTML5 elements
- Always include proper meta tags (charset, description, keywords, author, viewport)
- Include comprehensive file header comments with File, Author, Copyright, License, and Description
- Link to external resources (Google Fonts, Font Awesome) in the head section
- Follow a consistent structure: meta tags, title, favicon, fonts, CSS, then scripts
- Ensure all pages are accessible (WCAG compliant)

### CSS
- Use Stylelint with the standard config (`stylelint-config-standard`)
- CSS files should start with a header comment similar to HTML files
- Use `main.css` as the primary stylesheet (loaded first)
- Organize styles in a logical order
- Avoid descending specificity issues when necessary (see `.stylelintrc.json`)

### JavaScript
- Follow ESLint recommended rules (see `.eslintrc.json`)
- Use **4 spaces** for indentation (not tabs)
- Use **single quotes** for strings
- Always use semicolons
- Use ES2021 features and module syntax
- Add `'use strict';` at the top of files
- Unix line endings (LF)
- Include proper file header comments

### File Comments
All source files (HTML, CSS, JavaScript) must include a header comment block with:
- File path/name
- Author information
- Copyright notice
- License (MIT)
- Description of the file's purpose

## Development Workflow

### Running the Development Server
```bash
npm start          # Starts http-server on port 8000
# or
npm run dev        # Same as npm start
```

### Code Validation
```bash
# Run all validations for web application
bin/validate-code.sh web

# Individual validation tools are configured:
# - html-validate for HTML
# - eslint for JavaScript
# - stylelint for CSS
```

### Testing

The project has comprehensive automated testing:

1. **HTML/CSS/JavaScript Validation** (`bin/validate-code.sh`)
   - Validates HTML structure and semantics
   - Checks CSS against Stylelint rules
   - Lints JavaScript with ESLint

2. **File Comments Check** (`bin/check-file-comments.sh`)
   - Ensures all source files have proper header comments

3. **Link Checking** (`bin/check-links.sh`)
   - Validates all internal and external links
   - Uses broken-link-checker package

4. **Browser Testing** (`bin/run-browser-tests.sh`)
   - Tests across Chromium, Firefox, and WebKit
   - Custom test definitions in `web/tests/browser-tests.js`
   - Edit `web/tests/browser-tests.js` to modify pages or tests

5. **Accessibility Testing**
   - axe accessibility tests (`bin/run-axe-tests.sh`)
   - Pa11y accessibility tests (`bin/run-pa11y-tests.sh`)
   - WCAG compliance is mandatory

### Continuous Integration

The project uses GitHub Actions workflows:
- `pre-deploy-web.yml` - Tests web application changes
- `pre-deploy-sound.yml` - Tests sound application changes
- `pre-deploy-stats.yml` - Tests stats application changes
- Tests run on pushes to `development` and `main` branches
- All validations and tests must pass before deployment

## Accessibility Requirements

This project places a strong emphasis on web accessibility:

- All pages must be WCAG compliant
- Test with both axe and Pa11y tools
- Ensure proper semantic HTML
- Include appropriate ARIA labels when needed
- Maintain good color contrast
- Ensure keyboard navigation works
- Test across multiple browsers (Chromium, Firefox, WebKit)

## Best Practices for Contributions

1. **Minimal Changes**: Make surgical, focused changes that address specific issues
2. **Test Early**: Run relevant validations and tests as soon as changes are made
3. **Preserve Structure**: Maintain the existing file structure and naming conventions
4. **Comments**: Add or update file header comments when creating or modifying files
5. **Accessibility First**: Always consider accessibility implications of changes
6. **Cross-Browser**: Test changes work across different browsers
7. **Validation**: Ensure code passes ESLint, Stylelint, and HTML validation
8. **Links**: Verify all links work after making changes
9. **Documentation**: Update relevant documentation if changing functionality

## Common Tasks

### Adding a New Page
1. Create HTML file in appropriate directory (`web/pages/`, `web/students/`, or `web/mentors/`)
2. Include proper header comment and meta tags
3. Link to required stylesheets (starting with `main.css`)
4. Follow existing page structure
5. Add page to `web/tests/browser-tests.js` if it needs testing
6. Validate HTML, CSS, and accessibility
7. Update sitemap if necessary

### Modifying Styles
1. Edit appropriate CSS file in `web/styles/`
2. Maintain file header comment
3. Run `stylelint` to check for issues
4. Test visual changes across browsers
5. Verify accessibility is not negatively impacted

### Adding JavaScript Functionality
1. Create or edit file in `web/scripts/`
2. Include `'use strict';` directive
3. Follow ESLint rules (4-space indent, single quotes, semicolons)
4. Add file header comment
5. Run ESLint to validate
6. Test functionality in multiple browsers

## License

MIT License - Ensure all new files include the MIT license in header comments.

## Author

Edmund Mulligan <edmund@edmundmulligan.name>
