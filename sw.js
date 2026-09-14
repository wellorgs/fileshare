// Streams incoming WebRTC file chunks straight into a normal browser
// download, so the page never buffers the whole file in memory.
// Used as the fallback when the File System Access API isn't available
// (Firefox, Safari, mobile browsers).
const streams = {};

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('message', (e) => {
  const msg = e.data;
  if (msg.type !== 'stream-start') return;
  const port = e.ports[0];
  let controllerRef;
  const stream = new ReadableStream({
    start(controller) { controllerRef = controller; }
  });
  streams[msg.id] = { stream, filename: msg.filename, size: msg.size };
  port.onmessage = (ev) => {
    const d = ev.data;
    if (d.type === 'chunk') controllerRef.enqueue(new Uint8Array(d.buffer));
    else if (d.type === 'end') controllerRef.close();
  };
  self.clients.matchAll().then(list => list.forEach(c => c.postMessage({ type: 'stream-ready', id: msg.id })));
});

self.addEventListener('fetch', (e) => {
  const m = new URL(e.request.url).pathname.match(/\/__download__\/([^/]+)$/);
  if (!m) return;
  const entry = streams[m[1]];
  if (!entry) { e.respondWith(new Response('not found', { status: 404 })); return; }
  delete streams[m[1]];
  e.respondWith(new Response(entry.stream, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': "attachment; filename=\"" + entry.filename.replace(/"/g, '') + "\"",
      'Content-Length': String(entry.size)
    }
  }));
});
