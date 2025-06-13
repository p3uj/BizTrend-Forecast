#!/usr/bin/env python
"""Simple Django server runner"""
import os
import sys
import django
from django.core.management import execute_from_command_line

if __name__ == '__main__':
    # Set the settings module
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'auth.settings')
    
    # Setup Django
    django.setup()
    
    # Run the server
    execute_from_command_line(['manage.py', 'runserver', '127.0.0.1:8000'])
