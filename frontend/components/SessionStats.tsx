"use client";

import { Trophy, Percent, LineChart } from "lucide-react";
import { formatUsd, cn } from "@/lib/utils";

interface SessionStatsProps {
  sessionPnl: number;
  tradesCount: number;
  winsCount: number;
}

export default function SessionStats({ sessionPnl, tradesCount, winsCount }: SessionStatsProps) {
  const winRate = tradesCount > 0 ? (winsCount / tradesCount) * 100 : null;

  return (
    <div className="glass-panel glass-panel-hover p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="icon-badge bg-neon-blue/10">
          <LineChart className="h-4 w-4 text-neon-blue" />
        </div>
        <h3 className="text-sm font-semibold tracking-tight">Session Performance</h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <p className="text-[10px] uppercase tracking-wider text-white/35">Session P/L</p>
          <p
            className={cn(
              "mt-1 text-lg font-bold tabular-nums",
              sessionPnl > 0 && "neon-text-green",
              sessionPnl < 0 && "neon-text-red",
              sessionPnl === 0 && "text-white/70"
            )}
          >
            {formatUsd(sessionPnl, { showSign: true })}
          </p>
        </div>

        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-white/35">
            <Trophy className="h-3 w-3" /> Trades
          </p>
          <p className="mt-1 text-lg font-bold tabular-nums text-white/85">{tradesCount}</p>
        </div>

        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-white/35">
            <Percent className="h-3 w-3" /> Win Rate
          </p>
          <p className="mt-1 text-lg font-bold tabular-nums text-white/85">
            {winRate != null ? `${winRate.toFixed(0)}%` : "—"}
          </p>
        </div>
      </div>

      {tradesCount === 0 && (
        <p className="mt-3 text-center text-[11px] text-white/30">
          Run an analysis and execute a demo trade to start tracking your session.
        </p>
      )}
    </div>
  );
}
