import type { MarketSnapshot } from "./schema";

/**
 * Server contract only. Provider credentials must never be placed in this client.
 * The API should return data from an authorized source verified against Exness MT5.
 */
export async function getMarketSnapshot(signal?: AbortSignal): Promise<MarketSnapshot> {
  const response = await fetch("/api/market/snapshot", {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal,
  });
  if (!response.ok) throw new Error(response.status === 503 ? "Exness-matching feed is not configured" : `Feed request failed (${response.status})`);
  return response.json() as Promise<MarketSnapshot>;
}
