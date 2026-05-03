#!/bin/zsh
# This script captures screenshots of the website for documentation and testing purposes.

THEMES=("light" "dark")
STYLES=("normal" "subdued" "vibrant")
EXPANDED=("false" "true")
VIEWPORTS=("199" "401" "901" "2001")

# Random choices for student form (with selectors for form filling)
AVATAR_SELECTORS=("#avatar-choice-wizard" "#avatar-choice-witch")
GENDER_SELECTORS=("#gender-choice-male" "#gender-choice-female")
AGE_SELECTORS=("#age-choice-young" "#age-choice-old")

# Random choices for student data (values for mocking)
AVATAR_VALUES=("wizard" "witch")
GENDER_VALUES=("male" "female")
AGE_VALUES=("young" "old")

for THEME in "${THEMES[@]}"; do
    for STYLE in "${STYLES[@]}"; do
        for VIEWPORT in "${VIEWPORTS[@]}"; do
            for EXP in "${EXPANDED[@]}"; do
                # Pick random form choices for student page
                RANDOM_INDEX=$((RANDOM % 2))
                AVATAR_SEL=${AVATAR_SELECTORS[$((RANDOM_INDEX + 1))]}
                AVATAR_VAL=${AVATAR_VALUES[$((RANDOM_INDEX + 1))]}
                
                RANDOM_INDEX=$((RANDOM % 2))
                GENDER_SEL=${GENDER_SELECTORS[$((RANDOM_INDEX + 1))]}
                GENDER_VAL=${GENDER_VALUES[$((RANDOM_INDEX + 1))]}
                
                RANDOM_INDEX=$((RANDOM % 2))
                AGE_SEL=${AGE_SELECTORS[$((RANDOM_INDEX + 1))]}
                AGE_VAL=${AGE_VALUES[$((RANDOM_INDEX + 1))]}
                
                # capture the home page with the specified theme, style, viewport size, and expanded state
                # animation=off shows static portraits immediately (no fade animation), wait 2 seconds for page load
                node bin/capture-webpage.js "http://localhost:8080?theme=${THEME}&style=${STYLE}&expand-header=${EXP}&expand-footer=${EXP}&animation=off" "homepage-${VIEWPORT}-${THEME}-${STYLE}-${${EXP/true/expanded}/false/minimal}" --width ${VIEWPORT} --wait 2000

                # capture student dashboard with the specified theme, style, and viewport size, with filled form
                node bin/capture-webpage.js "http://localhost:8080/pages/students?theme=${THEME}&style=${STYLE}&expand-header=${EXP}&expand-footer=${EXP}" "students-${VIEWPORT}-${THEME}-${STYLE}-${${EXP/true/expanded}/false/minimal}" --width ${VIEWPORT} --fill-text "#student-name" "Edmund" --check "${AVATAR_SEL}" --check "${GENDER_SEL}" --check "${AGE_SEL}" --click "#save-information-btn" --wait-for "#avatar-preview" --wait-for-content --wait-timeout 10000

                # capture lesson 1 page with the specified theme, style, and viewport size, with mocked student data
                # iterate through all 7 sections (0-6) capturing each one
                node bin/capture-webpage.js "http://localhost:8080/students/lesson-01?theme=${THEME}&style=${STYLE}&expand-header=${EXP}&expand-footer=${EXP}" "lesson-01-${VIEWPORT}-${THEME}-${STYLE}-${${EXP/true/expanded}/false/minimal}" --width ${VIEWPORT} --mock-student-data "Edmund" "${AVATAR_VAL}" "${GENDER_VAL}" "${AGE_VAL}" --iterate-sections 7 --wait-for-content --wait-timeout 10000
            done
        done
    done
done