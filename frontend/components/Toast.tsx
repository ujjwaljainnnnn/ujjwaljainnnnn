"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  description?: string;
}

interface ToastStackProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const colorMap = {
  success: { border: "border-neon-green/40", icon: "text-neon-green", glow: "shadow-glow-green" },
  error: { border: "border-neon-red/40", icon: "text-neon-red", glow: "shadow-glow-red" },
  info: { border: "border-neon-purple/40", icon: "text-neon-purple", glow: "shadow-glow-purple" },
};

export default function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex w-80 flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type];
          const colors = colorMap[toast.type];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className={cn(
                "glass-panel pointer-events-auto flex items-start gap-3 border p-4",
                colors.border,
                colors.glow
              )}
              onClick={() => onDismiss(toast.id)}
              role="button"
            >
              <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", colors.icon)} />
              <div>
                <p className="text-sm font-semibold text-white">{toast.title}</p>
                {toast.description && (
                  <p className="mt-0.5 text-xs text-white/60">{toast.description}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
