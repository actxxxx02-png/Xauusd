import { useCallback, useEffect, useMemo, useState } from "react";
import { getMarketSnapshot } from "./lib/feed";
import { validateSnapshot, type MarketSnapshot, type Timeframe } from "./lib/schema";

const refreshMs = Math.max(1000, Number(import.meta.env.VITE_REFRESH_MS) || 2000);
const fmt = (n: number) => n.toFixed(2);
const fmtTime = (v: string) => new Date(v).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

function buildText(s: MarketSnapshot) {
  const lines = [
    "XAU/USD MARKET SNAPSHOT",
    `Captured: ${s.capturedAt}`,
    `Feed: ${s.source.provider} | Symbol: ${s.source.symbol}`,
    `Exness match: ${s.source.matchStatus.toUpperCase()}`,
    `Bid: ${s.quote.bid} | Ask: ${s.quote.ask} | Spread: ${s.quote.spread}`,
    `Quote time: ${s.quote.timestamp}`,
    "",
  ];
  for (const tf of ["M1", "M5", "M15"] as const) {
    lines.push(`[${tf} candles oldest → newest]`);
    for (const c of s.candles[tf]) lines.push(`${c.time} O:${c.open} H:${c.high} L:${c.low} C:${c.close} ${c.closed ? "CLOSED" : "LIVE"}`);
    lines.push("");
  }
  return lines.join("\n");
}

export default function App() {
  const [snapshot, setSnapshot] = useState<MarketSnapshot | null>(null);
  const [error, setError] = useState("Waiting for a verified Exness-matching feed");
  const [busy, setBusy] = useState(false);
  const [capturedAt, setCapturedAt] = useState<string | null>(null);
  const [copied, setCopied] = useState("");

  const refresh = useCallback(async (signal?: AbortSignal) => {
    try {
      const data = await getMarketSnapshot(signal);
      if (!validateSnapshot(data)) throw new Error("Feed returned invalid or incomplete market data");
      if (data.source.matchStatus !== "verified") throw new Error("Feed is not verified against Exness MT5. Live data is withheld.");
      if (Date.now() - Date.parse(data.quote.timestamp) > 5000) throw new Error("Feed is stale. Last quote is older than 5 seconds.");
      setSnapshot(data);
      setError("");
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError((e as Error).message || "Live feed unavailable");
      setSnapshot(null);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);
    const timer = window.setInterval(() => void refresh(controller.signal), refreshMs);
    return () => { controller.abort(); window.clearInterval(timer); };
  }, [refresh]);

  const copy = async (value: string, label: string) => {
    try { await navigator.clipboard.writeText(value); setCopied(label); window.setTimeout(() => setCopied(""), 1800); }
    catch { setCopied("Clipboard unavailable"); }
  };

  const capture = async () => {
    setBusy(true);
    await refresh();
    setCapturedAt(new Date().toISOString());
    setBusy(false);
  };

  const json = useMemo(() => snapshot ? JSON.stringify(snapshot, null, 2) : "", [snapshot]);
  const text = useMemo(() => snapshot ? buildText(snapshot) : "", [snapshot]);
  const timeframes: Timeframe[] = ["M1", "M5", "M15"];

  return <main className="shell">
    <header className="topbar"><div className="brand"><div className="brandMark">X</div><div><div className="brandName">XAUUSD <span>CAPTURE</span></div><div className="sub">MARKET DATA TERMINAL</div></div></div><div className="livePill"><i className={snapshot ? "dot good" : "dot"} />{snapshot ? "LIVE VERIFIED" : "FEED OFFLINE"}</div></header>
    <section className="hero"><div className="eyebrow">BROKER-MATCHED DATA · ONE TAP</div><h1>Replace the screenshot.</h1><p>Capture structured XAU/USD candles and send the exact data for analysis.</p>
      <div className="pricePanel"><div className="priceHead"><span>XAU/USD · GOLD</span><span className="muted">{snapshot ? `QUOTE · ${fmtTime(snapshot.quote.timestamp)}` : "AWAITING VERIFIED FEED"}</span></div><div className="price">{snapshot ? fmt(snapshot.quote.last ?? (snapshot.quote.bid + snapshot.quote.ask) / 2) : "— — —"}</div><div className="quoteGrid"><div><span>BID</span><strong>{snapshot ? fmt(snapshot.quote.bid) : "—"}</strong></div><div><span>ASK</span><strong>{snapshot ? fmt(snapshot.quote.ask) : "—"}</strong></div><div><span>SPREAD</span><strong>{snapshot ? fmt(snapshot.quote.spread) : "—"}</strong></div></div></div>
    </section>
    <section className={snapshot ? "statusBox ok" : "statusBox"}><div className="statusIcon">{snapshot ? "✓" : "!"}</div><div><strong>{snapshot ? "Exness feed verified" : "Exness-matching live feed not connected"}</strong><p>{snapshot ? `${snapshot.source.provider} · ${snapshot.source.symbol}` : error || "Configure an authorized Exness-matching backend feed. Generic prices are intentionally not used."}</p></div></section>
    <section className="dataSection"><div className="sectionTitle"><div><span className="eyebrow">CANDLE DATA</span><h2>Timeframes</h2></div><span className="tag">OHLC · UTC</span></div><div className="tfGrid">{timeframes.map(tf => <article className="tfCard" key={tf}><div className="tfHead"><b>{tf}</b><span>{snapshot ? `${snapshot.candles[tf].length} BARS` : "NO DATA"}</span></div>{snapshot ? <><div className="ohlc"><div><small>OPEN</small><b>{fmt(snapshot.candles[tf].at(-1)!.open)}</b></div><div><small>HIGH</small><b>{fmt(snapshot.candles[tf].at(-1)!.high)}</b></div><div><small>LOW</small><b>{fmt(snapshot.candles[tf].at(-1)!.low)}</b></div><div><small>CLOSE</small><b>{fmt(snapshot.candles[tf].at(-1)!.close)}</b></div></div><div className="candleTime">{snapshot.candles[tf].at(-1)!.time}</div></> : <div className="emptyBars"><span>—</span><span>—</span><span>—</span><span>—</span></div>}</article>)}</div></section>
    <section className="captureSection"><button className="captureBtn" onClick={capture} disabled={busy || !snapshot}>{busy ? "REFRESHING DATA…" : "↗  CAPTURE MARKET DATA"}</button><p className="hint">{snapshot ? "Captures the latest verified M1, M5 and M15 candles" : "Capture unlocks only when the Exness-matched live feed is verified"}</p>{capturedAt && <p className="captureTime">Last capture attempt · {fmtTime(capturedAt)}</p>}</section>
    <section className="exportSection"><div className="sectionTitle"><div><span className="eyebrow">SEND TO CHATGPT</span><h2>Export snapshot</h2></div><span className="tag">TEXT / JSON</span></div><div className="exportButtons"><button disabled={!snapshot} onClick={() => void copy(text, "Text copied")}>COPY ANALYSIS TEXT</button><button disabled={!snapshot} onClick={() => void copy(json, "JSON copied")}>COPY JSON</button><button disabled={!snapshot} onClick={() => { const blob = new Blob([json], {type:"application/json"}); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `xauusd-${new Date().toISOString().replaceAll(":","-")}.json`; a.click(); URL.revokeObjectURL(url); }}>DOWNLOAD</button><button disabled={!snapshot || !navigator.share} onClick={() => snapshot && void navigator.share({title:"XAU/USD Market Snapshot",text})}>SHARE</button></div>{copied && <p className="copyNotice">{copied}</p>}</section>
    <footer><span>NO TRADING · NO SIGNALS · READ-ONLY</span><span>REFRESH {refreshMs / 1000}s</span></footer>
  </main>;
}
