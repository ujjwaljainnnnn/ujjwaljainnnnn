"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BrainCircuit } from "lucide-react";

interface ScanningOverlayProps {
  active: boolean;
}

export default function ScanningOverlay({ active }: ScanningOverlayProps) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-2xl"
        >
          <div className="absolute inset-0 bg-neon-purple/5" />

          <div
            className="absolute inset-x-0 h-24 animate-scan"
            style={{
              background:
                "linear-gradient(to bottom, transparent, rgba(139,92,246,0.35), transparent)",
            }}
          />

          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(rgba(139,92,246,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.15) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute left-1/2 top-4 flex -translate-x-1/2 items-center gap-2 rounded-full border border-neon-purple/40 bg-black/60 px-4 py-1.5 backdrop-blur-md"
          >
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <BrainCircuit className="h-4 w-4 text-neon-purple" />
            </motion.span>
            <span className="text-xs font-medium tracking-wide text-white/80">
              Scanning price action&hellip;
            </span>
          </motion.div>

          {[0.2, 0.5, 0.8].map((pos, i) => (
            <motion.div
              key={i}
              className="absolute h-px w-full bg-neon-purple/40"
              style={{ top: `${pos * 100}%` }}
              animate={{ opacity: [0.1, 0.6, 0.1] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
