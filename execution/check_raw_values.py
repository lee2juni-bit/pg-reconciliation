import pandas as pd
import os

file_path = os.path.expanduser('~/Downloads/GL_paypal_raw_2601.csv')

try:
    # Read a few rows of each currency to see raw formatting
    df_raw = pd.read_csv(file_path, encoding='utf-8-sig', low_memory=False, nrows=100000)
    
    for curr in ['USD', 'JPY', 'MXN']:
        print(f"\n[Raw values for {curr}]")
        sample = df_raw[df_raw['통화'] == curr]['총액'].head(5)
        print(sample)
        
        # Check if they can be converted directy
        converted = pd.to_numeric(sample, errors='coerce')
        print("Converted with to_numeric:")
        print(converted)

except Exception as e:
    print(f"Error: {e}")
