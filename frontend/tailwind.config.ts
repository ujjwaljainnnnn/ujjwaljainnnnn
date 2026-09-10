import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          bg: "#0a0a0a",
          panel: "#111827",
        },
        neon: {
          green: "#10B981",
          red: "#EF4444",
          purple: "#8B5CF6",
          blue: "#3B82F6",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "glow-green": "0 0 20px rgba(16, 185, 129, 0.35)",
        "glow-red": "0 0 20px rgba(239, 68, 68, 0.35)",
        "glow-purple": "0 0 20px rgba(139, 92, 246, 0.45)",
        "glow-blue": "0 0 20px rgba(59, 130, 246, 0.35)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)",
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        scan: "scan 1.8s linear infinite",
        pulseGlow: "pulseGlow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
