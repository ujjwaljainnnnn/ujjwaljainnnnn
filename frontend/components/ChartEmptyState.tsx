"use client";

import { motion } from "framer-motion";
import { Radio } from "lucide-react";
import type { ConnectionStatus } from "@/lib/useBinanceKlines";

interface ChartEmptyStateProps {
  status: ConnectionStatus;
}

const copy: Record<ConnectionStatus, string> = {
  connecting: "Establishing live market feed",
  reconnecting: "Reconnecting to live market feed",
  live: "Waiting for candle data",
  offline: "Live feed offline — retrying shortly",
};

export default function ChartEmptyState({ status }: ChartEmptyStateProps) {
  return (
    <div className="absolute inset-0 z-[5] flex flex-col items-center justify-center gap-3">
      <div className="grid w-full grid-cols-12 items-end gap-1 px-8 opacity-[0.15]">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="skeleton-shimmer rounded-sm"
            style={{ height: `${20 + ((i * 37) % 60)}px` }}
          />
        ))}
      </div>
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.8, repeat: Infinity }}
        className="absolute flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-4 py-2 backdrop-blur-md"
      >
        <Radio className="h-3.5 w-3.5 text-neon-purple" />
        <span className="text-xs font-medium text-white/70">{copy[status]}&hellip;</span>
      </motion.div>
    </div>
  );
}
