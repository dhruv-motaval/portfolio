"""Live-reload dev server for the portfolio.

Serves the repo directory; injects a tiny polling snippet into index.html that
checks /__version every 1s and reloads the tab only when the file CONTENT
actually changes (hash-based, immune to OneDrive/sync mtime touches).
"""
import hashlib
import http.server
import os
import socketserver
import threading
import time

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = 8765
state = {"version": 0}
lock = threading.Lock()

SNIPPET = (
    "<script>(function(){var v=null;setInterval(function(){"
    "fetch('/__version',{cache:'no-store'}).then(function(r){return r.text()})"
    ".then(function(t){var n=parseInt(t,10);"
    "if(v!==null&&n>v){location.reload();}"
    "v=n;}).catch(function(){});},1000);})();</script>"
)


def file_hash(path):
    try:
        with open(path, "rb") as f:
            return hashlib.sha256(f.read()).hexdigest()
    except OSError:
        return None


def watch():
    last = file_hash(os.path.join(ROOT, "index.html"))
    while True:
        time.sleep(1.0)
        h = file_hash(os.path.join(ROOT, "index.html"))
        if h is not None and h != last:
            with lock:
                state["version"] += 1
            last = h


class LiveHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_GET(self):
        path = self.path.split("?")[0]
        if path == "/__version":
            with lock:
                body = str(state["version"]).encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if path in ("/", "/index.html"):
            try:
                html = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
            except OSError:
                self.send_error(404)
                return
            html = html.replace("</body>", SNIPPET + "</body>")
            body = html.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)
            return
        super().do_GET()

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    threading.Thread(target=watch, daemon=True).start()
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    with socketserver.ThreadingTCPServer(("127.0.0.1", PORT), LiveHandler) as httpd:
        print(f"live-reload server on http://127.0.0.1:{PORT}")
        httpd.serve_forever()
