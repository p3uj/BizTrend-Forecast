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
    permission_classes = [permissions.IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def list(self, request):
        queryset = User.objects.all()
        serializer = self.serializer_class(queryset, many=True)
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
        queryset = Dataset.objects.get(pk=pk)
        serializer = self.serializer_class(queryset)
        return Response(serializer.data)
        
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