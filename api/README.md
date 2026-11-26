# Market data API

`GET /api/market/snapshot` is the browser contract. The included serverless route returns HTTP 503 until a verified, authorized Exness-matching adapter is configured.

## Non-negotiable feed rules
- Do not substitute generic XAU/USD CFD quotes for Exness.
- Do not present delayed quotes as live.
- Do not set `matchStatus: verified` until synchronized comparison to the user's Exness MT5 XAUUSD symbol validates bid, ask, spread, precision, timestamps and M1/M5/M15 candle boundaries over representative market sessions.
- Keep provider credentials server-side. Never ask for or store Exness trading passwords.
- Use UTC ISO-8601 timestamps, chronological candles, explicit closed flags and at least 30 bars per timeframe.

## Deploy
Import this repository into Vercel, keep the root directory selected, and deploy. The UI and endpoint are included. Until a verified feed is connected, the app correctly reports Feed Offline.

## Why HTTP 503
No authorized Exness feed integration or credentials were provided. The app deliberately fails closed rather than inventing prices.
