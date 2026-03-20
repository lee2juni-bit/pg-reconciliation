import pandas as pd
import os

file_path = os.path.expanduser('~/Downloads/GL_paypal_raw_2601.csv')

try:
    print(f"Analyzing Transaction Event Codes...")
    codes = {}
    
    for chunk in pd.read_csv(file_path, encoding='utf-8-sig', low_memory=False, chunksize=300000, usecols=['거래 이벤트 코드', '유형', '통화', '총액', '상태']):
        chunk['총액_val'] = pd.to_numeric(chunk['총액'].astype(str).str.replace(',', ''), errors='coerce').fillna(0)
        
        # Aggregate by code, type, status, and currency
        agg = chunk.groupby(['거래 이벤트 코드', '유형', '상태', '통화'])['총액_val'].agg(['sum', 'count']).reset_index()
        
        for index, row in agg.iterrows():
            key = (row['거래 이벤트 코드'], row['유형'], row['상태'], row['통화'])
            if key not in codes:
                codes[key] = {'sum': 0.0, 'count': 0}
            codes[key]['sum'] += row['sum']
            codes[key]['count'] += row['count']

    # Sort and print
    results = []
    for key, val in codes.items():
        results.append({
            'Code': key[0],
            'Type': key[1],
            'Status': key[2],
            'Currency': key[3],
            'Total': val['sum'],
            'Count': val['count']
        })
    
    res_df = pd.DataFrame(results)
    print(res_df.sort_values(['Code', 'Currency']).to_markdown(index=False))

except Exception as e:
    print(f"Error: {e}")
