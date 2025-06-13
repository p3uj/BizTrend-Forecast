from rest_framework import serializers
from .models import *
from django.contrib.auth import get_user_model
User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'password')
        extra_kwargs = { 'password': {'write_only':True} }

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class DatasetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dataset
        fields = ['id', 'filename', 'total_rows', 'total_sectors', 'year_min', 'year_max', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

class PredictionResultSerializer(serializers.ModelSerializer):
    dataset = DatasetSerializer(read_only=True)

    class Meta:
        model = PredictionResult
        fields = ['id', 'dataset', 'year', 'industry_sector', 'predicted_revenue',
                 'predicted_growth_rate', 'predicted_least_crowded', 'model_performance', 'created_at']
        read_only_fields = ['id', 'created_at']

class TrendSerializer(serializers.ModelSerializer):
    prediction_result = PredictionResultSerializer(read_only=True)

    class Meta:
        model = Trend
        fields = ['id', 'prediction_result', 'rank', 'type']
            