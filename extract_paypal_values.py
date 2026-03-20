
import pandas as pd
import os

def extract_unique_values():
    file_path = '/Users/lee2juni/Desktop/GL_PG/2026-01/WEV_GL/df_payment_by_deposit_WEV_PG대사_2601_PAYPAL.xlsx'
    output_path = '/Users/lee2juni/Desktop/GL_PG/2026-01/WEV_GL/unique_values_w_p_combined.txt'

    print(f"Loading Excel file: {file_path}")

    try:
        # Read sheet 'w', column A (index 0)
        print("Reading Sheet 'w'...")
        df_w = pd.read_excel(file_path, sheet_name='w', usecols=[0], header=None)
        rows_w = len(df_w)
        print(f"Sheet 'w' loaded: {rows_w} rows.")
        
        # Read sheet 'p', column A (index 0)
        print("Reading Sheet 'p'...")
        df_p = pd.read_excel(file_path, sheet_name='p', usecols=[0], header=None)
        rows_p = len(df_p)
        print(f"Sheet 'p' loaded: {rows_p} rows.")

        # STRICT WORKFLOW: Combine First -> Then Deduplicate
        print("Combining both sheets...")
        combined_df = pd.concat([df_w, df_p], axis=0)
        total_rows = len(combined_df)
        print(f"Total combined rows (w + p): {total_rows}")

        # Remove duplicates
        print("Removing duplicates from combined data...")
        # dropna() is important because empty rows are technically duplicates of 'NaN'
        unique_values = combined_df.iloc[:, 0].dropna().drop_duplicates()
        final_count = len(unique_values)
        
        print("-" * 30)
        print(f"Final Unique Count: {final_count}")
        print("-" * 30)

        # Write to text file
        with open(output_path, 'w', encoding='utf-8') as f:
            for item in unique_values:
                f.write(f"{item}\n")
        
        print(f"Saved to: {output_path}")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    extract_unique_values()
