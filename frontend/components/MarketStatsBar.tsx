"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import type { TickerStats } from "@/lib/useBinanceTicker";
import { cn, formatPrice } from "@/lib/utils";

interface MarketStatsBarProps {
  symbol: string;
  stats: TickerStats | null;
}

function StatCell({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wider text-white/35">{label}</span>
      <span className={cn("text-sm font-semibold tabular-nums text-white/85", className)}>
        {value}
      </span>
    </div>
  );
}

export default function MarketStatsBar({ symbol, stats }: MarketStatsBarProps) {
  const isUp = (stats?.changePct ?? 0) >= 0;

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 backdrop-blur-md">
      <div className="flex items-center gap-2.5">
        <div className="icon-badge bg-gradient-to-br from-neon-purple/30 to-neon-blue/20">
          <TrendingUp className="h-4 w-4 text-neon-purple" />
        </div>
        <div>
          <p className="text-xs font-semibold text-white/70">{symbol.replace("USDT", "/USDT")}</p>
          <div className="flex items-baseline gap-2">
            {stats ? (
              <motion.span
                key={Math.round(stats.lastPrice)}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                className="text-xl font-bold neon-text-green tabular-nums"
              >
                ${formatPrice(stats.lastPrice)}
              </motion.span>
            ) : (
              <span className="h-6 w-28 animate-pulse rounded skeleton-shimmer" />
            )}
          </div>
        </div>
      </div>

      {stats ? (
        <>
          <div
            className={cn(
              "flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold",
              isUp ? "bg-neon-green/10 text-neon-green" : "bg-neon-red/10 text-neon-red"
            )}
          >
            {isUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {isUp ? "+" : ""}
            {stats.changePct.toFixed(2)}%
          </div>

          <div className="hidden sm:block h-8 w-px bg-white/10" />

          <StatCell label="24h High" value={`$${formatPrice(stats.high)}`} className="text-neon-green" />
          <StatCell label="24h Low" value={`$${formatPrice(stats.low)}`} className="text-neon-red" />
          <StatCell label="24h Volume" value={`${(stats.volume / 1000).toFixed(1)}K`} />
        </>
      ) : (
        <div className="flex gap-4">
          <span className="h-8 w-20 animate-pulse rounded skeleton-shimmer" />
          <span className="h-8 w-20 animate-pulse rounded skeleton-shimmer" />
          <span className="h-8 w-20 animate-pulse rounded skeleton-shimmer" />
        </div>
      )}
    </div>
  );
}
