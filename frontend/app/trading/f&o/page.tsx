"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FiArrowDownRight,
  FiArrowUpRight,
  FiBarChart2,
  FiClipboard,
  FiEye,
  FiHash,
  FiPlusCircle,
  FiTrendingUp,
  FiX,
} from "react-icons/fi";

import { useNeoQuotes } from "@/hooks/use-neo-quotes";
import { useAppSelector } from "@/store/hooks";
import type { FnOPositionView } from "@/types/trading";
import Tabs from "@/components/tab";

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

type OrderRow = {
  id: string;
  symbol: string;
  neoSymbol: string;
  side: "LONG" | "SHORT";
  qty: number;
  product: "MIS" | "NRML";
  limitPrice: number;
  expiry: string;
  strike: number;
  optionType: "CE" | "PE";
  notional: number;
};



export default function TradingPositionsPage() {
  const draftPositions = useAppSelector((state) => state.trading.draftPositions);
  const draftsHydrated = useAppSelector((state) => state.trading.hydrated);

  const positions = useMemo(
    () => (draftsHydrated ? draftPositions : []),
    [draftPositions, draftsHydrated],
  );

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

  const orderRows: OrderRow[] = useMemo(
    () =>
      positions.map((position) => ({
        id: `order-${position.id}`,
        symbol: position.label,
        neoSymbol: position.neoSymbol,
        side: position.side,
        qty: position.qty,
        product: position.product,
        limitPrice: position.avgPrice,
        expiry: position.expiry,
        strike: position.strike,
        optionType: position.optionType,
        notional: position.avgPrice * position.qty,
      })),
    [positions],
  );

  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);

  const totalPnl = rows.reduce((acc, row) => acc + row.pnl, 0);

  const positionTabContent = (
    <>
      {!draftsHydrated ? (
        <section className="pt-3">
          <article className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-3 text-sm text-zinc-500 dark:text-zinc-400">
            Restoring saved positions...
          </article>
        </section>
      ) : null}
      {draftsHydrated && rows.length === 0 ? (
        <section className="pt-3">
          <article className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-3 transition-colors">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200">
              <FiPlusCircle className="h-4 w-4" />
            </div>
            <h2 className="mt-2 text-sm font-semibold">No positions selected</h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Go to Instruments and select contracts with quantity and average price.
            </p>
            <Link
              href="/trading/instrument"
              className="mt-3 inline-flex items-center gap-1 rounded-md border border-zinc-300 dark:border-zinc-700 px-2.5 py-1.5 text-xs font-medium"
            >
              <FiPlusCircle className="h-3.5 w-3.5" />
              Select Instruments
            </Link>
          </article>
        </section>
      ) : null}
      <div className="grid grid-cols-1 gap-2 mt-3" >
        <article className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 transition-colors">
          <p className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            <span className="text-[12px] leading-none font-semibold">₹</span>
            Day P&L
          </p>
          <p
            className={`text-sm font-semibold ${totalPnl >= 0 ? "text-emerald-600" : "text-rose-600"
              }`}
          >
            {formatCompact(totalPnl)}
          </p>
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
                  {row.expiry} • {row.product} • Lots {row.qty}
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
      {!draftsHydrated ? (
        <article className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-3 text-sm text-zinc-500 dark:text-zinc-400">
          Restoring selected instruments...
        </article>
      ) : null}

      {draftsHydrated && orderRows.length === 0 ? (
        <article className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-3 transition-colors">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200">
            <FiClipboard className="h-4 w-4" />
          </div>
          <h2 className="mt-2 text-sm font-semibold">No orders created</h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Select instruments first to generate order entries.
          </p>
          <Link
            href="/trading/instrument"
            className="mt-3 inline-flex items-center gap-1 rounded-md border border-zinc-300 dark:border-zinc-700 px-2.5 py-1.5 text-xs font-medium"
          >
            <FiPlusCircle className="h-3.5 w-3.5" />
            Select Instruments
          </Link>
        </article>
      ) : null}

      {draftsHydrated && orderRows.length > 0 ? (
        <article className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors overflow-hidden">
          <div>
            <table className="w-full table-fixed text-[12px]">
              <thead className="bg-zinc-50 dark:bg-zinc-800/70 text-zinc-600 dark:text-zinc-300">
                <tr>
                  <th className="px-2 py-2 text-left font-semibold w-[42%]">Symbol</th>
                  <th className="px-2 py-2 text-left font-semibold w-[16%]">Side</th>
                  <th className="px-2 py-2 text-right font-semibold w-[12%]">Qty</th>
                  <th className="px-2 py-2 text-right font-semibold w-[18%]">Limit</th>
                  <th className="px-2 py-2 text-center font-semibold w-[12%]">View</th>
                </tr>
              </thead>
              <tbody>
                {orderRows.map((order) => (
                  <tr
                    key={order.id}
                    className="border-t border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100"
                  >
                    <td className="px-2 py-2">
                      <p className="font-medium leading-tight truncate">{order.symbol}</p>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                        {order.expiry} • {order.product}
                      </p>
                    </td>
                    <td className="px-2 py-2">
                      <span
                        className={`inline-flex rounded border px-2 py-0.5 text-[10px] ${order.side === "LONG"
                          ? "border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30"
                          : "border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/30"
                          }`}
                      >
                        {order.side === "LONG" ? "BUY" : "SELL"}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-right">{order.qty}</td>
                    <td className="px-2 py-2 text-right font-medium">{formatMoney(order.limitPrice)}</td>
                    <td className="px-2 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1 rounded-md border border-zinc-300 dark:border-zinc-700 px-2 py-1 text-[10px] font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      >
                        <FiEye className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      ) : null}
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

      {selectedOrder ? (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 p-3 sm:p-4">
          <article className="w-full max-w-md rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">Order Details</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {selectedOrder.symbol}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Close order details"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
              <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/60 px-2.5 py-2">
                <dt className="text-zinc-500 dark:text-zinc-400">Symbol</dt>
                <dd className="font-medium">{selectedOrder.neoSymbol}</dd>
              </div>
              <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/60 px-2.5 py-2">
                <dt className="text-zinc-500 dark:text-zinc-400">Side</dt>
                <dd className="font-medium">{selectedOrder.side === "LONG" ? "BUY" : "SELL"}</dd>
              </div>
              <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/60 px-2.5 py-2">
                <dt className="text-zinc-500 dark:text-zinc-400">Product</dt>
                <dd className="font-medium">{selectedOrder.product}</dd>
              </div>
              <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/60 px-2.5 py-2">
                <dt className="text-zinc-500 dark:text-zinc-400">Quantity</dt>
                <dd className="font-medium">{selectedOrder.qty}</dd>
              </div>
              <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/60 px-2.5 py-2">
                <dt className="text-zinc-500 dark:text-zinc-400">Expiry</dt>
                <dd className="font-medium">{selectedOrder.expiry}</dd>
              </div>
              <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/60 px-2.5 py-2">
                <dt className="text-zinc-500 dark:text-zinc-400">Strike / Type</dt>
                <dd className="font-medium">
                  {selectedOrder.strike} {selectedOrder.optionType}
                </dd>
              </div>
            </dl>

            <div className="mt-3 flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 px-2.5 py-2 text-[12px]">
              <span className="text-zinc-500 dark:text-zinc-400">Limit Price</span>
              <span className="font-semibold">{formatMoney(selectedOrder.limitPrice)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 px-2.5 py-2 text-[12px]">
              <span className="text-zinc-500 dark:text-zinc-400">Total Order Value</span>
              <span className="font-semibold">{formatMoney(selectedOrder.notional)}</span>
            </div>
          </article>
        </div>
      ) : null}


    </main >
  );
}