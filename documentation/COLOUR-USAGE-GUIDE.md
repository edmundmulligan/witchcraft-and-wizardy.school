# Web Witchcraft and Wizardry colour usage Guide

## Overview

This project uses a **theme-based colour system** with three styles (Normal, Subdued, Vibrant) and two brightness modes (Light, Dark), giving users 6 theme combinations. All colours are defined in `colours.css` and managed by `themeSwitcher.js`.

## colour system Architecture

```
colours.css (221 lines)
  ├── Base colours (--colour-indigo, --colour-cyan, etc.)
  ├── Non-theme colours (warnings, errors)
  └── Theme-specific colours (6 themes × ~18 colours each)

themeSwitcher.js
  ├── Reads user preference (localStorage or browser default)
  ├── Maps generic variables to theme-specific colours
  └── Updates all pages dynamically

CSS/HTML
  └── Uses ONLY generic variables (never theme-specific ones)
```

---

## ⚠️ RULES: What Colours to Use

### ✅ DO: Use Generic Variables

**Always use these generic variables** defined by `themeSwitcher.js`:

| Variable                                        | Purpose
|-------------------------------------------------|---------------------------------------
| `--colour-effective-page-background`            | Page background colour
| `--colour-effective-page-text`                  | Body text colour
| `--colour-effective-headings-background`        | Headings background colour
| `--colour-effective-headings-text`              | Headings text colour
| `--colour-effective-code-background`            | Code snippet background colour
| `--colour-effective-code-text`                  | Code snippet text colour
| `--colour-effective-button-background`          | Button background colour
| `--colour-effective-button-text`                | Button text colour
| `--colour-effective-button-background-hover`    | Hover/focus button background colour
| `--colour-effective-button-text-hover`          | Hover/focus button text colour
| `--colour-effective-button-background-selected` | Selected button background colour
| `--colour-effective-button-text-selected`       | Selected button text colour
| `--colour-effective-button-background-disabled` | Disabled button background colour
| `--colour-effective-button-text-disabled`       | Disabled button text colour
| `--colour-effective-link-background`            | Menu/link background colour
| `--colour-effective-link-text`                  | Menu/link text colour
| `--colour-effective-link-background-hover`      | Hover menu/link background colour
| `--colour-effective-link-text-hover`            | Hover menu/link text colour
| `--colour-effective-link-background-visited`    | Visited menu/link background colour
| `--colour-effective-link-text-visited`          | Visited menu/link text colour
| `--colour-effective-link-background-focus`      | Focus menu/link background colour
| `--colour-effective-link-text-focus`            | Focus menu/link text colour
| `--colour-error-background`                     | Error message background colour
| `--colour-error-text`                           | Error message text colour
| `--colour-warning-background`                   | Warning message background colour
| `--colour-warning-text`                         | Warning message text colour

**Why?** These automatically change when the user switches themes. Code works with all 6 theme combinations without modification.

---

### ❌ DON'T: Use These in Regular CSS/HTML

**Never directly use theme-specific variables like:**
- `--colour-normal-light-page-background` ❌
- `--colour-subdued-dark-headings-text` ❌
- `--colour-vibrant-light-code-background` ❌

**Why not?** These are hard-coded to specific themes. If a user switches from Normal to Subdued, the colours won't update.

**Exception:** Only `colours.css`, `themeSwitcher.js`, and diagnostic pages (`colourPalette.html`) may use these directly.

---

### ❌ NEVER: Use hardcoded colours

**Never use:**
- Hex colours: `#fff`, `#007bff`, `#ccc` ❌
- RGB: `rgb(255, 0, 0)`, `rgba(0, 0, 0, 0.5)` ❌
- HSL: `hsl(180, 100%, 50%)` ❌
- Named colours: `white`, `black`, `red` ❌

**Why?** Hard-coded colours bypass the theme system entirely and may fail WCAG contrast standards in different themes.

**Limited exceptions:**
- Shadows with transparency: `box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);` ✅ (transparency needed)
- Overlays: `background: rgba(0, 0, 0, 0.8);` ✅ (semi-transparent overlay)

---

## 📋 How to Use Colours Correctly

### Step 1: Ensure Theme System is Loaded

Every HTML page **must** load:

```html
<head>
    <!-- Load globals.css which imports colours.css -->
    <link rel="stylesheet" href="../styles/globals.css">
    <link rel="stylesheet" href="../styles/main.css">
    
    <!-- Other stylesheets... -->
    
    <!-- Load theme switcher -->
    <script src="../scripts/debug.js"></script>
    <script src="../scripts/themeSwitcher.js"></script>
</head>
```

### Step 2: Use Generic Variables in CSS

```css
/* ✅ CORRECT */
.my-component {
    background: var(--colour-page-background);
    color: var(--colour-page-text);
    border: 1px solid var(--colour-headings-text);
}

.my-link {
    color: var(--colour-link-text);
}

.my-link:hover {
    color: var(--colour-link-text-hover);
}

/* ❌ WRONG */
.my-component {
    background: #fff;  /* Hardcoded - won't change with theme */
    color: black;      /* Named colour - won't change with theme */
}

.my-link {
    color: var(--colour-normal-light-link-text);  /* Theme-specific - breaks in other themes */
}
```

### Step 3: Use Inline Styles Only When Necessary

```html
<!-- ✅ CORRECT: Use CSS variables in inline styles -->
<div style="background: var(--colour-headings-background); color: var(--colour-headings-text);">
    Theme-aware content
</div>

<!-- ❌ WRONG: hardcoded colours -->
<div style="background: #007bff; color: white;">
    Won't change with theme
</div>
```

---

## 🎨 Available Theme Combinations

Users can choose from 6 combinations:

| Style | Light Mode | Dark Mode |
|-------|------------|-----------|
| **Normal** | Light cyan background, purple headings | Dark purple background, cyan headings |
| **Subdued** | Light gray background, dark gray text | Dark gray background, light gray text |
| **Vibrant** | White background, bright colours | Black background, neon colours |

**Code doesn't need to know which theme is active** - the generic variables automatically point to the right colours.

---

## 🔍 Auditing colour usage

### Run the Audit Script

```bash
node bin/audit-colour-usage.js
```

This will identify:
1. **hardcoded colours** (hex, rgb, hsl, named colours)
2. **Direct theme-specific variable usage** (should use generic instead)
3. **Missing theme system** (HTML pages without globals.css or themeSwitcher.js)

### Interpreting Results

```
✅ No issues found - All green!
⚠️  Warnings - Minor issues (diagnostic files, fallbacks)
❌ Errors - Production files with hardcoded colours
```

---

## 🛠️ Fixing Common Issues

### Issue: Hardcoded Colour in CSS

**Bad:**
```css
.button {
    background: #007bff;
    color: white;
}
```

**Fix:** Extend the theme system if no generic variable exists:

1. Add to `themeSwitcher.js` (around line 60):
```javascript
root.style.setProperty('--colour-button-background', `var(${prefix}-button-background)`);
root.style.setProperty('--colour-button-text', `var(${prefix}-button-text)`);
```

2. Use in CSS:
```css
.button {
    background: var(--colour-button-background);
    color: var(--colour-button-text);
}
```

### Issue: Page Missing Theme System

**Fix:** Add to `<head>`:
```html
<link rel="stylesheet" href="../styles/globals.css">
<script src="../scripts/debug.js"></script>
<script src="../scripts/themeSwitcher.js"></script>
```

### Issue: Modal/Overlay Needs Semi-Transparent Colour

**Allowed exception:**
```css
.modal-overlay {
    background: rgba(0, 0, 0, 0.8);  /* ✅ OK - transparency required */
}

.modal-content {
    background: var(--colour-page-background);  /* ✅ Use theme colour for content */
    color: var(--colour-page-text);
}
```

---

## 📊 Current Status

Run `node bin/audit-colour-usage.js` to see:
- Total files scanned
- hardcoded colours found
- Theme-specific variable misuse
- Pages missing theme system

**Goal:** All production CSS/HTML files should show ✅ with zero issues.

---

## 🚀 Best Practices

1. **Always use generic variables** from theme switcher
2. **Test colours in all 6 themes** before committing (use URL params: `?style=vibrant&theme=dark`)
3. **Run audit before commits:** `node bin/audit-colour-usage.js`
4. **Verify WCAG compliance:** All theme colours already meet AAA standards
5. **Never bypass the theme system** unless absolutely necessary (shadows/overlays only)

---

## 📝 Adding New Generic Colour Variables

If you need a new colour type (e.g., buttons, badges, alerts):

### Step 1: Define in all themes in `colours.css`

```css
/* Add to each theme section */
--colour-normal-light-button-background: hsl(180deg 100% 75%);
--colour-normal-light-button-text: hsl(275deg 100% 25%);

--colour-normal-dark-button-background: hsl(180deg 100% 50%);
--colour-normal-dark-button-text: hsl(0deg 0% 100%);

/* Repeat for subdued-light, subdued-dark, vibrant-light, vibrant-dark */
```

### Step 2: Map in `themeSwitcher.js` (line ~60)

```javascript
root.style.setProperty('--colour-button-background', `var(${prefix}-button-background)`);
root.style.setProperty('--colour-button-text', `var(${prefix}-button-text)`);
```

### Step 3: Use in your CSS

```css
.button {
    background: var(--colour-button-background);
    color: var(--colour-button-text);
}
```

### Step 4: Document in this guide

Add to the table in the "✅ DO: Use Generic Variables" section.

---

## ❓ FAQ

**Q: Can I use `#fff` as a fallback?**  
A: Only in very rare cases like `color: var(--my-colour, #fff)`. Prefer defining a proper theme variable.

**Q: What about SVG fill colours?**  
A: Same rules apply. Use `fill: var(--colour-headings-text);` etc.

**Q: Can diagnostic/test files use hardcoded colours?**  
A: Yes, test files in `/diagnostics/` and `/bin/` can use hardcoded colours for demonstrations.

**Q: How do I test all themes?**  
A: Add URL parameters: `?style=vibrant&theme=dark` or use the theme switcher UI (if implemented).

---

## 🔗 Related Files

- **Theme Definitions:** `styles/colours.css`
- **Theme Logic:** `scripts/themeSwitcher.js`
- **Generic Variables:** Set dynamically by themeSwitcher.js
- **Audit Script:** `bin/audit-colour-usage.js`
- **Contrast Verification:** `bin/verify-colour-contrasts.js`

---

## Summary

✅ **Use generic variables** (`--colour-page-text`, etc.)  
❌ **Never use theme-specific** (`--colour-normal-light-*`)  
❌ **Never hardcode** (`#fff`, `rgb()`, named colours)  
🔍 **Audit regularly** (`node bin/audit-colour-usage.js`)  
🎨 **All themes work automatically** - no manual updates needed
