"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Timer } from "lucide-react";
import type { DemoTrade } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";

interface ActiveTradeCardProps {
  trade: DemoTrade;
  currentPrice: number | null;
}

export default function ActiveTradeCard({ trade, currentPrice }: ActiveTradeCardProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  const elapsed = now - trade.startedAt;
  const remainingMs = Math.max(trade.durationMs - elapsed, 0);
  const remainingSec = Math.ceil(remainingMs / 1000);
  const progress = Math.min(elapsed / trade.durationMs, 1);

  const isUp = trade.direction === "UP";
  const Icon = isUp ? TrendingUp : TrendingDown;

  const floatingDelta = currentPrice != null ? currentPrice - trade.entryPrice : 0;
  const isWinningNow = isUp ? floatingDelta >= 0 : floatingDelta <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel space-y-3 border-neon-purple/30 p-5"
    >
      <div className="flex items-center justify-between">
        <div className={cn("flex items-center gap-2 font-bold", isUp ? "text-neon-green" : "text-neon-red")}>
          <Icon className="h-4 w-4" />
          <span className="text-sm">Demo Trade Live &middot; {trade.direction}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-white/50">
          <Timer className="h-3.5 w-3.5" />
          {remainingSec}s
        </div>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-neon-purple to-neon-blue"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-white/50">
          Entry: <span className="font-semibold text-white/80">${formatPrice(trade.entryPrice)}</span>
        </span>
        <span className={cn("font-semibold", isWinningNow ? "text-neon-green" : "text-neon-red")}>
          {currentPrice != null ? `$${formatPrice(currentPrice)}` : "—"}
        </span>
      </div>
    </motion.div>
  );
}
