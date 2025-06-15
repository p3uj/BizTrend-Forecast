from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import *
from .models import *
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.conf import settings
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from ml_service.data_processor import DataProcessor
from ml_service.ml_predictor import BusinessTrendPredictor
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

class RegisterViewset(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)
        
class UserViewset(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def list(self, request):
        queryset = User.objects.all()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

"""
class DatasetViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def create(self, request):
        # Upload and validate dataset
        try:
            print(f"=== DATASET UPLOAD DEBUG ===")
            print(f"User: {request.user}")
            print(f"Files: {request.FILES}")
            print(f"Data: {request.data}")

            if 'file' not in request.FILES:
                return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

            file = request.FILES['file']
            print(f"File name: {file.name}")
            print(f"File size: {file.size}")

            # Basic validation
            if not file.name.endswith('.csv'):
                return Response({'error': 'File must be a CSV file'}, status=status.HTTP_400_BAD_REQUEST)

            if file.size > 10 * 1024 * 1024:  # 10MB limit
                return Response({'error': 'File size must be less than 10MB'}, status=status.HTTP_400_BAD_REQUEST)

            # Save file to media directory
            import pandas as pd
            from django.core.files.storage import default_storage
            from django.core.files.base import ContentFile

            # Create unique filename
            timestamp = pd.Timestamp.now().strftime("%Y%m%d_%H%M%S")
            filename = f"datasets/user_{request.user.id}_{timestamp}_{file.name}"

            # Save file
            file_path = default_storage.save(filename, ContentFile(file.read()))
            full_path = os.path.join(settings.MEDIA_ROOT, file_path)

            print(f"File saved to: {full_path}")

            # Read and analyze CSV
            df = pd.read_csv(full_path)
            print(f"CSV loaded with {len(df)} rows")

            # Get dataset info
            dataset_info = {
                'total_rows': len(df),
                'total_sectors': df['Industry Sector'].nunique() if 'Industry Sector' in df.columns else 0,
                'year_range': {
                    'min': int(df['Year'].min()) if 'Year' in df.columns else 2000,
                    'max': int(df['Year'].max()) if 'Year' in df.columns else 2023
                }
            }

            # Create dataset record
            dataset = Dataset.objects.create(
                uploaded_by=request.user,
                filename=file.name,
                file_path=full_path,
                total_rows=dataset_info['total_rows'],
                total_sectors=dataset_info['total_sectors'],
                year_min=dataset_info['year_range']['min'],
                year_max=dataset_info['year_range']['max']
            )

            print(f"Dataset created with ID: {dataset.id}")

            serializer = DatasetSerializer(dataset)
            return Response({
                'dataset': serializer.data,
                'info': dataset_info,
                'message': 'Dataset uploaded successfully'
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"ERROR in dataset upload: {e}")
            import traceback
            traceback.print_exc()
            logger.error(f"Error uploading dataset: {str(e)}")
            return Response({'error': f'Internal server error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def list(self, request):
        # Get user's uploaded datasets
        datasets = Dataset.objects.filter(uploaded_by=request.user).order_by('-uploaded_at')
        serializer = DatasetSerializer(datasets, many=True)
        return Response(serializer.data)
"""
"""
class PredictionViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['get'])
    def get_predictions(self, request):
        # Get user's prediction history from database
        try:
            predictions = PredictionResult.objects.filter(perform_by_user=request.user).order_by('-created_at')

            # Transform to frontend format
            prediction_data = []
            for pred in predictions:
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

            return Response({
                'predictions': prediction_data,
                'total': len(prediction_data)
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"ERROR getting predictions: {e}")
            return Response({'error': f'Failed to get predictions: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def make_prediction(self, request):
        # Make ML predictions based on uploaded dataset
        try:
            print(f"=== PREDICTION REQUEST DEBUG ===")
            print(f"User: {request.user}")
            print(f"Data: {request.data}")

            dataset_id = request.data.get('dataset_id')
            if not dataset_id:
                return Response({'error': 'Dataset ID is required'}, status=status.HTTP_400_BAD_REQUEST)

            # Get dataset
            try:
                dataset = Dataset.objects.get(id=dataset_id, uploaded_by=request.user)
                print(f"Found dataset: {dataset.filename}")
            except Dataset.DoesNotExist:
                return Response({'error': 'Dataset not found'}, status=status.HTTP_404_NOT_FOUND)

            # For now, create sample predictions and save to database
            # This ensures the database integration works while we debug the ML model

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

            # Clear existing predictions for this user and dataset
            PredictionResult.objects.filter(perform_by_user=request.user, dataset=dataset).delete()

            # Save predictions to database with correct values
            prediction_records = []

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
            for prediction_data in prediction_map.values():
                prediction_record = PredictionResult.objects.create(
                    perform_by_user=request.user,
                    dataset=dataset,
                    year=prediction_data['year'],
                    industry_sector=prediction_data['industry_sector'],
                    predicted_revenue=prediction_data['predicted_revenue'],
                    predicted_growth_rate=prediction_data['predicted_growth_rate'],
                    predicted_least_crowded=prediction_data['predicted_least_crowded'],
                    model_performance=model_performance
                )
                prediction_records.append(prediction_record)

            print(f"Saved {len(prediction_records)} prediction records to database")

            return Response({
                'message': 'Predictions generated successfully',
                'model_performance': model_performance,
                'predictions': sample_predictions,
                'total_predictions': len(prediction_records)
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"ERROR in prediction: {e}")
            import traceback
            traceback.print_exc()
            logger.error(f"Error making predictions: {str(e)}")
            return Response({'error': f'Internal server error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def list(self, request):
        # Get user's prediction history
        predictions = PredictionResult.objects.filter(perform_by_user=request.user).order_by('-created_at')
        serializer = PredictionResultSerializer(predictions, many=True)
        return Response(serializer.data)
"""