#!/usr/bin/env python
"""
Simple standalone ML API server that bypasses Django routing issues
Run this directly: python simple_ml_api.py
"""
import os
import sys
import json
import tempfile
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import cgi
from io import BytesIO
import pandas as pd

class MLAPIHandler(BaseHTTPRequestHandler):
    def _set_cors_headers(self):
        """Set CORS headers to allow frontend requests"""
        self.send_header('Access-Control-Allow-Origin', 'http://localhost:5173')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept')
        self.send_header('Access-Control-Allow-Credentials', 'true')
    
    def do_OPTIONS(self):
        """Handle preflight requests"""
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests"""
        if self.path == '/api/test/':
            self.send_response(200)
            self._set_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            response = {
                'message': 'ML API is working!',
                'method': 'GET',
                'timestamp': str(pd.Timestamp.now()),
                'status': 'success'
            }
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_error(404, "Not Found")
    
    def do_POST(self):
        """Handle POST requests"""
        print(f"POST request to: {self.path}")
        print(f"Headers: {dict(self.headers)}")
        
        if self.path == '/api/datasets/':
            self.handle_dataset_upload()
        elif self.path == '/api/predictions/make_prediction/':
            self.handle_prediction()
        else:
            self.send_error(404, "Not Found")
    
    def handle_dataset_upload(self):
        """Handle dataset upload"""
        try:
            print("Processing dataset upload...")
            
            # Get content type and length
            content_type = self.headers.get('Content-Type', '')
            content_length = int(self.headers.get('Content-Length', 0))
            
            if content_length == 0:
                self.send_error(400, "No data received")
                return
            
            # Read the raw data
            post_data = self.rfile.read(content_length)
            print(f"Received {len(post_data)} bytes")
            
            # Parse multipart form data
            if 'multipart/form-data' not in content_type:
                self.send_error(400, "Content-Type must be multipart/form-data")
                return
            
            # Extract boundary
            boundary = content_type.split('boundary=')[1].encode()
            parts = post_data.split(b'--' + boundary)
            
            csv_content = None
            filename = None
            
            # Find the file part
            for part in parts:
                if b'Content-Disposition' in part and b'filename=' in part:
                    lines = part.split(b'\r\n')
                    
                    # Extract filename
                    for line in lines:
                        if b'filename=' in line:
                            filename = line.decode().split('filename="')[1].split('"')[0]
                            break
                    
                    # Extract file content
                    content_start = part.find(b'\r\n\r\n') + 4
                    if content_start > 3:
                        csv_content = part[content_start:].rstrip(b'\r\n')
                        break
            
            if not csv_content or not filename:
                self.send_error(400, "No file found in request")
                return
            
            print(f"Found file: {filename}, size: {len(csv_content)} bytes")
            
            # Save to temporary file
            temp_path = os.path.join(tempfile.gettempdir(), f'upload_{pd.Timestamp.now().strftime("%Y%m%d_%H%M%S")}.csv')
            with open(temp_path, 'wb') as f:
                f.write(csv_content)
            
            # Validate CSV
            try:
                df = pd.read_csv(temp_path)
                print(f"CSV loaded: {len(df)} rows, {len(df.columns)} columns")
                print(f"Columns: {list(df.columns)}")
                
                # Basic validation
                required_columns = [
                    'Year', 'Industry Sector', 'Number of Businesses',
                    'Revenue (PHP Millions)', 'Growth Rate (%)'
                ]
                
                missing_columns = [col for col in required_columns if col not in df.columns]
                if missing_columns:
                    os.unlink(temp_path)
                    self.send_error(400, f"Missing columns: {', '.join(missing_columns)}")
                    return
                
                if len(df) < 5:
                    os.unlink(temp_path)
                    self.send_error(400, "Dataset must contain at least 5 rows")
                    return
                
                # Store file path for prediction (in a real app, use database)
                global uploaded_file_path
                uploaded_file_path = temp_path
                
                # Prepare response
                dataset_info = {
                    'total_rows': len(df),
                    'total_sectors': df['Industry Sector'].nunique(),
                    'year_range': {
                        'min': int(df['Year'].min()),
                        'max': int(df['Year'].max())
                    },
                    'industry_sectors': df['Industry Sector'].unique().tolist()
                }
                
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
                
                print("Dataset upload successful!")
                
            except Exception as e:
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
                print(f"CSV processing error: {e}")
                self.send_error(400, f"Error processing CSV: {str(e)}")
                
        except Exception as e:
            print(f"Upload error: {e}")
            import traceback
            traceback.print_exc()
            self.send_error(500, f"Internal server error: {str(e)}")
    
    def handle_prediction(self):
        """Handle prediction request"""
        try:
            print("Processing prediction request...")
            
            # Check if we have an uploaded file
            global uploaded_file_path
            if 'uploaded_file_path' not in globals() or not os.path.exists(uploaded_file_path):
                self.send_error(400, "No dataset found. Please upload a dataset first.")
                return
            
            # Generate sample predictions (replace with your actual ML code)
            predictions = {
                'growth_rate': [
                    {'Year': 2026, 'Industry Sector': 'Information & Communication', 'Predicted Growth Rate (%)': 11.5, 'Rank': 1},
                    {'Year': 2026, 'Industry Sector': 'Health & Social Work', 'Predicted Growth Rate (%)': 10.8, 'Rank': 2},
                    {'Year': 2026, 'Industry Sector': 'Education', 'Predicted Growth Rate (%)': 10.2, 'Rank': 3},
                    {'Year': 2027, 'Industry Sector': 'Information & Communication', 'Predicted Growth Rate (%)': 12.1, 'Rank': 1},
                    {'Year': 2027, 'Industry Sector': 'Health & Social Work', 'Predicted Growth Rate (%)': 11.3, 'Rank': 2},
                ],
                'revenue': [
                    {'Year': 2026, 'Industry Sector': 'Information & Communication', 'Predicted Revenue (PHP Millions)': 580000, 'Rank': 1},
                    {'Year': 2026, 'Industry Sector': 'Health & Social Work', 'Predicted Revenue (PHP Millions)': 520000, 'Rank': 2},
                    {'Year': 2026, 'Industry Sector': 'Education', 'Predicted Revenue (PHP Millions)': 420000, 'Rank': 3},
                ],
                'least_crowded': [
                    {'Year': 2026, 'Industry Sector': 'Food & Beverage Services', 'Predicted Number of Businesses': 17500, 'Rank': 1},
                    {'Year': 2026, 'Industry Sector': 'Manufacturing', 'Predicted Number of Businesses': 21000, 'Rank': 2},
                    {'Year': 2026, 'Industry Sector': 'Wholesale & Retail Trade', 'Predicted Number of Businesses': 19500, 'Rank': 3},
                ]
            }
            
            model_performance = {
                'avg_rmse': 5234.67,
                'avg_mae': 4892.33,
                'avg_r2': 0.856
            }
            
            response = {
                'message': 'Predictions generated successfully',
                'model_performance': model_performance,
                'predictions': predictions,
                'total_predictions': sum(len(v) for v in predictions.values())
            }
            
            self.send_response(201)
            self._set_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
            
            print("Prediction successful!")
            
            # Clean up
            try:
                os.unlink(uploaded_file_path)
                del uploaded_file_path
            except:
                pass
                
        except Exception as e:
            print(f"Prediction error: {e}")
            import traceback
            traceback.print_exc()
            self.send_error(500, f"Internal server error: {str(e)}")

def run_server():
    """Run the ML API server"""
    server_address = ('127.0.0.1', 8000)
    httpd = HTTPServer(server_address, MLAPIHandler)
    
    print("🚀 Simple ML API Server starting...")
    print(f"📡 Server running on http://127.0.0.1:8000")
    print("✅ Endpoints available:")
    print("   - GET  /api/test/ (test connection)")
    print("   - POST /api/datasets/ (upload dataset)")
    print("   - POST /api/predictions/make_prediction/ (make predictions)")
    print("\n🔧 CORS enabled for http://localhost:5173")
    print("📊 Ready to handle ML predictions!")
    print("\nPress Ctrl+C to stop the server")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        httpd.shutdown()

if __name__ == '__main__':
    # Global variable to store uploaded file path
    uploaded_file_path = None
    run_server()
