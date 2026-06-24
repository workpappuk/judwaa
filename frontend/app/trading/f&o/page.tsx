"use client";

import { useEffect, useMemo } from "react";
import {
  FiArrowDownRight,
  FiArrowUpRight,
  FiBarChart2,
  FiClipboard,
  FiDollarSign,
  FiHash,
  FiTarget,
  FiTrendingUp,
} from "react-icons/fi";

import { useNeoQuotes } from "@/hooks/use-neo-quotes";
import { useAppSelector } from "@/store/hooks";
import type { FnOPositionDraft, FnOPositionView } from "@/types/trading";
import Tabs from "@/components/tab";

const POSITIONS: FnOPositionDraft[] = [
  {
    id: "p1",
    neoSymbol: "nse_fo|103204",
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
    neoSymbol: "nse_fo|103272",
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
    neoSymbol: "nse_fo|109901",
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
  const draftPositions = useAppSelector((state) => state.trading.draftPositions);
  const positions = draftPositions.length > 0 ? draftPositions : POSITIONS;

  const symbols = useMemo(() => positions.map((position) => position.neoSymbol), [positions]);
  const { quotes, error, refresh } = useNeoQuotes(symbols);

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
    return positions.map((position, index) => {
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
  }, [positions, quotes]);

  const totalPnl = rows.reduce((acc, row) => acc + row.pnl, 0);
  const totalTurnover = rows.reduce((acc, row) => acc + row.turnover, 0);
  const winners = rows.filter((row) => row.pnl > 0).length;
  const losers = rows.length - winners;

  const positionTabContent = (
    <>
      <div className="grid grid-cols-3 gap-2 mt-3" >
        <article className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 transition-colors">
          <p className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            <FiDollarSign className="h-3 w-3" />
            Day P&L
          </p>
          <p
            className={`text-sm font-semibold ${totalPnl >= 0 ? "text-emerald-600" : "text-rose-600"
              }`}
          >
            {formatCompact(totalPnl)}
          </p>
        </article>

        <article className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 transition-colors">
          <p className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            <FiBarChart2 className="h-3 w-3" />
            Exposure
          </p>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{formatCompact(totalTurnover)}</p>
        </article>

        <article className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 transition-colors">
          <p className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            <FiTarget className="h-3 w-3" />
            W/L
          </p>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{winners}/{losers}</p>
        </article>
      </div >
      <section className="  pt-3 space-y-2.5">
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
                className={`text-[10px] px-2 py-0.5 rounded border ${row.side === "LONG"
                  ? "border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30"
                  : "border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/30"
                  }`}
              >
                {row.side}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 mt-2.5 text-[11px]">
              <div>
                <p className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-400"><FiHash className="h-3 w-3" />Avg</p>
                <p className="font-medium">{formatMoney(row.avgPrice)}</p>
              </div>
              <div>
                <p className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-400"><FiBarChart2 className="h-3 w-3" />LTP</p>
                <p className="font-medium">{formatMoney(row.ltp)}</p>
              </div>
              <div>
                <p className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                  {row.changePct >= 0 ? <FiArrowUpRight className="h-3 w-3" /> : <FiArrowDownRight className="h-3 w-3" />}
                  Chg
                </p>
                <p
                  className={`font-medium ${row.changePct >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                >
                  {formatSignedPercent(row.changePct)}
                </p>
              </div>
              <div>
                <p className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-400"><FiTrendingUp className="h-3 w-3" />P&L</p>
                <p
                  className={`font-semibold ${row.pnl >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                >
                  {formatMoney(row.pnl)}
                </p>
              </div>
            </div>

          </article>
        ))}
      </section>
    </>
  );

  const ordersTabContent = (
    <section className=" pt-3 space-y-2.5">
      <article className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-3 transition-colors">
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200">
          <FiClipboard className="h-4 w-4" />
        </div>
        <h2 className="mt-2 text-sm font-semibold">Orders</h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          No open orders right now.
        </p>
      </article>
    </section>
  );

  return (
    <main className="min-h-screen  text-zinc-900 dark:bg-[#0b0f15] dark:text-zinc-100 pb-8 transition-colors">
      <section className="sticky top-14 z-10 bg-white/95 dark:bg-[#0f141c]/95 backdrop-blur-sm  border-zinc-200 dark:border-zinc-800 transition-colors">
        <div className="px-4 pt-4 pb-3">
          <Tabs
            defaultTab="positions"
            tabs={[
              {
                id: "positions",
                label: "Positions",
                content: positionTabContent,
              },
              {
                id: "orders",
                label: "Orders",
                content: ordersTabContent,
              },
            ]}
          />

        </div >
      </section >


    </main >
  );
}