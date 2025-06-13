#!/usr/bin/env python
"""Test script for ML functionality"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'auth.settings')
django.setup()

from ml_service.ml_predictor import BusinessTrendPredictor
from ml_service.data_processor import DataProcessor

def test_ml_functionality():
    print("Testing ML functionality...")
    
    # Test data processor
    processor = DataProcessor()
    print("✓ DataProcessor initialized")
    
    # Test predictor
    predictor = BusinessTrendPredictor()
    print("✓ BusinessTrendPredictor initialized")
    
    # Test with sample CSV
    csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "business_trends_sample.csv")
    if os.path.exists(csv_path):
        print(f"✓ Sample CSV found: {csv_path}")
        
        # Test data loading
        if predictor.load_and_prepare_data(csv_path):
            print("✓ Data loaded and prepared successfully")
            
            # Test model training
            performance = predictor.train_models()
            if performance:
                print("✓ Models trained successfully")
                print(f"  - RMSE: {performance['avg_rmse']:.2f}")
                print(f"  - MAE: {performance['avg_mae']:.2f}")
                print(f"  - R²: {performance['avg_r2']:.3f}")
                
                # Test predictions
                predictions = predictor.make_predictions()
                if predictions:
                    print("✓ Predictions generated successfully")
                    print(f"  - Growth predictions: {len(predictions['growth_rate'])}")
                    print(f"  - Revenue predictions: {len(predictions['revenue'])}")
                    print(f"  - Least crowded predictions: {len(predictions['least_crowded'])}")
                    
                    # Show sample predictions
                    print("\nSample Growth Rate Predictions:")
                    for i, pred in enumerate(predictions['growth_rate'][:3]):
                        print(f"  {pred['Year']}: {pred['Industry Sector']} - {pred['Predicted Growth Rate (%)']:.2f}%")
                    
                    return True
                else:
                    print("✗ Failed to generate predictions")
            else:
                print("✗ Failed to train models")
        else:
            print("✗ Failed to load data")
    else:
        print(f"✗ Sample CSV not found: {csv_path}")
    
    return False

if __name__ == "__main__":
    success = test_ml_functionality()
    if success:
        print("\n🎉 All ML tests passed!")
    else:
        print("\n❌ ML tests failed!")
        sys.exit(1)
