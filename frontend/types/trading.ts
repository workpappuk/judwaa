export interface NeoDepthLevel {
  price: string;
  quantity: string;
  orders: string;
}

export interface NeoOhlc {
  open: string;
  high: string;
  low: string;
  close: string;
}

export interface NeoDepth {
  buy: NeoDepthLevel[];
  sell: NeoDepthLevel[];
}

export interface NeoQuoteResponse {
  exchange_token: string;
  display_symbol: string;
  exchange: string;
  lstup_time: string;
  ltp: string;
  last_traded_quantity: string;
  total_buy: string;
  total_sell: string;
  last_volume: string;
  change: string;
  per_change: string;
  year_high: string;
  year_low: string;
  ohlc?: NeoOhlc;
  depth?: NeoDepth;
}

export type PositionSide = "LONG" | "SHORT";
export type PositionProduct = "MIS" | "NRML";

export interface FnOPositionDraft {
  id: string;
  neoSymbol: string;
  label: string;
  qty: number;
  avgPrice: number;
  side: PositionSide;
  product: PositionProduct;
  expiry: string;
  strike: number;
  optionType: "CE" | "PE";
}

export interface FnOPositionView extends FnOPositionDraft {
  ltp: number;
  changePct: number;
  pnl: number;
  turnover: number;
}
