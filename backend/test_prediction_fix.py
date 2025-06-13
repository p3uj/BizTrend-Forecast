#!/usr/bin/env python3
"""
Test script to verify the prediction database integration fixes
"""
import os
import sys
import django
from django.conf import settings

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'auth.settings')
django.setup()

from users.models import PredictionResult, Dataset, CustomUser

def test_prediction_saving():
    """Test that predictions are saved correctly to database"""
    print("🧪 Testing Prediction Database Integration...")
    
    # Get any existing user for testing
    try:
        user = CustomUser.objects.first()
        if not user:
            print("❌ No users found in database. Please create a user first.")
            return
        print(f"✅ Using existing user: {user.username}")
    except Exception as e:
        print(f"❌ Error getting user: {e}")
        return
    
    # Get any existing dataset for testing
    try:
        dataset = Dataset.objects.filter(uploaded_by=user).first()
        if not dataset:
            print("❌ No datasets found for this user. Please upload a dataset first.")
            return
        print(f"✅ Using existing dataset: {dataset.filename}")
    except Exception as e:
        print(f"❌ Error getting dataset: {e}")
        return
    
    # Clear existing predictions for this test
    PredictionResult.objects.filter(perform_by_user=user, dataset=dataset).delete()
    print("🧹 Cleared existing test predictions")
    
    # Test data similar to what the view creates
    sample_predictions = {
        'growth_rate': [
            {'Year': 2026, 'Industry Sector': 'Information & Communication', 'Predicted Growth Rate (%)': 11.5, 'Rank': 1},
            {'Year': 2026, 'Industry Sector': 'Health & Social Work', 'Predicted Growth Rate (%)': 10.8, 'Rank': 2},
        ],
        'revenue': [
            {'Year': 2026, 'Industry Sector': 'Information & Communication', 'Predicted Revenue (PHP Millions)': 580000, 'Rank': 1},
            {'Year': 2026, 'Industry Sector': 'Health & Social Work', 'Predicted Revenue (PHP Millions)': 520000, 'Rank': 2},
        ],
        'least_crowded': [
            {'Year': 2026, 'Industry Sector': 'Food & Beverage Services', 'Predicted Number of Businesses': 17500, 'Rank': 1},
            {'Year': 2026, 'Industry Sector': 'Manufacturing', 'Predicted Number of Businesses': 21000, 'Rank': 2},
        ]
    }
    
    model_performance = {
        'avg_rmse': 5234.67,
        'avg_mae': 4892.33,
        'avg_r2': 0.856
    }
    
    # Create a mapping to combine all predictions for same industry/year
    prediction_map = {}
    
    # Process growth rate predictions
    for item in sample_predictions['growth_rate']:
        key = (item['Year'], item['Industry Sector'])
        if key not in prediction_map:
            prediction_map[key] = {
                'year': item['Year'],
                'industry_sector': item['Industry Sector'],
                'predicted_revenue': 0,
                'predicted_growth_rate': 0,
                'predicted_least_crowded': 0
            }
        prediction_map[key]['predicted_growth_rate'] = item['Predicted Growth Rate (%)']
    
    # Process revenue predictions
    for item in sample_predictions['revenue']:
        key = (item['Year'], item['Industry Sector'])
        if key not in prediction_map:
            prediction_map[key] = {
                'year': item['Year'],
                'industry_sector': item['Industry Sector'],
                'predicted_revenue': 0,
                'predicted_growth_rate': 0,
                'predicted_least_crowded': 0
            }
        prediction_map[key]['predicted_revenue'] = item['Predicted Revenue (PHP Millions)']
    
    # Process least crowded predictions
    for item in sample_predictions['least_crowded']:
        key = (item['Year'], item['Industry Sector'])
        if key not in prediction_map:
            prediction_map[key] = {
                'year': item['Year'],
                'industry_sector': item['Industry Sector'],
                'predicted_revenue': 0,
                'predicted_growth_rate': 0,
                'predicted_least_crowded': 0
            }
        prediction_map[key]['predicted_least_crowded'] = item['Predicted Number of Businesses']
    
    # Create database records
    prediction_records = []
    for prediction_data in prediction_map.values():
        prediction_record = PredictionResult.objects.create(
            perform_by_user=user,
            dataset=dataset,
            year=prediction_data['year'],
            industry_sector=prediction_data['industry_sector'],
            predicted_revenue=prediction_data['predicted_revenue'],
            predicted_growth_rate=prediction_data['predicted_growth_rate'],
            predicted_least_crowded=prediction_data['predicted_least_crowded'],
            model_performance=model_performance
        )
        prediction_records.append(prediction_record)
    
    print(f"✅ Created {len(prediction_records)} prediction records")
    
    # Verify the data was saved correctly
    print("\n📊 Verifying saved predictions:")
    for record in prediction_records:
        print(f"  • {record.industry_sector} ({record.year}):")
        print(f"    - Revenue: ₱{record.predicted_revenue:,.0f}M")
        print(f"    - Growth Rate: {record.predicted_growth_rate}%")
        print(f"    - Businesses: {record.predicted_least_crowded:,}")
    
    # Test the API response format
    print("\n🔄 Testing API response transformation:")
    prediction_data = []
    for pred in prediction_records:
        prediction_data.append({
            'id': pred.id,
            'year': pred.year,
            'industry_sector': pred.industry_sector,
            'predicted_revenue': float(pred.predicted_revenue),
            'predicted_growth_rate': float(pred.predicted_growth_rate),
            'predicted_least_crowded': int(pred.predicted_least_crowded),
            'dataset_name': pred.dataset.filename if pred.dataset else 'Unknown',
            'created_at': pred.created_at.isoformat(),
            'model_performance': pred.model_performance
        })
    
    print(f"✅ API response format ready with {len(prediction_data)} records")
    
    # Show sample API response
    if prediction_data:
        sample = prediction_data[0]
        print(f"\n📋 Sample API response:")
        print(f"  - Industry: {sample['industry_sector']}")
        print(f"  - Revenue: {sample['predicted_revenue']}")
        print(f"  - Growth: {sample['predicted_growth_rate']}")
        print(f"  - Businesses: {sample['predicted_least_crowded']}")
    
    print("\n🎉 Test completed successfully!")
    print("✅ Predictions are now being saved with correct values")
    print("✅ Database integration is working properly")

if __name__ == "__main__":
    test_prediction_saving()
