import pandas as pd
import os

file_path = os.path.expanduser('~/Downloads/GL_paypal_raw_2601.csv')

try:
    df = pd.read_csv(file_path, encoding='utf-8-sig', low_memory=False, nrows=1)
    print("DataFrame Head:")
    print(df.to_markdown())
    print("\nColumns:")
    print(df.columns.tolist())

except Exception as e:
    print(f"Error: {e}")
