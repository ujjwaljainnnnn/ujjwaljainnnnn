"use client";

import type { CSSProperties } from "react";
import { DollarSign, Percent } from "lucide-react";

interface BetControlsProps {
  betAmount: number;
  onBetAmountChange: (value: number) => void;
  payoutPct: number;
  onPayoutPctChange: (value: number) => void;
  disabled?: boolean;
}

function fillStyle(value: number, min: number, max: number): CSSProperties {
  const pct = ((value - min) / (max - min)) * 100;
  return { "--range-fill": `${pct}%` } as CSSProperties;
}

export default function BetControls({
  betAmount,
  onBetAmountChange,
  payoutPct,
  onPayoutPctChange,
  disabled,
}: BetControlsProps) {
  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-white/50">
            <DollarSign className="h-3.5 w-3.5" />
            Bet Amount
          </label>
          <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-0.5 text-sm font-bold text-white shadow-[0_0_10px_rgba(139,92,246,0.15)]">
            ${betAmount}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={500}
          step={1}
          value={betAmount}
          disabled={disabled}
          onChange={(e) => onBetAmountChange(Number(e.target.value))}
          style={fillStyle(betAmount, 1, 500)}
          className="w-full disabled:opacity-40"
        />
        <div className="mt-1 flex justify-between text-[10px] text-white/30">
          <span>$1</span>
          <span>$500</span>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-white/50">
            <Percent className="h-3.5 w-3.5" />
            Simulated Payout
          </label>
          <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-0.5 text-sm font-bold text-white shadow-[0_0_10px_rgba(139,92,246,0.15)]">
            {payoutPct}%
          </span>
        </div>
        <input
          type="range"
          min={70}
          max={95}
          step={1}
          value={payoutPct}
          disabled={disabled}
          onChange={(e) => onPayoutPctChange(Number(e.target.value))}
          style={fillStyle(payoutPct, 70, 95)}
          className="w-full disabled:opacity-40"
        />
        <div className="mt-1 flex justify-between text-[10px] text-white/30">
          <span>70%</span>
          <span>95%</span>
        </div>
      </div>
    </div>
  );
}
