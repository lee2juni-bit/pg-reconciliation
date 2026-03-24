import os
import argparse
import glob
import pandas as pd
import re

def process_reconciliation(wev_file, pg_file, output_file):
    print(f"\nProcessing matching pair:")
    print(f"  W: {os.path.basename(wev_file)}")
    print(f"  P: {os.path.basename(pg_file)}")

    # 1. Load Data with string type for 주문번호 to prevent scientific notation
    df_w = pd.read_excel(wev_file, dtype={'주문번호': str})
    
    # Read PG P data. It might use '주문번호' or '주문번호2'. We'll force both to string if they exist.
    # To be safe, just read all as string first for order numbers if we know the column name, 
    # or let's read the whole file, then convert to string safely.
    df_p = pd.read_excel(pg_file)
    if '주문번호' in df_p.columns:
        df_p['주문번호'] = df_p['주문번호'].astype(str).str.replace('\.0$', '', regex=True)
    if '주문번호2' in df_p.columns:
        df_p['주문번호2'] = df_p['주문번호2'].astype(str).str.replace('\.0$', '', regex=True)
        
    if '주문번호' in df_w.columns:
        df_w['주문번호'] = df_w['주문번호'].astype(str).str.replace('\.0$', '', regex=True)

    # Standardize dataframes for easier processing
    # Note: We keep original rows so we don't lose any data for the W/P 원본 sheets,
    # but for the C sheet math, we will work with deduplicated sets.
    
    # Standardize Key ( 마감구분 + _ + 주문번호 )
    def create_key(row, type_col, ord_col):
        # We use a helper here to ensure we don't get 'nan_somevalue' if we want it to be distinct.
        # However, for the 'append then deduplicate' requested, we just concat.
        t = str(row[type_col]).strip() if pd.notna(row[type_col]) else 'NaN'
        o = str(row[ord_col]).strip() if pd.notna(row[ord_col]) else 'NaN'
        return f"{t}_{o}"

    df_w['_Standard_Key'] = df_w.apply(lambda r: create_key(r, '마감구분', '주문번호'), axis=1)
    
    # Define p_ord_col before use
    p_ord_col = '주문번호' if '주문번호' in df_p.columns else '주문번호2'
    df_p['_Standard_Key'] = df_p.apply(lambda r: create_key(r, '거래구분', p_ord_col), axis=1)

    # 3. Amount Extraction (Dual Currency)
    w_amt_req = '원장금액_결제통화'
    w_amt_krw = '원장금액_원화'
    
    p_amt_req = '합계 : 주문금액(요청통화)2' if '합계 : 주문금액(요청통화)2' in df_p.columns else '요청통화2'
    p_amt_krw = '합계 : 주문금액(원화)2'
    
    # Strip commas and convert to numeric
    for col in [w_amt_req, w_amt_krw]:
        if col in df_w.columns:
            df_w[f'_Std_{col}'] = pd.to_numeric(df_w[col].astype(str).str.replace(',', '', regex=False), errors='coerce').fillna(0)
        else:
            df_w[f'_Std_{col}'] = 0.0
            
    for col in [p_amt_req, p_amt_krw]:
        if col in df_p.columns:
            df_p[f'_Std_{col}'] = pd.to_numeric(df_p[col].astype(str).str.replace(',', '', regex=False), errors='coerce').fillna(0)
        else:
            df_p[f'_Std_{col}'] = 0.0

    # 4. Create Master C Sheet (Append -> Deduplicate)
    w_keys_all = df_w['_Standard_Key']
    p_keys_all = df_p['_Standard_Key']
    
    # Append then drop duplicates for the index (This is just for the key list)
    final_keys = pd.concat([w_keys_all, p_keys_all]).drop_duplicates().sort_values().reset_index(drop=True)
    df_c = pd.DataFrame({'마스터비교Key_C': final_keys})

    # Group by Sum & First (Categorical info)
    # We NO LONGER drop duplicates for math, as requested by the user to match total sums.
    
    # WEV Aggregation
    w_agg_cols = {f'_Std_{w_amt_req}': 'sum', f'_Std_{w_amt_krw}': 'sum'}
    if '마감구분' in df_w.columns: w_agg_cols['마감구분'] = 'first'
    if '결제통화' in df_w.columns: w_agg_cols['결제통화'] = 'first'
    
    w_sum = df_w.groupby('_Standard_Key', dropna=False).agg(w_agg_cols).reset_index()
    w_sum.rename(columns={
        '_Standard_Key': '마스터비교Key_C', 
        f'_Std_{w_amt_req}': 'W_원장금액_결제통화',
        f'_Std_{w_amt_krw}': 'W_원장금액_원화',
        '마감구분': 'W_마감구분',
        '결제통화': 'W_결제통화'
    }, inplace=True)

    # PG Aggregation
    p_agg_cols = {f'_Std_{p_amt_req}': 'sum', f'_Std_{p_amt_krw}': 'sum'}
    if '거래구분' in df_p.columns: p_agg_cols['거래구분'] = 'first'
    if 'pgRef' in df_p.columns: p_agg_cols['pgRef'] = 'first'
    
    # For 요청통화2, the user wants the literal column "요청통화2" if it exists
    p_cur_col = '요청통화2' if '요청통화2' in df_p.columns else None
    if p_cur_col: p_agg_cols[p_cur_col] = 'first'
    
    p_sum = df_p.groupby('_Standard_Key', dropna=False).agg(p_agg_cols).reset_index()
    p_sum.rename(columns={
        '_Standard_Key': '마스터비교Key_C', 
        f'_Std_{p_amt_req}': 'W_주문금액_요청통화',
        f'_Std_{p_amt_krw}': 'W_주문금액_원화',
        '거래구분': 'P_거래구분',
        '요청통화2': 'P_요청통화2'
    }, inplace=True)

    # 5. Join all
    df_c = pd.merge(df_c, w_sum, on='마스터비교Key_C', how='left').fillna(0)
    df_c = pd.merge(df_c, p_sum, on='마스터비교Key_C', how='left').fillna(0)
    
    # pgRef position (next to 마스터비교Key_C)
    if 'pgRef' in df_c.columns:
        cols = list(df_c.columns)
        cols.remove('pgRef')
        cols.insert(1, 'pgRef')
        df_c = df_c[cols]
    
    # Ensure categorical columns are not 0 but empty string if missing
    for c in ['W_마감구분', 'W_결제통화', 'P_거래구분', 'P_요청통화2', 'pgRef']:
        if c in df_c.columns:
            df_c[c] = df_c[c].replace(0, '')

    # 6. Calculate Differences (Using NEW requested names)
    df_c['차액_결제통화'] = df_c['W_원장금액_결제통화'] - df_c['W_주문금액_요청통화']
    df_c['차액_원화'] = df_c['W_원장금액_원화'] - df_c['W_주문금액_원화']
    
    def determine_status(row):
        # We use WEV Book Amount as base for Check
        if row['W_원장금액_원화'] == 0 and row['W_주문금액_원화'] != 0:
            return 'W_누락(P에만 존재)'
        elif row['W_주문금액_원화'] == 0 and row['W_원장금액_원화'] != 0:
            return 'P_누락(W에만 존재)'
        elif abs(row['차액_원화']) < 0.01 and abs(row['차액_결제통화']) < 0.01:
            return '완벽_일치'
        else:
            return '금액_불일치'
            
    df_c['대사_상태'] = df_c.apply(determine_status, axis=1)

    # Clean up intermediate columns in original dfs (kept original rows here)
    df_w.drop(columns=[c for c in df_w.columns if c.startswith('_Std') or c == '_Standard_Key'], inplace=True, errors='ignore')
    df_p.drop(columns=[c for c in df_p.columns if c.startswith('_Std') or c == '_Standard_Key'], inplace=True, errors='ignore')

    # 7. Write to Excel with TEXT formatting & UI Conveniences
    print(f"  Saving to: {output_file}")
    with pd.ExcelWriter(output_file, engine='xlsxwriter') as writer:
        df_c.to_excel(writer, sheet_name='C_대사결과', index=False)
        df_w.to_excel(writer, sheet_name='W_원본', index=False)
        df_p.to_excel(writer, sheet_name='P_원본', index=False)
        
        workbook = writer.book
        text_format = workbook.add_format({'num_format': '@'}) # Text format
        
        for sheet_name in ['C_대사결과', 'W_원본', 'P_원본']:
            worksheet = writer.sheets[sheet_name]
            # Use current df to find columns
            if sheet_name == 'C_대사결과': cdf = df_c
            elif sheet_name == 'W_원본': cdf = df_w
            else: cdf = df_p
            
            # 1. Freeze the first row
            worksheet.freeze_panes(1, 0)
            
            # 2. Auto-fit column widths and set TEXT format for specific columns
            for col_num, col_name in enumerate(cdf.columns):
                # Calculate max length of the content in this column for auto-fit
                # More robust way to handle numeric/NaN values
                all_lengths = cdf[col_name].astype(str).str.len()
                max_len = all_lengths.max() if not all_lengths.empty else 0
                max_len = max(max_len, len(col_name)) + 2 # Add padding
                
                # Apply formatting
                if '주문번호' in col_name or 'Key' in col_name:
                    worksheet.set_column(col_num, col_num, max_len, text_format)
                else:
                    worksheet.set_column(col_num, col_num, max_len)
        
    print(f"  Result generated. C Sheet Rows: {len(df_c)} | Match: {sum(df_c['대사_상태']=='완벽_일치')} | Mismatch: {sum(df_c['대사_상태']!='완벽_일치')}")

def main():
    parser = argparse.ArgumentParser(description="PG Reconciliation Merge and Report Engine")
    parser.add_argument('--wev_dir', required=True, help="Directory containing WEV files")
    parser.add_argument('--pg_dir', required=True, help="Directory containing PG files")
    parser.add_argument('--output_dir', default='.', help="Directory to save output files")
    args = parser.parse_args()

    if not os.path.exists(args.output_dir):
        os.makedirs(args.output_dir)

    wev_pattern = re.compile(r'^WEV_(.*)\.xlsx$', re.IGNORECASE)
    wev_files = glob.glob(os.path.join(args.wev_dir, 'WEV_*.xlsx'))

    if not wev_files:
        print(f"No WEV files found in {args.wev_dir}")
        return

    for wf in wev_files:
        filename = os.path.basename(wf)
        match = wev_pattern.match(filename)
        if match:
            core_name = match.group(1)
            expected_pg_name = f"PG_{core_name}.xlsx"
            pg_path = os.path.join(args.pg_dir, expected_pg_name)
            
            if os.path.exists(pg_path):
                output_name = f"{core_name}_대사완료.xlsx"
                output_path = os.path.join(args.output_dir, output_name)
                try:
                    process_reconciliation(wf, pg_path, output_path)
                except Exception as e:
                    print(f"Failed to process {core_name}: {e}")
            else:
                print(f"Warning: No matching PG file found for {filename} (Expected: {expected_pg_name})")

if __name__ == "__main__":
    main()
