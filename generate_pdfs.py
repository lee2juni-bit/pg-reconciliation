import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import re

# Register Korean Font
FONT_PATH = "/System/Library/Fonts/Supplemental/AppleGothic.ttf"
pdfmetrics.registerFont(TTFont('AppleGothic', FONT_PATH))

def markdown_to_pdf(input_md_path, output_pdf_path, title):
    doc = SimpleDocTemplate(output_pdf_path, pagesize=letter)
    styles = getSampleStyleSheet()
    
    # Custom Korean Styles
    ko_title_style = ParagraphStyle(
        'KoTitle',
        parent=styles['Title'],
        fontName='AppleGothic',
        fontSize=24,
        spaceAfter=20
    )
    ko_normal_style = ParagraphStyle(
        'KoNormal',
        parent=styles['Normal'],
        fontName='AppleGothic',
        fontSize=10,
        leading=14,
        spaceAfter=10
    )
    ko_heading_style = ParagraphStyle(
        'KoHeading',
        parent=styles['Heading2'],
        fontName='AppleGothic',
        fontSize=14,
        spaceAfter=10,
        spaceBefore=20
    )

    story = []
    story.append(Paragraph(title, ko_title_style))
    story.append(Spacer(1, 12))

    if os.path.exists(input_md_path):
        with open(input_md_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            for line in lines:
                line = line.strip()
                if not line:
                    story.append(Spacer(1, 12))
                    continue
                
                # Simple MD parsing
                if line.startswith('# '):
                    story.append(Paragraph(line[2:], ko_title_style))
                elif line.startswith('## '):
                    story.append(Paragraph(line[3:], ko_heading_style))
                elif line.startswith('### '):
                    story.append(Paragraph(line[4:], ko_heading_style))
                elif line.startswith('- ') or line.startswith('* '):
                    story.append(Paragraph(f"• {line[2:]}", ko_normal_style))
                else:
                    # Remove some MD syntax
                    clean_line = re.sub(r'[*_`]', '', line)
                    story.append(Paragraph(clean_line, ko_normal_style))
    
    doc.build(story)

def image_to_pdf(image_path, output_pdf_path, title):
    doc = SimpleDocTemplate(output_pdf_path, pagesize=letter)
    styles = getSampleStyleSheet()
    
    ko_title_style = ParagraphStyle(
        'KoTitle',
        parent=styles['Title'],
        fontName='AppleGothic',
        fontSize=24,
        spaceAfter=20
    )

    story = []
    story.append(Paragraph(title, ko_title_style))
    story.append(Spacer(1, 12))

    if os.path.exists(image_path):
        img = Image(image_path, width=500, height=350)
        story.append(img)
    
    doc.build(story)

# Files to process
BASE_DIR = "/Users/lee2juni/.gemini/antigravity/brain/897490ce-be3f-4b49-a5d0-2bea8b289bff"
DOWNLOADS = "/Users/lee2juni/Downloads"
IMAGE_PATH = "/Users/lee2juni/Desktop/Antigravity/reconciliation_execution_screenshot.png"
SKILL_PATH = "/Users/lee2juni/Desktop/Antigravity/.agent/skills/pg-reconciliation/SKILL.md"

files = [
    (os.path.join(BASE_DIR, "Internal_Sharing_Doc.md"), os.path.join(DOWNLOADS, "PG_Reconciliation_Sharing_Doc.pdf"), "시스템 도입 및 작동 원리 안내"),
    (SKILL_PATH, os.path.join(DOWNLOADS, "PG_Reconciliation_Skill_Spec.pdf"), "PG 정산 대사 스킬 명세서"),
    (os.path.join(BASE_DIR, "walkthrough.md"), os.path.join(DOWNLOADS, "PG_Reconciliation_Walkthrough.pdf"), "프로젝트 실행 결과 워크스루"),
]

for md, pdf, title in files:
    print(f"Generating {pdf}...")
    markdown_to_pdf(md, pdf, title)

print(f"Generating Execution Screenshot PDF...")
image_to_pdf(IMAGE_PATH, os.path.join(DOWNLOADS, "PG_Reconciliation_Execution_Capture.pdf"), "시스템 실제 실행 화면 캡쳐")

print("All PDFs generated successfully in Downloads folder.")
