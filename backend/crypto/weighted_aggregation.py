"""Secure score aggregation helpers.

The functions below operate on reconstructed aggregate values. The proposed
SMPC protocol itself reconstructs only the aggregate from Shamir shares; it
never passes individual bank scores into these functions in normal mode.
"""

from typing import List, Dict, Any


def secure_sum(scores: List[float]) -> float:
    return round(sum(scores), 2)


def secure_average(scores: List[float]) -> float:
    return round(sum(scores) / len(scores), 2) if scores else 0.0


def secure_weighted_average(contributions: List[Dict[str, Any]]) -> float:
    if not contributions:
        return 0.0
    total_w = sum(float(c.get("weight", 1.0)) for c in contributions)
    if total_w <= 0:
        return secure_average([float(c["score"]) for c in contributions])
    weighted_sum = sum(
        float(c["score"]) * float(c.get("weight", 1.0)) for c in contributions
    )
    return round(weighted_sum / total_w, 2)


def execute_aggregation(
    contributions: List[Dict[str, Any]],
    method: str = "SECURE_WEIGHTED_AVERAGE",
) -> Dict[str, Any]:
    scores = [float(c["score"]) for c in contributions]
    weights = [float(c.get("weight", 1.0)) for c in contributions]
    if method == "SECURE_SUM":
        raw = secure_sum(scores)
    elif method == "SECURE_AVERAGE":
        raw = secure_average(scores)
    else:
        raw = secure_weighted_average(contributions)
    return {
        "method": method,
        "raw_aggregate": max(0.0, min(100.0, raw)),
        "participant_count": len(contributions),
        "total_weight": round(sum(weights), 2),
    }
