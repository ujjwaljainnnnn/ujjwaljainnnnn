"use client";

import { useCallback, useState } from "react";
import Navbar from "@/components/Navbar";
import TradingChart from "@/components/TradingChart";
import ScanningOverlay from "@/components/ScanningOverlay";
import ChartEmptyState from "@/components/ChartEmptyState";
import MarketStatsBar from "@/components/MarketStatsBar";
import CopilotPanel from "@/components/CopilotPanel";
import ToastStack, { ToastMessage } from "@/components/Toast";
import { useBinanceKlines } from "@/lib/useBinanceKlines";
import { useBinanceTicker } from "@/lib/useBinanceTicker";
import { analyzeChart } from "@/lib/api";
import type { AIProvider, AnalysisResult, DemoTrade } from "@/lib/types";
import { formatUsd, formatPrice } from "@/lib/utils";

const SYMBOL = "BTCUSDT";
const INTERVAL = "1m";
const TRADE_DURATION_MS = 30_000;
const STARTING_BALANCE = 10_000;

export default function Home() {
  const { candles, status, lastPrice, candlesRef } = useBinanceKlines(SYMBOL, INTERVAL);
  const tickerStats = useBinanceTicker(SYMBOL);

  const [balance, setBalance] = useState(STARTING_BALANCE);
  const [betAmount, setBetAmount] = useState(10);
  const [payoutPct, setPayoutPct] = useState(80);
  const [provider, setProvider] = useState<AIProvider>("anthropic");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTrade, setActiveTrade] = useState<DemoTrade | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [tradesCount, setTradesCount] = useState(0);
  const [winsCount, setWinsCount] = useState(0);

  const pushToast = useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (candlesRef.current.length < 20) return;
    setAnalyzing(true);
    setResult(null);
    try {
      const snapshot = candlesRef.current.slice(-50);
      const [analysis] = await Promise.all([
        analyzeChart({
          symbol: SYMBOL,
          candles: snapshot,
          bet_amount: betAmount,
          payout_pct: payoutPct,
          provider,
        }),
        new Promise((resolve) => setTimeout(resolve, 1400)), // let the scan animation play out
      ]);
      setResult(analysis);
    } catch (err) {
      console.error(err);
      pushToast({
        type: "error",
        title: "Analysis failed",
        description: "Could not reach the AI Copilot engine. Please try again.",
      });
    } finally {
      setAnalyzing(false);
    }
  }, [betAmount, payoutPct, provider, candlesRef, pushToast]);

  const handleExecuteTrade = useCallback(() => {
    if (!result || result.direction === "NEUTRAL" || lastPrice == null) return;

    const trade: DemoTrade = {
      id: `${Date.now()}`,
      direction: result.direction,
      entryPrice: lastPrice,
      betAmount,
      payoutPct,
      startedAt: Date.now(),
      durationMs: TRADE_DURATION_MS,
      status: "pending",
    };
    setActiveTrade(trade);
    setBalance((b) => b - betAmount);
    pushToast({
      type: "info",
      title: "Demo trade placed",
      description: `${trade.direction} $${betAmount} @ $${formatPrice(trade.entryPrice)}. Resolving in 30s.`,
    });

    setTimeout(() => {
      const candlesNow = candlesRef.current;
      const exitPrice =
        candlesNow.length > 0 ? candlesNow[candlesNow.length - 1].close : trade.entryPrice;

      const won =
        trade.direction === "UP" ? exitPrice > trade.entryPrice : exitPrice < trade.entryPrice;

      const payout = trade.betAmount * (trade.payoutPct / 100);
      const pnl = won ? payout : -trade.betAmount;

      // The stake was already deducted when the trade was placed; a win returns
      // the stake plus the payout, a loss returns nothing further.
      if (won) {
        setBalance((b) => b + trade.betAmount + payout);
      }
      setTradesCount((c) => c + 1);
      if (won) setWinsCount((c) => c + 1);
      setActiveTrade((current) =>
        current && current.id === trade.id
          ? { ...current, status: won ? "won" : "lost", exitPrice, pnl }
          : current
      );

      pushToast({
        type: won ? "success" : "error",
        title: won ? "Trade won!" : "Trade lost",
        description: `${trade.direction} closed at $${formatPrice(exitPrice)}. ${
          won ? `+${formatUsd(payout)}` : `-${formatUsd(trade.betAmount)}`
        }`,
      });

      setTimeout(() => {
        setActiveTrade((current) => (current && current.id === trade.id ? null : current));
        setResult(null);
      }, 2500);
    }, TRADE_DURATION_MS);
  }, [result, lastPrice, betAmount, payoutPct, candlesRef, pushToast]);

  return (
    <div className="flex h-screen flex-col">
      <Navbar balance={balance} connectionStatus={status} />

      <main className="flex flex-1 overflow-hidden">
        <section className="flex w-full flex-col gap-3 p-4 lg:w-[65%]">
          <MarketStatsBar symbol={SYMBOL} stats={tickerStats} />

          <div className="glass-panel relative min-h-0 flex-1 overflow-hidden p-2">
            <ScanningOverlay active={analyzing} />
            {candles.length === 0 && <ChartEmptyState status={status} />}
            <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 backdrop-blur-md">
              <span className="text-xs font-semibold text-white/80">1m Candles</span>
            </div>
            <TradingChart candles={candles} activeTrade={activeTrade} />
          </div>
        </section>

        <div className="hidden w-px bg-white/10 lg:block" />

        <section className="w-full lg:w-[35%]">
          <CopilotPanel
            betAmount={betAmount}
            onBetAmountChange={setBetAmount}
            payoutPct={payoutPct}
            onPayoutPctChange={setPayoutPct}
            provider={provider}
            onProviderChange={setProvider}
            analyzing={analyzing}
            onAnalyze={handleAnalyze}
            result={result}
            canAnalyze={candles.length >= 20}
            activeTrade={activeTrade}
            lastPrice={lastPrice}
            onExecuteTrade={handleExecuteTrade}
            sessionPnl={balance - STARTING_BALANCE}
            tradesCount={tradesCount}
            winsCount={winsCount}
          />
        </section>
      </main>

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
