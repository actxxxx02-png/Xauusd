export type Timeframe = "M1" | "M5" | "M15";
export type MatchStatus = "verified" | "unverified" | "unavailable";

export interface Quote {
  bid: number;
  ask: number;
  last?: number;
  spread: number;
  timestamp: string;
}
export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  closed: boolean;
}
export interface FeedStatus {
  provider: string;
  symbol: string;
  matchStatus: MatchStatus;
  note?: string;
}
export interface MarketSnapshot {
  schemaVersion: "1.0";
  capturedAt: string;
  source: FeedStatus;
  quote: Quote;
  candles: Record<Timeframe, Candle[]>;
}

export function validateSnapshot(value: unknown): value is MarketSnapshot {
  if (!value || typeof value !== "object") return false;
  const s = value as Partial<MarketSnapshot>;
  if (s.schemaVersion !== "1.0" || !s.source || !s.quote || !s.candles) return false;
  if (!["verified", "unverified", "unavailable"].includes(s.source.matchStatus)) return false;
  if (![s.quote.bid, s.quote.ask, s.quote.spread].every(Number.isFinite)) return false;
  if (s.quote.ask < s.quote.bid || s.quote.spread < 0 || !Number.isFinite(Date.parse(s.quote.timestamp))) return false;
  for (const tf of ["M1", "M5", "M15"] as const) {
    const bars = s.candles[tf];
    if (!Array.isArray(bars) || bars.length === 0) return false;
    for (const c of bars) {
      if (!Number.isFinite(Date.parse(c.time)) || ![c.open,c.high,c.low,c.close].every(Number.isFinite)) return false;
      if (c.high < Math.max(c.open,c.close,c.low) || c.low > Math.min(c.open,c.close,c.high)) return false;
    }
  }
  return Number.isFinite(Date.parse(s.capturedAt));
}
