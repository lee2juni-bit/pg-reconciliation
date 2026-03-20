import pandas as pd
import os

file_path = os.path.expanduser('~/Downloads/GL_paypal_raw_2601.csv')

try:
    print("Checking dates for dispute codes...")
    
    target_codes = ['T1201', 'T1106', 'T1110', 'T1111']
    
    for chunk in pd.read_csv(file_path, encoding='utf-8-sig', low_memory=False, chunksize=300000, index_col=False):
        
        chunk['거래 이벤트 코드'] = chunk['거래 이벤트 코드'].astype(str).str.strip()
        mask = chunk['거래 이벤트 코드'].isin(target_codes)
        found = chunk[mask]
        
        if not found.empty:
            print("Found codes. Dates:")
            print(found[['날짜', '거래 이벤트 코드', '통화', '총액']].head(10).to_markdown())

except Exception as e:
    print(f"Error: {e}")
