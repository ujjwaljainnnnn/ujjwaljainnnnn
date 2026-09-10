export interface Candle {
  time: number; // unix seconds (UTC), matches lightweight-charts UTCTimestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type Direction = "UP" | "DOWN" | "NEUTRAL";

export interface AnalysisResult {
  direction: Direction;
  confidence: number; // 0-100
  pattern_detected: string;
  reasoning: string;
  expected_value: number;
  ev_per_dollar: number;
  is_positive_ev: boolean;
  bet_amount: number;
  payout_pct: number;
}

export interface AnalyzeRequestPayload {
  symbol: string;
  candles: Candle[];
  bet_amount: number;
  payout_pct: number;
}

export type TradeStatus = "idle" | "pending" | "won" | "lost";

export interface DemoTrade {
  id: string;
  direction: Direction;
  entryPrice: number;
  betAmount: number;
  payoutPct: number;
  startedAt: number;
  durationMs: number;
  status: TradeStatus;
  exitPrice?: number;
  pnl?: number;
}
