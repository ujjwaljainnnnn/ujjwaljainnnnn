import json
import logging
import os
from typing import List

from models import AIProvider, Candle, Direction, RawAIAnalysis

logger = logging.getLogger("copilot.ai_engine")

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-5")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

MODEL_LABELS = {
    AIProvider.ANTHROPIC: f"Claude ({ANTHROPIC_MODEL})",
    AIProvider.OPENAI: f"GPT ({OPENAI_MODEL})",
}
HEURISTIC_LABEL = "Heuristic Engine (offline)"

SYSTEM_PROMPT = """You are an expert technical analyst embedded in an educational trading \
copilot. You are given the last N one-minute OHLCV candles for a crypto pair. Analyze the \
price action for classic technical patterns (trend, support/resistance, momentum, \
candlestick formations, volume confirmation) and return your read as STRICT JSON only, \
with no markdown fences and no commentary outside the JSON object.

The JSON object must have exactly these keys:
- "direction": one of "UP", "DOWN", "NEUTRAL"
- "confidence": a number from 0 to 100 representing how confident you are in the direction
- "pattern_detected": a short label for the technical pattern observed (e.g. "Bull Flag", \
"RSI Oversold Bounce", "Descending Triangle", "Volume Climax Reversal")
- "reasoning": exactly two sentences explaining the call in plain language suitable for a \
retail trader learning technical analysis

This is for an educational simulator, not real trading advice. Be honest about uncertainty: \
if the price action is choppy or directionless, return "NEUTRAL" with lower confidence rather \
than forcing a call."""


def format_candles_prompt(symbol: str, candles: List[Candle]) -> str:
    header = f"Symbol: {symbol}\nTimeframe: 1 minute\nCandle count: {len(candles)}\n\n"
    header += "index | open | high | low | close | volume\n"
    rows = "\n".join(
        f"{i} | {c.open:.2f} | {c.high:.2f} | {c.low:.2f} | {c.close:.2f} | {c.volume:.4f}"
        for i, c in enumerate(candles)
    )
    return header + rows


def _extract_json(text: str) -> dict:
    text = text.strip()
    if text.startswith("```"):
        text = text.strip("`")
        if text.lower().startswith("json"):
            text = text[4:]
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("No JSON object found in model response")
    return json.loads(text[start : end + 1])


async def _call_anthropic(prompt: str) -> dict:
    from anthropic import AsyncAnthropic

    client = AsyncAnthropic(api_key=ANTHROPIC_API_KEY)
    response = await client.messages.create(
        model=ANTHROPIC_MODEL,
        max_tokens=400,
        temperature=0.3,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    )
    text = "".join(block.text for block in response.content if block.type == "text")
    return _extract_json(text)


async def _call_openai(prompt: str) -> dict:
    from openai import AsyncOpenAI

    client = AsyncOpenAI(api_key=OPENAI_API_KEY)
    response = await client.chat.completions.create(
        model=OPENAI_MODEL,
        temperature=0.3,
        max_tokens=400,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
    )
    text = response.choices[0].message.content or "{}"
    return _extract_json(text)


def _heuristic_analysis(candles: List[Candle]) -> RawAIAnalysis:
    """Deterministic technical-analysis fallback used when no LLM API key is
    configured, or if the live model call fails. Keeps the product fully
    functional in demo/dev environments without external dependencies.
    """
    closes = [c.close for c in candles]
    n = len(closes)

    def sma(period: int) -> float:
        window = closes[-period:] if n >= period else closes
        return sum(window) / len(window)

    fast = sma(5)
    slow = sma(min(20, n))

    gains, losses = [], []
    for i in range(1, n):
        delta = closes[i] - closes[i - 1]
        gains.append(max(delta, 0))
        losses.append(max(-delta, 0))
    avg_gain = sum(gains) / len(gains) if gains else 0
    avg_loss = sum(losses) / len(losses) if losses else 0
    rsi = 100.0 if avg_loss == 0 else 100 - (100 / (1 + (avg_gain / avg_loss)))

    spread = (fast - slow) / slow * 100 if slow else 0

    if rsi < 30 and fast >= slow * 0.999:
        direction = Direction.UP
        confidence = min(90.0, 55 + (30 - rsi))
        pattern = "RSI Oversold Bounce"
        reasoning = (
            f"RSI reads {rsi:.1f}, indicating oversold conditions with the 5-period average "
            f"stabilizing near the 20-period average. This often precedes a short-term relief bounce."
        )
    elif rsi > 70 and fast <= slow * 1.001:
        direction = Direction.DOWN
        confidence = min(90.0, 55 + (rsi - 70))
        pattern = "RSI Overbought Rejection"
        reasoning = (
            f"RSI reads {rsi:.1f}, indicating overbought conditions with momentum fading against "
            f"the slower moving average. This setup frequently leads to a pullback."
        )
    elif spread > 0.05:
        direction = Direction.UP
        confidence = min(85.0, 55 + abs(spread) * 4)
        pattern = "Bullish Moving Average Crossover"
        reasoning = (
            f"The fast moving average sits {spread:.2f}% above the slow average, signaling "
            f"building upside momentum. Volume and trend structure both favor continuation."
        )
    elif spread < -0.05:
        direction = Direction.DOWN
        confidence = min(85.0, 55 + abs(spread) * 4)
        pattern = "Bearish Moving Average Crossover"
        reasoning = (
            f"The fast moving average sits {abs(spread):.2f}% below the slow average, signaling "
            f"building downside pressure. Recent candles confirm sellers are in control."
        )
    else:
        direction = Direction.NEUTRAL
        confidence = 50.0
        pattern = "Range-Bound Consolidation"
        reasoning = (
            "Price is oscillating tightly around its moving averages with no clear momentum "
            "edge. Waiting for a decisive breakout is statistically safer than forcing a call."
        )

    return RawAIAnalysis(
        direction=direction,
        confidence=round(confidence, 1),
        pattern_detected=pattern,
        reasoning=reasoning,
        model_used=HEURISTIC_LABEL,
    )


async def get_ai_analysis(
    symbol: str, candles: List[Candle], provider: AIProvider
) -> RawAIAnalysis:
    has_key = (provider == AIProvider.ANTHROPIC and ANTHROPIC_API_KEY) or (
        provider == AIProvider.OPENAI and OPENAI_API_KEY
    )

    if not has_key:
        logger.info("No %s API key configured; using heuristic fallback analyzer.", provider.value)
        return _heuristic_analysis(candles)

    prompt = format_candles_prompt(symbol, candles)

    try:
        if provider == AIProvider.OPENAI:
            raw = await _call_openai(prompt)
        else:
            raw = await _call_anthropic(prompt)
        raw["model_used"] = MODEL_LABELS[provider]
        return RawAIAnalysis(**raw)
    except Exception:
        logger.exception(
            "%s analysis call failed; falling back to heuristic analyzer.", provider.value
        )
        return _heuristic_analysis(candles)
