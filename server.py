#!/usr/bin/env python3
"""
Simple HTTP server for static files (Railway deployment)
"""
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

class StaticHandler(SimpleHTTPRequestHandler):
    """Handler for static files with SPA routing support"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.path.dirname(__file__), **kwargs)
    
    def end_headers(self):
        # Add CORS headers if needed
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
    
    def do_GET(self):
        # Handle SPA routing - serve index.html for all routes
        if self.path == '/' or not Path(self.path[1:]).exists():
            self.path = '/index.html'
        return super().do_GET()

def main():
    port = int(os.environ.get('PORT', 8000))
    host = os.environ.get('HOST', '0.0.0.0')
    
    server = HTTPServer((host, port), StaticHandler)
    print(f"Server running on http://{host}:{port}")
    server.serve_forever()

if __name__ == '__main__':
    main()

