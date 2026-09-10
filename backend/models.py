from enum import Enum
from typing import List

from pydantic import BaseModel, Field, field_validator


class Direction(str, Enum):
    UP = "UP"
    DOWN = "DOWN"
    NEUTRAL = "NEUTRAL"


class Candle(BaseModel):
    time: int
    open: float
    high: float
    low: float
    close: float
    volume: float


class AnalyzeRequest(BaseModel):
    symbol: str = Field(default="BTCUSDT", max_length=20)
    candles: List[Candle]
    bet_amount: float = Field(gt=0, le=500)
    payout_pct: float = Field(ge=70, le=95)

    @field_validator("candles")
    @classmethod
    def candles_bounds(cls, v: List[Candle]) -> List[Candle]:
        if len(v) < 5:
            raise ValueError("At least 5 candles are required for analysis")
        if len(v) > 200:
            return v[-200:]
        return v


class AnalysisResponse(BaseModel):
    direction: Direction
    confidence: float
    pattern_detected: str
    reasoning: str
    expected_value: float
    ev_per_dollar: float
    is_positive_ev: bool
    bet_amount: float
    payout_pct: float


class RawAIAnalysis(BaseModel):
    """What we expect back from the LLM before risk math is applied."""

    direction: Direction
    confidence: float = Field(ge=0, le=100)
    pattern_detected: str
    reasoning: str
