import pandas as pd
import os

file_path = os.path.expanduser('~/Downloads/GL_paypal_raw_2601.csv')

try:
    unique_types = set()
    for chunk in pd.read_csv(file_path, encoding='utf-8-sig', low_memory=False, chunksize=300000, usecols=['유형']):
        for ut in chunk['유형'].unique():
            if "결제 청구서" in str(ut):
                unique_types.add(ut)
    
    print("Detected types containing '결제 청구서':")
    for t in unique_types:
        print(f"- '{t}'")

except Exception as e:
    print(f"Error: {e}")
