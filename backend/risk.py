from models import Direction


def calculate_expected_value(
    bet_amount: float, payout_pct: float, confidence: float, direction: Direction
) -> tuple[float, float]:
    """Expected value of a fixed-time binary trade.

    EV = (Bet * Payout% * Confidence%) - (Bet * (1 - Confidence%))

    A NEUTRAL call has no directional edge to size a trade against, so its
    EV is reported as zero rather than implying a bet should be placed.
    """
    if direction == Direction.NEUTRAL:
        return 0.0, 0.0

    payout_fraction = payout_pct / 100
    confidence_fraction = confidence / 100

    win_leg = bet_amount * payout_fraction * confidence_fraction
    loss_leg = bet_amount * (1 - confidence_fraction)
    expected_value = win_leg - loss_leg

    ev_per_dollar = expected_value / bet_amount if bet_amount else 0.0

    return round(expected_value, 4), round(ev_per_dollar, 4)
