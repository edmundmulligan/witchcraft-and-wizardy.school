#!/bin/bash

# Build the LaTeX document specified as the first argument

# First, get the word count and save it to wordcount.txt
texcount -nobib $1.tex | awk -F: ' $1 == "Words in text" {print $2}' > wordcount.txt

# Generate the PDF
pdflatex $1.tex

# Run BibTeX to handle references
bibtex $1

# Run pdflatex twice more to ensure all references are updated
pdflatex $1.tex
pdflatex $1.tex