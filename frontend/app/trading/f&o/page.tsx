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
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

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
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));

  return `${value >= 0 ? "+" : "-"}${formatted}`;
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
    }, 1000);

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
  const totalOrderNotional = orderRows.reduce((sum, order) => sum + order.notional, 0);

  const positionTabContent = (
    <>
      {!draftsHydrated ? (
        <Box sx={{ pt: 1.5 }}>
          <Alert severity="info" variant="outlined">Restoring saved positions...</Alert>
        </Box>
      ) : null}
      {draftsHydrated && rows.length === 0 ? (
        <Box sx={{ pt: 1.5 }}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: "action.hover", display: "grid", placeItems: "center" }}>
                <FiPlusCircle size={16} />
              </Box>
              <Typography variant="subtitle2" sx={{ mt: 1.5, fontWeight: 700 }}>No positions selected</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                Go to Instruments and select contracts with quantity and average price.
              </Typography>
              <Button component={Link} href="/trading/instrument" startIcon={<FiPlusCircle />} variant="outlined" size="small" sx={{ mt: 1.5 }}>
                Select Instruments
              </Button>
            </CardContent>
          </Card>
        </Box>
      ) : null}
      <Box sx={{ mt: 1.5 }}>
        <Card variant="outlined" sx={{ bgcolor: totalPnl >= 0 ? "success.50" : "error.50" }}>
          <CardContent sx={{ textAlign: "center", py: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Typography variant="caption" color="text.secondary">Day P&L</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: totalPnl >= 0 ? "success.main" : "error.main" }}>{formatCompact(totalPnl)}</Typography>
          </CardContent>
        </Card>
      </Box>
      <Box sx={{ pt: 1.5, display: "grid", gap: 1.25 }}>
        {error ? (
          <Alert severity="error" variant="outlined">{error}</Alert>
        ) : null}

        {rows.map((row) => (
          <Card
            key={row.id}
            variant="outlined"
          >
            <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>{row.label}</Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {row.expiry} • {row.product} • Lots {row.qty}
                </Typography>
              </Box>

              <Chip size="small" color={row.side === "LONG" ? "success" : "error"} variant="outlined" label={row.side} />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 1, mt: 1.5 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}><FiHash size={12} />Avg</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatMoney(row.avgPrice)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}><FiBarChart2 size={12} />LTP</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatMoney(row.ltp)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                  {row.changePct >= 0 ? <FiArrowUpRight size={12} /> : <FiArrowDownRight size={12} />}Chg
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: row.changePct >= 0 ? "success.main" : "error.main" }}>{formatSignedPercent(row.changePct)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}><FiTrendingUp size={12} />P&L</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: row.pnl >= 0 ? "success.main" : "error.main" }}>{formatMoney(row.pnl)}</Typography>
              </Box>
            </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </>
  );

  const ordersTabContent = (
    <Box sx={{ pt: 1.5, display: "grid", gap: 1.25 }}>
      {!draftsHydrated ? (
        <Alert severity="info" variant="outlined">Restoring selected instruments...</Alert>
      ) : null}

      {draftsHydrated && orderRows.length === 0 ? (
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: "action.hover", display: "grid", placeItems: "center" }}>
              <FiClipboard size={16} />
            </Box>
            <Typography variant="subtitle2" sx={{ mt: 1.5, fontWeight: 700 }}>No orders created</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
              Select instruments first to generate order entries.
            </Typography>
            <Button component={Link} href="/trading/instrument" startIcon={<FiPlusCircle />} variant="outlined" size="small" sx={{ mt: 1.5 }}>
              Select Instruments
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {draftsHydrated && orderRows.length > 0 ? (
        <>
          <Card variant="outlined">
            <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
              <Typography variant="caption" color="text.secondary">Order book notional</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatMoney(totalOrderNotional)}</Typography>
            </CardContent>
          </Card>

          <TableContainer component={Card} variant="outlined">
              <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: "42%" }}>Symbol</TableCell>
                  <TableCell sx={{ width: "16%" }}>Side</TableCell>
                  <TableCell sx={{ width: "12%", textAlign: "right" }}>Qty</TableCell>
                  <TableCell sx={{ width: "18%", textAlign: "right" }}>Limit</TableCell>
                  <TableCell sx={{ width: "12%", textAlign: "center" }}>View</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderRows.map((order) => (
                  <TableRow
                    key={order.id}
                    hover
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{order.symbol}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {order.expiry} • {order.product}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" color={order.side === "LONG" ? "success" : "error"} variant="outlined" label={order.side === "LONG" ? "BUY" : "SELL"} />
                    </TableCell>
                    <TableCell sx={{ textAlign: "right" }}>{order.qty}</TableCell>
                    <TableCell sx={{ textAlign: "right", fontWeight: 600 }}>{formatMoney(order.limitPrice)}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      <IconButton
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        aria-label={`View order details for ${order.symbol}`}
                        size="small"
                        color="primary"
                      >
                        <FiEye size={14} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              </Table>
          </TableContainer>
        </>
      ) : null}
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ minHeight: "100vh", pb: 4 }}>
      <Box sx={{ position: "sticky", top: 56, zIndex: 10, bgcolor: "background.default", py: 1.5 }}>
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

      </Box>

      <Dialog
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        fullWidth
        maxWidth="sm"
        aria-labelledby="order-details-title"
      >
        {selectedOrder ? (
        <>
          <DialogTitle id="order-details-title" sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1.5 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Order Details</Typography>
              <Typography variant="caption" color="text.secondary">{selectedOrder.symbol}</Typography>
            </Box>
            <IconButton
              onClick={() => setSelectedOrder(null)}
              aria-label="Close order details"
              size="small"
            >
              <FiX size={16} />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mb: 1.5 }}>
              <Card variant="outlined"><CardContent sx={{ py: 1.25, "&:last-child": { pb: 1.25 } }}><Typography variant="caption" color="text.secondary">Symbol</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedOrder.neoSymbol}</Typography></CardContent></Card>
              <Card variant="outlined"><CardContent sx={{ py: 1.25, "&:last-child": { pb: 1.25 } }}><Typography variant="caption" color="text.secondary">Side</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedOrder.side === "LONG" ? "BUY" : "SELL"}</Typography></CardContent></Card>
              <Card variant="outlined"><CardContent sx={{ py: 1.25, "&:last-child": { pb: 1.25 } }}><Typography variant="caption" color="text.secondary">Product</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedOrder.product}</Typography></CardContent></Card>
              <Card variant="outlined"><CardContent sx={{ py: 1.25, "&:last-child": { pb: 1.25 } }}><Typography variant="caption" color="text.secondary">Quantity</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedOrder.qty}</Typography></CardContent></Card>
              <Card variant="outlined"><CardContent sx={{ py: 1.25, "&:last-child": { pb: 1.25 } }}><Typography variant="caption" color="text.secondary">Expiry</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedOrder.expiry}</Typography></CardContent></Card>
              <Card variant="outlined"><CardContent sx={{ py: 1.25, "&:last-child": { pb: 1.25 } }}><Typography variant="caption" color="text.secondary">Strike / Type</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedOrder.strike} {selectedOrder.optionType}</Typography></CardContent></Card>
            </Box>

            <Card variant="outlined" sx={{ mb: 1 }}><CardContent sx={{ py: 1.25, "&:last-child": { pb: 1.25 }, display: "flex", justifyContent: "space-between" }}><Typography variant="caption" color="text.secondary">Limit Price</Typography><Typography variant="body2" sx={{ fontWeight: 700 }}>{formatMoney(selectedOrder.limitPrice)}</Typography></CardContent></Card>
            <Card variant="outlined"><CardContent sx={{ py: 1.25, "&:last-child": { pb: 1.25 }, display: "flex", justifyContent: "space-between" }}><Typography variant="caption" color="text.secondary">Total Order Value</Typography><Typography variant="body2" sx={{ fontWeight: 700 }}>{formatMoney(selectedOrder.notional)}</Typography></CardContent></Card>
          </DialogContent>
        </>
        ) : null}
      </Dialog>
    </Container>
  );
}