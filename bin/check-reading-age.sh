#!/bin/bash

# This script checks the reading age/readability of HTML pages
# Uses Flesch Reading Ease and Flesch-Kincaid Grade Level

# Source common helper functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

# Install dependencies
echo "Installing dependencies..."
npm install syllable cheerio > /dev/null 2>&1

# Setup results directory
setup_results_dir
RESULT_FILE="$RESULTS_DIR/readability-results.json"

# Find all HTML pages
discover_html_pages

# Initialize results
echo '{"pages":[]}' > "$RESULT_FILE"

echo ""
echo "📖 Checking reading age of HTML pages..."
echo ""

# Process each page
TESTED=0
for page in $PAGES; do
  TESTED=$((TESTED + 1))
  echo "[$TESTED/$PAGE_COUNT] Analyzing $page"
  
  # Analyze readability using Node.js
  node -e "
    const fs = require('fs');
    const cheerio = require('cheerio');
    const { syllable } = require('syllable');
    
    try {
      // Read and parse HTML
      const html = fs.readFileSync('$page', 'utf8');
      const \$ = cheerio.load(html);
      
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
      
      // Count sentences, words, and syllables
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
      const words = text.split(/\s+/).filter(w => w.length > 0);
      const wordCount = words.length;
      const syllableCount = words.reduce((sum, word) => sum + syllable(word), 0);
      
      if (sentences === 0 || wordCount === 0) {
        console.log('  ⚠️  Not enough text content to analyze');
        process.exit(0);
      }
      
      // Calculate readability scores
      const wordsPerSentence = wordCount / sentences;
      const syllablesPerWord = syllableCount / wordCount;
      
      // Flesch Reading Ease: 206.835 - 1.015 × (words/sentences) - 84.6 × (syllables/words)
      const fleschEase = 206.835 - (1.015 * wordsPerSentence) - (84.6 * syllablesPerWord);
      
      // Flesch-Kincaid Grade Level: 0.39 × (words/sentences) + 11.8 × (syllables/words) - 15.59
      const fkGrade = (0.39 * wordsPerSentence) + (11.8 * syllablesPerWord) - 15.59;
      
      // SMOG Index (simplified): 1.0430 × sqrt(polysyllables × 30/sentences) + 3.1291
      const polysyllables = words.filter(w => syllable(w) >= 3).length;
      const smog = 1.043 * Math.sqrt(polysyllables * (30 / sentences)) + 3.1291;
      
      // Coleman-Liau Index: 0.0588 × L - 0.296 × S - 15.8
      // L = average letters per 100 words, S = average sentences per 100 words
      const letters = words.join('').replace(/[^a-zA-Z]/g, '').length;
      const L = (letters / wordCount) * 100;
      const S = (sentences / wordCount) * 100;
      const coleman = (0.0588 * L) - (0.296 * S) - 15.8;
      
      // Automated Readability Index: 4.71 × (letters/words) + 0.5 × (words/sentences) - 21.43
      const ari = (4.71 * (letters / wordCount)) + (0.5 * wordsPerSentence) - 21.43;
      
      // Calculate average grade level
      const avgGrade = (fkGrade + smog + coleman + ari) / 4;
      
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
        wordCount: text.split(/\s+/).length,
        fleschReadingEase: Math.round(fleschEase * 10) / 10,
        fleschKincaidGrade: Math.round(fkGrade * 10) / 10,
        smogIndex: Math.round(smog * 10) / 10,
        colemanLiauIndex: Math.round(coleman * 10) / 10,
        automatedReadabilityIndex: Math.round(ari * 10) / 10,
        averageGradeLevel: Math.round(avgGrade * 10) / 10,
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
      console.log('  Flesch Reading Ease: ' + result.fleschReadingEase + '/100');
      console.log('  Word Count: ' + result.wordCount);
      
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
exit 0
