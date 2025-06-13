#!/usr/bin/env python
"""Simple API server for testing ML integration"""
import os
import sys
import django
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import cgi
from io import BytesIO

# Setup Django
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'auth.settings')
django.setup()

from ml_service.ml_predictor import BusinessTrendPredictor
from ml_service.data_processor import DataProcessor

class APIHandler(BaseHTTPRequestHandler):
    def _set_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    def do_OPTIONS(self):
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()
    
    def do_POST(self):
        if self.path == '/api/datasets/':
            self.handle_dataset_upload()
        elif self.path == '/api/predictions/make_prediction/':
            self.handle_prediction()
        else:
            self.send_error(404, "Not Found")
    
    def handle_dataset_upload(self):
        try:
            # Parse multipart form data
            content_type = self.headers.get('Content-Type')
            if not content_type or 'multipart/form-data' not in content_type:
                self.send_error(400, "Invalid content type")
                return
            
            # Get content length
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            # Parse the multipart data
            boundary = content_type.split('boundary=')[1].encode()
            parts = post_data.split(b'--' + boundary)
            
            csv_content = None
            filename = None
            
            for part in parts:
                if b'Content-Disposition' in part and b'filename=' in part:
                    # Extract filename
                    lines = part.split(b'\r\n')
                    for line in lines:
                        if b'filename=' in line:
                            filename = line.decode().split('filename="')[1].split('"')[0]
                            break
                    
                    # Extract CSV content
                    content_start = part.find(b'\r\n\r\n') + 4
                    if content_start > 3:
                        csv_content = part[content_start:].rstrip(b'\r\n')
            
            if not csv_content or not filename:
                self.send_error(400, "No file uploaded")
                return
            
            # Save temporary file
            temp_path = os.path.join(current_dir, 'temp_upload.csv')
            with open(temp_path, 'wb') as f:
                f.write(csv_content)
            
            # Validate and process
            processor = DataProcessor()
            is_valid, message = processor.validate_csv_file(temp_path)
            
            if not is_valid:
                os.remove(temp_path)
                self.send_error(400, message)
                return
            
            # Get dataset info
            dataset_info = processor.get_dataset_info(temp_path)
            
            # Create response
            response = {
                'dataset': {
                    'id': 1,
                    'filename': filename,
                    'total_rows': dataset_info['total_rows'],
                    'total_sectors': dataset_info['total_sectors'],
                    'year_min': dataset_info['year_range']['min'],
                    'year_max': dataset_info['year_range']['max']
                },
                'info': dataset_info,
                'message': 'Dataset uploaded successfully'
            }
            
            self.send_response(201)
            self._set_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            print(f"Error in dataset upload: {e}")
            import traceback
            traceback.print_exc()
            self.send_error(500, str(e))
    
    def handle_prediction(self):
        try:
            # Read JSON data
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode())
            
            dataset_id = data.get('dataset_id')
            if not dataset_id:
                self.send_error(400, "Dataset ID required")
                return
            
            # Use the temporary file
            temp_path = os.path.join(current_dir, 'temp_upload.csv')
            if not os.path.exists(temp_path):
                self.send_error(404, "Dataset not found")
                return
            
            # Initialize predictor and make predictions
            predictor = BusinessTrendPredictor()
            
            if not predictor.load_and_prepare_data(temp_path):
                self.send_error(400, "Failed to load dataset")
                return
            
            performance = predictor.train_models()
            if not performance:
                self.send_error(500, "Failed to train models")
                return
            
            predictions = predictor.make_predictions()
            if not predictions:
                self.send_error(500, "Failed to make predictions")
                return
            
            response = {
                'message': 'Predictions generated successfully',
                'model_performance': performance,
                'predictions': predictions,
                'total_predictions': sum(len(v) for v in predictions.values())
            }
            
            self.send_response(201)
            self._set_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            print(f"Error in prediction: {e}")
            import traceback
            traceback.print_exc()
            self.send_error(500, str(e))

def run_server():
    server_address = ('127.0.0.1', 8000)
    httpd = HTTPServer(server_address, APIHandler)
    print(f"🚀 Simple API Server running on http://127.0.0.1:8000")
    print("✅ Ready to handle ML predictions!")
    print("📊 Endpoints available:")
    print("   - POST /api/datasets/ (file upload)")
    print("   - POST /api/predictions/make_prediction/ (ML predictions)")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
        httpd.shutdown()

if __name__ == '__main__':
    run_server()
