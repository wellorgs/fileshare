"""
LAN file drop. Run on both machines. Open http://<other-ip>:8000 in a
browser and drag files onto the page to send them there. Received files
land in ./received next to this script.

Usage: python lanshare.py [port]
"""
import http.server
import shutil
import socket
import sys
import urllib.parse
from pathlib import Path

CHUNK = 1024 * 1024  # 1 MB, keeps memory flat regardless of file size

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
RECV_DIR = Path(__file__).parent / "received"
RECV_DIR.mkdir(exist_ok=True)

PAGE_TEMPLATE = """<!doctype html><html><head><meta charset="utf-8">
<title>LAN Share</title>
<style>
body{font-family:sans-serif;max-width:640px;margin:40px auto;padding:0 16px}
#drop{border:3px dashed #888;border-radius:12px;padding:60px 20px;text-align:center;color:#555}
#drop.over{border-color:#08c;background:#eef8ff}
li{margin:4px 0}
.myurl{background:#f4f4f4;padding:10px 14px;border-radius:8px;font-family:monospace}
.connect{margin:20px 0;display:flex;gap:8px}
.connect input{flex:1;padding:8px;font-size:14px}
.connect button{padding:8px 14px}
</style></head><body>
<h2>LAN Share</h2>
<p>This machine's link (give it to the other person):<br>
<span class="myurl">http://__SELF_IP__:__PORT__</span></p>
<div class="connect">
  <input id="peer" placeholder="other device's IP, e.g. 192.168.1.42">
  <button onclick="goPeer()">Open their page</button>
</div>
<div id="drop">Drag files here to send</div>
<h3>Received files</h3>
<ul id="list"></ul>
<script>
function goPeer() {
  let ip = document.getElementById('peer').value.trim();
  if (!ip) return;
  if (!ip.includes(':')) ip += ':__PORT__';
  window.open('http://' + ip + '/', '_blank');
}
const drop = document.getElementById('drop');
['dragenter','dragover'].forEach(e => drop.addEventListener(e, ev => {
  ev.preventDefault(); drop.classList.add('over');
}));
['dragleave','drop'].forEach(e => drop.addEventListener(e, ev => {
  ev.preventDefault(); drop.classList.remove('over');
}));
drop.addEventListener('drop', async ev => {
  for (const file of ev.dataTransfer.files) {
    drop.textContent = 'Sending ' + file.name + '...';
    await fetch('/upload', {
      method: 'POST',
      headers: {'X-Filename': encodeURIComponent(file.name)},
      body: file
    });
  }
  drop.textContent = 'Drag files here to send';
  loadList();
});
async function loadList() {
  const res = await fetch('/list');
  const names = await res.json();
  const ul = document.getElementById('list');
  ul.innerHTML = names.length ? '' : '<li>(none yet)</li>';
  for (const n of names) {
    const li = document.createElement('li');
    li.innerHTML = '<a href="/received/' + encodeURIComponent(n) + '">' + n + '</a>';
    ul.appendChild(li);
  }
}
loadList();
</script></body></html>"""


class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/":
            page = PAGE_TEMPLATE.replace("__SELF_IP__", local_ip()).replace("__PORT__", str(PORT))
            body = page.encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        elif self.path == "/list":
            import json
            names = sorted(p.name for p in RECV_DIR.iterdir() if p.is_file())
            body = json.dumps(names).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        elif self.path.startswith("/received/"):
            name = urllib.parse.unquote(self.path[len("/received/"):])
            fp = RECV_DIR / name
            if ".." in name or not fp.is_file():
                self.send_error(404)
                return
            size = fp.stat().st_size
            self.send_response(200)
            self.send_header("Content-Type", "application/octet-stream")
            self.send_header("Content-Disposition", f'attachment; filename="{name}"')
            self.send_header("Content-Length", str(size))
            self.end_headers()
            with fp.open("rb") as f:
                shutil.copyfileobj(f, self.wfile, CHUNK)
        else:
            self.send_error(404)

    def do_POST(self):
        if self.path != "/upload":
            self.send_error(404)
            return
        name = urllib.parse.unquote(self.headers.get("X-Filename", "upload.bin"))
        name = Path(name).name  # strip any path components
        length = int(self.headers.get("Content-Length", 0))
        dest = RECV_DIR / name
        tmp = dest.with_suffix(dest.suffix + ".part")
        remaining = length
        with tmp.open("wb") as f:
            while remaining > 0:
                chunk = self.rfile.read(min(CHUNK, remaining))
                if not chunk:
                    break
                f.write(chunk)
                remaining -= len(chunk)
        tmp.rename(dest)
        print(f"received: {name} ({length} bytes)")
        self.send_response(200)
        self.end_headers()

    def log_message(self, fmt, *args):
        pass  # quiet


def local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        return s.getsockname()[0]
    except OSError:
        return "127.0.0.1"
    finally:
        s.close()


if __name__ == "__main__":
    ip = local_ip()
    print(f"LAN Share running. On the OTHER machine, open: http://{ip}:{PORT}")
    print(f"Received files saved to: {RECV_DIR}")
    http.server.ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
