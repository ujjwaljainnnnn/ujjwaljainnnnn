"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  HistogramData,
  UTCTimestamp,
  IPriceLine,
} from "lightweight-charts";
import type { Candle, DemoTrade } from "@/lib/types";

interface TradingChartProps {
  candles: Candle[];
  activeTrade: DemoTrade | null;
}

export default function TradingChart({ candles, activeTrade }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const hasInitialData = useRef(false);
  const entryLineRef = useRef<IPriceLine | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: "transparent" },
        textColor: "rgba(255,255,255,0.55)",
        fontFamily: "var(--font-inter), Inter, sans-serif",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.04)" },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      crosshair: {
        vertLine: { color: "rgba(139,92,246,0.4)", labelBackgroundColor: "#8B5CF6" },
        horzLine: { color: "rgba(139,92,246,0.4)", labelBackgroundColor: "#8B5CF6" },
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.08)",
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.08)",
        timeVisible: true,
        secondsVisible: false,
      },
      autoSize: true,
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#10B981",
      downColor: "#EF4444",
      borderVisible: false,
      wickUpColor: "#10B981",
      wickDownColor: "#EF4444",
      priceLineVisible: true,
      lastValueVisible: true,
    });

    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
      color: "rgba(139,92,246,0.35)",
    });
    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    return () => {
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
      hasInitialData.current = false;
    };
  }, []);

  useEffect(() => {
    const candleSeries = candleSeriesRef.current;
    const volumeSeries = volumeSeriesRef.current;
    if (!candleSeries || !volumeSeries || candles.length === 0) return;

    const toCandleData = (c: Candle): CandlestickData => ({
      time: c.time as UTCTimestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    });
    const toVolumeData = (c: Candle): HistogramData => ({
      time: c.time as UTCTimestamp,
      value: c.volume,
      color: c.close >= c.open ? "rgba(16,185,129,0.35)" : "rgba(239,68,68,0.35)",
    });

    if (!hasInitialData.current) {
      candleSeries.setData(candles.map(toCandleData));
      volumeSeries.setData(candles.map(toVolumeData));
      hasInitialData.current = true;
      chartRef.current?.timeScale().scrollToRealTime();
    } else {
      const last = candles[candles.length - 1];
      candleSeries.update(toCandleData(last));
      volumeSeries.update(toVolumeData(last));
    }
  }, [candles]);

  useEffect(() => {
    const candleSeries = candleSeriesRef.current;
    if (!candleSeries) return;

    if (entryLineRef.current) {
      candleSeries.removePriceLine(entryLineRef.current);
      entryLineRef.current = null;
    }

    if (activeTrade && activeTrade.status === "pending") {
      entryLineRef.current = candleSeries.createPriceLine({
        price: activeTrade.entryPrice,
        color: activeTrade.direction === "UP" ? "#10B981" : "#EF4444",
        lineWidth: 2,
        lineStyle: 2,
        axisLabelVisible: true,
        title: `Entry (${activeTrade.direction})`,
      });
    }
  }, [activeTrade]);

  return <div ref={containerRef} className="h-full w-full" />;
}
