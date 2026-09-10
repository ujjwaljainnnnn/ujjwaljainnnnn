"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Candle } from "./types";

const REST_BASE = "https://api.binance.com/api/v3/klines";
const WS_BASE = "wss://stream.binance.com:9443/ws";
const MAX_CANDLES = 300;
const MAX_BACKOFF_MS = 30_000;

export type ConnectionStatus = "connecting" | "live" | "reconnecting" | "offline";

interface BinanceKline {
  0: number; // open time
  1: string; // open
  2: string; // high
  3: string; // low
  4: string; // close
  5: string; // volume
  6: number; // close time
}

function toCandle(k: BinanceKline): Candle {
  return {
    time: Math.floor(k[0] / 1000),
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
    volume: parseFloat(k[5]),
  };
}

export function useBinanceKlines(symbol: string, interval: string) {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [lastPrice, setLastPrice] = useState<number | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempt = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closedByUser = useRef(false);
  const candlesRef = useRef<Candle[]>([]);

  const setCandlesState = useCallback((updater: (prev: Candle[]) => Candle[]) => {
    setCandles((prev) => {
      const next = updater(prev);
      candlesRef.current = next;
      return next;
    });
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch(
        `${REST_BASE}?symbol=${symbol.toUpperCase()}&interval=${interval}&limit=150`
      );
      if (!res.ok) throw new Error(`Binance REST error ${res.status}`);
      const raw: BinanceKline[] = await res.json();
      const history = raw.map(toCandle);
      setCandlesState(() => history);
      if (history.length) setLastPrice(history[history.length - 1].close);
    } catch (err) {
      // History load failure is non-fatal; the WS stream will still populate live candles.
      console.error("Failed to load candle history", err);
    }
  }, [symbol, interval, setCandlesState]);

  const connect = useCallback(() => {
    if (closedByUser.current) return;
    setStatus(reconnectAttempt.current > 0 ? "reconnecting" : "connecting");

    const stream = `${symbol.toLowerCase()}@kline_${interval}`;
    const ws = new WebSocket(`${WS_BASE}/${stream}`);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectAttempt.current = 0;
      setStatus("live");
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const k = msg.k;
        if (!k) return;
        const candle: Candle = {
          time: Math.floor(k.t / 1000),
          open: parseFloat(k.o),
          high: parseFloat(k.h),
          low: parseFloat(k.l),
          close: parseFloat(k.c),
          volume: parseFloat(k.v),
        };
        setLastPrice(candle.close);
        setCandlesState((prev) => {
          if (prev.length && prev[prev.length - 1].time === candle.time) {
            const next = prev.slice(0, -1);
            next.push(candle);
            return next;
          }
          const next = [...prev, candle];
          if (next.length > MAX_CANDLES) next.shift();
          return next;
        });
      } catch (err) {
        console.error("Failed to parse kline message", err);
      }
    };

    ws.onerror = () => {
      ws.close();
    };

    ws.onclose = () => {
      wsRef.current = null;
      if (closedByUser.current) {
        setStatus("offline");
        return;
      }
      setStatus("reconnecting");
      const attempt = reconnectAttempt.current + 1;
      reconnectAttempt.current = attempt;
      const delay = Math.min(1000 * 2 ** attempt, MAX_BACKOFF_MS);
      reconnectTimer.current = setTimeout(connect, delay);
    };
  }, [symbol, interval, setCandlesState]);

  useEffect(() => {
    closedByUser.current = false;
    reconnectAttempt.current = 0;
    loadHistory().then(connect);

    return () => {
      closedByUser.current = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [loadHistory, connect]);

  return { candles, status, lastPrice, candlesRef };
}
