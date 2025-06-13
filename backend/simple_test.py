#!/usr/bin/env python
"""Simple test script"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'auth.settings')
django.setup()

print("Django setup successful!")

# Test imports
try:
    from ml_service.data_processor import DataProcessor
    print("✓ DataProcessor imported")
except Exception as e:
    print(f"✗ DataProcessor import failed: {e}")

try:
    from ml_service.ml_predictor import BusinessTrendPredictor
    print("✓ BusinessTrendPredictor imported")
except Exception as e:
    print(f"✗ BusinessTrendPredictor import failed: {e}")

# Test pandas
try:
    import pandas as pd
    print("✓ Pandas imported")
    
    # Test CSV reading
    csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "business_trends_sample.csv")
    if os.path.exists(csv_path):
        df = pd.read_csv(csv_path)
        print(f"✓ CSV loaded successfully: {df.shape}")
    else:
        print(f"✗ CSV not found: {csv_path}")
        
except Exception as e:
    print(f"✗ Pandas test failed: {e}")

print("Simple test completed!")
