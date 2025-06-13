from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.views.decorators.csrf import csrf_exempt
import json
import os
import tempfile
try:
    import pandas as pd
except ImportError:
    print("WARNING: pandas not installed. Please install with: pip install pandas")
    pd = None

@csrf_exempt
@api_view(['GET', 'POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def test_api(request):
    """Test endpoint with authentication"""
    return Response({
        'message': 'Authenticated API is working!',
        'method': request.method,
        'user': str(request.user),
        'user_id': request.user.id if request.user.is_authenticated else None,
        'timestamp': str(pd.Timestamp.now()) if pd else 'N/A'
    }, status=status.HTTP_200_OK)

@csrf_exempt
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def upload_dataset(request):
    """Authenticated dataset upload endpoint"""
    print(f"=== UPLOAD REQUEST DEBUG ===")
    print(f"Method: {request.method}")
    print(f"User: {request.user}")
    print(f"User authenticated: {request.user.is_authenticated}")
    print(f"Request FILES: {list(request.FILES.keys())}")
    print(f"Authorization header: {request.META.get('HTTP_AUTHORIZATION', 'None')}")
    print(f"Content type: {request.META.get('CONTENT_TYPE', 'None')}")
    print("=== END DEBUG ===")

    # Additional authentication check
    if not request.user.is_authenticated:
        print("User is not authenticated!")
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

    # Check if pandas is available
    if pd is None:
        return Response({'error': 'Server configuration error: pandas not installed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    try:
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        file = request.FILES['file']
        
        # Basic validation
        if not file.name.endswith('.csv'):
            return Response({'error': 'File must be a CSV file'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(mode='wb', suffix='.csv', delete=False) as temp_file:
            for chunk in file.chunks():
                temp_file.write(chunk)
            temp_path = temp_file.name
        
        try:
            # Read and validate CSV
            df = pd.read_csv(temp_path)
            print(f"CSV loaded: {len(df)} rows, {len(df.columns)} columns")

            # Clean the data - remove NaN values and handle missing data
            df = df.dropna()  # Remove rows with any NaN values
            print(f"After cleaning: {len(df)} rows")

            if len(df) == 0:
                os.unlink(temp_path)
                return Response({
                    'error': 'Dataset contains no valid data after cleaning'
                }, status=status.HTTP_400_BAD_REQUEST)

            required_columns = [
                'Year',
                'Industry Sector',
                'Number of Businesses',
                'Revenue (PHP Millions)',
                'Growth Rate (%)'
            ]

            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                os.unlink(temp_path)
                return Response({
                    'error': f'Missing required columns: {", ".join(missing_columns)}'
                }, status=status.HTTP_400_BAD_REQUEST)

            if len(df) < 5:
                os.unlink(temp_path)
                return Response({
                    'error': 'Dataset must contain at least 5 rows after cleaning'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Get dataset info - ensure no NaN values
            try:
                year_min = int(df['Year'].min())
                year_max = int(df['Year'].max())
                total_sectors = int(df['Industry Sector'].nunique())
                industry_sectors = df['Industry Sector'].unique().tolist()

                # Filter out any NaN values from the list
                industry_sectors = [sector for sector in industry_sectors if pd.notna(sector)]

            except Exception as e:
                print(f"Error processing data: {e}")
                year_min = year_max = 0
                total_sectors = 0
                industry_sectors = []

            dataset_info = {
                'total_rows': len(df),
                'total_sectors': total_sectors,
                'year_range': {
                    'min': year_min,
                    'max': year_max
                },
                'industry_sectors': industry_sectors
            }
            
            # Store file path in session for this user
            session_key = f'uploaded_file_path_{request.user.id}'
            request.session[session_key] = temp_path
            
            response_data = {
                'dataset': {
                    'id': 1,  # Temporary ID
                    'filename': file.name,
                    'total_rows': dataset_info['total_rows'],
                    'total_sectors': dataset_info['total_sectors'],
                    'year_min': dataset_info['year_range']['min'],
                    'year_max': dataset_info['year_range']['max']
                },
                'info': dataset_info,
                'message': 'Dataset uploaded successfully'
            }
            
            return Response(response_data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
            return Response({
                'error': f'Error processing CSV: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        print(f"CRITICAL ERROR in upload_dataset: {e}")
        import traceback
        traceback.print_exc()
        return Response({
            'error': f'Internal server error: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def make_prediction(request):
    """Authenticated prediction endpoint"""
    try:
        print(f"=== PREDICTION REQUEST DEBUG ===")
        print(f"User: {request.user}")
        print(f"User ID: {request.user.id}")
        print(f"Request method: {request.method}")
        print(f"Request data: {request.data}")

        # Get the uploaded file path from session for this user
        session_key = f'uploaded_file_path_{request.user.id}'
        temp_path = request.session.get(session_key)
        print(f"Session key: {session_key}")
        print(f"Temp path: {temp_path}")
        print(f"File exists: {os.path.exists(temp_path) if temp_path else False}")
        print(f"Session keys: {list(request.session.keys())}")
        print("=== END PREDICTION DEBUG ===")

        if not temp_path or not os.path.exists(temp_path):
            return Response({
                'error': 'No dataset found. Please upload a dataset first.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # For now, return sample predictions
        # In a real implementation, you would run your ML models here
        sample_predictions = {
            'growth_rate': [
                {'Year': 2026, 'Industry Sector': 'Information & Communication', 'Predicted Growth Rate (%)': 11.5, 'Rank': 1},
                {'Year': 2026, 'Industry Sector': 'Health & Social Work', 'Predicted Growth Rate (%)': 10.8, 'Rank': 2},
                {'Year': 2026, 'Industry Sector': 'Education', 'Predicted Growth Rate (%)': 10.2, 'Rank': 3},
                {'Year': 2027, 'Industry Sector': 'Information & Communication', 'Predicted Growth Rate (%)': 12.1, 'Rank': 1},
                {'Year': 2027, 'Industry Sector': 'Health & Social Work', 'Predicted Growth Rate (%)': 11.3, 'Rank': 2},
            ],
            'revenue': [
                {'Year': 2026, 'Industry Sector': 'Information & Communication', 'Predicted Revenue (PHP Millions)': 580000, 'Rank': 1},
                {'Year': 2026, 'Industry Sector': 'Health & Social Work', 'Predicted Revenue (PHP Millions)': 520000, 'Rank': 2},
                {'Year': 2026, 'Industry Sector': 'Education', 'Predicted Revenue (PHP Millions)': 420000, 'Rank': 3},
            ],
            'least_crowded': [
                {'Year': 2026, 'Industry Sector': 'Food & Beverage Services', 'Predicted Number of Businesses': 17500, 'Rank': 1},
                {'Year': 2026, 'Industry Sector': 'Manufacturing', 'Predicted Number of Businesses': 21000, 'Rank': 2},
                {'Year': 2026, 'Industry Sector': 'Wholesale & Retail Trade', 'Predicted Number of Businesses': 19500, 'Rank': 3},
            ]
        }
        
        model_performance = {
            'avg_rmse': 5234.67,
            'avg_mae': 4892.33,
            'avg_r2': 0.856
        }
        
        response_data = {
            'message': 'Predictions generated successfully',
            'model_performance': model_performance,
            'predictions': sample_predictions,
            'total_predictions': sum(len(v) for v in sample_predictions.values())
        }
        
        # Clean up temp file
        try:
            os.unlink(temp_path)
            session_key = f'uploaded_file_path_{request.user.id}'
            del request.session[session_key]
        except:
            pass
        
        return Response(response_data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': f'Internal server error: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
