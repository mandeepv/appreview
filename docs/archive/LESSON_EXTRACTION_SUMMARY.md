> **SNAPSHOT — frozen as of 2026-07-10. Do not follow as current process; see docs/README.md for the live docs.**

# Mamalearn Lesson Content Extraction - Summary

## Overview
Successfully extracted and compiled all lesson content from 13 lessons across the Mamalearn application into a comprehensive markdown document.

## Output File
**Location:** `/Users/mandeepverma/mamalearn/docs/archive/lessons_content.md`

## Statistics
- **Total Lines:** 4,542
- **Total Characters:** 85,556
- **Total Lessons:** 13
- **Top-level Headings:** 14 (including title)
- **Second-level Headings:** 92 (screens, sub-lessons, and quizzes)

## Lesson Structure

### Lessons 1-4 (Direct Flows)
- **Lesson 1:** What Changed in How We Understand Parenting (11 screens + 3 quiz questions)
- **Lesson 2:** Happiness Chemicals (12 screens + 3 quiz questions)
- **Lesson 3:** The Long-Term Unhappiness Chemical (12 screens + 6 quiz questions)
- **Lesson 4:** The Long-Term Happiness Chemical (11 screens + 6 quiz questions)

### Lessons 5-13 (Sub-lesson Based)
- **Lesson 5:** Labeling Emotions (4 sub-lessons with multiple screens)
  - Location: `/Users/mandeepverma/mamalearn/src/screens/lessons/`
  
- **Lesson 6:** Naming Our Emotions (4 sub-lessons)
  - Location: `/Users/mandeepverma/mamalearn/src/screens/naming-emotions/`
  
- **Lesson 7:** Sprinklers (5 sub-lessons)
  - Location: `/Users/mandeepverma/mamalearn/src/screens/sprinklers/`
  
- **Lesson 8:** Emotional Sandbags (6 sub-lessons)
  - Location: `/Users/mandeepverma/mamalearn/src/screens/emotional-sandbags/`
  
- **Lesson 9:** Communication Mistakes (10 sub-lessons)
  - Location: `/Users/mandeepverma/mamalearn/src/screens/communicationMistakes/`
  
- **Lesson 10:** Helping Someone Process Emotions (2 sub-lessons)
  - Location: `/Users/mandeepverma/mamalearn/src/screens/helpingProcessEmotions/`
  
- **Lesson 11:** Dissociation (4 sub-lessons)
  - Location: `/Users/mandeepverma/mamalearn/src/screens/dissociation/`
  
- **Lesson 12:** Serve and Return (6 sub-lessons)
  - Location: `/Users/mandeepverma/mamalearn/src/screens/serveReturn/`
  
- **Lesson 13:** Recording Deep Bond Moments (1 sub-lesson)
  - Location: `/Users/mandeepverma/mamalearn/src/screens/recordingDeepBondMoments/`

## Content Extracted

### Text Elements Captured
- **Labels:** Day markers and section indicators (e.g., "DAY 1 · FOUNDATIONS")
- **Headlines/Titles:** Main screen titles and headers
- **Body Text:** All paragraph content
- **Bullet Points:** Lists and key points
- **Quotes:** Inspirational and research quotes
- **Subtitles:** Section subtitles and emphasis text
- **Card Content:** Titles and descriptions
- **Quiz Elements:**
  - Questions
  - Multiple choice options (with correct answers marked)
  - Feedback text

### Formatting
- **Bold text** for headlines, labels, and key concepts
- *Italic text* for subtitles, captions, and feedback
- > Blockquotes for quoted material
- Bullet points preserved as-is
- Quiz options formatted as a), b), c), d) with [CORRECT] markers

## Extraction Features

### Text Cleaning
- Removed React Native formatting markers (`{'\n'}`, `{' '}`)
- Cleaned nested Text component syntax
- Normalized whitespace
- Removed duplicate content

### Content Organization
- Hierarchical structure with proper markdown headings
- Screen numbers clearly indicated
- Sub-lessons properly grouped
- Quiz questions separated and numbered
- Horizontal rules between major lessons

## Key Themes Covered

1. **Foundations (Lessons 1-4)**
   - Evolution of parenting science
   - Happiness chemicals (dopamine, cortisol, oxytocin)
   - Brain development and emotional regulation

2. **Emotional Skills (Lessons 5-6)**
   - Labeling and naming emotions
   - Understanding surface vs. deeper emotions

3. **Advanced Concepts (Lessons 7-13)**
   - Building deep bonds (Sprinklers)
   - Emotional regulation (Sandbags)
   - Communication patterns
   - Processing emotions
   - Dissociation awareness
   - Serve and return interactions
   - Recording meaningful moments

## Technical Details

### Extraction Method
- Python script: `/Users/mandeepverma/mamalearn/scripts/extract_lessons.py`
- Regex-based text extraction from TypeScript React Native files
- Pattern matching for various text styles and components
- Automatic deduplication of content

### Files Processed
- **Lesson files:** 93 files
- **Sprinklers files:** 51 files
- **Communication Mistakes files:** 38 files
- **Dissociation files:** 25 files
- **Serve Return files:** 22 files
- **Naming Emotions files:** 24 files
- **Emotional Sandbags files:** 47 files
- **Helping Process Emotions files:** 11 files
- **Recording Deep Bond Moments files:** 6 files

**Total files processed:** ~317 screen files

## Usage

The extracted content can be used for:
- Content review and editing
- Curriculum documentation
- Content translation preparation
- Quality assurance
- Educational material development
- Marketing and content preview

## Notes

- All content is preserved in reading order
- Quiz correct answers are clearly marked for reference
- Some minor formatting variations may exist due to different component structures
- Interactive elements (buttons, inputs) are not included, only static text content

---

Generated: January 7, 2026
