import pandas as pd
import os

file_path = os.path.expanduser('~/Downloads/GL_paypal_raw_2601.csv')

try:
    for chunk in pd.read_csv(file_path, encoding='utf-8-sig', low_memory=False, chunksize=1):
        print("Columns in chunk:")
        print(chunk.columns.tolist())
        break

except Exception as e:
    print(f"Error: {e}")
