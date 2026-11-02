"""
Baseline 1: Raw Data Pooling (Insecure Centralized Baseline)
"""

import time
from typing import List, Dict, Any


def run_raw_pooling(
    transaction: Dict[str, Any],
    bank_scores: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Centralized baseline where banks transmit unmasked scores directly to the central aggregator.
    
    WARNING:
    This baseline exposes all raw customer data and individual bank scores.
    """
    start = time.perf_counter()

    # Direct arithmetic average on exposed scores
    raw_scores = [b["score"] for b in bank_scores]
    avg_score = round(sum(raw_scores) / len(raw_scores), 2) if raw_scores else 0.0

    latency_ms = round((time.perf_counter() - start) * 1000 + 12.0, 2)  # Simulated WAN trip

    bytes_per_score = 64
    total_bytes = len(bank_scores) * bytes_per_score

    decision = "FRAUD_ALERT" if avg_score >= 70 else ("MANUAL_REVIEW" if avg_score >= 40 else "SAFE")

    return {
        "protocol": "Raw Data Pooling",
        "aggregate_score": avg_score,
        "decision": decision,
        "latency_ms": latency_ms,
        "communication_bytes": total_bytes,
        "observed_raw_scores_revealed": len(raw_scores),
        "privacy_status": "INSECURE_INDIVIDUAL_SCORES_EXPOSED",
        "verification_supported": False,
        "fault_tolerance_supported": True,
    }
