import pandas as pd
import os

file_path = os.path.expanduser('~/Downloads/GL_paypal_raw_2601.csv')

try:
    for chunk in pd.read_csv(file_path, encoding='utf-8-sig', low_memory=False, chunksize=5):
        print("Column names:", chunk.columns.tolist())
        date_col = chunk.columns[0]
        print(f"First column name: '{date_col}'")
        print("First 5 dates:")
        print(chunk[date_col].tolist())
        
        mask = chunk[date_col].astype(str).str.startswith('2026.01.')
        print("Mask for '2026.01.':")
        print(mask.tolist())
        
        # Try different formats
        print("Try 2026-01-")
        print(chunk[date_col].astype(str).str.startswith('2026-01-').tolist())
        break

except Exception as e:
    print(f"Error: {e}")
