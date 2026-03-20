import pandas as pd
import os

file_path = os.path.expanduser('~/Downloads/GL_paypal_raw_2601.csv')

try:
    print("Checking dispute codes in Jan 2026...")
    total_found = 0
    target_codes = ['T1201', 'T1106', 'T1110', 'T1111']
    
    for chunk in pd.read_csv(file_path, encoding='utf-8-sig', low_memory=False, chunksize=300000, index_col=False):
        # Filter Jan
        chunk = chunk[chunk['날짜'].str.startswith('2026.01.', na=False)]
        if chunk.empty: continue
        
        # Check codes
        mask = chunk['거래 이벤트 코드'].isin(target_codes)
        found = chunk[mask]
        
        if not found.empty:
            total_found += len(found)
            print(found[['날짜', '거래 이벤트 코드', '통화', '총액']].head(5).to_markdown())
            
    print(f"Total dispute rows found: {total_found}")

except Exception as e:
    print(f"Error: {e}")
