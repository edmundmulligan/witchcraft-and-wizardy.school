#!/usr/bin/env python3
"""
Generate LaTeX colour definitions from CSS custom properties
Reads HSL colours from CSS and converts them to HSB for LaTeX
Author: Edmund Mulligan <edmund@edmundmulligan.name>
License: MIT
"""

import re
import sys
import os

def hsl_to_rgb(h, s, l):
    """
    Convert HSL to RGB colour space
    
    Args:
        h: Hue (0-360 degrees)
        s: Saturation (0-100%)
        l: Lightness (0-100%)
    
    Returns:
        tuple: (r, g, b) where each value is 0-1
    """
    # Convert percentages to 0-1 range
    s = s / 100.0
    l = l / 100.0
    h = h / 360.0
    
    def hue_to_rgb(p, q, t):
        if t < 0:
            t += 1
        if t > 1:
            t -= 1
        if t < 1/6:
            return p + (q - p) * 6 * t
        if t < 1/2:
            return q
        if t < 2/3:
            return p + (q - p) * (2/3 - t) * 6
        return p
    
    if s == 0:
        r = g = b = l
    else:
        q = l * (1 + s) if l < 0.5 else l + s - l * s
        p = 2 * l - q
        r = hue_to_rgb(p, q, h + 1/3)
        g = hue_to_rgb(p, q, h)
        b = hue_to_rgb(p, q, h - 1/3)
    
    return (r, g, b)


def hsl_to_hsb(h, s, l):
    """
    Convert HSL to HSB (HSV) colour space
    
    Args:
        h: Hue (0-360 degrees)
        s: Saturation (0-100%)
        l: Lightness (0-100%)
    
    Returns:
        tuple: (h, s_hsb, b) where h is 0-1, s_hsb is 0-1, b is 0-1
    """
    # Convert percentages to 0-1 range
    s = s / 100.0
    l = l / 100.0
    
    # Convert HSL to HSB
    b = l + s * min(l, 1 - l)
    
    if b == 0:
        s_hsb = 0
    else:
        s_hsb = 2 * (1 - l / b)
    
    # Convert hue to 0-1 range for LaTeX
    h_normalised = h / 360.0
    
    return (h_normalised, s_hsb, b)


def parse_css_colours(css_file_path):
    """
    Parse CSS file and extract colour definitions
    
    Args:
        css_file_path: Path to CSS file
    
    Returns:
        dict: Dictionary mapping colour names to HSL values
    """
    colours = {}
    relative_colours = {}
    
    with open(css_file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # First pass: Match CSS custom properties with direct HSL values
    # Pattern: --colour-name: hsl(hdeg s% l%); (modern space-separated syntax)
    # Also supports comma-separated: hsl(h, s%, l%);
    pattern = r'--([a-z0-9-]+):\s*hsl\((\d+(?:\.\d+)?)(?:deg)?[,\s]+(\d+(?:\.\d+)?)%[,\s]+(\d+(?:\.\d+)?)%\)'
    
    matches = re.finditer(pattern, content)
    
    for match in matches:
        name = match.group(1)
        h = float(match.group(2))
        s = float(match.group(3))
        l = float(match.group(4))
        colours[name] = (h, s, l)
    
    # Second pass: Match relative colour syntax hsl(from var(--colour-name) h s l)
    # Pattern: --colour-name: hsl(from var(--ref-colour) h s l);
    relative_pattern = r'--([a-z0-9-]+):\s*hsl\(from\s+var\(--([a-z0-9-]+)\)\s+([hsl\d.%\s]+)\)'
    
    relative_matches = re.finditer(relative_pattern, content)
    
    for match in relative_matches:
        name = match.group(1)
        ref_name = match.group(2)
        params = match.group(3).strip()
        relative_colours[name] = (ref_name, params)
    
    # Resolve relative colours
    max_iterations = 10  # Prevent infinite loops
    for _ in range(max_iterations):
        resolved_any = False
        for name, (ref_name, params) in list(relative_colours.items()):
            if ref_name in colours:
                # Get reference colour
                ref_h, ref_s, ref_l = colours[ref_name]
                
                # Parse the parameters
                tokens = params.split()
                new_h = ref_h
                new_s = ref_s
                new_l = ref_l
                
                # Simple parser for h, s, l, or numeric values with %
                if len(tokens) == 3:
                    # Format: "h s l" or "h s 75%" etc.
                    for i, token in enumerate(tokens):
                        if token != ['h', 's', 'l'][i]:
                            # It's a numeric value
                            value = token.rstrip('%')
                            try:
                                if i == 0:  # hue
                                    new_h = float(value)
                                elif i == 1:  # saturation
                                    new_s = float(value)
                                elif i == 2:  # lightness
                                    new_l = float(value)
                            except ValueError:
                                pass  # Keep original value
                
                colours[name] = (new_h, new_s, new_l)
                del relative_colours[name]
                resolved_any = True
        
        if not resolved_any:
            break  # No more can be resolved
    
    return colours


def generate_latex_colours(colours):
    """
    Generate LaTeX colour definitions from HSL colours
    
    Args:
        colours: Dictionary mapping colour names to HSL tuples
    
    Returns:
        str: LaTeX colour definitions
    """
    output = []
    output.append('%' * 75)
    output.append('% File: colours.tex')
    output.append('% Author: Edmund Mulligan <edmund@edmundmulligan.name>')
    output.append('% Auto-generated from CSS - DO NOT EDIT MANUALLY')
    output.append('% Run generate-colours-from-css.py to regenerate')
    output.append('% Description: Contains colour definitions converted from CSS HSL to LaTeX RGB')
    output.append('%' * 75)
    output.append('')
    
    for name, (h, s, l) in sorted(colours.items()):
        # Convert HSL to RGB
        r, g, b = hsl_to_rgb(h, s, l)
        
        # Replace hyphens with underscores for LaTeX colour names
        latex_name = name.replace('-', '_')
        
        # Format with 3 decimal places
        output.append(f'\\definecolor{{{latex_name}}}{{rgb}}{{{r:.3f}, {g:.3f}, {b:.3f}}}')
        output.append(f'% Original CSS: hsl({h}, {s}%, {l}%)')
        output.append('')
    
    return '\n'.join(output)


def main():
    """Main execution function"""
    if len(sys.argv) < 2:
        print('Usage: generate-colours-from-css.py <css-file> [output-file]')
        print('Example: generate-colours-from-css.py ../../styles/main.css ../common/colours.tex')
        sys.exit(1)
    
    css_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else '../common/colours.tex'
    
    # Check if CSS file exists
    if not os.path.exists(css_file):
        print(f'Error: CSS file not found: {css_file}')
        sys.exit(1)
    
    # Parse colours from CSS
    print(f'Reading colours from {css_file}...')
    colours = parse_css_colours(css_file)
    
    if not colours:
        print('Warning: No HSL colours found in CSS file')
        print('Make sure your CSS uses custom properties with HSL format:')
        print('  --colour-name: hsl(180, 100%, 50%);')
    else:
        print(f'Found {len(colours)} colour definitions')
    
    # Generate LaTeX colour definitions
    latex_output = generate_latex_colours(colours)
    
    # Write to output file
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(latex_output)
    
    print(f'Generated LaTeX colours in {output_file}')
    print('Done!')


if __name__ == '__main__':
    main()
