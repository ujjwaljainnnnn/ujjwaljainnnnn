"use client";

import { motion } from "framer-motion";
import { Sparkles, Wallet, Crown, Wifi, WifiOff } from "lucide-react";
import { formatUsd, cn } from "@/lib/utils";
import type { ConnectionStatus } from "@/lib/useBinanceKlines";

interface NavbarProps {
  balance: number;
  connectionStatus: ConnectionStatus;
}

const statusConfig: Record<ConnectionStatus, { label: string; dot: string }> = {
  connecting: { label: "Connecting", dot: "bg-yellow-400" },
  live: { label: "Live", dot: "bg-neon-green" },
  reconnecting: { label: "Reconnecting", dot: "bg-yellow-400" },
  offline: { label: "Offline", dot: "bg-neon-red" },
};

export default function Navbar({ balance, connectionStatus }: NavbarProps) {
  const status = statusConfig[connectionStatus];

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue shadow-glow-purple">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-bold tracking-tight">Nexus Copilot</span>
          <span className="text-[10px] uppercase tracking-widest text-white/40">
            AI Trading Coach
          </span>
        </div>

        <div className="ml-4 hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 sm:flex">
          {connectionStatus === "offline" ? (
            <WifiOff className="h-3 w-3 text-neon-red" />
          ) : (
            <Wifi className="h-3 w-3 text-white/50" />
          )}
          <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
          <span className="text-[11px] text-white/60">{status.label}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2">
          <Wallet className="h-4 w-4 text-neon-green" />
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] uppercase tracking-wider text-white/40">
              Demo Balance
            </span>
            <motion.span
              key={balance}
              initial={{ opacity: 0.4, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-bold neon-text-green"
            >
              {formatUsd(balance)}
            </motion.span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-neon-purple to-neon-blue px-4 py-2 text-xs font-semibold shadow-glow-purple"
        >
          <Crown className="h-3.5 w-3.5" />
          Upgrade to Pro
        </motion.button>
      </div>
    </header>
  );
}
