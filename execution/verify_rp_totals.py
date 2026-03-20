import pandas as pd
import os

file_path = os.path.expanduser('~/Downloads/GL_paypal_raw_2601.csv')

def force_numeric(s):
    # Ensure it's a string, remove commas, then convert
    return pd.to_numeric(s.astype(str).str.replace(',', ''), errors='coerce').fillna(0)

try:
    print(f"Verifying Received Payments for USD...")
    
    total_rp = {
        'USD': 0.0,
        'JPY': 0.0,
        'MXN': 0.0
    }
    
    for chunk in pd.read_csv(file_path, encoding='utf-8-sig', low_memory=False, chunksize=300000):
        chunk['총액_val'] = force_numeric(chunk['총액'])
        
        # Types: 익스프레스 체크아웃 결제, 사전 승인 결제 청구서 사용자 결제
        # Status: 완료됨
        
        mask = (chunk['상태'] == '완료됨') & \
               (chunk['유형'].isin(['익스프레스 체크아웃 결제', '사전 승인 결제 청구서 사용자 결제']))
        
        rp_chunk = chunk[mask]
        
        for curr in total_rp.keys():
            total_rp[curr] += rp_chunk[rp_chunk['통화'] == curr]['총액_val'].sum()
    
    print("\n[Calculated Received Payments]")
    for curr, val in total_rp.items():
        print(f"{curr}: {val:,.2f}")
        
    print("\n[PDF Target]")
    print("USD: 17,733,244.92")
    print("JPY: 406,312,841.00")
    print("MXN: 81,080,632.75")

except Exception as e:
    import traceback
    print(f"Error: {e}")
    traceback.print_exc()
