"use client";

import { useEffect, useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiDatabase, FiFileText, FiInfo, FiX } from "react-icons/fi";

import { getInstruments } from "@/services/trading-api";
import type { InstrumentPojo } from "@/types/trading";

const PAGE_SIZE = 50;

const normalize = (value: string): string => (value && value.trim() ? value : "-");

export default function InstrumentPage() {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<InstrumentPojo[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [selected, setSelected] = useState<InstrumentPojo | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getInstruments(page, PAGE_SIZE, controller.signal);
        setItems(data.content);
        setTotalElements(data.totalElements);
        setTotalPages(data.totalPages);
        setHasPrevious(data.hasPrevious);
        setHasNext(data.hasNext);
      } catch {
        setError("Unable to load instruments right now.");
      } finally {
        setLoading(false);
      }
    };

    void load();

    return () => {
      controller.abort();
    };
  }, [page]);

  const rangeLabel = useMemo(() => {
    if (totalElements === 0 || items.length === 0) {
      return "No records";
    }
    const start = (page - 1) * PAGE_SIZE + 1;
    const end = start + items.length - 1;
    return `${start}-${end} of ${totalElements}`;
  }, [items.length, page, totalElements]);

  return (
    <main className="min-h-screen bg-[#f4f7ff] text-zinc-900 dark:bg-[#0c1119] dark:text-zinc-100 pb-8 transition-colors">
      <section className="sticky top-14 z-10 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-[#0f151e]/95 backdrop-blur-sm">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                <FiDatabase className="h-3 w-3" />
                Trading Data
              </p>
              <h1 className="display-face text-lg font-semibold leading-tight">Instruments</h1>
              <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">{rangeLabel}</p>
            </div>

            <span className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1 text-[11px] font-medium">
              Page {page}{totalPages > 0 ? ` / ${totalPages}` : ""}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!hasPrevious || loading}
              className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium disabled:opacity-45 disabled:cursor-not-allowed"
            >
              <FiChevronLeft className="h-3.5 w-3.5" />
              Prev
            </button>

            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNext || loading}
              className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium disabled:opacity-45 disabled:cursor-not-allowed"
            >
              Next
              <FiChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      <section className="px-3 pt-3">
        {error ? (
          <div className="rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 text-sm text-zinc-500 dark:text-zinc-400">
            Loading instruments...
          </div>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 text-sm text-zinc-500 dark:text-zinc-400">
            No instruments found.
          </div>
        ) : null}

        <div className="space-y-2.5">
          {items.map((item) => (
            <article
              key={`${item.sourceFile}-${item.rowNumber}`}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-[14px] font-semibold leading-tight">{normalize(item.tradingSymbol)}</h2>
                  <p className="mt-0.5 truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                    {normalize(item.symbol)} • {normalize(item.exchangeSegment)} • {normalize(item.instrumentType)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelected(item)}
                  className="inline-flex shrink-0 items-center gap-1 rounded-md border border-zinc-300 dark:border-zinc-700 px-2 py-1 text-[11px] font-medium"
                >
                  <FiInfo className="h-3.5 w-3.5" />
                  Details
                </button>
              </div>

              <div className="mt-2.5 grid grid-cols-3 gap-2 text-[11px]">
                <div>
                  <p className="text-zinc-500 dark:text-zinc-400">Exchange</p>
                  <p className="font-medium">{normalize(item.exchange)}</p>
                </div>
                <div>
                  <p className="text-zinc-500 dark:text-zinc-400">Option</p>
                  <p className="font-medium">{normalize(item.optionType)}</p>
                </div>
                <div>
                  <p className="text-zinc-500 dark:text-zinc-400">Lot</p>
                  <p className="font-medium">{normalize(item.lotSize)}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {selected ? (
        <div className="fixed inset-0 z-30 bg-black/55 p-4">
          <div className="mx-auto mt-10 max-h-[78vh] w-full max-w-xl overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111926]">
            <div className="flex items-start justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold">{normalize(selected.tradingSymbol)}</h3>
                <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                  {selected.sourceFile} • row {selected.rowNumber}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-300 dark:border-zinc-700"
                aria-label="Close details"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[62vh] overflow-auto p-4">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {Object.entries(selected.fields).map(([key, value]) => (
                  <div key={key} className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-2 py-1.5">
                    <p className="truncate text-zinc-500 dark:text-zinc-400">{key}</p>
                    <p className="break-all font-medium">{normalize(value)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-zinc-200 dark:border-zinc-800 px-4 py-2 text-[11px] text-zinc-500 dark:text-zinc-400">
              <p className="inline-flex items-center gap-1">
                <FiFileText className="h-3.5 w-3.5" />
                Full CSV row fields
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}