# XAUUSD Live Capture

A lightweight mobile-first app that replaces chart screenshots with structured XAU/USD data for ChatGPT analysis.

## Included
- Mobile-friendly React/Vite interface.
- Bid, ask, spread, source and quote timestamp display.
- M1, M5 and M15 OHLC capture schema.
- One-tap capture, text export, JSON copy, download and native share.
- Quote freshness and candle integrity validation.
- Fail-closed serverless API endpoint and GitHub Actions build workflow.

## Exness match is mandatory
This project does not silently use generic XAU/USD prices. The included API returns HTTP 503 until an authorized live source has been validated against the exact Exness MT5 XAUUSD symbol. Validation must cover synchronized bid/ask, spread, precision, timestamps and M1/M5/M15 candle boundaries.

Never store broker passwords. Keep provider credentials server-side only.

## Run
Requires Node.js 20+:

```bash
npm install
npm run dev
npm run build
```

## Deploy
Import this GitHub repository in Vercel, use the repository root and deploy. Until the feed is configured, the app shows Feed Offline and will not provide fabricated market data.

## Remaining dependency
A verified Exness-matching live feed is not configured. A generic public quote API is not an acceptable substitute. The adapter can only be completed once a supported authorized Exness feed path is available.
