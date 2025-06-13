import pandas as pd
import lightgbm as lgb
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import numpy as np
from tabulate import tabulate
import logging

logger = logging.getLogger(__name__)

class BusinessTrendPredictor:
    def __init__(self):
        self.model_biz = None
        self.model_rev = None
        self.model_gro = None
        self.sector_cats = None
        self.df = None
        
    def load_and_prepare_data(self, csv_file_path):
        """Load and prepare data from CSV file"""
        try:
            # Load dataset
            print(f"Reading CSV from: {csv_file_path}")
            self.df = pd.read_csv(csv_file_path)
            print(f"CSV shape: {self.df.shape}")
            print(f"CSV columns: {list(self.df.columns)}")
            self.df['Industry Sector'] = self.df['Industry Sector'].astype('category')

            # Business growth
            self.df['business_growth'] = self.df.groupby("Industry Sector", observed=True)['Number of Businesses'].pct_change().bfill()

            # Lag features
            for lag in range(1, 4):
                self.df[f'lag_business_{lag}'] = self.df.groupby('Industry Sector', observed=True)['Number of Businesses'].shift(lag)
            for lag in range(1, 3):
                self.df[f'lag_growth_{lag}'] = self.df.groupby('Industry Sector', observed=True)['Growth Rate (%)'].shift(lag)
                self.df[f'lag_revenue_{lag}'] = self.df.groupby('Industry Sector', observed=True)['Revenue (PHP Millions)'].shift(lag)

            # Derived features
            self.df['revenue_per_business'] = self.df['Revenue (PHP Millions)'] / self.df['Number of Businesses']
            self.df['rev_x_growth'] = self.df['Revenue (PHP Millions)'] * self.df['Growth Rate (%)']
            self.df['lag_rev_x_growth'] = self.df.groupby('Industry Sector', observed=True)['rev_x_growth'].shift(1)

            # Drop NA
            self.df = self.df.dropna()

            # Encode sector
            self.df['industry_sector_encoded'] = self.df['Industry Sector'].cat.codes
            self.sector_cats = dict(zip(self.df['Industry Sector'].cat.categories, self.df['industry_sector_encoded']))
            
            return True
        except Exception as e:
            logger.error(f"Error preparing data: {str(e)}")
            return False
    
    def train_models(self):
        """Train the ML models"""
        try:
            # Define features and targets
            X = self.df.drop(columns=['Number of Businesses', 'Revenue (PHP Millions)', 'Growth Rate (%)', 'rev_x_growth'])
            y_business = self.df['Number of Businesses']
            y_revenue = self.df['Revenue (PHP Millions)']
            y_growth = self.df['Growth Rate (%)']

            # Train/test split and evaluation
            tscv = TimeSeriesSplit(n_splits=5)
            rmses, maes, r2s = [], [], []

            for train_idx, test_idx in tscv.split(X):
                X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
                yb_train, yb_test = y_business.iloc[train_idx], y_business.iloc[test_idx]

                model = lgb.LGBMRegressor(n_estimators=1000, learning_rate=0.01, num_leaves=50, boosting_type='gbdt')
                model.fit(X_train, yb_train,
                          eval_set=[(X_test, yb_test)],
                          eval_metric='rmse',
                          categorical_feature=['Industry Sector'],
                          callbacks=[lgb.early_stopping(10)]
                         )

                preds = model.predict(X_test)
                rmses.append(np.sqrt(mean_squared_error(yb_test, preds)))
                maes.append(mean_absolute_error(yb_test, preds))
                r2s.append(r2_score(yb_test, preds))

            # Re-train on full data
            self.model_biz = lgb.LGBMRegressor(n_estimators=1000, learning_rate=0.01, num_leaves=50)
            self.model_rev = lgb.LGBMRegressor(n_estimators=1000, learning_rate=0.01, num_leaves=50)
            self.model_gro = lgb.LGBMRegressor(n_estimators=1000, learning_rate=0.01, num_leaves=50)

            self.model_biz.fit(X, y_business, categorical_feature=['Industry Sector'])
            self.model_rev.fit(X, y_revenue, categorical_feature=['Industry Sector'])
            self.model_gro.fit(X, y_growth, categorical_feature=['Industry Sector'])
            
            # Return model performance metrics
            return {
                'avg_rmse': np.mean(rmses),
                'avg_mae': np.mean(maes),
                'avg_r2': np.mean(r2s)
            }
        except Exception as e:
            logger.error(f"Error training models: {str(e)}")
            return None
    
    def make_predictions(self, forecast_horizons=[1, 3, 5]):
        """Make predictions for future years"""
        try:
            # Dynamically determine forecast years
            latest_year = self.df['Year'].max()
            future_years = sorted(set(latest_year + np.array(forecast_horizons)))

            # Start from last available values
            future_base = self.df.sort_values("Year").groupby("Industry Sector", observed=True).last().copy()
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

            X = self.df.drop(columns=['Number of Businesses', 'Revenue (PHP Millions)', 'Growth Rate (%)', 'rev_x_growth'])

            for year in future_years:
                next_rows = []
                for sector in future_base.index:
                    # Only use past data to compute average growth
                    avg_growth = self.df[(self.df['Industry Sector'] == sector) & (self.df['Year'] <= year - 1)]['business_growth'].mean()
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

            # Combine and process results
            final_forecast = pd.concat(df_future)
            
            return self.process_predictions(final_forecast)
        except Exception as e:
            logger.error(f"Error making predictions: {str(e)}")
            return None
    
    def process_predictions(self, final_forecast):
        """Process predictions into different ranking categories"""
        try:
            # Sort the final forecast
            final_forecast_least_crowded = final_forecast.sort_values(by=['Year', 'Predicted Number of Businesses'], ascending=[True, True])
            final_forecast_revenue = final_forecast.sort_values(by=['Year', 'Predicted Revenue (PHP Millions)'], ascending=[True, False])
            final_forecast_growth_rate = final_forecast.sort_values(by=['Year', 'Predicted Growth Rate (%)'], ascending=[True, False])

            # Insert 'Rank' column and its values in the second position
            final_forecast_least_crowded.insert(2, 'Rank', final_forecast_least_crowded.groupby('Year')['Predicted Number of Businesses'].rank(method='dense', ascending=True).astype(int))
            final_forecast_revenue.insert(2, 'Rank', final_forecast_revenue.groupby('Year')['Predicted Revenue (PHP Millions)'].rank(method='dense', ascending=False).astype(int))
            final_forecast_growth_rate.insert(2, 'Rank', final_forecast_growth_rate.groupby('Year')['Predicted Growth Rate (%)'].rank(method='dense', ascending=False).astype(int))

            # Extract relevant columns for different forecast perspectives
            least_crowded = final_forecast_least_crowded[['Year', 'Industry Sector', 'Rank', 'Predicted Number of Businesses']].to_dict('records')
            revenue = final_forecast_revenue[['Year', 'Industry Sector', 'Rank', 'Predicted Revenue (PHP Millions)']].to_dict('records')
            growth_rate = final_forecast_growth_rate[['Year', 'Industry Sector', 'Rank', 'Predicted Growth Rate (%)']].to_dict('records')
            
            return {
                'least_crowded': least_crowded,
                'revenue': revenue,
                'growth_rate': growth_rate
            }
        except Exception as e:
            logger.error(f"Error processing predictions: {str(e)}")
            return None
