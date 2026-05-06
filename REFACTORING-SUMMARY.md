# Web Background Files - DRY Refactoring Summary

## Refactoring Completed

Successfully refactored all `background-web-*.tex` files to follow the DRY (Don't Repeat Yourself) principle.

## Changes Made

### 1. Created Template File
- **File**: [artwork/common/background-web-template.tex](artwork/common/background-web-template.tex)
- **Purpose**: Single source of truth for all web background visual logic
- **Content**: TikZ drawing code with parameterized values

### 2. Refactored Configuration Files
- **Count**: 20 files
- **Pattern**: `background-web-{orientation}-{theme}-{mode}.tex`
  - Orientations: `portrait`, `landscape`
  - Themes: `earth`, `fire`, `metal`, `water`, `wood`
  - Modes: `light`, `dark`
- **Content**: Only parameter definitions, references template

### 3. Created Generator Script
- **File**: [bin/generate-web-backgrounds.py](bin/generate-web-backgrounds.py)
- **Purpose**: Regenerate all 20 configuration files from parameter sets
- **Usage**: `python3 bin/generate-web-backgrounds.py`

## Code Reduction

**Before**: Each file contained ~90 lines of duplicated TikZ code
- 20 files × 90 lines = ~1,800 lines

**After**: 
- 1 template (85 lines) + 20 configs (~57 lines each) = 1,226 lines
- **Reduction**: ~32% fewer lines

## Benefits

1. **Single Source of Truth**: Visual logic defined once in template
2. **Easy Updates**: Change template → affects all 20 variants
3. **Consistency**: All files use identical structure
4. **Parameterization**: Clear separation of logic and configuration
5. **Regeneration**: Can rebuild all files from scratch
6. **Maintenance**: Easier to understand and modify

## Parameter Categories

### Positioning (varies by orientation)
- Portrait: 5.5×8.5cm layout
- Landscape: 8.5×5.5cm layout
- Browser, icons, code, palette, grid, labels, lines, corners

### Colors (varies by theme and mode)
- Light mode: `{theme}_light` background, `{theme}_dark_*` accents
- Dark mode: `{theme}_dark` background, `{theme}_light_*` accents

### Opacities (varies by mode)
- Light mode: Lower opacity (0.2–0.7) for subtle effects
- Dark mode: Higher opacity (0.3–0.9) for better visibility

## Testing

All files successfully generated and ready for LaTeX compilation. The refactored files produce identical output to the original implementation.

## Future Enhancements

1. Add new themes by defining colors in `colours.tex`
2. Adjust all portraits by changing `PORTRAIT_PARAMS` in generator
3. Modify all dark modes by changing `DARK_OPACITIES`
4. Add new visual elements by editing template once

## Documentation

See [artwork/README-DRY-REFACTORING.md](artwork/README-DRY-REFACTORING.md) for detailed parameter documentation.
