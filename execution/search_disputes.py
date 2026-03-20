import pandas as pd
import os

file_path = os.path.expanduser('~/Downloads/GL_paypal_raw_2601.csv')

try:
    print("Searching for '지불거절' in '유형' for Jan 2026...")
    for chunk in pd.read_csv(file_path, encoding='utf-8-sig', low_memory=False, chunksize=300000, index_col=False):
        chunk = chunk[chunk['날짜'].str.startswith('2026.01.', na=False)]
        if chunk.empty: continue
        
        mask = chunk['유형'].str.contains('지불거절', na=False)
        found = chunk[mask]
        
        if not found.empty:
            print("Found via '유형':")
            print(found[['날짜', '유형', '거래 이벤트 코드', '통화', '총액']].head(5).to_markdown())
            break
            
    print("Searching for any 'T11' or 'T12' codes in Jan 2026...")
    for chunk in pd.read_csv(file_path, encoding='utf-8-sig', low_memory=False, chunksize=300000, index_col=False):
        chunk = chunk[chunk['날짜'].str.startswith('2026.01.', na=False)]
        if chunk.empty: continue
        
        mask = chunk['거래 이벤트 코드'].astype(str).str.startswith(('T11', 'T12'))
        # Exclude refunds T1107 which we know exists
        mask = mask & (chunk['거래 이벤트 코드'] != 'T1107')
        
        found = chunk[mask]
        if not found.empty:
            print("Found via Code (excluding T1107):")
            print(found[['날짜', '유형', '거래 이벤트 코드', '통화', '총액']].head(5).to_markdown())
            break

except Exception as e:
    print(f"Error: {e}")
