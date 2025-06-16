from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from django.utils import timezone

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is a required field')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractUser):
    email = models.EmailField(max_length=200, unique=True)
    profile_picture = models.ImageField(upload_to='profile_pictures', null=True, blank=True)
    username = models.CharField(max_length=200, unique=True, null=True, blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

class Dataset(models.Model):
    uploaded_by_user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    file = models.FileField(upload_to='datasets')
    created_at = models.DateTimeField(auto_now_add=True)

class PredictionResult(models.Model):
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE)
    year = models.IntegerField()
    industry_sector = models.CharField(max_length=200)
    predicted_revenue = models.DecimalField(max_digits=20, decimal_places=2)
    predicted_growth_rate = models.DecimalField(max_digits=7, decimal_places=2)
    predicted_least_crowded = models.IntegerField()
    created_at = models.DateTimeField(default=timezone.now, editable=False)

class Trend(models.Model):
    TYPE_CHOICES = [
        ('short-term', 'Short-Term'),
        ('mid-term', 'Mid-Term'),
        ('long-term', 'Long-Term')
    ]

    CATEGORY_CHOICES = [
        ('least_crowded', 'Least Crowded'),
        ('revenue', 'Revenue'),
        ('growth_rate', 'Growth Rate')
    ]

    prediction_result = models.ForeignKey(PredictionResult, on_delete=models.CASCADE)
    rank = models.IntegerField()
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    category = models.CharField(max_length=15, choices=CATEGORY_CHOICES)
    is_latest = models.BooleanField(default=True)