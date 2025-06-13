import pandas as pd
import os

csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "business_trends_sample.csv")
print(f"CSV path: {csv_path}")
print(f"File exists: {os.path.exists(csv_path)}")

if os.path.exists(csv_path):
    print(f"File size: {os.path.getsize(csv_path)} bytes")
    
    # Try reading with different encodings
    encodings = ['utf-8', 'utf-8-sig', 'latin-1', 'cp1252']
    
    for encoding in encodings:
        try:
            print(f"\nTrying encoding: {encoding}")
            df = pd.read_csv(csv_path, encoding=encoding)
            print(f"Success! Shape: {df.shape}")
            print(f"Columns: {list(df.columns)}")
            print(f"First few rows:\n{df.head()}")
            break
        except Exception as e:
            print(f"Failed with {encoding}: {e}")
    
    # Try reading raw content
    print("\nRaw file content (first 200 chars):")
    with open(csv_path, 'rb') as f:
        content = f.read(200)
        print(repr(content))
