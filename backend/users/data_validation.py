import pandas as pd

class DatasetValidation:
    REQUIRED_COLUMNS = [
        "Year",
        "Industry Sector",
        "Number of Businesses",
        "Revenue (PHP Millions)",
        "Growth Rate (%)"
    ]

    @staticmethod
    def validate(dataset):
        # Check if the file is a CSV file
        if not dataset.name.lower().endswith('.csv'):
            return False, 'File is not a CSV file'
        
        # Check if the file is empty
        dataset.seek(0, 2)  # Move to end of file
        size = dataset.tell()
        if size == 0:
            return False, 'File is empty'
        dataset.seek(0)  # Reset pointer to start

        # Read the CSV file
        try:
            df = pd.read_csv(dataset)
        except pd.errors.EmptyDataError:
            return False, 'File is empty'
        except Exception as e:
            return False, f'Error reading CSV file: {e}'

        # Check for required columns
        if not all(col in df.columns for col in DatasetValidation.REQUIRED_COLUMNS):
            return False, f'Missing required columns. Required columns: {DatasetValidation.REQUIRED_COLUMNS}'

        # Check for missing values
        if df[DatasetValidation.REQUIRED_COLUMNS].isnull().any().any():
            return False, 'There are missing values in the required columns'
        
        # Check data types
        if not pd.api.types.is_integer_dtype(df["Year"]):
            return False, 'Year column must contain integer values'
        if not pd.api.types.is_string_dtype(df["Industry Sector"]):
            return False, 'Industry Sector column must contain string values'
        if not pd.api.types.is_numeric_dtype(df["Number of Businesses"]):
            return False, 'Number of Businesses column must contain numeric values'
        if not pd.api.types.is_numeric_dtype(df["Revenue (PHP Millions)"]):
            return False, 'Revenue (PHP Millions) column must contain numeric values'
        if not pd.api.types.is_numeric_dtype(df["Growth Rate (%)"]):
            return False, 'Growth Rate (%) column must contain numeric values'

        return True, 'File is valid'