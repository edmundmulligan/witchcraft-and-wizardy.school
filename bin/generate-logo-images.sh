#!/bin/bash

# Generate logo image files
# Run from the artwork folder to ensure correct paths
# Usage: ./generate-logo-images.sh

echo "Generating logo images"
cd artwork/source/logos
../../../bin/tex-to-svg.sh logo-embodied-mind-normal-dark ../../generated/logos
../../../bin/tex-to-svg.sh logo-embodied-mind-normal-light ../../generated/logos
../../../bin/tex-to-svg.sh logo-embodied-mind-subdued-dark ../../generated/logos
../../../bin/tex-to-svg.sh logo-embodied-mind-subdued-light ../../generated/logos
../../../bin/tex-to-svg.sh logo-embodied-mind-vibrant-dark ../../generated/logos
../../../bin/tex-to-svg.sh logo-embodied-mind-vibrant-light ../../generated/logos
cd ../../..
