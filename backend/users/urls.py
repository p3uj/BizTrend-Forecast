from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register('register', RegisterViewset, basename='register')
router.register('users', UserViewset, basename='users')
#router.register('datasets', DatasetViewSet, basename='datasets')
#router.register('predictions', PredictionViewSet, basename='predictions')

# Add ML API endpoints (note: 'api/' prefix is already in main urls.py)
urlpatterns = router.urls + [
    # Keep the old endpoints for compatibility, but they now use database views
]