"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const REST_BASE = "https://api.binance.com/api/v3/ticker/24hr";
const WS_BASE = "wss://stream.binance.com:9443/ws";
const MAX_BACKOFF_MS = 30_000;

export interface TickerStats {
  lastPrice: number;
  changePct: number;
  high: number;
  low: number;
  volume: number;
}

export function useBinanceTicker(symbol: string) {
  const [stats, setStats] = useState<TickerStats | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempt = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closedByUser = useRef(false);

  const loadInitial = useCallback(async () => {
    try {
      const res = await fetch(`${REST_BASE}?symbol=${symbol.toUpperCase()}`);
      if (!res.ok) throw new Error(`Binance ticker REST error ${res.status}`);
      const data = await res.json();
      setStats({
        lastPrice: parseFloat(data.lastPrice),
        changePct: parseFloat(data.priceChangePercent),
        high: parseFloat(data.highPrice),
        low: parseFloat(data.lowPrice),
        volume: parseFloat(data.volume),
      });
    } catch (err) {
      console.error("Failed to load 24h ticker stats", err);
    }
  }, [symbol]);

  const connect = useCallback(() => {
    if (closedByUser.current) return;
    const ws = new WebSocket(`${WS_BASE}/${symbol.toLowerCase()}@ticker`);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectAttempt.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        setStats({
          lastPrice: parseFloat(msg.c),
          changePct: parseFloat(msg.P),
          high: parseFloat(msg.h),
          low: parseFloat(msg.l),
          volume: parseFloat(msg.v),
        });
      } catch (err) {
        console.error("Failed to parse ticker message", err);
      }
    };

    ws.onerror = () => ws.close();

    ws.onclose = () => {
      wsRef.current = null;
      if (closedByUser.current) return;
      const attempt = reconnectAttempt.current + 1;
      reconnectAttempt.current = attempt;
      const delay = Math.min(1000 * 2 ** attempt, MAX_BACKOFF_MS);
      reconnectTimer.current = setTimeout(connect, delay);
    };
  }, [symbol]);

  useEffect(() => {
    closedByUser.current = false;
    reconnectAttempt.current = 0;
    loadInitial().then(connect);

    return () => {
      closedByUser.current = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [loadInitial, connect]);

  return stats;
}
