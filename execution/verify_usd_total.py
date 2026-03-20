import pandas as pd
import os

file_path = os.path.expanduser('~/Downloads/GL_paypal_raw_2601.csv')

def clean_currency(col):
    if col.dtype == object:
        return pd.to_numeric(col.str.replace(',', ''), errors='coerce').fillna(0)
    return col

try:
    print(f"Verifying Received Payments for USD...")
    
    total_usd_rp = 0
    
    # PDF Target for USD Received Payments: 17,733,244.92
    
    for chunk in pd.read_csv(file_path, encoding='utf-8-sig', low_memory=False, chunksize=200000):
        chunk['총액'] = clean_currency(chunk['총액'])
        
        # Filter for Status: 완료됨
        # Filter for Types: 익스프레스 체크아웃 결제, 사전 승인 결제 청구서 사용자 결제
        # Exclude: 쇼핑 카트 상품 (as they are usually duplicates/breakdown)
        
        rp_chunk = chunk[
            (chunk['상태'] == '완료됨') & 
            (chunk['통화'] == 'USD') &
            (chunk['유형'].isin(['익스프레스 체크아웃 결제', '사전 승인 결제 청구서 사용자 결제']))
        ]
        
        total_usd_rp += rp_chunk['총액'].sum()
    
    print(f"\nCalculated USD Received Payments: {total_usd_rp:,.2f}")
    print(f"PDF Target USD Received Payments: 17,733,244.92")
    print(f"Difference: {total_usd_rp - 17733244.92:,.2f}")

except Exception as e:
    import traceback
    print(f"Error: {e}")
    traceback.print_exc()
