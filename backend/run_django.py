#!/usr/bin/env python
"""Simple Django server runner"""
import os
import sys
import django
from django.core.wsgi import get_wsgi_application
from django.core.management import execute_from_command_line

# Add current directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'auth.settings')

if __name__ == '__main__':
    try:
        # Setup Django
        django.setup()
        print("✅ Django setup successful!")
        
        # Start the development server
        execute_from_command_line(['manage.py', 'runserver', '127.0.0.1:8000'])
        
    except Exception as e:
        print(f"❌ Error starting Django server: {e}")
        import traceback
        traceback.print_exc()
