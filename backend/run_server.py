#!/usr/bin/env python
"""Run Django development server"""
import os
import sys
import django
from django.core.management import execute_from_command_line

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'auth.settings')
    execute_from_command_line(['manage.py', 'runserver', '8000'])
