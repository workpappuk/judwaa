"use client";

import { useEffect, useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiDatabase, FiFileText, FiInfo, FiX } from "react-icons/fi";

import { getInstruments } from "@/services/trading-api";
import { useAppDispatch } from "@/store/hooks";
import { setDraftPositions } from "@/store/slices/tradingSlice";
import type { FnOPositionDraft, InstrumentPojo, PositionProduct, PositionSide } from "@/types/trading";

const PAGE_SIZE = 50;

const normalize = (value: string): string => (value && value.trim() ? value : "-");

const toNumber = (value: string, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const inferOptionType = (instrument: InstrumentPojo): "CE" | "PE" => {
  const option = (instrument.optionType || "").trim().toUpperCase();
  if (option === "CE" || option === "PE") {
    return option;
  }

  const symbol = (instrument.tradingSymbol || "").toUpperCase();
  if (symbol.includes("PE")) {
    return "PE";
  }

  return "CE";
};

interface SelectedInstrumentInput {
  instrument: InstrumentPojo;
  quantity: string;
  avgPrice: string;
  side: PositionSide;
  product: PositionProduct;
}

const instrumentKey = (item: InstrumentPojo): string => `${item.sourceFile}-${item.rowNumber}`;

export default function InstrumentPage() {
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<InstrumentPojo[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [selected, setSelected] = useState<InstrumentPojo | null>(null);
  const [selectedInputs, setSelectedInputs] = useState<Record<string, SelectedInstrumentInput>>({});
  const [showSelectionModal, setShowSelectionModal] = useState(false);

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

  const selectedEntries = useMemo(() => Object.values(selectedInputs), [selectedInputs]);

  const saveValidationError = useMemo(() => {
    for (const entry of selectedEntries) {
      const qty = Number(entry.quantity);
      if (!Number.isFinite(qty) || qty < 1 || !Number.isInteger(qty)) {
        return `Invalid quantity for ${normalize(entry.instrument.tradingSymbol)}.`;
      }

      if (entry.avgPrice.trim() === "") {
        return `Average price is required for ${normalize(entry.instrument.tradingSymbol)}.`;
      }

      const avg = Number(entry.avgPrice);
      if (!Number.isFinite(avg) || avg < 0) {
        return `Invalid average price for ${normalize(entry.instrument.tradingSymbol)}.`;
      }
    }
    return null;
  }, [selectedEntries]);

  const toggleInstrumentSelection = (item: InstrumentPojo) => {
    const key = instrumentKey(item);
    setSelectedInputs((prev) => {
      if (prev[key]) {
        const next = { ...prev };
        delete next[key];
        return next;
      }

      return {
        ...prev,
        [key]: {
          instrument: item,
          quantity: "1",
          avgPrice: "0",
          side: "LONG",
          product: "NRML",
        },
      };
    });
  };

  const updateSelectedInput = (
    key: string,
    field: "quantity" | "avgPrice" | "side" | "product",
    value: string,
  ) => {
    setSelectedInputs((prev) => {
      const current = prev[key];
      if (!current) {
        return prev;
      }

      return {
        ...prev,
        [key]: {
          ...current,
          [field]: value,
        },
      };
    });
  };

  const saveDraftPositions = () => {
    if (saveValidationError) {
      return;
    }

    const drafts: FnOPositionDraft[] = selectedEntries.map((entry, idx) => {
      const instrument = entry.instrument;
      const optionType = inferOptionType(instrument);
      const symbolPart = normalize(instrument.symbol) === "-" ? instrumentKey(instrument) : instrument.symbol;

      return {
        id: `inst-${instrumentKey(instrument)}`,
        neoSymbol: `${instrument.exchangeSegment}|${symbolPart}`,
        label: normalize(instrument.tradingSymbol) === "-" ? normalize(instrument.symbol) : instrument.tradingSymbol,
        qty: Math.max(1, Math.floor(toNumber(entry.quantity, 1))),
        avgPrice: Math.max(0, toNumber(entry.avgPrice, 0)),
        side: entry.side,
        product: entry.product,
        expiry: normalize(instrument.expiryDate),
        strike: Math.max(0, toNumber(instrument.strikePrice, 0)),
        optionType,
      };
    });

    dispatch(setDraftPositions(drafts));
    setShowSelectionModal(false);
  };

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

              <div className="mt-2.5 flex justify-end">
                <button
                  type="button"
                  onClick={() => toggleInstrumentSelection(item)}
                  className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-medium ${
                    selectedInputs[instrumentKey(item)]
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                      : "border-zinc-300 dark:border-zinc-700"
                  }`}
                >
                  {selectedInputs[instrumentKey(item)] ? "Selected" : "Select"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {selectedEntries.length > 0 ? (
        <section className="fixed bottom-4 left-0 right-0 z-20 px-3">
          <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white/95 dark:bg-[#0f151e]/95 px-3 py-2 backdrop-blur-sm">
            <p className="text-xs font-medium">
              {selectedEntries.length} instrument{selectedEntries.length > 1 ? "s" : ""} selected
            </p>
            <button
              type="button"
              onClick={() => setShowSelectionModal(true)}
              className="inline-flex items-center gap-1 rounded-md border border-zinc-300 dark:border-zinc-700 px-2.5 py-1 text-xs font-medium"
            >
              Configure & save
            </button>
          </div>
        </section>
      ) : null}

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

      {showSelectionModal ? (
        <div className="fixed inset-0 z-40 bg-black/55 p-4">
          <div className="mx-auto mt-10 max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111926]">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
              <h3 className="text-sm font-semibold">Selected Instruments</h3>
              <button
                type="button"
                onClick={() => setShowSelectionModal(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-300 dark:border-zinc-700"
                aria-label="Close selection"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[62vh] space-y-2 overflow-auto p-4">
              {selectedEntries.map((entry) => {
                const key = instrumentKey(entry.instrument);
                return (
                  <article
                    key={key}
                    className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold">{normalize(entry.instrument.tradingSymbol)}</p>
                        <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                          {normalize(entry.instrument.symbol)} • {normalize(entry.instrument.exchangeSegment)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleInstrumentSelection(entry.instrument)}
                        className="rounded-md border border-zinc-300 dark:border-zinc-700 px-2 py-1 text-[11px]"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <label className="text-[11px]">
                        <span className="mb-1 block text-zinc-500 dark:text-zinc-400">Quantity</span>
                        <input
                          type="number"
                          min="1"
                          value={entry.quantity}
                          onChange={(event) => updateSelectedInput(key, "quantity", event.target.value)}
                          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1.5 text-xs"
                        />
                      </label>
                      <label className="text-[11px]">
                        <span className="mb-1 block text-zinc-500 dark:text-zinc-400">Avg Price</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={entry.avgPrice}
                          onChange={(event) => updateSelectedInput(key, "avgPrice", event.target.value)}
                          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1.5 text-xs"
                        />
                      </label>
                      <label className="text-[11px]">
                        <span className="mb-1 block text-zinc-500 dark:text-zinc-400">Side</span>
                        <select
                          value={entry.side}
                          onChange={(event) => updateSelectedInput(key, "side", event.target.value)}
                          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1.5 text-xs"
                        >
                          <option value="LONG">LONG</option>
                          <option value="SHORT">SHORT</option>
                        </select>
                      </label>
                      <label className="text-[11px]">
                        <span className="mb-1 block text-zinc-500 dark:text-zinc-400">Product</span>
                        <select
                          value={entry.product}
                          onChange={(event) => updateSelectedInput(key, "product", event.target.value)}
                          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1.5 text-xs"
                        >
                          <option value="NRML">NRML</option>
                          <option value="MIS">MIS</option>
                        </select>
                      </label>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 px-4 py-3">
              <div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Add quantity and average price for each selected instrument.
                </p>
                {saveValidationError ? (
                  <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-300">{saveValidationError}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={saveDraftPositions}
                disabled={!!saveValidationError}
                className="rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium"
              >
                Save To F&O
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}