"use client";

import { motion } from "framer-motion";
import { Sparkles, Atom } from "lucide-react";
import type { AIProvider } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ModelSwitcherProps {
  provider: AIProvider;
  onChange: (provider: AIProvider) => void;
  disabled?: boolean;
}

const OPTIONS: { value: AIProvider; label: string; icon: typeof Sparkles }[] = [
  { value: "anthropic", label: "Claude", icon: Sparkles },
  { value: "openai", label: "GPT", icon: Atom },
];

export default function ModelSwitcher({ provider, onChange, disabled }: ModelSwitcherProps) {
  return (
    <div className="mb-4">
      <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/50">
        Reasoning Engine
      </label>
      <div className="relative flex rounded-xl border border-white/10 bg-white/5 p-1">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const active = provider === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(opt.value)}
              className={cn(
                "relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed",
                active ? "text-white" : "text-white/40 hover:text-white/70"
              )}
            >
              {active && (
                <motion.span
                  layoutId="model-switcher-active"
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-neon-purple to-neon-blue shadow-glow-purple"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className="relative z-10 h-3.5 w-3.5" />
              <span className="relative z-10">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
