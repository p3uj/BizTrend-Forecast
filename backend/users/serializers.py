from rest_framework import serializers
from .models import *
from django.contrib.auth import get_user_model
User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id',
                  'email',
                  'password',
                  'is_superuser',
                  'first_name',
                  'last_name',
                  'is_active',
                  'profile_picture',
                  'date_created',
                  'date_updated'
                  )
        extra_kwargs = { 'password': {'write_only':True} }

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
            
class DatasetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dataset
        fields = '__all__'

class PredictionResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = PredictionResult
        fields = '__all__'

class TrendSerializer(serializers.ModelSerializer):
    prediction_result = PredictionResultSerializer(read_only=True)

    class Meta:
        model = Trend
        fields = '__all__'
