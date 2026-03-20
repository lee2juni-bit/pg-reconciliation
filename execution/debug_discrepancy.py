import pandas as pd
import os

file_path = os.path.expanduser('~/Downloads/GL_paypal_raw_2601.csv')

try:
    print(f"Reading {file_path} for debugging...")
    # Read a sample to avoid memory issues while investigating filters
    df = pd.read_csv(file_path, encoding='utf-8-sig', low_memory=False, nrows=500000)

    # Convert numeric
    df['총액'] = pd.to_numeric(df['총액'], errors='coerce').fillna(0)
    df['수수료'] = pd.to_numeric(df['수수료'], errors='coerce').fillna(0)

    # Filter for Received Payment types
    types = ['익스프레스 체크아웃 결제', '사전 승인 결제 청구서 사용자 결제', '쇼핑 카트 상품']
    rp_df = df[df['유형'].isin(types)]

    print("\n[Analysis by Type, Status, and Balance Impact]")
    summary = rp_df.groupby(['유형', '상태', '잔액 영향', '거래 이벤트 코드', '통화'])['총액'].agg(['sum', 'count']).reset_index()
    print(summary.to_markdown())

    print("\n[Sample rows for '익스프레스 체크아웃 결제' with '통화' == 'USD']")
    print(df[(df['유형'] == '익스프레스 체크아웃 결제') & (df['통화'] == 'USD')][['날짜', '이름', '유형', '상태', '잔액 영향', '거래 이벤트 코드', '총액', '수수료']].head(10).to_markdown())

except Exception as e:
    print(f"Error: {e}")
