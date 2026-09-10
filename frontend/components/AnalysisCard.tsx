"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Target, Gauge, Cpu } from "lucide-react";
import type { AnalysisResult } from "@/lib/types";
import { formatUsd, cn } from "@/lib/utils";

interface AnalysisCardProps {
  result: AnalysisResult;
}

const directionConfig = {
  UP: { icon: TrendingUp, label: "BULLISH", color: "text-neon-green", glow: "shadow-glow-green" },
  DOWN: { icon: TrendingDown, label: "BEARISH", color: "text-neon-red", glow: "shadow-glow-red" },
  NEUTRAL: { icon: Minus, label: "NEUTRAL", color: "text-white/60", glow: "" },
};

export default function AnalysisCard({ result }: AnalysisCardProps) {
  const dir = directionConfig[result.direction];
  const Icon = dir.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className={cn(
        "glass-panel space-y-4 p-5",
        result.is_positive_ev ? "border-neon-green/30" : "border-neon-red/30"
      )}
    >
      <div className="flex items-center justify-between">
        <div className={cn("flex items-center gap-2 font-bold", dir.color)}>
          <Icon className="h-5 w-5" />
          <span className="text-lg tracking-tight">{dir.label}</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1">
          <Gauge className="h-3.5 w-3.5 text-neon-purple" />
          <span className="text-xs font-semibold text-white/80">
            {result.confidence}% confidence
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
        <Target className="h-4 w-4 shrink-0 text-neon-blue" />
        <span className="text-sm font-medium text-white/90">{result.pattern_detected}</span>
      </div>

      <p className="text-sm leading-relaxed text-white/60">{result.reasoning}</p>

      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/30">
        <Cpu className="h-3 w-3" />
        Analyzed by {result.model_used}
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-white/40">Expected Value</p>
          <p
            className={cn(
              "text-xl font-bold",
              result.is_positive_ev ? "neon-text-green" : "neon-text-red"
            )}
          >
            {formatUsd(result.expected_value, { showSign: true })}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-white/40">EV per $1</p>
          <p
            className={cn(
              "text-xl font-bold",
              result.is_positive_ev ? "text-neon-green" : "text-neon-red"
            )}
          >
            {result.ev_per_dollar >= 0 ? "+" : ""}
            {result.ev_per_dollar.toFixed(3)}
          </p>
        </div>
      </div>

      {!result.is_positive_ev && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-start gap-2 rounded-lg border border-neon-red/30 bg-neon-red/10 px-3 py-2.5"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-neon-red" />
          <p className="text-xs font-medium leading-relaxed text-neon-red">
            Negative Expectancy: The House Edge Wins Here. Over many trades at this
            confidence and payout, this setup loses money on average.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
