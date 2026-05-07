# Background Web Template - DRY Refactoring

## Overview

The `background-web-*.tex` files have been refactored to follow the DRY (Don't Repeat Yourself) principle. Instead of 20 files each containing ~90 lines of duplicated code, we now have:

- **1 template file** (`common/background-web-template.tex`) - 85 lines
- **20 configuration files** (~60 lines each) - Just parameters
- **1 generator script** (`bin/generate-web-backgrounds.py`) - Can regenerate all files

## Structure

### Template File
[common/background-web-template.tex](../common/background-web-template.tex)

Contains the core TikZ drawing logic with parameterized values. All visual elements (browser window, responsive icons, code snippets, etc.) are defined once using variable placeholders.

### Configuration Files
[artwork/source/background-web-{orientation}-{theme}-{mode}.tex](../source/)

Each file defines only the parameters specific to that variant:
- **Orientation**: `portrait` (5.5×8.5cm) or `landscape` (8.5×5.5cm)
- **Theme**: `earth`, `fire`, `metal`, `water`, `wood`
- **Mode**: `light` or `dark`

### Generator Script
[bin/generate-web-backgrounds.py](../../bin/generate-web-backgrounds.py)

Python script that regenerates all 20 configuration files from scratch. Useful when:
- Adding new parameters to the template
- Changing opacity values for all light/dark modes
- Adjusting positioning for portrait/landscape layouts

## Usage

### Regenerate All Files
```bash
cd /path/to/witchcraft-and-wizardy.school
python3 bin/generate-web-backgrounds.py
```

### Build Backgrounds
```bash
./bin/build-background.sh web
```

### Manual Customization
To customize a specific variant, edit its parameter file directly:
```tex
\def\opacityone{0.4}  % Browser chrome opacity
\def\colorone{earth_dark_highlight}  % Primary accent color
```

## Parameters

### Position Parameters
- `\bgwidth`, `\bgheight` - Card dimensions
- `\browserx`, `\browsery` - Browser window position
- `\iconsx`, `\iconsy` - Responsive icons position
- `\codex`, `\codey` - Code snippet position
- `\palettex`, `\palettey` - Color palette position
- `\gridx`, `\gridy` - Grid layout position
- `\labelonex`, `\labeloney`, etc. - Label positions
- `\lineoneax`, `\lineoneay`, etc. - Decorative line positions
- `\cornerx`, `\cornery`, etc. - Corner accent positions

### Color Parameters
- `\bgcolorbase` - Background color
- `\colorone` - Primary accent color
- `\colortwo` - Secondary accent color
- `\gridcolor` - Grid line color

### Opacity Parameters
- `\opacityone` - Browser chrome outlines
- `\opacitychrome` - Browser top bar
- `\opacitycontent` - Browser content areas
- `\opacityicons` - Responsive device icons
- `\opacityiconfill` - Icon fill areas
- `\opacitycodebg` - Code snippet background
- `\opacitycode` - Code text
- `\opacitypaletteone`, `\opacitypalettetwo` - Color palette squares
- `\opacitygrid` - Grid layout
- `\opacitylabels` - Text labels
- `\opacitylines` - Decorative lines
- `\opacitycorner` - Corner accents

## Benefits

1. **Maintainability**: Change the template once, affects all 20 variants
2. **Consistency**: All cards use identical structure and logic
3. **Reduced Code**: ~1,800 lines → ~1,400 lines (22% reduction)
4. **Easy Tweaks**: Adjust all dark modes by changing one parameter set
5. **No Duplication**: Single source of truth for visual logic

## Migration Notes

All existing files have been regenerated with identical output. The LaTeX compilation should produce bit-identical PDFs/PNGs as before.
