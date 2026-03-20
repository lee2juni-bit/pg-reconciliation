import openpyxl
import os

files = [
    "/Users/lee2juni/Desktop/data/(GL)결제취소원장_상품 - 2026_01.xlsx",
    "/Users/lee2juni/Desktop/data/(GL)결제취소원장_주문서 - 2026_01.xlsx"
]

for file_path in files:
    if os.path.exists(file_path):
        print(f"Checking: {os.path.basename(file_path)}")
        try:
            wb = openpyxl.load_workbook(file_path, read_only=True)
            sheet = wb.active
            headers = [cell.value for cell in next(sheet.iter_rows(max_row=1))]
            print(f"Headers: {headers}")
            wb.close()
        except Exception as e:
            print(f"Error checking {file_path}: {e}")
    else:
        print(f"File not found: {file_path}")
