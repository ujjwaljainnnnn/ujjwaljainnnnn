import logging
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

from ai_engine import get_ai_analysis
from models import AnalysisResponse, AnalyzeRequest, Direction
from risk import calculate_expected_value

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("copilot.main")

app = FastAPI(
    title="Nexus Copilot API",
    description="AI trading copilot engine: technical analysis + expected value risk math.",
    version="1.0.0",
)

allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health() -> dict:
    return {"status": "ok"}


@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze(request: AnalyzeRequest) -> AnalysisResponse:
    try:
        raw = await get_ai_analysis(request.symbol, request.candles, request.provider)
    except ValidationError as exc:
        logger.error("AI response failed validation: %s", exc)
        raise HTTPException(status_code=502, detail="AI engine returned a malformed response")

    expected_value, ev_per_dollar = calculate_expected_value(
        bet_amount=request.bet_amount,
        payout_pct=request.payout_pct,
        confidence=raw.confidence,
        direction=raw.direction,
    )

    return AnalysisResponse(
        direction=raw.direction,
        confidence=raw.confidence,
        pattern_detected=raw.pattern_detected,
        reasoning=raw.reasoning,
        expected_value=expected_value,
        ev_per_dollar=ev_per_dollar,
        is_positive_ev=expected_value > 0 and raw.direction != Direction.NEUTRAL,
        bet_amount=request.bet_amount,
        payout_pct=request.payout_pct,
        model_used=raw.model_used,
    )
