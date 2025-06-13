#!/usr/bin/env python
"""Start Django development server with correct settings"""
import os
import sys
import django
from django.core.management import execute_from_command_line

if __name__ == '__main__':
    # Set the correct settings module
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'auth.settings')
    
    # Add current directory to Python path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    if current_dir not in sys.path:
        sys.path.insert(0, current_dir)
    
    # Start the server
    execute_from_command_line(['manage.py', 'runserver', '8000'])
