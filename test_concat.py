import pandas as pd

# Create dummy dataframes that mimic sheet1, sheet2, sheet3 values
data1 = [["Code", "Name", "Other"], ["C1", "BP_1", "X"], ["C2", "BP_2", "Y"]]
data2 = [["Code", "Name", "Other"], ["C3", "BP_3", "X"]]
data3 = [["Code", "Name", "Other"], ["C4", "BP_4", "X"], ["C5", "BP_5", "Y"]]

df1 = pd.DataFrame(data1)
df2 = pd.DataFrame(data2)
df3 = pd.DataFrame(data3)

df1.columns = range(df1.shape[1])
df2.columns = range(df2.shape[1])
df3.columns = range(df3.shape[1])

combined = pd.concat([
    df1.iloc[1:, [0, 1]],
    df2.iloc[1:, [0, 1]],
    df3.iloc[1:, [0, 1]]
]).dropna().drop_duplicates()

print("Combined shape:", combined.shape)
print("Combined items (col 1):", combined.iloc[:, 1].tolist())

