import pandas as pd
import os
from datetime import datetime

# Configuration
INPUT_FILE = '/Users/lee2juni/Downloads/GL_paypal_raw_2601.csv'
OUTPUT_FILE = '/Users/lee2juni/Downloads/GL_paypal_raw_2601_new.csv'
START_DATE = datetime(2026, 1, 1)
END_DATE = datetime(2026, 1, 31)

def main():
    print(f"Reading file: {INPUT_FILE}")
    if not os.path.exists(INPUT_FILE):
        print(f"Error: File not found at {INPUT_FILE}")
        return

    try:
        # Read the CSV file
        df = pd.read_csv(INPUT_FILE)
        
        # '날짜' column is expected to be in YYYY.MM.DD format based on earlier inspection
        print("Columns found:", df.columns.tolist())
        
        if '날짜' not in df.columns:
            print("Error: '날짜' column not found.")
            return

        # Convert date column to datetime objects
        # Using coerce to handle potential parsing errors gracefully, though we expect valid dates
        df['dt_date'] = pd.to_datetime(df['날짜'], format='%Y.%m.%d', errors='coerce')
        
        initial_count = len(df)
        print(f"Total rows before filtering: {initial_count}")

        # Filter by date range
        # Note: We want 2026.01.01 to 2026.01.31 inclusive
        mask = (df['dt_date'] >= START_DATE) & (df['dt_date'] <= END_DATE)
        filtered_df = df[mask].copy()
        
        # Remove the helper column
        filtered_df = filtered_df.drop(columns=['dt_date'])
        
        final_count = len(filtered_df)
        print(f"Total rows after filtering: {final_count}")
        print(f"Rows removed: {initial_count - final_count}")

        # Save to new CSV
        filtered_df.to_csv(OUTPUT_FILE, index=False, encoding='utf-8-sig')
        print(f"Successfully saved filtered data to: {OUTPUT_FILE}")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
