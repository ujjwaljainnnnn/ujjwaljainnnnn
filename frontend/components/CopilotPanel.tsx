"use client";

import { motion } from "framer-motion";
import { ScanLine, Rocket, Loader2 } from "lucide-react";
import BetControls from "./BetControls";
import AnalysisCard from "./AnalysisCard";
import ActiveTradeCard from "./ActiveTradeCard";
import ModelSwitcher from "./ModelSwitcher";
import type { AIProvider, AnalysisResult, DemoTrade } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CopilotPanelProps {
  betAmount: number;
  onBetAmountChange: (v: number) => void;
  payoutPct: number;
  onPayoutPctChange: (v: number) => void;
  provider: AIProvider;
  onProviderChange: (p: AIProvider) => void;
  analyzing: boolean;
  onAnalyze: () => void;
  result: AnalysisResult | null;
  canAnalyze: boolean;
  activeTrade: DemoTrade | null;
  lastPrice: number | null;
  onExecuteTrade: () => void;
}

export default function CopilotPanel({
  betAmount,
  onBetAmountChange,
  payoutPct,
  onPayoutPctChange,
  provider,
  onProviderChange,
  analyzing,
  onAnalyze,
  result,
  canAnalyze,
  activeTrade,
  lastPrice,
  onExecuteTrade,
}: CopilotPanelProps) {
  const hasPendingTrade = activeTrade?.status === "pending";

  return (
    <aside className="flex h-full flex-col gap-5 overflow-y-auto p-5">
      <div className="glass-panel p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neon-purple/15">
            <ScanLine className="h-4 w-4 text-neon-purple" />
          </div>
          <h2 className="text-sm font-semibold tracking-tight">AI Copilot Console</h2>
        </div>

        <ModelSwitcher
          provider={provider}
          onChange={onProviderChange}
          disabled={analyzing || hasPendingTrade}
        />

        <BetControls
          betAmount={betAmount}
          onBetAmountChange={onBetAmountChange}
          payoutPct={payoutPct}
          onPayoutPctChange={onPayoutPctChange}
          disabled={analyzing || hasPendingTrade}
        />

        <motion.button
          whileHover={{ scale: canAnalyze ? 1.015 : 1 }}
          whileTap={{ scale: canAnalyze ? 0.985 : 1 }}
          disabled={!canAnalyze || analyzing || hasPendingTrade}
          onClick={onAnalyze}
          className={cn(
            "relative mt-5 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-3 text-sm font-bold transition-opacity",
            "bg-gradient-to-r from-neon-purple to-neon-blue shadow-glow-purple",
            (!canAnalyze || analyzing || hasPendingTrade) && "opacity-40"
          )}
        >
          {!analyzing && (
            <motion.span
              className="absolute inset-0 bg-white/20"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          {analyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing Setup&hellip;
            </>
          ) : (
            <>
              <ScanLine className="h-4 w-4" />
              Analyze Setup
            </>
          )}
        </motion.button>
        {!canAnalyze && (
          <p className="mt-2 text-center text-[11px] text-white/30">
            Waiting for enough live candle data&hellip;
          </p>
        )}
      </div>

      {hasPendingTrade && activeTrade && (
        <ActiveTradeCard trade={activeTrade} currentPrice={lastPrice} />
      )}

      {result && !hasPendingTrade && (
        <>
          <AnalysisCard result={result} />
          {result.direction === "NEUTRAL" ? (
            <p className="text-center text-xs text-white/40">
              No directional edge detected &mdash; the Copilot recommends sitting this one out.
            </p>
          ) : (
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              onClick={onExecuteTrade}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-black",
                result.direction === "DOWN"
                  ? "bg-neon-red text-white shadow-glow-red"
                  : "bg-neon-green shadow-glow-green"
              )}
            >
              <Rocket className="h-4 w-4" />
              Execute Demo Trade ({result.direction})
            </motion.button>
          )}
        </>
      )}
    </aside>
  );
}
