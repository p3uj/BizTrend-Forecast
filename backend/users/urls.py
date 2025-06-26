from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register('register', RegisterViewset, basename='register')
router.register('users', UserViewset, basename='users')
router.register('dataset', DatasetViewset, basename='dataset')
router.register('dataset_validation', DataValidationViewset, basename='dataset_validation')
router.register('predictions', PredictionViewset, basename='predictions')

urlpatterns = [
    path('health/', health_check, name='health_check'),
] + router.urls


# List of registered endpoints
"""
+----------+------------------------------------------+---------------------------------------------------------------+
|  METHOD  | ENDPOINT                                 | PURPOSE                                                       |
+==========+==========================================+===============================================================+
|   POST   | /register/                               | Register a new user.                                          |
+----------+------------------------------------------+---------------------------------------------------------------+
|   GET    | /users/                                  | List of users.                                                |
+----------+------------------------------------------+---------------------------------------------------------------+
|   POST   | /dataset_validation/validate/            | Upload selected file to validate.                             |
+----------+------------------------------------------+---------------------------------------------------------------+
|   POST   | /dataset/                                | Upload dataset.                                               |
+----------+------------------------------------------+---------------------------------------------------------------+
|   GET    | /dataset/                                | List of datasets.                                             |
+----------+------------------------------------------+---------------------------------------------------------------+
|   GET    | /dataset/{pk}/                           | Retrieve dataset by id.                                       |
+----------+------------------------------------------+---------------------------------------------------------------+
|   GET    | /predictions/                            | List of prediction result.                                    |
+----------+------------------------------------------+---------------------------------------------------------------+
|   GET    | /predictions/{pk}/                       | Retrieve prediction result by id.                             |
+----------+------------------------------------------+---------------------------------------------------------------+
|   GET    | /predictions/by_dataset/?dataset_id={pk} | List of prediction result by dataset id.                      |
+----------+------------------------------------------+---------------------------------------------------------------+
|   POST   | /predictions/generate/                   | Generate prediction by dataset id.                            |
+----------+------------------------------------------+---------------------------------------------------------------+
|   GET    | /predictions/trends_list/                | List of trends.                                               |
+----------+------------------------------------------+---------------------------------------------------------------+
|   GET    | /predictions/latest_trends/              | List of latest trends with ranking of 1-5 only.               |
+----------+------------------------------------------+---------------------------------------------------------------+
|   GET    | /predictions/trends/?dataset_id={pk}     | List of trends by dataset id.                                 |
|          |                                          | Note: This endpoint accept type and category as query params. |
+----------+------------------------------------------+---------------------------------------------------------------+
"""