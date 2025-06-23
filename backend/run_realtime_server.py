#!/usr/bin/env python
"""
Script to run Django with ASGI support using Daphne for real-time WebSocket functionality.
"""
import os
import sys
import django
from django.core.management import execute_from_command_line

if __name__ == '__main__':
    # Set the Django settings module
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'auth.settings')
    
    # Setup Django
    django.setup()
    
    # Import and run Daphne
    from daphne.cli import CommandLineInterface
    
    # Run Daphne with the ASGI application
    sys.argv = [
        'daphne',
        '-b', '127.0.0.1',
        '-p', '8000',
        'auth.asgi:application'
    ]
    
    CommandLineInterface.entrypoint()
