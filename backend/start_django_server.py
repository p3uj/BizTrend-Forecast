#!/usr/bin/env python
"""Start Django server with proper configuration"""
import os
import sys
import subprocess

def start_server():
    # Set environment variables
    os.environ['DJANGO_SETTINGS_MODULE'] = 'auth.settings'
    
    # Change to backend directory
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(backend_dir)
    
    print(f"Starting Django server from: {backend_dir}")
    print("Setting DJANGO_SETTINGS_MODULE=auth.settings")
    
    # Start the server
    try:
        subprocess.run([
            sys.executable, 'manage.py', 'runserver', '127.0.0.1:8000'
        ], check=True)
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except Exception as e:
        print(f"Error starting server: {e}")

if __name__ == '__main__':
    start_server()
