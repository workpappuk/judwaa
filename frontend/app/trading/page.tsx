"use client";

import { useEffect, useMemo } from "react";

import { useNeoQuotes } from "@/hooks/use-neo-quotes";
import type { FnOPositionDraft, FnOPositionView } from "@/types/trading";

const POSITIONS: FnOPositionDraft[] = [
  {
    id: "p1",
    neoSymbol: "nse_fo|NIFTY26JUN24300CE",
    label: "NIFTY 24300 CE",
    qty: 50,
    avgPrice: 122.4,
    side: "LONG",
    product: "NRML",
    expiry: "26 Jun 2026",
    strike: 24300,
    optionType: "CE",
  },
  {
    id: "p2",
    neoSymbol: "nse_fo|BANKNIFTY26JUN52500PE",
    label: "BANKNIFTY 52500 PE",
    qty: 15,
    avgPrice: 208.1,
    side: "SHORT",
    product: "MIS",
    expiry: "26 Jun 2026",
    strike: 52500,
    optionType: "PE",
  },
  {
    id: "p3",
    neoSymbol: "nse_fo|FINNIFTY26JUN24150CE",
    label: "FINNIFTY 24150 CE",
    qty: 40,
    avgPrice: 76.7,
    side: "LONG",
    product: "NRML",
    expiry: "26 Jun 2026",
    strike: 24150,
    optionType: "CE",
  },
];

const toNumber = (value: string | undefined): number => {
  const parsed = Number(value ?? "0");
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatMoney = (value: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);

const formatSignedPercent = (value: number): string =>
  `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;

const formatCompact = (value: number): string => {
  const absolute = Math.abs(value);
  if (absolute >= 1_00_000) {
    return `${value >= 0 ? "+" : "-"}${(absolute / 1_00_000).toFixed(2)}L`;
  }
  if (absolute >= 1_000) {
    return `${value >= 0 ? "+" : "-"}${(absolute / 1_000).toFixed(1)}K`;
  }
  return `${value >= 0 ? "+" : "-"}${absolute.toFixed(0)}`;
};

export default function TradingPositionsPage() {
  const symbols = useMemo(() => POSITIONS.map((position) => position.neoSymbol), []);
  const { quotes, loading, error, refresh, lastUpdated } = useNeoQuotes(symbols);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      void refresh();
    }, 0);

    const timer = setInterval(() => {
      void refresh();
    }, 12000);

    return () => {
      clearTimeout(initialLoad);
      clearInterval(timer);
    };
  }, [refresh]);

  const rows: FnOPositionView[] = useMemo(() => {
    return POSITIONS.map((position, index) => {
      const quote = quotes[index];
      const ltp = toNumber(quote?.ltp);
      const changePct = toNumber(quote?.per_change);
      const sideFactor = position.side === "LONG" ? 1 : -1;
      const pnl = (ltp - position.avgPrice) * position.qty * sideFactor;
      const turnover = ltp * position.qty;

      return {
        ...position,
        ltp,
        changePct,
        pnl,
        turnover,
      };
    });
  }, [quotes]);

  const totalPnl = rows.reduce((acc, row) => acc + row.pnl, 0);
  const totalTurnover = rows.reduce((acc, row) => acc + row.turnover, 0);
  const winners = rows.filter((row) => row.pnl > 0).length;
  const losers = rows.length - winners;

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-zinc-900 dark:bg-[#0b0f15] dark:text-zinc-100 pb-8 transition-colors">
      <section className="sticky top-14 z-10 bg-white/95 dark:bg-[#0f141c]/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 transition-colors">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">F&O</p>
              <h1 className="text-lg font-semibold leading-tight">Positions</h1>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                {lastUpdated
                  ? `Updated ${lastUpdated.toLocaleTimeString()}`
                  : "Waiting for live prices"}
              </p>
            </div>

            <button
              onClick={() => void refresh()}
              className="rounded-lg px-3 py-1.5 text-xs font-medium border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 active:scale-95 transition"
            >
              {loading ? "Syncing" : "Sync"}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3">
            <article className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 transition-colors">
              <p className="text-[10px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Day P&L</p>
              <p
                className={`text-sm font-semibold ${
                  totalPnl >= 0 ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {formatCompact(totalPnl)}
              </p>
            </article>

            <article className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 transition-colors">
              <p className="text-[10px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Exposure</p>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{formatCompact(totalTurnover)}</p>
            </article>

            <article className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 transition-colors">
              <p className="text-[10px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">W/L</p>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{winners}/{losers}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="px-3 pt-3 space-y-2.5">
        {error ? (
          <div className="rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-2.5 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        ) : null}

        {rows.map((row) => (
          <article
            key={row.id}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-3 transition-colors"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-[14px] font-semibold leading-tight truncate">{row.label}</h2>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                  {row.expiry} • {row.product} • Qty {row.qty}
                </p>
              </div>

              <span
                className={`text-[10px] px-2 py-0.5 rounded border ${
                  row.side === "LONG"
                    ? "border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30"
                    : "border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/30"
                }`}
              >
                {row.side}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 mt-2.5 text-[11px]">
              <div>
                <p className="text-zinc-500 dark:text-zinc-400">Avg</p>
                <p className="font-medium">{formatMoney(row.avgPrice)}</p>
              </div>
              <div>
                <p className="text-zinc-500 dark:text-zinc-400">LTP</p>
                <p className="font-medium">{formatMoney(row.ltp)}</p>
              </div>
              <div>
                <p className="text-zinc-500 dark:text-zinc-400">Chg</p>
                <p
                  className={`font-medium ${
                    row.changePct >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {formatSignedPercent(row.changePct)}
                </p>
              </div>
              <div>
                <p className="text-zinc-500 dark:text-zinc-400">P&L</p>
                <p
                  className={`font-semibold ${
                    row.pnl >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {formatMoney(row.pnl)}
                </p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}