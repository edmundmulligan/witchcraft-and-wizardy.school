#!/bin/bash

# This script checks the reading age/readability of HTML pages
# Uses Flesch Reading Ease and Flesch-Kincaid Grade Level

# Source common helper functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

# Install dependencies
echo "Installing dependencies..."
npm install text-readability cheerio > /dev/null 2>&1

# Validate folder parameter
FOLDER=""
EXCLUDE_LIST=""
while [[ $# -gt 0 ]]; do
  case $1 in
    -x|--exclude)
      shift
      if [[ $1 == *","* ]]; then
        # Comma-separated list
        EXCLUDE_LIST=$(echo "$1" | tr ',' ' ')
      else
        # Space-separated list (take all remaining arguments)
        EXCLUDE_LIST="$*"
        break
      fi
      ;;
    *)
      # First non-option argument is the folder
      if [ -z "$FOLDER" ]; then
        FOLDER="$1"
      else
        echo "❌ Unknown option: $1"
        echo "Usage: $0 [folder] [-x|--exclude file1.html,file2.html] or [folder] [-x|--exclude file1.html file2.html]"
        exit 1
      fi
      ;;
  esac
  shift
done

# Set default folder if not provided
FOLDER="${FOLDER:-.}"

# Validate folder exists
if [ ! -d "$FOLDER" ]; then
  echo "❌ Error: '$FOLDER' is not a valid directory"
  exit 1
fi

EXCLUDED_COUNT=0

# Setup results directory in application folder
ORIGINAL_DIR=$(pwd)
RESULTS_DIR="$ORIGINAL_DIR/$FOLDER/test-results"
mkdir -p "$RESULTS_DIR"
RESULT_FILE="$RESULTS_DIR/readability-results.json"

# Find all HTML pages
discover_html_pages "$FOLDER"

# Filter out excluded pages
if [ -n "$EXCLUDE_LIST" ]; then
  FILTERED_PAGES=""
  for page in $PAGES; do
    # Get basename for comparison
    page_base=$(basename "$page")
    EXCLUDED=0
    for exclude in $EXCLUDE_LIST; do
      exclude_base=$(basename "$exclude")
      # Match against basename or full path (with or without ./ prefix)
      if [ "$page_base" = "$exclude_base" ] || [ "$page" = "./$exclude" ] || [ "$page" = "$exclude" ]; then
        EXCLUDED=1
        EXCLUDED_COUNT=$((EXCLUDED_COUNT + 1))
        break
      fi
    done
    if [ $EXCLUDED -eq 0 ]; then
      FILTERED_PAGES="$FILTERED_PAGES $page"
    fi
  done
  PAGES="$FILTERED_PAGES"
  PAGE_COUNT=$(echo "$PAGES" | wc -w)
fi

# Initialize results
echo '{"pages":[]}' > "$RESULT_FILE"

echo ""
echo "📖 Checking reading age of HTML pages..."
echo ""

# Process each page
TESTED=0
SKIPPED=0
for page in $PAGES; do
  TESTED=$((TESTED + 1))
  echo "[$TESTED/$PAGE_COUNT] Analyzing $page"

  # Analyze readability using Node.js
  node -e "
    const fs = require('fs');
    const cheerio = require('cheerio');
    const rs = require('text-readability').default;

    try {
      // Read and parse HTML
      const html = fs.readFileSync('$page', 'utf8');
      const \$ = cheerio.load(html);

      // Check for meta tag that disables reading age check
      const checkReadingAge = \$('meta[name=\"check-reading-age\"]').attr('content');
      if (checkReadingAge === 'false') {
        console.log('  ⏭️  Skipping (check-reading-age=false)');
        process.exit(0);
      }

      // Extract text content (remove scripts, styles, etc.)
      \$('script, style').remove();
      const text = \$('body').text()
        .replace(/\s+/g, ' ')
        .trim();

      // Need at least 3 sentences to get meaningful readability scores
      const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
      if (!text || text.length < 50 || sentenceCount < 3) {
        console.log('  ⚠️  Not enough text content to analyze (need at least 3 sentences)');
        process.exit(0);
      }

      // Count words for word count
      const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;

      if (sentenceCount === 0 || wordCount === 0) {
        console.log('  ⚠️  Not enough text content to analyze');
        process.exit(0);
      }

      // Calculate readability scores using text-readability package
      const fleschEase = rs.fleschReadingEase(text);
      const fkGrade = rs.fleschKincaidGrade(text);
      const smog = rs.smogIndex(text);
      const coleman = rs.colemanLiauIndex(text);
      const ari = rs.automatedReadabilityIndex(text);
      const gunningFog = rs.gunningFog(text);
      const daleChall = rs.daleChallReadabilityScore(text);

      // Get additional metrics
      const textStandard = rs.textStandard(text, false); // false = return numeric
      const difficultWordCount = rs.difficultWords(text);
      const avgSentenceLength = rs.averageSentenceLength(text);

      // Calculate average grade level (including Gunning Fog)
      const avgGrade = (fkGrade + smog + coleman + ari + gunningFog) / 5;

      // Determine reading level description
      let level = '';
      let age = '';
      if (avgGrade <= 6) {
        level = 'Easy (Elementary)';
        age = '11-12 years';
      } else if (avgGrade <= 8) {
        level = 'Fairly Easy (Middle School)';
        age = '13-14 years';
      } else if (avgGrade <= 10) {
        level = 'Plain English (High School)';
        age = '15-16 years';
      } else if (avgGrade <= 12) {
        level = 'Fairly Difficult (High School)';
        age = '17-18 years';
      } else if (avgGrade <= 16) {
        level = 'Difficult (College)';
        age = '18-22 years';
      } else {
        level = 'Very Difficult (College Graduate)';
        age = '22+ years';
      }

      const result = {
        file: '$page',
        wordCount: wordCount,
        fleschReadingEase: Math.round(fleschEase * 10) / 10,
        fleschKincaidGrade: Math.round(fkGrade * 10) / 10,
        smogIndex: Math.round(smog * 10) / 10,
        colemanLiauIndex: Math.round(coleman * 10) / 10,
        automatedReadabilityIndex: Math.round(ari * 10) / 10,
        gunningFogIndex: Math.round(gunningFog * 10) / 10,
        daleChallScore: Math.round(daleChall * 10) / 10,
        averageGradeLevel: Math.round(avgGrade * 10) / 10,
        textStandard: textStandard,
        difficultWords: difficultWordCount,
        averageSentenceLength: Math.round(avgSentenceLength * 10) / 10,
        readingLevel: level,
        readingAge: age
      };

      // Add to results file
      const resultsFile = '$RESULT_FILE';
      const combined = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
      combined.pages.push(result);
      fs.writeFileSync(resultsFile, JSON.stringify(combined, null, 2));

      console.log('  Grade Level: ' + result.averageGradeLevel + ' (' + result.readingAge + ')');
      console.log('  Reading Level: ' + result.readingLevel);
      console.log('  Text Standard: ' + result.textStandard);
      console.log('  Flesch Reading Ease: ' + result.fleschReadingEase + '/100');
      console.log('  Gunning Fog Index: ' + result.gunningFogIndex);
      console.log('  Word Count: ' + result.wordCount);
      console.log('  Difficult Words: ' + result.difficultWords);
      console.log('  Avg Sentence Length: ' + result.averageSentenceLength + ' words');

    } catch (e) {
      console.error('  Error: ' + e.message);
    }
  "

  echo ""
done

# Display summary
echo "======================================"
echo "📊 Readability Summary"
echo "======================================"
echo "Pages excluded: $EXCLUDED_COUNT"

node -e "
  const fs = require('fs');
  const data = JSON.parse(fs.readFileSync('$RESULT_FILE', 'utf8'));

  if (data.pages.length === 0) {
    console.log('No pages analyzed');
    process.exit(0);
  }

  // Calculate averages
  const avgGrade = data.pages.reduce((sum, p) => sum + p.averageGradeLevel, 0) / data.pages.length;
  const totalWords = data.pages.reduce((sum, p) => sum + p.wordCount, 0);

  console.log('Pages analyzed: ' + data.pages.length);
  console.log('Total words: ' + totalWords);
  console.log('Average Grade Level: ' + Math.round(avgGrade * 10) / 10);
  console.log('');

  // Show pages that are too difficult (grade > 12)
  const difficult = data.pages.filter(p => p.averageGradeLevel > 12);
  if (difficult.length > 0) {
    console.log('⚠️  Pages with college-level reading difficulty:');
    difficult.forEach(p => {
      console.log('  • ' + p.file + ' (Grade ' + p.averageGradeLevel + ')');
    });
  } else {
    console.log('✅ All pages are at high school reading level or below');
  }
"

echo ""
echo "Detailed results saved to: $RESULT_FILE"

# Check if any pages are too difficult
HAS_DIFFICULT=$(node -p "const fs = require('fs'); const data = JSON.parse(fs.readFileSync('$RESULT_FILE', 'utf8')); data.pages.some(p => p.averageGradeLevel > 12) ? 1 : 0")

if [ "$HAS_DIFFICULT" -eq 0 ]; then
  exit 0
else
  echo ""
  echo "❌ Some pages have college-level reading difficulty!"
  exit 1
fi
