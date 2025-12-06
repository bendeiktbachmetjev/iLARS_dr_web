#!/usr/bin/env python3
"""
Simple HTTP server for static files (Railway deployment)
"""
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse

class StaticHandler(SimpleHTTPRequestHandler):
    """Handler for static files with SPA routing support"""
    
    def __init__(self, *args, **kwargs):
        self.directory = os.path.dirname(os.path.abspath(__file__))
        super().__init__(*args, **kwargs)
    
    def translate_path(self, path):
        """Translate URL path to file system path"""
        path = urlparse(path).path
        path = path.lstrip('/')
        
        # If path is empty or doesn't exist, serve index.html (SPA routing)
        if not path or path == '/':
            return os.path.join(self.directory, 'index.html')
        
        file_path = os.path.join(self.directory, path)
        
        # If file doesn't exist, serve index.html (for SPA client-side routing)
        if not os.path.exists(file_path) or os.path.isdir(file_path):
            return os.path.join(self.directory, 'index.html')
        
        return file_path
    
    def end_headers(self):
        # Add headers for better caching and CORS
        if self.path.endswith('.html'):
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
        else:
            # Cache static assets
            self.send_header('Cache-Control', 'public, max-age=31536000')
        super().end_headers()
    
    def log_message(self, format, *args):
        """Override to reduce log noise"""
        pass

def main():
    port = int(os.environ.get('PORT', 8000))
    host = os.environ.get('HOST', '0.0.0.0')
    
    server = HTTPServer((host, port), StaticHandler)
    print(f"Server running on http://{host}:{port}")
    server.serve_forever()

if __name__ == '__main__':
    main()

