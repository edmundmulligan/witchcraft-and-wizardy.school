#!/usr/bin/env python3
"""
Generate all background-web-*.tex files from template
This script implements DRY principle by generating files from parameters
"""

# Define portrait parameters (common for all portrait variants)
PORTRAIT_PARAMS = {
    'bgwidth': '5.5',
    'bgheight': '8.5',
    'browserx': '1.2',
    'browsery': '6.5',
    'iconsx': '1.5',
    'iconsy': '5.2',
    'codex': '1.0',
    'codey': '3.5',
    'palettex': '1.5',
    'palettey': '2.4',
    'gridx': '1.8',
    'gridy': '1.0',
    'labelonex': '2.7',
    'labeloney': '3.0',
    'labeltwox': '4.2',
    'labeltwoy': '5.5',
    'labelthreex': '4.0',
    'labelthreey': '1.5',
    'lineoneax': '0.3',
    'lineoneay': '8.2',
    'lineonebx': '1.5',
    'linetwoax': '4.0',
    'linetwoay': '0.3',
    'linetwobx': '5.2',
    'cornerx': '0.2',
    'cornery': '8.3',
    'corneryb': '7.8',
    'cornerxb': '0.7',
}

# Define landscape parameters (common for all landscape variants)
LANDSCAPE_PARAMS = {
    'bgwidth': '8.5',
    'bgheight': '5.5',
    'browserx': '0.8',
    'browsery': '3.5',
    'iconsx': '5.2',
    'iconsy': '3.8',
    'codex': '0.8',
    'codey': '1.8',
    'palettex': '5.0',
    'palettey': '1.0',
    'gridx': '5.2',
    'gridy': '1.9',
    'labelonex': '1.2',
    'labeloney': '0.8',
    'labeltwox': '6.5',
    'labeltwoy': '2.5',
    'labelthreex': '6.8',
    'labelthreey': '0.5',
    'lineoneax': '0.3',
    'lineoneay': '5.2',
    'lineonebx': '1.5',
    'linetwoax': '7.0',
    'linetwoay': '0.3',
    'linetwobx': '8.2',
    'cornerx': '0.2',
    'cornery': '5.3',
    'corneryb': '4.8',
    'cornerxb': '0.7',
}

# DefG faiine light theme opacities
LIGHT_OPACITIES = {
    'opacityone': '0.4',
    'opacitychrome': '0.15',
    'opacitycontent': '0.2',
    'opacityicons': '0.5',
    'opacityiconfill': '0.2',
    'opacitycodebg': '0.3',
    'opacitycode': '0.5',
    'opacitypaletteone': '0.7',
    'opacitypalettetwo': '0.4',
    'opacitygrid': '0.25',
    'opacitylabels': '0.6',
    'opacitylines': '0.3',
    'opacitycorner': '0.4',
}

# Define dark theme opacities
DARK_OPACITIES = {
    'opacityone': '0.7',
    'opacitychrome': '0.3',
    'opacitycontent': '0.4',
    'opacityicons': '0.8',
    'opacityiconfill': '0.3',
    'opacitycodebg': '0.6',
    'opacitycode': '0.8',
    'opacitypaletteone': '0.9',
    'opacitypalettetwo': '0.6',
    'opacitygrid': '0.4',
    'opacitylabels': '0.9',
    'opacitylines': '0.6',
    'opacitycorner': '0.7',
}

def generate_file(orientation, mode, style, source_dir='artwork/source/backgrounds/web'):
    """Generate a single background-web file"""
    
    filename = f"{source_dir}/background-web-{orientation}-{style}-{mode}.tex"
    
    # Select parameters based on orientation
    package_orientation = orientation
    position_params = PORTRAIT_PARAMS if orientation == 'portrait' else LANDSCAPE_PARAMS
    
    # Select opacities and colours based on mode
    bg_colour = f"colour_{style}_{mode}_page_background"
    colour_one = f"colour_{style}_{mode}_page_text"
    colour_two = f"colour_{style}_{mode}_button_background_hover"
    if mode == 'light':
        opacity_params = LIGHT_OPACITIES
    else:
        opacity_params = DARK_OPACITIES
    
    # Combine all parameters including colours
    all_params = {**position_params, **opacity_params}
    # Add colour parameters as expandable definitions
    all_params['bgcolourbase'] = bg_colour
    all_params['colourone'] = colour_one
    all_params['colourtwo'] = colour_two
    all_params['gridcolour'] = colour_two
    
    # Generate parameter definitions using edef for full expansion
    param_defs = '\n'.join([f'\\edef\\{key}{{{value}}}' for key, value in all_params.items()])
    
    # Generate the file content
    content = f"""\\documentclass[border=0mm]{{standalone}}

\\input{{artwork/common/packages-background.tex}}
\\input{{artwork/common/colours.tex}}

% {orientation.capitalize()} dimensions ({mode} mode)
{param_defs}

\\begin{{document}}
  \\input{{artwork/common/background-web-template.tex}}
\\end{{document}}
"""
    
    # Write the file
    with open(filename, 'w') as f:
        f.write(content)
    
    print(f"Generated: {filename}")

def main():
    """Generate all background-web files"""
    orientations = ['portrait', 'landscape']
    modes = ['light', 'dark']
    themes = ['normal', 'subdued', 'vibrant']
    
    for orientation in orientations:
        for mode in modes:
            for style in themes:
                generate_file(orientation, mode, style)
    
    print("\nAll background-web-*.tex files have been generated!")

if __name__ == '__main__':
    main()
