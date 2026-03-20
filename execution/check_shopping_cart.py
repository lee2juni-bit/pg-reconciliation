import pandas as pd
import os

file_path = os.path.expanduser('~/Downloads/GL_paypal_raw_2601.csv')

try:
    print(f"Checking '쇼핑 카트 상품' and '잔액 영향'...")
    
    for chunk in pd.read_csv(file_path, encoding='utf-8-sig', low_memory=False, chunksize=300000):
        # Jan 2026
        chunk = chunk[chunk['날짜'].str.startswith('2026.01.', na=False)]
        
        mask = (chunk['유형'] == '쇼핑 카트 상품') & (chunk['잔액 영향'] == '입금')
        hit = chunk[mask]
        if not hit.empty:
            print(f"Found {len(hit)} rows of '쇼핑 카트 상품' with '입금' influence!")
            print(hit[['날짜', '이름', '통화', '총액', '수수료', '거래 ID', '거래 이벤트 코드']].head(5))

except Exception as e:
    print(f"Error: {e}")
