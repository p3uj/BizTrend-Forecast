import pandas as pd
import os
import logging
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

logger = logging.getLogger(__name__)

class DataProcessor:
    def __init__(self):
        self.required_columns = [
            'Year',
            'Industry Sector',
            'Number of Businesses',
            'Revenue (PHP Millions)',
            'Growth Rate (%)'
        ]
    
    def validate_csv_file(self, file):
        """Validate the uploaded CSV file"""
        try:
            # Handle both file objects and file paths
            if isinstance(file, str):
                # It's a file path
                if not file.endswith('.csv'):
                    return False, "File must be a CSV file"

                # Check file size (limit to 10MB)
                if os.path.getsize(file) > 10 * 1024 * 1024:
                    return False, "File size must be less than 10MB"

                # Read and validate CSV structure
                df = pd.read_csv(file)
            else:
                # It's a file object
                if hasattr(file, 'name') and not file.name.endswith('.csv'):
                    return False, "File must be a CSV file"

                # Check file size (limit to 10MB)
                if hasattr(file, 'size') and file.size > 10 * 1024 * 1024:
                    return False, "File size must be less than 10MB"

                # Read and validate CSV structure
                df = pd.read_csv(file)
            
            # Check required columns
            missing_columns = [col for col in self.required_columns if col not in df.columns]
            if missing_columns:
                return False, f"Missing required columns: {', '.join(missing_columns)}"
            
            # Check if data is not empty
            if df.empty:
                return False, "CSV file is empty"
            
            # Check data types and basic validation
            if not pd.api.types.is_numeric_dtype(df['Year']):
                return False, "Year column must contain numeric values"
            
            if not pd.api.types.is_numeric_dtype(df['Number of Businesses']):
                return False, "Number of Businesses column must contain numeric values"
            
            if not pd.api.types.is_numeric_dtype(df['Revenue (PHP Millions)']):
                return False, "Revenue column must contain numeric values"
            
            if not pd.api.types.is_numeric_dtype(df['Growth Rate (%)']):
                return False, "Growth Rate column must contain numeric values"
            
            # Check for minimum data requirements
            if len(df) < 10:
                return False, "Dataset must contain at least 10 rows"
            
            # Check year range
            min_year = df['Year'].min()
            max_year = df['Year'].max()
            if max_year - min_year < 2:
                return False, "Dataset must span at least 3 years"
            
            return True, "File validation successful"
            
        except Exception as e:
            logger.error(f"Error validating CSV file: {str(e)}")
            return False, f"Error reading CSV file: {str(e)}"
    
    def save_uploaded_file(self, file, user_id):
        """Save uploaded file to storage"""
        try:
            # Create unique filename
            timestamp = pd.Timestamp.now().strftime("%Y%m%d_%H%M%S")
            filename = f"datasets/user_{user_id}_{timestamp}_{file.name}"
            
            # Save file
            file_path = default_storage.save(filename, ContentFile(file.read()))
            
            # Return full path
            full_path = os.path.join(settings.MEDIA_ROOT, file_path)
            return full_path, filename
            
        except Exception as e:
            logger.error(f"Error saving uploaded file: {str(e)}")
            return None, None
    
    def get_dataset_info(self, file_path):
        """Get basic information about the dataset"""
        try:
            df = pd.read_csv(file_path)
            
            info = {
                'total_rows': len(df),
                'total_columns': len(df.columns),
                'year_range': {
                    'min': int(df['Year'].min()),
                    'max': int(df['Year'].max())
                },
                'industry_sectors': df['Industry Sector'].unique().tolist(),
                'total_sectors': df['Industry Sector'].nunique()
            }
            
            return info
            
        except Exception as e:
            logger.error(f"Error getting dataset info: {str(e)}")
            return None
