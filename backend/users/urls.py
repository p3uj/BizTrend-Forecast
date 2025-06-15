from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register('register', RegisterViewset, basename='register')
router.register('users', UserViewset, basename='users')
router.register('dataset_validation', DataValidationViewset, basename='dataset_validation')
urlpatterns = router.urls