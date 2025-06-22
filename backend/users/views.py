from django.shortcuts import render
from rest_framework import viewsets, permissions
from .serializers import *
from .models import *
from rest_framework.response import Response
from django.contrib.auth import get_user_model
User = get_user_model()

from rest_framework.parsers import MultiPartParser, FormParser
from .data_validation import DatasetValidation
from rest_framework.decorators import action
from .ml_service import MLPredictionService
from rest_framework import status

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
    permission_classes = [permissions.IsAdminUser] # Only the admin user can access the list, list_by_status, and change_status endpoints
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def list(self, request):
        queryset = User.objects.all().order_by('first_name')
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)
    
    def update(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
            serializer = self.serializer_class(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            else:
                return Response(serializer.errors, status=400)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
    
    def partial_update(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
            serializer = self.serializer_class(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            else:
                return Response(serializer.errors, status=400)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
    
    @action(detail=False, methods=['get'])
    def list_by_status(self, request):
        """ Get all users by status (active/inactive) """
        is_active = request.query_params.get('is_active')

        if not is_active:
            return Response({'error': 'is_active parameter is required'}, status=400)

        queryset = User.objects.filter(is_active=is_active).order_by('first_name')
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['patch'])
    def change_status(self, request):
        """ Change user status (active/inactive) """
        user_id = request.data.get('user_id')

        if not user_id:
            return Response({'error': 'user_id is required'}, status=400)

        # Get the current status of the user and negate it
        is_active = not User.objects.get(id=user_id).is_active

        try:
            user = User.objects.get(id=user_id)
            user.is_active = is_active
            user.save()
            return Response({'message': 'User status changed successfully'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """ Get current user """
        user = request.user
        
        if not user.is_authenticated:
            return Response({'error': 'User is not authenticated'}, status=401)

        serializer = self.serializer_class(user)
        return Response(serializer.data)
    
class DatasetViewset(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = Dataset.objects.all()
    serializer_class = DatasetSerializer
    parser_classes = [MultiPartParser, FormParser]

    def list(self, request):
        queryset = Dataset.objects.all()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)
    
    def retrieve(self, request, pk=None):
        """Get specific dataset"""
        try:
            dataset = Dataset.objects.get(pk=pk)
            serializer = self.serializer_class(dataset)
            return Response(serializer.data)
        except Dataset.DoesNotExist:
            return Response({'error': 'Dataset not found'}, status=404)
        
class DataValidationViewset(viewsets.ViewSet):
    parser_classes = [MultiPartParser, FormParser]

    def list(self, request):
        # Generate URL for actions
        validate_url = self.reverse_action(self.validate.url_name)

        return Response({'dataset validation': validate_url})

    @action(detail=False, methods=['post'])
    def validate(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided'}, status=400)
        
        is_valid, message = DatasetValidation.validate(file)
        
        if not is_valid:
            return Response({'valid': False, 'message': message}, status=400)
        
        return Response({'valid': True, 'message': message})

class PredictionViewset(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]  # You can change this to IsAuthenticated if needed

    def list(self, request):
        """List all prediction results"""
        queryset = PredictionResult.objects.all().order_by('-created_at')
        serializer = PredictionResultSerializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        """Get specific prediction result"""
        try:
            prediction = PredictionResult.objects.get(pk=pk)
            serializer = PredictionResultSerializer(prediction)
            return Response(serializer.data)
        except PredictionResult.DoesNotExist:
            return Response({'error': 'Prediction not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Generate ML predictions for a dataset"""
        dataset_id = request.data.get('dataset_id')

        if not dataset_id:
            return Response(
                {'error': 'dataset_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Initialize ML service and run prediction pipeline
            ml_service = MLPredictionService()
            result = ml_service.run_prediction_pipeline(dataset_id)

            return Response(result, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def by_dataset(self, request):
        """Get predictions by dataset ID"""
        dataset_id = request.query_params.get('dataset_id')

        if not dataset_id:
            return Response(
                {'error': 'dataset_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            predictions = PredictionResult.objects.filter(
                dataset_id=dataset_id
            ).order_by('year', 'industry_sector')

            serializer = PredictionResultSerializer(predictions, many=True)
            return Response(serializer.data)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def trends(self, request):
        """Get all trends with rankings by dataset ID, type, and category"""
        dataset_id = request.query_params.get('dataset_id')
        trend_type = request.query_params.get('type', 'short-term')  # short-term, mid-term, long-term
        category = request.query_params.get('category', 'least_crowded')  # least_crowded, revenue, growth_rate

        if not dataset_id:
            return Response(
                {'error': 'dataset_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            trends = Trend.objects.filter(
                prediction_result__dataset_id=dataset_id,
                type=trend_type,
                category=category,
            ).select_related('prediction_result').order_by('rank')

            serializer = TrendSerializer(trends, many=True)
            return Response(serializer.data)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
    @action(detail=False, methods=['get'])
    def trends_list(self, request):
        """Get all trends"""
        try:
            trends = Trend.objects.all().select_related('prediction_result').order_by('rank')

            serializer = TrendSerializer(trends, many=True)
            return Response(serializer.data)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
    @action(detail=False, methods=['get'])
    def latest_trends(self, request):
        """Get latest trends data with ranking of 1-5 only"""
        is_latest = request.query_params.get('is_latest', True)

        try:
            trends = Trend.objects.filter(
                is_latest=is_latest,
                rank__in=[1,2,3,4,5]
            ).select_related('prediction_result').order_by('rank', 'type')

            serializer = TrendSerializer(trends, many=True)
            return Response(serializer.data)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
