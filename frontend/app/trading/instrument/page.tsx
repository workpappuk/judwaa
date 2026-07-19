"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FiChevronLeft, FiChevronRight, FiDatabase, FiFileText, FiInfo, FiX } from "react-icons/fi";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import { downloadNeoScriptMaster, getInstruments, loginNeoSession, replaceOrders } from "@/services/trading-api";
import { useAppDispatch } from "@/store/hooks";
import { setDraftPositions } from "@/store/slices/tradingSlice";
import type { FnOPositionDraft, InstrumentPojo, PositionProduct, PositionSide } from "@/types/trading";
import { useRouter } from "next/navigation";

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

const randomFrom = <T,>(values: readonly T[]): T => values[Math.floor(Math.random() * values.length)];

const getRandomSelectionDefaults = (): Omit<SelectedInstrumentInput, "instrument"> => ({
  quantity: randomFrom(["11", "15", "25", "50"]),
  avgPrice: randomFrom(["11", "25", "50", "100", "150"]),
  side: randomFrom<PositionSide>(["LONG", "SHORT"]),
  product: randomFrom<PositionProduct>(["NRML", "MIS"]),
});

const getApiErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (typeof data === "string" && data.trim().length > 0) {
      return data;
    }

    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string" &&
      data.message.trim().length > 0
    ) {
      return data.message;
    }
  }

  return fallbackMessage;
};

export default function InstrumentPage() {
  const dispatch = useAppDispatch();
  const route = useRouter();
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
  const [showNeoActionsModal, setShowNeoActionsModal] = useState(false);
  const [totp, setTotp] = useState("");
  const [isNeoLoginLoading, setIsNeoLoginLoading] = useState(false);
  const [isScriptDownloadLoading, setIsScriptDownloadLoading] = useState(false);
  const [neoActionError, setNeoActionError] = useState<string | null>(null);
  const [neoActionSuccess, setNeoActionSuccess] = useState<string | null>(null);
  const [isSavingOrders, setIsSavingOrders] = useState(false);
  const [saveOrdersError, setSaveOrdersError] = useState<string | null>(null);

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

  const selectedOnCurrentPageCount = useMemo(
    () => items.filter((item) => Boolean(selectedInputs[instrumentKey(item)])).length,
    [items, selectedInputs],
  );

  const allCurrentPageSelected = useMemo(() => {
    if (items.length === 0) {
      return false;
    }

    return items.every((item) => Boolean(selectedInputs[instrumentKey(item)]));
  }, [items, selectedInputs]);

  const saveValidationError = useMemo(() => {
    for (const entry of selectedEntries) {
      const qty = Number(entry.quantity);
      if (!Number.isFinite(qty) || qty <= 10 || !Number.isInteger(qty)) {
        return `Invalid quantity for ${normalize(entry.instrument.tradingSymbol)}.`;
      }

      if (entry.avgPrice.trim() === "") {
        return `Average price is required for ${normalize(entry.instrument.tradingSymbol)}.`;
      }

      const avg = Number(entry.avgPrice);
      if (!Number.isFinite(avg) || avg <= 10) {
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
          ...getRandomSelectionDefaults(),
        },
      };
    });
  };

  const toggleSelectAllCurrentPage = () => {
    setSelectedInputs((prev) => {
      const next = { ...prev };

      if (allCurrentPageSelected) {
        items.forEach((item) => {
          delete next[instrumentKey(item)];
        });
        return next;
      }

      items.forEach((item) => {
        const key = instrumentKey(item);
        if (next[key]) {
          return;
        }

        next[key] = {
          instrument: item,
          ...getRandomSelectionDefaults(),
        };
      });

      return next;
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

  const saveDraftPositions = async () => {
    if (saveValidationError) {
      return;
    }

    const drafts: FnOPositionDraft[] = selectedEntries.map((entry) => {
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

    setIsSavingOrders(true);
    setSaveOrdersError(null);

    try {
      await replaceOrders(drafts);
      dispatch(setDraftPositions(drafts));
      setShowSelectionModal(false);
      route.push("/trading/f&o");
    } catch (err) {
      setSaveOrdersError(getApiErrorMessage(err, "Unable to store orders in H2 right now."));
    } finally {
      setIsSavingOrders(false);
    }
  };

  const handleNeoLogin = async () => {
    const safeTotp = totp.trim();
    if (!safeTotp) {
      setNeoActionSuccess(null);
      setNeoActionError("TOTP is required.");
      return;
    }

    setIsNeoLoginLoading(true);
    setNeoActionError(null);
    setNeoActionSuccess(null);

    try {
      const message = await loginNeoSession(safeTotp);
      setNeoActionSuccess(message || "Neo login successful.");
    } catch (err) {
      setNeoActionError(getApiErrorMessage(err, "Unable to login to Neo right now."));
    } finally {
      setIsNeoLoginLoading(false);
    }
  };

  const handleScriptDownload = async () => {
    setIsScriptDownloadLoading(true);
    setNeoActionError(null);
    setNeoActionSuccess(null);

    try {
      const message = await downloadNeoScriptMaster();
      setNeoActionSuccess(message || "Script download started.");
    } catch (err) {
      setNeoActionError(getApiErrorMessage(err, "Unable to download script right now."));
    } finally {
      setIsScriptDownloadLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ minHeight: "100vh", pb: 4 }}>
      <Card variant="outlined" sx={{ position: "sticky", top: 56, zIndex: 10, mt: 1.5 }}>
        <CardContent sx={{ pb: "16px !important" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1.5, flexWrap: "wrap" }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                <FiDatabase size={12} /> Trading Data
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Instruments</Typography>
              <Typography variant="caption" color="text.secondary">{rangeLabel}</Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  setNeoActionError(null);
                  setNeoActionSuccess(null);
                  setShowNeoActionsModal(true);
                }}
              >
                Neo Actions
              </Button>
              <Chip size="small" variant="outlined" label={`Page ${page}${totalPages > 0 ? ` / ${totalPages}` : ""}`} />
            </Box>
          </Box>

          <Box sx={{ mt: 1.5, display: "flex", justifyContent: "space-between", gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!hasPrevious || loading}
              startIcon={<FiChevronLeft />}
            >
              Prev
            </Button>

            <Button
              size="small"
              variant="outlined"
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNext || loading}
              endIcon={<FiChevronRight />}
            >
              Next
            </Button>
          </Box>

          <Card variant="outlined" sx={{ mt: 1.5 }}>
            <CardContent sx={{ py: 1.25, "&:last-child": { pb: 1.25 }, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Typography variant="caption" color="text.secondary">
                {selectedOnCurrentPageCount}/{items.length} visible selected
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={toggleSelectAllCurrentPage}
                  disabled={loading || items.length === 0}
                >
                  {allCurrentPageSelected
                    ? `Deselect visible (${items.length})`
                    : `Select visible (${items.length - selectedOnCurrentPageCount})`}
                </Button>
                {selectedEntries.length > 0 ? (
                  <Button size="small" variant="outlined" onClick={() => setSelectedInputs({})}>
                    Clear all
                  </Button>
                ) : null}
              </Box>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Box sx={{ pt: 1.5 }}>
        {error ? <Alert severity="error" variant="outlined" sx={{ mb: 1.25 }}>{error}</Alert> : null}
        {loading ? <Alert severity="info" variant="outlined" sx={{ mb: 1.25 }}>Loading instruments...</Alert> : null}
        {!loading && !error && items.length === 0 ? <Alert severity="info" variant="outlined" sx={{ mb: 1.25 }}>No instruments found.</Alert> : null}

        <Box sx={{ display: "grid", gap: 1.25 }}>
          {items.map((item) => {
            const key = `${item.sourceFile}-${item.rowNumber}`;
            const isSelected = Boolean(selectedInputs[instrumentKey(item)]);
            return (
              <Card
                key={key}
                variant="outlined"
                role="button"
                tabIndex={0}
                onClick={() => setSelected(item)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    setSelected(item);
                  }
                }}
                sx={{ cursor: "pointer", "&:hover": { borderColor: "text.secondary" } }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1.5 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>{normalize(item.tradingSymbol)}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {normalize(item.symbol)} • {normalize(item.exchangeSegment)} • {normalize(item.instrumentType)}
                      </Typography>
                    </Box>

                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<FiInfo />}
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelected(item);
                      }}
                    >
                      Details
                    </Button>
                  </Box>

                  <Box sx={{ mt: 1.5, display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 1 }}>
                    <Box><Typography variant="caption" color="text.secondary">Exchange</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{normalize(item.exchange)}</Typography></Box>
                    <Box><Typography variant="caption" color="text.secondary">Option</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{normalize(item.optionType)}</Typography></Box>
                    <Box><Typography variant="caption" color="text.secondary">Lot</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{normalize(item.lotSize)}</Typography></Box>
                  </Box>

                  <Box sx={{ mt: 1.5, display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      size="small"
                      variant={isSelected ? "contained" : "outlined"}
                      color={isSelected ? "success" : "primary"}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleInstrumentSelection(item);
                      }}
                    >
                      {isSelected ? "Selected" : "Select"}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Box>

      {selectedEntries.length > 0 ? (
        <Box sx={{ position: "fixed", bottom: 16, left: 0, right: 0, zIndex: 20, px: 2 }}>
          <Card variant="outlined" sx={{ maxWidth: 720, mx: "auto" }}>
            <CardContent sx={{ py: 1.25, "&:last-child": { pb: 1.25 }, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {selectedEntries.length} instrument{selectedEntries.length > 1 ? "s" : ""} selected
              </Typography>
              <Button size="small" variant="contained" onClick={() => setShowSelectionModal(true)}>
                Configure and Save
              </Button>
            </CardContent>
          </Card>
        </Box>
      ) : null}

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="md">
        {selected ? (
          <>
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1.5 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>{normalize(selected.tradingSymbol)}</Typography>
                <Typography variant="caption" color="text.secondary">{selected.sourceFile} • row {selected.rowNumber}</Typography>
              </Box>
              <IconButton size="small" onClick={() => setSelected(null)} aria-label="Close details">
                <FiX size={16} />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1 }}>
                {Object.entries(selected.fields).map(([key, value]) => (
                  <Card key={key} variant="outlined">
                    <CardContent sx={{ py: 1.25, "&:last-child": { pb: 1.25 } }}>
                      <Typography variant="caption" color="text.secondary" noWrap>{key}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: "break-all" }}>{normalize(value)}</Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                <FiFileText size={12} /> Full CSV row fields
              </Typography>
            </DialogContent>
          </>
        ) : null}
      </Dialog>

      <Dialog open={showNeoActionsModal} onClose={() => setShowNeoActionsModal(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Neo Actions</Typography>
          <IconButton size="small" onClick={() => setShowNeoActionsModal(false)} aria-label="Close neo actions">
            <FiX size={16} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gap: 1.5, pt: 0.5 }}>
            <TextField label="TOTP" size="small" value={totp} onChange={(event) => setTotp(event.target.value)} placeholder="Enter TOTP" />

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button variant="outlined" size="small" onClick={handleNeoLogin} disabled={isNeoLoginLoading || isScriptDownloadLoading}>
                {isNeoLoginLoading ? "Logging in..." : "Login Neo"}
              </Button>
              <Button variant="outlined" size="small" onClick={handleScriptDownload} disabled={isScriptDownloadLoading || isNeoLoginLoading}>
                {isScriptDownloadLoading ? "Downloading..." : "Download Script"}
              </Button>
            </Box>

            {neoActionError ? <Alert severity="error" variant="outlined">{neoActionError}</Alert> : null}
            {neoActionSuccess ? <Alert severity="success" variant="outlined">{neoActionSuccess}</Alert> : null}
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog open={showSelectionModal} onClose={() => setShowSelectionModal(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Selected Instruments</Typography>
          <IconButton size="small" onClick={() => setShowSelectionModal(false)} aria-label="Close selection">
            <FiX size={16} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gap: 1, maxHeight: "58vh", overflow: "auto", pr: 0.5 }}>
            {selectedEntries.map((entry) => {
              const key = instrumentKey(entry.instrument);
              return (
                <Card key={key} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>{normalize(entry.instrument.tradingSymbol)}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {normalize(entry.instrument.symbol)} • {normalize(entry.instrument.exchangeSegment)}
                        </Typography>
                      </Box>
                      <Button size="small" variant="outlined" onClick={() => toggleInstrumentSelection(entry.instrument)}>
                        Remove
                      </Button>
                    </Box>

                    <Box sx={{ mt: 1.25, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                      <TextField
                        label="Quantity"
                        type="number"
                        size="small"
                        value={entry.quantity}
                        onChange={(event) => updateSelectedInput(key, "quantity", event.target.value)}
                      />
                      <TextField
                        label="Avg Price"
                        type="number"
                        size="small"
                        value={entry.avgPrice}
                        onChange={(event) => updateSelectedInput(key, "avgPrice", event.target.value)}
                      />
                      <Select
                        size="small"
                        value={entry.side}
                        onChange={(event) => updateSelectedInput(key, "side", event.target.value)}
                      >
                        <MenuItem value="LONG">LONG</MenuItem>
                        <MenuItem value="SHORT">SHORT</MenuItem>
                      </Select>
                      <Select
                        size="small"
                        value={entry.product}
                        onChange={(event) => updateSelectedInput(key, "product", event.target.value)}
                      >
                        <MenuItem value="NRML">NRML</MenuItem>
                        <MenuItem value="MIS">MIS</MenuItem>
                      </Select>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Add quantity and average price for each selected instrument.</Typography>
            {saveValidationError ? <Typography variant="caption" sx={{ display: "block", color: "error.main" }}>{saveValidationError}</Typography> : null}
            {saveOrdersError ? <Typography variant="caption" sx={{ display: "block", color: "error.main" }}>{saveOrdersError}</Typography> : null}
          </Box>
          <Button
            onClick={() => {
              void saveDraftPositions();
            }}
            disabled={!!saveValidationError || isSavingOrders}
            variant="contained"
            size="small"
          >
            {isSavingOrders ? "Saving orders..." : "Save and route F&O"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}