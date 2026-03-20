import pandas as pd
import os

file_path = os.path.expanduser('~/Downloads/GL_paypal_raw_2601.csv')

try:
    print("Checking total rows and parsing...")
    
    total_rows = 0
    jan_rows = 0
    
    # Read without index_col=False to see if it makes a difference in row count
    # But we know index_col=False is needed for alignment.
    # The warning "Length of header or names does not match length of data" is concerning.
    # It usually means some rows have MORE columns than the header.
    
    # Let's count separators in header vs first few rows
    with open(file_path, 'r', encoding='utf-8-sig') as f:
        header = f.readline()
        print(f"Header columns: {header.count(',') + 1}")
        
        for i in range(5):
            line = f.readline()
            print(f"Row {i+1} columns: {line.count(',') + 1}")
            
except Exception as e:
    print(f"Error: {e}")
