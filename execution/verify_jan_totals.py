import pandas as pd
import os

file_path = os.path.expanduser('~/Downloads/GL_paypal_raw_2601.csv')

def force_numeric(s):
    return pd.to_numeric(s.astype(str).str.replace(',', ''), errors='coerce').fillna(0)

try:
    print(f"Verifying Received Payments for Jan 2026...")
    
    total_rp = {
        'USD': {'item1': 0.0, 'item2': 0.0},
        'JPY': {'item1': 0.0, 'item2': 0.0},
        'MXN': {'item1': 0.0, 'item2': 0.0}
    }
    
    for chunk in pd.read_csv(file_path, encoding='utf-8-sig', low_memory=False, chunksize=300000):
        # Filter dates: 2026.01.01 to 2026.01.31
        chunk_jan = chunk[chunk['날짜'].str.startswith('2026.01.', na=False)]
        
        chunk_jan['총액_val'] = force_numeric(chunk_jan['총액'])
        
        # Mapping
        # item1: '사전 승인 결제 청구서 사용자 결제' (matches PDF '결제 청구서 사용자 결제')
        # item2: '익스프레스 체크아웃 결제'
        
        mask1 = (chunk_jan['상태'] == '완료됨') & (chunk_jan['유형'] == '사전 승인 결제 청구서 사용자 결제')
        mask2 = (chunk_jan['상태'] == '완료됨') & (chunk_jan['유형'] == '익스프레스 체크아웃 결제')
        
        c1 = chunk_jan[mask1]
        c2 = chunk_jan[mask2]
        
        for curr in total_rp.keys():
            total_rp[curr]['item1'] += c1[c1['통화'] == curr]['총액_val'].sum()
            total_rp[curr]['item2'] += c2[c2['통화'] == curr]['총액_val'].sum()
    
    print("\n[Calculated Received Payments (Jan 2026)]")
    for curr, items in total_rp.items():
        t1 = items['item1']
        t2 = items['item2']
        print(f"{curr}: {t1:,.2f} + {t2:,.2f} = {t1+t2:,.2f}")
        
    print("\n[PDF Target]")
    print("USD: 4,545,952.68 + 13,187,292.24 = 17,733,244.92")
    print("JPY: 236,273,931 + 170,038,910 = 406,312,841")
    print("MXN: 10,158,505.52 + 70,922,127.23 = 81,080,632.75")

except Exception as e:
    import traceback
    print(f"Error: {e}")
    traceback.print_exc()
