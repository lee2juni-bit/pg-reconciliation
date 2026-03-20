import pandas as pd
import os

file_path = os.path.expanduser('~/Downloads/GL_paypal_raw_2601.csv')

try:
    print(f"Analyzing unique types in {file_path}...")
    # Use chunking to be memory efficient but process everything
    unique_types = set()
    for chunk in pd.read_csv(file_path, encoding='utf-8-sig', low_memory=False, chunksize=200000, usecols=['유형']):
        unique_types.update(chunk['유형'].unique())
    
    print("\nUnique Types identified:")
    for t in sorted(list(unique_types)):
        print(f"- {t}")

except Exception as e:
    print(f"Error: {e}")
