import type { VercelRequest, VercelResponse } from "@vercel/node";

/** Fail-closed endpoint: never fabricate or substitute market data. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  return res.status(503).json({
    error: "EXNESS_MATCHED_FEED_NOT_CONFIGURED",
    message: "No verified Exness-matching live feed is configured. No substitute quote will be returned.",
    source: { provider: "unconfigured", symbol: "XAUUSD", matchStatus: "unavailable" },
    timestamp: new Date().toISOString()
  });
}
