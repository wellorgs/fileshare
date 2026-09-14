# fileshare-local

Two ways to send files directly between two computers, no cloud storage involved.

## Option A — hosted page, works over WiFi or the internet

Open **https://wellorgs.github.io/fileshare-local/** on both devices.

1. On device 1, click **Create room** — it shows a 6-digit code.
2. On device 2, type that code under **Option B: Join with a code**, click **Connect**.
3. Once status says "connected" on both, drag a file onto either page to send it to the other — it downloads straight there.

This uses WebRTC: once connected, files go directly browser-to-browser (peer-to-peer). The 6-digit code is just a room name on a free public signaling broker used to set up that connection; GitHub never sees your files, and neither does the broker. Works on any network, including different WiFi networks, as long as neither side is behind strict corporate NAT (in which case use Option B).

## Option B — local script, same WiFi only, zero setup friction

On **both** machines (needs Python 3):

```bash
python lanshare.py
```

It prints something like:

```
LAN Share running. On the OTHER machine, open: http://192.168.1.42:8000
```

1. Open `http://<your-own-ip>:8000` in your browser (the URL printed above, or shown at the top of the page).
2. Tell the other person your IP, or type theirs into the "other device's IP" box and click **Open their page** — it opens their page in a new tab.
3. Drag a file onto the drop zone on **their** page to send it to them. Works the other way too — whoever's page you're dragging onto is who receives the file.
4. Received files show up under **Received files** on that machine (clickable to download), and are saved to a `received/` folder next to the script.

Works for large files (multi-GB) — both upload and download stream in 1MB chunks, so memory use stays flat regardless of file size.

## Notes

- Both machines must be on the same network and able to reach each other (same WiFi; some public/guest WiFi networks block device-to-device traffic).
- No authentication — anyone on your network who has the URL can upload/download. Fine for a home/office LAN, not for open networks.
- Default port is 8000. Change it with `python lanshare.py 9000`.
- If Windows Firewall prompts on first run, allow access on private networks.
