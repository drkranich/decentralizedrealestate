import { useEffect, useState } from "react";

// Live market data for the Investor Terminal — no API key required.
// FX (EUR/GBP/BRL vs USD): Frankfurter (ECB reference rates).
// Crypto + gold proxy (BTC, PAX Gold): CoinGecko.

export type TickerItem = { sym: string; price: number; changePct: number };

export type LiveFx = { EUR: number; GBP: number; BRL: number; BTC: number; ETH: number };
export type LiveChanges = Partial<Record<"EUR" | "GBP" | "BRL" | "BTC" | "ETH", number>>;

type MarketState = {
  ticker: TickerItem[];
  fx: LiveFx | null;
  changes: LiveChanges;
  loading: boolean;
  error: string | null;
  updatedAt: Date | null;
};

const FX_ENDPOINT = "https://api.frankfurter.dev/v1";
const COINGECKO_ENDPOINT = "https://api.coingecko.com/api/v3/simple/price";

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

async function fetchMarketData(): Promise<{ ticker: TickerItem[]; fx: LiveFx; changes: LiveChanges }> {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 9);

  const [fxJson, cryptoJson] = await Promise.all([
    fetch(`${FX_ENDPOINT}/${isoDate(start)}..${isoDate(end)}?from=USD&to=EUR,GBP,BRL`).then((r) => {
      if (!r.ok) throw new Error("Falha ao buscar câmbio");
      return r.json();
    }),
    fetch(`${COINGECKO_ENDPOINT}?ids=bitcoin,ethereum,pax-gold&vs_currencies=usd&include_24hr_change=true`).then((r) => {
      if (!r.ok) throw new Error("Falha ao buscar cripto/ouro");
      return r.json();
    }),
  ]);

  const dates: string[] = Object.keys(fxJson.rates ?? {}).sort();
  const firstRates = dates.length ? fxJson.rates[dates[0]] : null;
  const lastRates = dates.length ? fxJson.rates[dates[dates.length - 1]] : null;

  const pctChange = (from: number, to: number) => ((to - from) / from) * 100;

  const ticker: TickerItem[] = [];

  if (firstRates && lastRates) {
    const eurUsdFirst = 1 / firstRates.EUR;
    const eurUsdLast = 1 / lastRates.EUR;
    ticker.push({ sym: "EUR/USD", price: eurUsdLast, changePct: pctChange(eurUsdFirst, eurUsdLast) });

    const gbpUsdFirst = 1 / firstRates.GBP;
    const gbpUsdLast = 1 / lastRates.GBP;
    ticker.push({ sym: "GBP/USD", price: gbpUsdLast, changePct: pctChange(gbpUsdFirst, gbpUsdLast) });

    ticker.push({ sym: "USD/BRL", price: lastRates.BRL, changePct: pctChange(firstRates.BRL, lastRates.BRL) });
  }

  if (cryptoJson.bitcoin) {
    ticker.push({ sym: "BTC/USD", price: cryptoJson.bitcoin.usd, changePct: cryptoJson.bitcoin.usd_24h_change ?? 0 });
  }
  if (cryptoJson["pax-gold"]) {
    ticker.push({ sym: "GOLD/oz", price: cryptoJson["pax-gold"].usd, changePct: cryptoJson["pax-gold"].usd_24h_change ?? 0 });
  }

  const fx: LiveFx = {
    EUR: lastRates?.EUR ?? 0.92,
    GBP: lastRates?.GBP ?? 0.79,
    BRL: lastRates?.BRL ?? 5.3,
    BTC: cryptoJson.bitcoin ? 1 / cryptoJson.bitcoin.usd : 0.0000148,
    ETH: cryptoJson.ethereum ? 1 / cryptoJson.ethereum.usd : 0.000312,
  };

  const changes: LiveChanges = {};
  if (firstRates && lastRates) {
    changes.EUR = pctChange(1 / firstRates.EUR, 1 / lastRates.EUR);
    changes.GBP = pctChange(1 / firstRates.GBP, 1 / lastRates.GBP);
    changes.BRL = pctChange(firstRates.BRL, lastRates.BRL);
  }
  if (cryptoJson.bitcoin) changes.BTC = cryptoJson.bitcoin.usd_24h_change ?? undefined;
  if (cryptoJson.ethereum) changes.ETH = cryptoJson.ethereum.usd_24h_change ?? undefined;

  return { ticker, fx, changes };
}

const REFRESH_MS = 5 * 60 * 1000;

export function useMarketData(): MarketState {
  const [state, setState] = useState<MarketState>({ ticker: [], fx: null, changes: {}, loading: true, error: null, updatedAt: null });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { ticker, fx, changes } = await fetchMarketData();
        if (cancelled) return;
        setState({ ticker, fx, changes, loading: false, error: null, updatedAt: new Date() });
      } catch (err: any) {
        if (cancelled) return;
        setState((prev) => ({ ...prev, loading: false, error: err?.message ?? "Falha ao buscar dados de mercado." }));
      }
    }

    load();
    const interval = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return state;
}
