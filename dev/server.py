#!/usr/bin/env python3
"""개발용 정적 서버 (캐시 끔). 실행: python3 dev/server.py  →  http://localhost:8404"""
import http.server, os, sys

class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, max-age=0')
        super().end_headers()
    def log_message(self, *a):
        pass

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
port = int(sys.argv[1]) if len(sys.argv) > 1 else 8404
http.server.ThreadingHTTPServer(('127.0.0.1', port), H).serve_forever()
