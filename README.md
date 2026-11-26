# XAUUSD Live Capture

A lightweight, mobile-first market-data capture app for XAU/USD. Its purpose is to replace chart screenshots with a structured, timestamped snapshot you can paste into ChatGPT.

## What it does

- Shows the active feed status and latest quote (bid, ask, spread, source, timestamp).
- Captures M1, M5 and M15 OHLC candle data with timestamps and closed/in-progress state.
- One-tap capture, copy as readable text, copy JSON, and share/export.
- Rejects stale, missing or malformed data. No simulated prices are ever presented as live.
- Does not place trades, request broker passwords, or calculate signals.

## Important: Exness feed matching

The app deliberately ships with the Exness feed adapter **unconfigured**. A generic XAU/USD provider is not an acceptable silent fallback: gold CFD quotes can differ by broker, and a feed cannot be called Exness-matched until it has been validated against the user's Exness MT5 symbol and candle history.

To connect an approved Exness-matching feed, implement the backend contract in `src/lib/feed.ts` and configure the server endpoint. Do not put provider secrets in browser code. Do not ask users for Exness account passwords. If an officially supported read-only API or authenticated quote bridge is not available, the app must report that live Exness-matched data is unavailable.

## Run locally

Requires Node.js 20+.

```bash
npm install
npm run dev
``

Open the local URL in a phone browser. To build: `npm run build`.

## Feed contract

The client reads `GET /api/market/snapshot`. The response schema is in `src/lib/schema.ts`. All timestamps are ISO-8601 UTC. Candle arrays are chronological (oldest first), and each timeframe includes enough history for context (default 30 bars). The server must set `source.matchStatus` to `verified` only after comparison against Exness MT5 for the same symbol, session and timestamps.

## Configuration

- `VITE_REFRESH_MS`: polling interval (default 2000 ms; this only refreshes a configured feed, it does not make a delayed provider live).
- Backend/provider secrets belong in server-side environment variables only.

## Current implementation status

The UI, typed snapshot contract, validation, capture/export, and an explicit unconfigured feed state are implemented. A verified Exness-matching live provider is not bundled because no authorized feed credentials or confirmed integration have been supplied. The app will not invent one or pretend a public generic feed matches Exness.
