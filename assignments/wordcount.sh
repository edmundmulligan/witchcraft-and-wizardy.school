#!/bin/bash
texcount -nobib $1.tex | awk -F: ' $1 == "Words in text" {print $2}' > wordcount.txt