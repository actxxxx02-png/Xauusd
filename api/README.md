# Backend contract

Implement a server-side `GET /api/market/snapshot` endpoint. Keep provider credentials on the server. Never ship them in Vite variables or browser bundles.

Return HTTP 503 until a live, authorized Exness-matching feed is configured. Do not fall back to another broker or a delayed quote.

Successful response: see `src/lib/schema.ts`. `source.matchStatus` must remain `unverified` until the data has been compared to Exness MT5 for the exact XAUUSD symbol at synchronized timestamps over representative market sessions. Check bid/ask, spread, price precision, OHLC alignment, session gaps, and timezones. Only then set it to `verified`.

The client refuses to display data unless the quote is newer than five seconds and matchStatus is verified. Candle data should contain at least 30 chronological bars for each timeframe, with correct UTC timestamps and a closed flag. No fabricated, extrapolated, or interpolated candles.
