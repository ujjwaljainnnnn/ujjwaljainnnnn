import type { AnalyzeRequestPayload, AnalysisResult } from "./types";

export async function analyzeChart(payload: AnalyzeRequestPayload): Promise<AnalysisResult> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Analysis request failed (${res.status}): ${text}`);
  }

  return res.json();
}
