import pandas as pd
import os

file_path = os.path.expanduser('~/Downloads/GL_paypal_raw_2601.csv')

def force_numeric(s):
    return pd.to_numeric(s.astype(str).str.replace(',', ''), errors='coerce').fillna(0)

def format_curr(val):
    if abs(val) < 0.001: return "0.00"
    return "{:,.2f}".format(val)

try:
    print(f"Summarizing {file_path} for January 2026...")
    
    summary_list = []
    
    # Reverting to standard read with index_col=False which worked best, despite warnings.
    # The warnings are about index_col=False with extra data, but pandas usually handles it by shifting.
    # We will be very careful with column access.
    
    for chunk in pd.read_csv(file_path, encoding='utf-8-sig', low_memory=False, chunksize=300000, index_col=False):
        
        # 1. Date Filter
        mask_jan = chunk['날짜'].astype(str).str.startswith('2026.01.', na=False)
        chunk = chunk[mask_jan].copy()
        
        if chunk.empty:
            continue
        
        # 2. Numeric Conversion
        chunk['Gross'] = force_numeric(chunk['총액'])
        chunk['Fee'] = force_numeric(chunk['수수료'])
        
        # 3. String normalization
        u = chunk['유형'].astype(str).str.strip()
        code = chunk['거래 이벤트 코드'].astype(str).str.strip()
        status = chunk['상태'].astype(str).str.strip()
        
        # Initialize Categories
        chunk['Category'] = '기타'
        chunk['Description'] = u
        
        # 1. Received Payments
        m1 = (status == '완료됨') & (u == '사전 승인 결제 청구서 사용자 결제')
        m2 = (status == '완료됨') & (u == '익스프레스 체크아웃 결제')
        chunk.loc[m1, ['Category', 'Description']] = ['1. 받은 결제대금', '결제 청구서 사용자 결제']
        chunk.loc[m2, ['Category', 'Description']] = ['1. 받은 결제대금', '익스프레스 체크아웃 결제']
        
        # 2. Withdrawals & Credits
        m3 = (status == '완료됨') & (u == '결제 환불')
        m4 = (status == '완료됨') & (u.isin(['일반 인출', '사용자 개시 인출']))
        chunk.loc[m3, ['Category', 'Description']] = ['2. 인출 및 출금', '결제 환불']
        chunk.loc[m4, ['Category', 'Description']] = ['2. 인출 및 출금', '인출 이체']
        
        # 4. Disputes
        # Codes: T1201, T1106, T1110, T1111
        m5 = code.isin(['T1201', 'T1106'])
        m6 = (code == 'T1110')
        m7 = (code == 'T1111')
        
        chunk.loc[m5, ['Category', 'Description']] = ['4. 지불거절', '지불거절 활동/조정']
        chunk.loc[m6, ['Category', 'Description']] = ['4. 지불거절', '지불거절 보류']
        chunk.loc[m7, ['Category', 'Description']] = ['4. 지불거절', '지불거절 해제']
        
        # 5. Transfers
        m8 = (u == '사용자가 시작한 환전')
        chunk.loc[m8, ['Category', 'Description']] = ['5. 이체', '환전']
        
        # Aggregate
        main = chunk[chunk['Category'] != '기타']
        if not main.empty:
            agg = main.groupby(['Category', 'Description', '통화'])['Gross'].sum().reset_index()
            agg.columns = ['Category', 'Description', 'Currency', 'Amount']
            summary_list.append(agg)
            
        # Fees RP
        rp = chunk[m1 | m2]
        if not rp.empty:
            f1 = rp.groupby('통화')['Fee'].sum().reset_index()
            f1['Category'] = '3. 수수료'
            f1['Description'] = '결제 수수료'
            summary_list.append(f1.rename(columns={'Fee': 'Amount', '통화': 'Currency'}))
            
        # Fees WD
        wc = chunk[m3 | m4]
        if not wc.empty:
            f2 = wc.groupby('통화')['Fee'].sum().reset_index()
            f2['Category'] = '3. 수수료'
            f2['Description'] = '수수료 입금'
            summary_list.append(f2.rename(columns={'Fee': 'Amount', '통화': 'Currency'}))
            
        # Dispute Fees
        df_mask = (u == '분쟁 수수료')
        df_chunk = chunk[df_mask]
        if not df_chunk.empty:
            f3 = df_chunk.groupby('통화')['Gross'].sum().reset_index()
            f3['Category'] = '3. 수수료'
            f3['Description'] = '분쟁 수수료'
            summary_list.append(f3.rename(columns={'Gross': 'Amount', '통화': 'Currency'}))

    if not summary_list:
        print("No matching data found.")
    else:
        full = pd.concat(summary_list).groupby(['Category', 'Description', 'Currency'])['Amount'].sum().reset_index()
        pivot = full.pivot_table(index=['Category', 'Description'], columns='Currency', values='Amount', aggfunc='sum').fillna(0)
        
        for cat in sorted(full['Category'].unique()):
            print(f"\n{cat}")
            sec = pivot.xs(cat, level=0)
            cols = [c for c in ['USD', 'JPY', 'MXN'] if c in sec.columns]
            print(sec[cols].map(format_curr).to_markdown())

except Exception as e:
    import traceback
    print(f"Error: {e}")
    traceback.print_exc()
