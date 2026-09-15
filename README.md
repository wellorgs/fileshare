# FileShare — free peer-to-peer file transfer, no app, no upload, no size limit

**[wellorgs.github.io/fileshare](https://wellorgs.github.io/fileshare/)** — an AirDrop / Nearby Share alternative that works in any browser, on any OS, on the same WiFi or across the internet. Open the page on two devices, connect with a 6-digit code or QR, drag a file over. Nothing is ever uploaded anywhere — files go straight device-to-device over WebRTC, end-to-end encrypted.

Useful for: sending files between Windows, Mac, Linux, iPhone, iPad, and Android without installing anything; sending large files (video, ISOs, zipped folders) without a cloud upload/download round trip or a file-size cap; transferring files between a phone and a laptop on different networks; a quick, private, no-signup alternative to email attachments, USB drives, or cloud storage links.

## Quick start

1. Open **https://wellorgs.github.io/fileshare/** on both devices — nothing to install.
2. On device A, click **Create room** — you get a 6-digit code and a QR code.
3. On device B, either scan the QR or type the code under **Join a room**, click **Connect**.
4. Drag files onto the drop zone (or click it to browse), pick who to send to, hit **Send**.

Works across different WiFi networks, mobile data, or entirely different locations — it tries a direct connection first and automatically falls back through a relay if the two devices can't reach each other directly. The only case it can't get around is a network that blocks WebRTC outright (some locked-down corporate firewalls).

## Features

- **Direct P2P transfer, end-to-end encrypted** — WebRTC data channels, DTLS-encrypted by default. No file ever touches a server; the room code is only used to set up the connection.
- **Works on any network** — same WiFi/LAN goes direct; different networks fall back through a TURN relay automatically, no VPN or port forwarding needed.
- **Room code + QR join** — no accounts, no pairing dance.
- **Multi-device rooms** — a host sees every joined device; click one to target it, or hit **All** to broadcast a send to every connected device at once.
- **Folders** — drag a folder in, or pick one from the file picker's dropdown; the whole structure sends natively and lands back in the same folder layout, no zip step either side.
- **Checksum-verified transfers** — every file is SHA-256 hashed on send and rechecked on receipt, with a visible verified/mismatch badge, so silent corruption doesn't slip through.
- **Resumable transfers** — if a connection drops mid-file, it picks back up from the exact byte the receiver actually has as soon as the device reconnects, no restart from zero.
- **Live speed + ETA** on every in-flight transfer.
- **Re-send** a past file from History in one click, no re-picking it from disk.
- **Watch folder auto-sync** (Chrome/Edge) — point it at a folder (e.g. a camera-roll/downloads dump) and new files sync automatically to your selected device(s).
- **Device avatars, names, and status** (Available/Busy/Do Not Disturb), synced live across connected devices.
- **Flash to identify** — can't tell which physical device is "Swift Falcon"? One click makes its screen flash.
- **Light/dark theme**, no page reload.

## Alternative: local network script (`lanshare.py`)

A zero-dependency Python fallback for large multi-GB transfers on the same WiFi, streaming to disk in chunks instead of buffering in the browser:

```bash
python lanshare.py
```

See the script's own printed instructions for the rest — open the printed URL on both machines and drag files onto the other device's page.

## Privacy

No accounts, no analytics, no server-side storage. The only third party involved is a public WebRTC signaling broker (to match the room code to a connection) and, when a direct connection isn't possible, a public TURN relay (which only ever sees already-encrypted traffic, the same as any VPN or corporate proxy). Closing the tab ends the session; nothing persists anywhere but your own browser's local storage (your device name, avatar, and theme preference).

---

**Keywords:** file sharing, airdrop for windows, airdrop alternative, nearby share alternative, peer to peer file transfer, p2p file sharing, webrtc file transfer, send files between devices, cross platform file sharing, no upload file transfer, no cloud file sharing, private file transfer, secure file transfer, LAN file sharing, local network file sharing, large file transfer, send large files free, quick share alternative, share files between phone and pc, wireless file transfer, browser based file sharing, no size limit file transfer, direct device to device transfer, offline file transfer, cross network file transfer.
