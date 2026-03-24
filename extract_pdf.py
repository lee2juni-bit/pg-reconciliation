from pypdf import PdfReader
import os

pdf_path = os.path.expanduser("~/Downloads/settlement-Weverse 거래처 관리 기능 개선 기획서-230326-022221.pdf")
reader = PdfReader(pdf_path)
text = ""
for page in reader.pages:
    text += page.extract_text() + "\n"

print(text)
