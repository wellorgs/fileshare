# fileshare-local

Drag-and-drop file transfer between two computers on the same WiFi/LAN. No accounts, no cloud, no dependencies — just Python's standard library.

## Run it

On **both** machines (needs Python 3):

```bash
python lanshare.py
```

It prints something like:

```
LAN Share running. On the OTHER machine, open: http://192.168.1.42:8000
```

## Use it

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
