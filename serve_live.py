"""Live-reload dev server for the portfolio.

Serves the repo directory; injects a tiny polling snippet into index.html that
checks /__version every 600ms and reloads the tab when index.html changes.
"""
import http.server
import os
import socketserver
import threading
import time

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = 8765
state = {"version": 0}

SNIPPET = (
    "<script>(function(){var v=0;setInterval(function(){"
    "fetch('/__version',{cache:'no-store'}).then(function(r){return r.text()})"
    ".then(function(t){var n=parseInt(t,10);if(v&&n>v)location.reload();v=n;})"
    ".catch(function(){});},600);})();</script>"
)


def watch():
    last = None
    while True:
        try:
            m = os.path.getmtime(os.path.join(ROOT, "index.html"))
            if last is not None and m != last:
                state["version"] += 1
            last = m
        except OSError:
            pass
        time.sleep(0.4)


class LiveHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_GET(self):
        path = self.path.split("?")[0]
        if path == "/__version":
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
