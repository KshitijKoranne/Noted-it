# Noted It

A notes app in the spirit of Google Keep that keeps your notes on your own device. Notes, checklists, drawings, voice notes, reminders, labels, and colours. No account needed.

## Run it

It's one HTML file. Open `index.html` in a browser, or serve the folder from any static host (Vercel, Netlify, Nginx, Coolify). Serve it over HTTPS if you want it to install and work offline.

## What's inside

- `index.html` – the whole app (no build step, no dependencies)
- `sw.js` – offline cache
- `manifest.webmanifest` + icons – install to home screen, "New note" and "New list" shortcuts

## Privacy

Notes live in the browser (IndexedDB). The app makes no network calls. The one exception is "Grab image text", which downloads its text reader when you use it. Locked notes are encrypted with AES-256-GCM using a key derived from your PIN (PBKDF2, 600,000 rounds).

## Contributing

Pull requests are welcome. Contributors need to sign a CLA, because the same code is also used in the closed-source iPhone app.

## License

AGPL-3.0. See `LICENSE`.
