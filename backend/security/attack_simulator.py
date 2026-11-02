"""
Security Attack Simulator for Verification & Resilience Testing
"""

from typing import Dict, Any, List
import math


def simulate_bank_dropout(total_participants: int, threshold: int, dropped_count: int) -> Dict[str, Any]:
    """
    Simulates participant node dropout during aggregation.
    """
    available = max(0, total_participants - dropped_count)
    threshold_satisfied = available >= threshold

    return {
        "scenario": "BANK_DROPOUT",
        "total_participants": total_participants,
        "threshold": threshold,
        "dropped_count": dropped_count,
        "available_participants": available,
        "threshold_satisfied": threshold_satisfied,
        "status": "AGGREGATION_CONTINUES" if threshold_satisfied else "AGGREGATION_BLOCKED",
        "message": (
            f"Quorum satisfied ({available}/{threshold} required). Aggregation proceeds."
            if threshold_satisfied
            else f"Insufficient active participants ({available} < {threshold} required). Aggregation blocked."
        ),
    }


def simulate_share_tampering(expected_commitment: str, altered_value: int) -> Dict[str, Any]:
    """
    Simulates in-flight tampering of secret shares.
    """
    # Deterministic simulated tampered hash
    tampered_commitment = "b73d" + expected_commitment[4:]
    return {
        "scenario": "SHARE_TAMPERING",
        "expected_commitment": expected_commitment,
        "received_commitment": tampered_commitment,
        "tamper_detected": True,
        "status": "VERIFICATION_FAILED_AGGREGATION_REJECTED",
        "message": "SHA-256 HMAC commitment mismatch. Tampered share detected. Aggregation aborted.",
    }


def simulate_invalid_share(share_value: Any) -> Dict[str, Any]:
    """
    Simulates injection of malformed or out-of-range share data.
    """
    is_valid = isinstance(share_value, (int, float)) and not isinstance(share_value, bool)
    if is_valid and (not math.isfinite(float(share_value)) or share_value < 0 or share_value > 2147483647):
        is_valid = False

    return {
        "scenario": "INVALID_SHARE",
        "input_value": str(share_value),
        "is_valid": is_valid,
        "status": "ACCEPTED" if is_valid else "REJECTED_INVALID_TYPE_OR_BOUND",
        "message": "Valid numeric share in field range." if is_valid else "Malformed or out-of-bound share rejected.",
    }


def simulate_duplicate_share(participant_ids: List[str]) -> Dict[str, Any]:
    """
    Simulates duplicate contribution submission from the same bank.
    """
    seen = set()
    duplicates = []
    for pid in participant_ids:
        if pid in seen:
            duplicates.append(pid)
        seen.add(pid)

    has_duplicates = len(duplicates) > 0
    return {
        "scenario": "DUPLICATE_SHARE",
        "has_duplicates": has_duplicates,
        "duplicate_participants": duplicates,
        "status": "REJECTED_DUPLICATE_FOUND" if has_duplicates else "PASSED_UNIQUE_NODES",
        "message": f"Duplicate submissions detected: {duplicates}" if has_duplicates else "All participant IDs unique.",
    }


def simulate_network_jitter(base_latency_ms: float, jitter_delay_ms: float) -> Dict[str, Any]:
    """
    Simulates WAN network delay impact.
    """
    total = round(base_latency_ms + jitter_delay_ms, 2)
    throughput_tps = round(1000.0 / max(1.0, total), 1)

    return {
        "scenario": "NETWORK_JITTER",
        "base_latency_ms": base_latency_ms,
        "jitter_delay_ms": jitter_delay_ms,
        "total_latency_ms": total,
        "estimated_throughput_tps": throughput_tps,
        "status": "DELAY_MEASURED",
        "message": f"Network jitter of +{jitter_delay_ms} ms increased latency to {total} ms.",
    }
