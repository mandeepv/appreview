#!/usr/bin/env python3
"""
Extract all lesson content from TypeScript React Native screens into a markdown document.
"""

import os
import re
from pathlib import Path
from collections import defaultdict

def extract_text_content(file_path):
    """Extract text content from a TSX file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    texts = []
    found_texts = set()

    def add_unique(text_type, text):
        """Add text only if not already found."""
        if text:
            # Remove nested Text tags within the content
            text = re.sub(r'<Text[^>]*>', '', text)
            text = text.replace('</Text>', '')

            # Clean React Native formatting
            text = text.replace("{' '}", ' ')
            text = text.replace("{\"\\n\"}", '\n')
            text = text.replace("{'\\n'}", '\n')
            text = re.sub(r"\{['\"]\\n['\"]\}", '\n', text)
            text = re.sub(r"\s+", ' ', text).strip()

            if text and text not in found_texts:
                texts.append((text_type, text))
                found_texts.add(text)

    # Extract label text (e.g., DAY 1 · FOUNDATIONS)
    label_matches = re.findall(r'<Text style={styles\.label}>(.*?)</Text>', content, re.DOTALL)
    for label in label_matches:
        add_unique('LABEL', label.strip())

    # Extract headline/title/header text
    headline_matches = re.findall(r'<Text style={styles\.(?:headline|title|header)}>(.*?)</Text>', content, re.DOTALL)
    for headline in headline_matches:
        add_unique('HEADLINE', headline.strip())

    # Extract subtitle text
    subtitle_matches = re.findall(r'<Text style={styles\.subtitle}>(.*?)</Text>', content, re.DOTALL)
    for subtitle in subtitle_matches:
        add_unique('SUBTITLE', subtitle.strip())

    # Extract body text
    body_matches = re.findall(r'<Text style={styles\.body}>(.*?)</Text>', content, re.DOTALL)
    for body in body_matches:
        add_unique('BODY', body.strip())

    # Extract bullet points
    bullet_matches = re.findall(r'<Text style={styles\.bullet}>(.*?)</Text>', content, re.DOTALL)
    for bullet in bullet_matches:
        add_unique('BULLET', bullet.strip())

    # Extract card content
    card_matches = re.findall(r'<Text style={styles\.cardTitle}>(.*?)</Text>', content, re.DOTALL)
    for card in card_matches:
        add_unique('CARD_TITLE', card.strip())

    card_desc_matches = re.findall(r'<Text style={styles\.cardDescription}>(.*?)</Text>', content, re.DOTALL)
    for desc in card_desc_matches:
        add_unique('CARD_DESC', desc.strip())

    # Extract description text
    desc_matches = re.findall(r'<Text style={styles\.description}>(.*?)</Text>', content, re.DOTALL)
    for desc in desc_matches:
        add_unique('DESCRIPTION', desc.strip())

    # Extract various caption styles
    caption_matches = re.findall(r'<Text style={styles\.(?:caption|note|helper)}>(.*?)</Text>', content, re.DOTALL)
    for caption in caption_matches:
        add_unique('CAPTION', caption.strip())

    # Extract quotes
    quote_matches = re.findall(r'<Text style={styles\.quote}>(.*?)</Text>', content, re.DOTALL)
    for quote in quote_matches:
        add_unique('QUOTE', quote.strip())

    # Extract quiz questions
    question_match = re.search(r'question="([^"]*)"', content)
    if question_match:
        add_unique('QUIZ_QUESTION', question_match.group(1))

    # Extract quiz options with correct answers marked
    options_block = re.search(r'options=\{?\[(.*?)\]\}?', content, re.DOTALL)
    if options_block:
        # Try both single and double quotes
        option_items = re.findall(r"\{\s*label:\s*['\"]([^'\"]*)['\"],\s*isCorrect:\s*(true|false)", options_block.group(1))
        for i, (option, is_correct) in enumerate(option_items, 1):
            marker = " [CORRECT]" if is_correct == "true" else ""
            add_unique('QUIZ_OPTION', f"{chr(96+i)}) {option}{marker}")

    # Extract feedback
    feedback_match = re.search(r'feedback="([^"]*)"', content)
    if feedback_match:
        add_unique('QUIZ_FEEDBACK', feedback_match.group(1))

    # Extract section titles (for sub-lesson headers)
    section_title_matches = re.findall(r'<Text style={styles\.sectionTitle}>(.*?)</Text>', content, re.DOTALL)
    for title in section_title_matches:
        add_unique('SECTION_TITLE', title.strip())

    # Extract any text content in <Text> tags that we might have missed
    all_text_matches = re.findall(r'<Text[^>]*>([^<{]+(?:{[^}]+}[^<{]*)*)</Text>', content, re.DOTALL)
    for text in all_text_matches:
        # Clean up the text
        cleaned = re.sub(r'\s+', ' ', text).strip()
        # Only add if it's substantial and not already captured
        if cleaned and len(cleaned) > 5 and cleaned not in found_texts:
            add_unique('OTHER', cleaned)

    return texts

def get_screen_number(filename):
    """Extract screen number from filename."""
    match = re.search(r'Screen(\d+)', filename)
    if match:
        return int(match.group(1))
    match = re.search(r'QuizQ(\d+)', filename)
    if match:
        return 1000 + int(match.group(1))  # Quiz questions come after screens
    return 0

def get_section_number(filename):
    """Extract section number from filename."""
    match = re.search(r'Sec(\d+)', filename)
    if match:
        return int(match.group(1))
    match = re.search(r'Sub(\d+)', filename)
    if match:
        return int(match.group(1))
    return 0

def format_content(texts):
    """Format extracted texts into readable markdown."""
    output = []
    for text_type, text in texts:
        if text_type == 'LABEL':
            output.append(f"**{text}**\n")
        elif text_type == 'HEADLINE':
            output.append(f"**{text}**\n")
        elif text_type == 'SECTION_TITLE':
            output.append(f"**{text}**\n")
        elif text_type == 'SUBTITLE':
            output.append(f"*{text}*\n")
        elif text_type == 'BODY':
            output.append(f"{text}\n")
        elif text_type == 'BULLET':
            output.append(f"{text}\n")
        elif text_type == 'CARD_TITLE':
            output.append(f"**{text}**\n")
        elif text_type == 'CARD_DESC':
            output.append(f"{text}\n")
        elif text_type == 'DESCRIPTION':
            output.append(f"{text}\n")
        elif text_type == 'CAPTION':
            output.append(f"*{text}*\n")
        elif text_type == 'QUOTE':
            output.append(f"> {text}\n")
        elif text_type == 'QUIZ_QUESTION':
            output.append(f"**Question:** {text}\n")
        elif text_type == 'QUIZ_OPTION':
            output.append(f"{text}\n")
        elif text_type == 'QUIZ_FEEDBACK':
            output.append(f"*Feedback: {text}*\n")
        elif text_type == 'OTHER':
            output.append(f"{text}\n")
    return '\n'.join(output)

def process_lessons():
    """Process all lessons and generate markdown."""
    base_path = Path('/Users/mandeepverma/mamalearn/src/screens')
    markdown_output = ["# Mamalearn - Complete Lesson Content\n"]

    # Lesson 1-4 (direct flows)
    for lesson_num in range(1, 5):
        markdown_output.append(f"# Lesson {lesson_num}\n")

        lessons_path = base_path / 'lessons'
        screen_files = sorted(
            [f for f in lessons_path.glob(f'Lesson{lesson_num}Screen*.tsx')],
            key=lambda x: get_screen_number(x.name)
        )

        for screen_file in screen_files:
            screen_num = get_screen_number(screen_file.name)
            markdown_output.append(f"## Screen {screen_num}\n")
            texts = extract_text_content(screen_file)
            markdown_output.append(format_content(texts))
            markdown_output.append("")

        # Quiz screens
        quiz_files = sorted(
            [f for f in lessons_path.glob(f'Lesson{lesson_num}QuizQ*.tsx')],
            key=lambda x: get_screen_number(x.name)
        )

        if quiz_files:
            markdown_output.append(f"## Quiz\n")
            for quiz_file in quiz_files:
                quiz_num = get_screen_number(quiz_file.name) - 1000
                markdown_output.append(f"### Question {quiz_num}\n")
                texts = extract_text_content(quiz_file)
                markdown_output.append(format_content(texts))
                markdown_output.append("")

        markdown_output.append("---\n")

    # Lesson 5 (has sub-lessons in lessons folder)
    markdown_output.append(f"# Lesson 5: Labeling Emotions\n")
    lessons_path = base_path / 'lessons'

    sections = defaultdict(list)
    for screen_file in lessons_path.glob('Lesson5Sec*.tsx'):
        sec_num = get_section_number(screen_file.name)
        screen_num = get_screen_number(screen_file.name)
        sections[sec_num].append((screen_num, screen_file))

    for sec_num in sorted(sections.keys()):
        markdown_output.append(f"## Sub-lesson {sec_num}\n")
        for screen_num, screen_file in sorted(sections[sec_num]):
            markdown_output.append(f"### Screen {screen_num}\n")
            texts = extract_text_content(screen_file)
            markdown_output.append(format_content(texts))
            markdown_output.append("")

    markdown_output.append("---\n")

    # Lesson 6: Naming Emotions
    markdown_output.append(f"# Lesson 6: Naming Our Emotions\n")
    naming_path = base_path / 'naming-emotions'

    sections = defaultdict(list)
    for screen_file in naming_path.glob('NamingEmotionsSub*.tsx'):
        sec_num = get_section_number(screen_file.name)
        screen_num = get_screen_number(screen_file.name)
        sections[sec_num].append((screen_num, screen_file))

    for sec_num in sorted(sections.keys()):
        markdown_output.append(f"## Sub-lesson {sec_num}\n")
        for screen_num, screen_file in sorted(sections[sec_num]):
            markdown_output.append(f"### Screen {screen_num}\n")
            texts = extract_text_content(screen_file)
            markdown_output.append(format_content(texts))
            markdown_output.append("")

    markdown_output.append("---\n")

    # Lesson 7: Sprinklers
    markdown_output.append(f"# Lesson 7: Sprinklers\n")
    sprinklers_path = base_path / 'sprinklers'

    sections = defaultdict(list)
    for screen_file in sprinklers_path.glob('SprinklersSec*.tsx'):
        sec_num = get_section_number(screen_file.name)
        screen_num = get_screen_number(screen_file.name)
        sections[sec_num].append((screen_num, screen_file))

    for sec_num in sorted(sections.keys()):
        markdown_output.append(f"## Sub-lesson {sec_num}\n")
        for screen_num, screen_file in sorted(sections[sec_num]):
            markdown_output.append(f"### Screen {screen_num}\n")
            texts = extract_text_content(screen_file)
            markdown_output.append(format_content(texts))
            markdown_output.append("")

    markdown_output.append("---\n")

    # Lesson 8: Emotional Sandbags
    markdown_output.append(f"# Lesson 8: Emotional Sandbags\n")
    sandbags_path = base_path / 'emotional-sandbags'

    sections = defaultdict(list)
    for screen_file in sandbags_path.glob('*Sec*.tsx'):
        sec_num = get_section_number(screen_file.name)
        screen_num = get_screen_number(screen_file.name)
        sections[sec_num].append((screen_num, screen_file))

    for sec_num in sorted(sections.keys()):
        markdown_output.append(f"## Sub-lesson {sec_num}\n")
        for screen_num, screen_file in sorted(sections[sec_num]):
            markdown_output.append(f"### Screen {screen_num}\n")
            texts = extract_text_content(screen_file)
            markdown_output.append(format_content(texts))
            markdown_output.append("")

    markdown_output.append("---\n")

    # Lesson 9: Communication Mistakes
    markdown_output.append(f"# Lesson 9: Communication Mistakes\n")
    comm_path = base_path / 'communicationMistakes'

    sections = defaultdict(list)
    for screen_file in comm_path.glob('CommunicationMistakesSec*.tsx'):
        sec_num = get_section_number(screen_file.name)
        screen_num = get_screen_number(screen_file.name)
        sections[sec_num].append((screen_num, screen_file))

    for sec_num in sorted(sections.keys()):
        markdown_output.append(f"## Sub-lesson {sec_num}\n")
        for screen_num, screen_file in sorted(sections[sec_num]):
            markdown_output.append(f"### Screen {screen_num}\n")
            texts = extract_text_content(screen_file)
            markdown_output.append(format_content(texts))
            markdown_output.append("")

    markdown_output.append("---\n")

    # Lesson 10: Helping Someone Process Emotions
    markdown_output.append(f"# Lesson 10: Helping Someone Process Emotions\n")
    helping_path = base_path / 'helpingProcessEmotions'

    sections = defaultdict(list)
    for screen_file in helping_path.glob('HelpingProcessEmotionsSec*.tsx'):
        sec_num = get_section_number(screen_file.name)
        screen_num = get_screen_number(screen_file.name)
        sections[sec_num].append((screen_num, screen_file))

    for sec_num in sorted(sections.keys()):
        markdown_output.append(f"## Sub-lesson {sec_num}\n")
        for screen_num, screen_file in sorted(sections[sec_num]):
            markdown_output.append(f"### Screen {screen_num}\n")
            texts = extract_text_content(screen_file)
            markdown_output.append(format_content(texts))
            markdown_output.append("")

    markdown_output.append("---\n")

    # Lesson 11: Dissociation
    markdown_output.append(f"# Lesson 11: Dissociation\n")
    dissoc_path = base_path / 'dissociation'

    sections = defaultdict(list)
    for screen_file in dissoc_path.glob('DissociationSec*.tsx'):
        sec_num = get_section_number(screen_file.name)
        screen_num = get_screen_number(screen_file.name)
        sections[sec_num].append((screen_num, screen_file))

    for sec_num in sorted(sections.keys()):
        markdown_output.append(f"## Sub-lesson {sec_num}\n")
        for screen_num, screen_file in sorted(sections[sec_num]):
            markdown_output.append(f"### Screen {screen_num}\n")
            texts = extract_text_content(screen_file)
            markdown_output.append(format_content(texts))
            markdown_output.append("")

    markdown_output.append("---\n")

    # Lesson 12: Serve and Return
    markdown_output.append(f"# Lesson 12: Serve and Return\n")
    serve_path = base_path / 'serveReturn'

    sections = defaultdict(list)
    for screen_file in serve_path.glob('ServeReturnSec*.tsx'):
        sec_num = get_section_number(screen_file.name)
        screen_num = get_screen_number(screen_file.name)
        sections[sec_num].append((screen_num, screen_file))

    for sec_num in sorted(sections.keys()):
        markdown_output.append(f"## Sub-lesson {sec_num}\n")
        for screen_num, screen_file in sorted(sections[sec_num]):
            markdown_output.append(f"### Screen {screen_num}\n")
            texts = extract_text_content(screen_file)
            markdown_output.append(format_content(texts))
            markdown_output.append("")

    markdown_output.append("---\n")

    # Lesson 13: Recording Deep Bond Moments
    markdown_output.append(f"# Lesson 13: Recording Deep Bond Moments\n")
    recording_path = base_path / 'recordingDeepBondMoments'

    sections = defaultdict(list)
    for screen_file in recording_path.glob('RecordingDeepBondMomentsSec*.tsx'):
        sec_num = get_section_number(screen_file.name)
        screen_num = get_screen_number(screen_file.name)
        sections[sec_num].append((screen_num, screen_file))

    for sec_num in sorted(sections.keys()):
        markdown_output.append(f"## Sub-lesson {sec_num}\n")
        for screen_num, screen_file in sorted(sections[sec_num]):
            markdown_output.append(f"### Screen {screen_num}\n")
            texts = extract_text_content(screen_file)
            markdown_output.append(format_content(texts))
            markdown_output.append("")

    return '\n'.join(markdown_output)

if __name__ == '__main__':
    markdown = process_lessons()
    output_file = '/Users/mandeepverma/mamalearn/lessons_content.md'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(markdown)
    print(f"Markdown content written to: {output_file}")
    print(f"Total length: {len(markdown)} characters")
