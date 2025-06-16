import pandas as pd
import lightgbm as lgb
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import numpy as np
from django.db import models
from .models import Dataset, PredictionResult, Trend
import os
from django.conf import settings


class MLPredictionService:
    """
    Machine Learning service for business trend forecasting using LightGBM.
    Handles dynamic file processing and saves predictions to database.
    """
    
    def __init__(self):
        self.model_biz = None
        self.model_rev = None
        self.model_gro = None
        self.sector_cats = None
        self.forecast_horizons = [1, 3, 5]
    
    def load_and_preprocess_data(self, file_path):
        """Load and preprocess the dataset from file path."""
        try:
            # Load dataset
            df = pd.read_csv(file_path)
            df['Industry Sector'] = df['Industry Sector'].astype('category')
            
            # Business growth
            df['business_growth'] = df.groupby("Industry Sector", observed=True)['Number of Businesses'].pct_change().bfill()
            
            # Lag features
            for lag in range(1, 4):
                df[f'lag_business_{lag}'] = df.groupby('Industry Sector', observed=True)['Number of Businesses'].shift(lag)
            for lag in range(1, 3):
                df[f'lag_growth_{lag}'] = df.groupby('Industry Sector', observed=True)['Growth Rate (%)'].shift(lag)
                df[f'lag_revenue_{lag}'] = df.groupby('Industry Sector', observed=True)['Revenue (PHP Millions)'].shift(lag)
            
            # Derived features
            df['revenue_per_business'] = df['Revenue (PHP Millions)'] / df['Number of Businesses']
            df['rev_x_growth'] = df['Revenue (PHP Millions)'] * df['Growth Rate (%)']
            df['lag_rev_x_growth'] = df.groupby('Industry Sector', observed=True)['rev_x_growth'].shift(1)
            
            # Drop NA
            df = df.dropna()
            
            # Encode sector
            df['industry_sector_encoded'] = df['Industry Sector'].cat.codes
            self.sector_cats = dict(zip(df['Industry Sector'].cat.categories, df['industry_sector_encoded']))
            
            return df
            
        except Exception as e:
            raise Exception(f"Error preprocessing data: {str(e)}")
    
    def train_models(self, df):
        """Train the three LightGBM models for business count, revenue, and growth predictions."""
        try:
            # Define features and targets
            X = df.drop(columns=['Number of Businesses', 'Revenue (PHP Millions)', 'Growth Rate (%)', 'rev_x_growth'])
            y_business = df['Number of Businesses']
            y_revenue = df['Revenue (PHP Millions)']
            y_growth = df['Growth Rate (%)']
            
            # Train models on full data
            self.model_biz = lgb.LGBMRegressor(n_estimators=1000, learning_rate=0.01, num_leaves=50)
            self.model_rev = lgb.LGBMRegressor(n_estimators=1000, learning_rate=0.01, num_leaves=50)
            self.model_gro = lgb.LGBMRegressor(n_estimators=1000, learning_rate=0.01, num_leaves=50)
            
            self.model_biz.fit(X, y_business, categorical_feature=['Industry Sector'])
            self.model_rev.fit(X, y_revenue, categorical_feature=['Industry Sector'])
            self.model_gro.fit(X, y_growth, categorical_feature=['Industry Sector'])
            
            return X
            
        except Exception as e:
            raise Exception(f"Error training models: {str(e)}")
    
    def generate_forecasts(self, df, X):
        """Generate forecasts for future years."""
        try:
            # Dynamically determine forecast years
            latest_year = df['Year'].max()
            future_years = sorted(set(latest_year + np.array(self.forecast_horizons)))
            
            # Start from last available values
            future_base = df.sort_values("Year").groupby("Industry Sector", observed=True).last().copy()
            df_future = []
            
            def update_lags(fb, row):
                sec = row['Industry Sector']
                fb.loc[sec, 'lag_business_3'] = fb.loc[sec, 'lag_business_2']
                fb.loc[sec, 'lag_business_2'] = fb.loc[sec, 'lag_business_1']
                fb.loc[sec, 'lag_business_1'] = row['Predicted Number of Businesses']
                
                fb.loc[sec, 'lag_growth_2'] = fb.loc[sec, 'lag_growth_1']
                fb.loc[sec, 'lag_growth_1'] = row['Predicted Growth Rate (%)']
                
                revenue = row['Predicted Revenue (PHP Millions)']
                growth = row['Predicted Growth Rate (%)']
                num_biz = row['Predicted Number of Businesses']
                fb.loc[sec, 'lag_rev_x_growth'] = revenue * growth
                fb.loc[sec, 'revenue_per_business'] = revenue / num_biz
            
            for year in future_years:
                next_rows = []
                for sector in future_base.index:
                    # Only use past data to compute average growth
                    avg_growth = df[(df['Industry Sector'] == sector) & (df['Year'] <= year - 1)]['business_growth'].mean()
                    row = {
                        'Year': year,
                        'Industry Sector': sector,
                        'industry_sector_encoded': self.sector_cats[sector],
                        'business_growth': avg_growth,
                        'lag_business_1': future_base.loc[sector, 'lag_business_1'],
                        'lag_business_2': future_base.loc[sector, 'lag_business_2'],
                        'lag_business_3': future_base.loc[sector, 'lag_business_3'],
                        'lag_growth_1': future_base.loc[sector, 'lag_growth_1'],
                        'lag_growth_2': future_base.loc[sector, 'lag_growth_2'],
                        'revenue_per_business': future_base.loc[sector, 'revenue_per_business'],
                        'lag_rev_x_growth': future_base.loc[sector, 'lag_rev_x_growth']
                    }
                    next_rows.append(row)
                
                X_future = pd.DataFrame(next_rows)
                X_future['Industry Sector'] = X_future['Industry Sector'].astype('category')
                X_future = X_future.reindex(columns=X.columns, fill_value=0)
                
                # Predict
                X_future['Predicted Number of Businesses'] = self.model_biz.predict(X_future[X.columns])
                X_future['Predicted Revenue (PHP Millions)'] = self.model_rev.predict(X_future[X.columns])
                X_future['Predicted Growth Rate (%)'] = self.model_gro.predict(X_future[X.columns])
                X_future['Year'] = year
                
                df_future.append(X_future.copy())
                
                # Update lags
                for _, row in X_future.iterrows():
                    update_lags(future_base, row)
            
            # Combine forecasts
            final_forecast = pd.concat(df_future)
            return final_forecast
            
        except Exception as e:
            raise Exception(f"Error generating forecasts: {str(e)}")
    
    def create_ranked_forecasts(self, final_forecast):
        """Create ranked forecasts for different perspectives."""
        try:
            # Sort the final forecast
            final_forecast_least_crowded = final_forecast.sort_values(
                by=['Year', 'Predicted Number of Businesses'], 
                ascending=[True, True]
            ).copy()
            
            final_forecast_revenue = final_forecast.sort_values(
                by=['Year', 'Predicted Revenue (PHP Millions)'], 
                ascending=[True, False]
            ).copy()
            
            final_forecast_growth_rate = final_forecast.sort_values(
                by=['Year', 'Predicted Growth Rate (%)'], 
                ascending=[True, False]
            ).copy()
            
            # Insert 'Rank' column
            final_forecast_least_crowded['Rank'] = final_forecast_least_crowded.groupby('Year')['Predicted Number of Businesses'].rank(method='dense', ascending=True).astype(int)
            final_forecast_revenue['Rank'] = final_forecast_revenue.groupby('Year')['Predicted Revenue (PHP Millions)'].rank(method='dense', ascending=False).astype(int)
            final_forecast_growth_rate['Rank'] = final_forecast_growth_rate.groupby('Year')['Predicted Growth Rate (%)'].rank(method='dense', ascending=False).astype(int)
            
            return {
                'least_crowded': final_forecast_least_crowded,
                'revenue': final_forecast_revenue,
                'growth_rate': final_forecast_growth_rate
            }
            
        except Exception as e:
            raise Exception(f"Error creating ranked forecasts: {str(e)}")

    def save_predictions_to_database(self, dataset_id, ranked_forecasts, base_year=None):
        """Save prediction results and trends to database."""
        try:
            dataset = Dataset.objects.get(id=dataset_id)

            # Set ALL existing trends to is_latest=False (across all datasets)
            # This ensures only the new predictions will have is_latest=True
            updated_count = Trend.objects.all().update(is_latest=False)
            print(f"Updated {updated_count} existing trends to is_latest=False")

            saved_predictions = []

            # First, create unique PredictionResult entries (one per year-sector combination)
            # Use the base forecast data (we'll use least_crowded as the base since it has all data)
            base_forecast = ranked_forecasts['least_crowded']

            # If base_year is not provided, determine it from the forecast data
            if base_year is None:
                # Get all unique years from predictions and find the base year
                prediction_years = sorted([int(row['Year']) for _, row in base_forecast.iterrows()])
                if prediction_years:
                    # The base year is the year before the first prediction
                    # Since we use forecast_horizons = [1, 3, 5], the first prediction is 1 year ahead
                    base_year = prediction_years[0] - 1
                else:
                    base_year = 2025  # fallback

            # Create a dictionary to store predictions by year-sector key
            predictions_dict = {}

            for _, row in base_forecast.iterrows():
                key = f"{row['Year']}_{row['Industry Sector']}"

                # Create PredictionResult only once per year-sector combination
                if key not in predictions_dict:
                    prediction = PredictionResult.objects.create(
                        dataset=dataset,
                        year=int(row['Year']),
                        industry_sector=row['Industry Sector'],
                        predicted_revenue=float(row['Predicted Revenue (PHP Millions)']),
                        predicted_growth_rate=float(row['Predicted Growth Rate (%)']),
                        predicted_least_crowded=int(row['Predicted Number of Businesses'])
                    )
                    predictions_dict[key] = prediction
                    saved_predictions.append(prediction)

            # Now create Trend entries for each category with proper rankings
            for forecast_type, forecast_df in ranked_forecasts.items():
                category_map = {
                    'least_crowded': 'least_crowded',
                    'revenue': 'revenue',
                    'growth_rate': 'growth_rate'
                }
                category = category_map[forecast_type]

                for _, row in forecast_df.iterrows():
                    key = f"{row['Year']}_{row['Industry Sector']}"
                    prediction = predictions_dict[key]

                    # Determine trend type based on year difference from base year
                    prediction_year = int(row['Year'])
                    year_diff = prediction_year - base_year

                    # Explicit mapping based on forecast horizons [1, 3, 5]
                    if year_diff == 1:
                        trend_type = 'short-term'  # 1 year ahead
                    elif year_diff == 3:
                        trend_type = 'mid-term'    # 3 years ahead
                    elif year_diff == 5:
                        trend_type = 'long-term'   # 5 years ahead
                    else:
                        # Fallback logic for any other year differences
                        if year_diff <= 1:
                            trend_type = 'short-term'
                        elif year_diff <= 3:
                            trend_type = 'mid-term'
                        else:
                            trend_type = 'long-term'

                    # Debug logging only.
                    print(f"Year: {prediction_year}, Base Year: {base_year}, Year Diff: {year_diff}, Trend Type: {trend_type}, Category: {category}")

                    # Create Trend with category-specific ranking
                    Trend.objects.create(
                        prediction_result=prediction,
                        rank=int(row['Rank']),
                        type=trend_type,
                        category=category,
                        is_latest=True
                    )

            return saved_predictions

        except Dataset.DoesNotExist:
            raise Exception(f"Dataset with ID {dataset_id} not found")
        except Exception as e:
            raise Exception(f"Error saving predictions to database: {str(e)}")

    def run_prediction_pipeline(self, dataset_id):
        """
        Main method to run the complete ML prediction pipeline.
        Returns the saved prediction results.
        """
        try:
            # Get dataset file path
            dataset = Dataset.objects.get(id=dataset_id)
            file_path = dataset.file.path

            # Check if file exists
            if not os.path.exists(file_path):
                raise Exception(f"Dataset file not found: {file_path}")

            # Run ML pipeline
            df = self.load_and_preprocess_data(file_path)
            X = self.train_models(df)
            final_forecast = self.generate_forecasts(df, X)
            ranked_forecasts = self.create_ranked_forecasts(final_forecast)

            # Get the base year from the original dataset (latest year in the data)
            base_year = df['Year'].max()
            print(f"Base year from original dataset: {base_year}")
            print(f"Forecast horizons: {self.forecast_horizons}")

            # Save to database (only prediction results)
            saved_predictions = self.save_predictions_to_database(dataset_id, ranked_forecasts, base_year)

            return {
                'success': True,
                'message': f'Successfully generated and saved {len(saved_predictions)} predictions',
                'predictions_count': len(saved_predictions),
                'dataset_id': dataset_id
            }

        except Dataset.DoesNotExist:
            raise Exception(f"Dataset with ID {dataset_id} not found")
        except Exception as e:
            raise Exception(f"ML prediction pipeline failed: {str(e)}")
