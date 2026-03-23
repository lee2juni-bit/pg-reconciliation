# -*- coding: utf-8 -*-
import pandas as pd
import os
import argparse

def generate_wev_files(item_path, sheet_path, output_dir, month_str):
    print(f"Loading raw ledger files for {month_str}...")
    
    # Check extensions
    def read_df(path):
        if path.endswith('.csv'):
            return pd.read_csv(path, encoding='utf-8', dtype={'주문번호': str}, na_filter=False, low_memory=False)
        else:
            return pd.read_excel(path, dtype={'주문번호': str})

    df_item_raw = read_df(item_path)
    df_sheet_raw = read_df(sheet_path)

    # 1. Product Data Aggregation
    item_cols = [
        "마감일", "마감구분", "주문번호", "결제번호", "입금처", "결제수단", "결제통화", "환율",
        "주문금액(결제통화)", "주문금액", "주문금액 관세(결제통화)", "주문금액 관세"
    ]
    df_item = df_item_raw[item_cols].copy()
    
    df_item_sum = df_item.groupby(["주문번호", "마감일"], as_index=False).agg({
        "마감구분": "first", "결제번호": "first", "입금처": "first", "결제수단": "first",
        "결제통화": "first", "환율": "first", "주문금액(결제통화)": "sum", "주문금액": "sum",
        "주문금액 관세(결제통화)": "sum", "주문금액 관세": "sum"
    })
    # Filter non-zero
    df_item_sum = df_item_sum[(df_item_sum["주문금액(결제통화)"] != 0) | (df_item_sum["주문금액"] != 0)]

    # 2. Order Sheet Aggregation
    sheet_cols = [
        "마감일", "마감구분", "주문번호", "결제번호", "입금처", "결제수단", "결제통화", "환율",
        "배송비(결제통화)", "배송비", "캐쉬(결제통화)", "캐쉬", "결제금액"
    ]
    df_sheet = df_sheet_raw[sheet_cols].copy()
    
    df_sheet_sum = df_sheet.groupby(["주문번호", "마감일"], as_index=False).agg({
        "마감구분": "first", "결제번호": "first", "입금처": "first", "결제수단": "first",
        "결제통화": "first", "환율": "first", "배송비(결제통화)": "sum", "배송비": "sum",
        "캐쉬(결제통화)": "sum", "캐쉬": "sum", "결제금액": "sum"
    })
    # Filter non-zero
    df_sheet_sum = df_sheet_sum[(df_sheet_sum["배송비"] != 0) | (df_sheet_sum["캐쉬"] != 0) | (df_sheet_sum["결제금액"] != 0)]

    # 3. Full Outer Join
    df_combined = pd.merge(df_sheet_sum, df_item_sum, how="outer", on=["주문번호", "마감일"], suffixes=('_sheet', '_item'))

    # Integrate columns
    for col in ["마감구분", "결제번호", "입금처", "결제수단", "결제통화", "환율"]:
        df_combined[col] = df_combined[f"{col}_sheet"].combine_first(df_combined[f"{col}_item"])
    
    # Drop intermediate columns
    drops = [f"{c}_sheet" for c in ["마감구분", "결제번호", "입금처", "결제수단", "결제통화", "환율"]] + \
            [f"{c}_item" for c in ["마감구분", "결제번호", "입금처", "결제수단", "결제통화", "환율"]]
    df_combined.drop(columns=drops, inplace=True)

    # 4. Master Calculation
    cols_to_num = ["주문금액(결제통화)", "주문금액 관세(결제통화)", "배송비(결제통화)", "캐쉬(결제통화)", "주문금액", "주문금액 관세", "배송비", "캐쉬"]
    for c in cols_to_num:
        if c in df_combined.columns:
            df_combined[c] = pd.to_numeric(df_combined[c], errors='coerce').fillna(0)
        else:
            df_combined[c] = 0.0

    df_combined["원장금액_결제통화"] = df_combined["주문금액(결제통화)"] + df_combined["주문금액 관세(결제통화)"] + df_combined["배송비(결제통화)"] - df_combined["캐쉬(결제통화)"]
    df_combined["원장금액_원화"] = df_combined["주문금액"] + df_combined["주문금액 관세"] + df_combined["배송비"] - df_combined["캐쉬"]

    # Final Column Order
    final_cols = [
        "마감일", "마감구분", "주문번호", "결제번호", "입금처", "결제수단", "결제통화", "환율",
        "배송비(결제통화)", "배송비", "주문금액(결제통화)", "주문금액", "주문금액 관세(결제통화)", "주문금액 관세",
        "캐쉬(결제통화)", "캐쉬", "결제금액", "원장금액_결제통화", "원장금액_원화"
    ]
    df_final = df_combined[final_cols].copy()

    # 5. Split and Save
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    pg_list = df_final['입금처'].unique()
    for pg in pg_list:
        if not pg: continue
        df_pg = df_final[df_final['입금처'] == pg].copy()
        df_pg['주문번호'] = df_pg['주문번호'].astype(str)
        
        filename = f"WEV_GL_{pg}_{month_str}.xlsx"
        save_path = os.path.join(output_dir, filename)
        df_pg.to_excel(save_path, index=False)
        print(f"  Generated: {filename} ({len(df_pg)} rows)")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--item", required=True)
    parser.add_argument("--sheet", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--month", required=True)
    args = parser.parse_args()

    generate_wev_files(args.item, args.sheet, args.output, args.month)
