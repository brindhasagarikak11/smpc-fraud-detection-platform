"""Executable score-level SMPC protocol for the research prototype.

Protocol contributions:
1. Shamir (t,n) threshold sharing of each bank's *weighted contribution*.
2. Dynamic sharding of participant x-coordinates.
3. Secure aggregation by summing shares at the same x-coordinate.
4. Reconstruction of only the aggregate secret after quorum validation.
5. Commitment verification before reconstruction.
6. Differential privacy applied only to the reconstructed aggregate.

This is a single-process research simulation of distributed roles. It models
what each role is allowed to receive, but it is not a production deployment
and does not claim malicious-secure MPC.
"""

import time
from typing import List, Dict, Any, Optional

from backend.crypto.secret_sharing import (
    SCORE_SCALE,
    SMPC_PRIME,
    generate_shamir_secret_shares,
    reconstruct_shamir_integer,
)
from backend.crypto.sharding import compute_dynamic_shards, route_points_to_shards
from backend.crypto.verification import verify_aggregation_commitments
from backend.crypto.dp import apply_adaptive_dp
from backend.privacy.tokenization import generate_customer_token

WEIGHT_SCALE = 100


def _clamp_score(score: float) -> float:
    return max(0.0, min(100.0, float(score)))


def _encode_contribution(score: float, weight: float, method: str) -> int:
    score_i = int(round(_clamp_score(score) * SCORE_SCALE))
    if method == "SECURE_SUM":
        return score_i
    weight_i = int(round(max(0.0, float(weight)) * WEIGHT_SCALE))
    return score_i * (weight_i if method == "SECURE_WEIGHTED_AVERAGE" else 1)


def _decode_aggregate(secret: int, method: str, bank_scores: List[Dict[str, Any]]) -> float:
    if method == "SECURE_SUM":
        return secret / SCORE_SCALE
    if method == "SECURE_AVERAGE":
        return (secret / SCORE_SCALE) / len(bank_scores)
    total_weight = sum(max(0.0, float(b.get("weight", 1.0))) for b in bank_scores)
    return (secret / (SCORE_SCALE * WEIGHT_SCALE)) / max(total_weight, 1e-12)


def _aggregate_points_at_same_x(
    per_bank_shares: Dict[str, List[Dict[str, Any]]],
    bank_ids: List[str],
    n: int,
) -> List[Dict[str, Any]]:
    """Securely combine same-x shares. No points with different x are added."""
    by_x: Dict[int, List[int]] = {x: [] for x in range(1, n + 1)}
    for bank_id in bank_ids:
        for share in per_bank_shares[bank_id]:
            by_x[int(share["x"])].append(int(share["y"]))

    return [
        {"x": x, "y": sum(by_x[x]) % SMPC_PRIME}
        for x in range(1, n + 1)
    ]


def _build_share_commitment_records(
    per_bank_shares: Dict[str, List[Dict[str, Any]]]
) -> List[Dict[str, Any]]:
    return [share for shares in per_bank_shares.values() for share in shares]


def run_proposed_smpc(
    transaction: Dict[str, Any],
    bank_scores: List[Dict[str, Any]],
    threshold_ratio: float = 0.67,
    use_sharding: bool = True,
    use_dp: bool = True,
    epsilon: float = 1.0,
    use_verification: bool = True,
    aggregation_method: str = "SECURE_WEIGHTED_AVERAGE",
    target_shard_size: int = 3,
    available_bank_ids: Optional[List[str]] = None,
) -> Dict[str, Any]:
    start = time.perf_counter()
    if len(bank_scores) < 2:
        raise ValueError("At least 2 banks are required")
    if not 0 < threshold_ratio <= 1:
        raise ValueError("threshold_ratio must be in (0, 1]")
    if aggregation_method not in {
        "SECURE_SUM", "SECURE_AVERAGE", "SECURE_WEIGHTED_AVERAGE"
    }:
        raise ValueError("Unsupported aggregation method")

    all_bank_ids = [b["bank_id"] for b in bank_scores]
    if len(set(all_bank_ids)) != len(all_bank_ids):
        raise ValueError("Duplicate bank_id values are not allowed")

    n = len(all_bank_ids)
    threshold = max(2, min(n, int(round(n * threshold_ratio))))
    available = all_bank_ids if available_bank_ids is None else [
        x for x in available_bank_ids if x in all_bank_ids
    ]
    available = list(dict.fromkeys(available))
    if len(available) < threshold:
        return {
            "protocol": "Proposed Lightweight Score-Level SMPC",
            "participants": n,
            "available_participants": len(available),
            "threshold": threshold,
            "threshold_satisfied": False,
            "verified": False,
            "tamper_detected": False,
            "decision": "REJECTED_THRESHOLD",
            "risk_level": "UNKNOWN",
            "final_aggregate_score": None,
            "raw_aggregate": None,
            "dp_noise_added": 0.0,
            "observed_raw_scores_revealed": 0,
            "error": f"Threshold not satisfied: {len(available)} available, {threshold} required",
            "shards": 0,
            "latency_breakdown": {
                "total_ms": round((time.perf_counter() - start) * 1000, 3)
            },
        }

    round_id = f"SMPC-{int(time.time() * 1000000) % 10**10:010d}"

    # 1. Pseudonymous correlation token.
    t0 = time.perf_counter()
    raw_customer_id = transaction.get("raw_customer_id", f"CUST-{transaction.get('id', 'TXN')}")
    customer_token = generate_customer_token(raw_customer_id)
    token_ms = (time.perf_counter() - t0) * 1000

    # 2. Each bank locally encodes and Shamir-shares ONLY its contribution.
    t1 = time.perf_counter()
    per_bank_shares: Dict[str, List[Dict[str, Any]]] = {}
    for bank in bank_scores:
        secret = _encode_contribution(
            float(bank["score"]), float(bank.get("weight", 1.0)), aggregation_method
        )
        per_bank_shares[bank["bank_id"]] = generate_shamir_secret_shares(
            bank["bank_id"], secret, threshold, n, round_id=round_id
        )
    share_generation_ms = (time.perf_counter() - t1) * 1000

    # 3. Verify every generated share commitment before using it.
    t2 = time.perf_counter()
    share_records = _build_share_commitment_records(per_bank_shares)
    verification = (
        verify_aggregation_commitments(share_records, round_id)
        if use_verification
        else {"all_valid": True, "tamper_detected": False, "aggregation_hash": "DISABLED"}
    )
    verification_ms = (time.perf_counter() - t2) * 1000
    if not verification["all_valid"]:
        return {
            "protocol": "Proposed Lightweight Score-Level SMPC",
            "round_id": round_id,
            "customer_token": customer_token,
            "participants": n,
            "available_participants": len(available),
            "threshold": threshold,
            "threshold_satisfied": True,
            "verified": False,
            "tamper_detected": True,
            "decision": "REJECTED_TAMPER",
            "risk_level": "UNKNOWN",
            "final_aggregate_score": None,
            "raw_aggregate": None,
            "dp_noise_added": 0.0,
            "aggregation_hash": verification.get("aggregation_hash", ""),
            "observed_raw_scores_revealed": 0,
            "error": verification.get("reason", "Commitment verification failed"),
            "latency_breakdown": {
                "tokenization_ms": round(token_ms, 3),
                "share_generation_ms": round(share_generation_ms, 3),
                "verification_ms": round(verification_ms, 3),
                "total_ms": round((time.perf_counter() - start) * 1000, 3),
            },
        }

    # 4. Securely add shares at equal x-coordinates.
    t3 = time.perf_counter()
    aggregate_points = _aggregate_points_at_same_x(per_bank_shares, all_bank_ids, n)

    # 5. Dynamic sharding is an actual routing layer. Only available participant
    # x-points are eligible for reconstruction. A shard never adds points with
    # different x coordinates; it collects and forwards its own points.
    shard_participants = available if use_sharding else all_bank_ids
    routed = route_points_to_shards(
        aggregate_points,
        shard_participants,
        target_shard_size if use_sharding else len(shard_participants),
    )

    selected_points: List[Dict[str, Any]] = []
    for shard in routed["shards"]:
        for point in shard["points"]:
            if len(selected_points) < threshold:
                selected_points.append(point)

    secure_aggregation_ms = (time.perf_counter() - t3) * 1000

    if len(selected_points) < threshold:
        return {
            "protocol": "Proposed Lightweight Score-Level SMPC",
            "round_id": round_id,
            "customer_token": customer_token,
            "participants": n,
            "available_participants": len(available),
            "threshold": threshold,
            "threshold_satisfied": False,
            "verified": True,
            "tamper_detected": False,
            "decision": "REJECTED_THRESHOLD",
            "risk_level": "UNKNOWN",
            "final_aggregate_score": None,
            "raw_aggregate": None,
            "dp_noise_added": 0.0,
            "aggregation_hash": verification.get("aggregation_hash", ""),
            "shards": routed["plan"]["num_shards"],
            "shard_details": routed["shards"],
            "observed_raw_scores_revealed": 0,
            "error": "Not enough available aggregate points",
            "latency_breakdown": {"total_ms": round((time.perf_counter() - start) * 1000, 3)},
        }

    # 6. Reconstruct ONLY the aggregate contribution.
    t4 = time.perf_counter()
    ok, aggregate_secret, reconstruction_message = reconstruct_shamir_integer(
        selected_points, threshold
    )
    reconstruction_ms = (time.perf_counter() - t4) * 1000
    if not ok:
        raise RuntimeError(reconstruction_message)

    raw_aggregate = _decode_aggregate(aggregate_secret, aggregation_method, bank_scores)
    raw_aggregate = round(_clamp_score(raw_aggregate), 2)

    # 7. DP is applied after secure reconstruction.
    t5 = time.perf_counter()
    dp_result = apply_adaptive_dp(
        raw_aggregate,
        participant_count=n,
        epsilon=epsilon,
        enabled=use_dp,
    )
    dp_ms = (time.perf_counter() - t5) * 1000
    final_score = round(_clamp_score(dp_result["dp_protected_score"]), 2)

    decision = (
        "FRAUD_ALERT" if final_score >= 70
        else "MANUAL_REVIEW" if final_score >= 40
        else "SAFE"
    )
    risk_level = (
        "CRITICAL" if final_score >= 80
        else "HIGH" if final_score >= 60
        else "MEDIUM" if final_score >= 40
        else "SAFE"
    )

    # 8. Protocol-level communication accounting.
    # Each bank sends n Shamir points in the logical distributed model.
    point_bytes = 64
    share_messages = n * n
    if use_sharding:
        shard_messages = sum(len(s["participants"]) for s in routed["shards"]) + len(routed["shards"])
    else:
        shard_messages = n
    communication_bytes = (share_messages + shard_messages) * point_bytes

    total_ms = (time.perf_counter() - start) * 1000
    return {
        "protocol": "Proposed Lightweight Score-Level SMPC",
        "round_id": round_id,
        "customer_token": customer_token,
        "participants": n,
        "available_participants": len(available),
        "threshold": threshold,
        "threshold_ratio": threshold_ratio,
        "threshold_satisfied": True,
        "verified": bool(verification["all_valid"]),
        "tamper_detected": False,
        "aggregation_method": aggregation_method,
        "shards": routed["plan"]["num_shards"],
        "shard_details": routed["shards"],
        "sharding_enabled": use_sharding,
        "raw_aggregate": raw_aggregate,
        "final_aggregate_score": final_score,
        "dp_noise_added": dp_result.get("noise_added", 0.0),
        "dp_epsilon": dp_result.get("epsilon", epsilon),
        "dp_sensitivity": dp_result.get("sensitivity", 0.0),
        "risk_level": risk_level,
        "decision": decision,
        "aggregation_hash": verification.get("aggregation_hash", ""),
        "observed_raw_scores_revealed": 0,
        "communication": {
            "share_messages": share_messages,
            "shard_coordination_messages": shard_messages,
            "total_messages": share_messages + shard_messages,
            "estimated_bytes": communication_bytes,
            "estimated_kb": round(communication_bytes / 1024, 3),
            # Backward-compatible names used by the existing dashboard/tests.
            "messages": share_messages + shard_messages,
            "bytes": communication_bytes,
        },
        "total_latency_ms": round(total_ms, 3),
        "latency_breakdown": {
            "tokenization_ms": round(token_ms, 3),
            "share_generation_ms": round(share_generation_ms, 3),
            "verification_ms": round(verification_ms, 3),
            "secure_aggregation_ms": round(secure_aggregation_ms, 3),
            "reconstruction_ms": round(reconstruction_ms, 3),
            "dp_ms": round(dp_ms, 3),
            "total_ms": round(total_ms, 3),
        },
        "protocol_notes": [
            "Each bank secret-shares only its local risk contribution.",
            "Same-x Shamir shares are added to form aggregate polynomial points.",
            "Dynamic sharding routes available aggregate points without adding different x-coordinates.",
            "Only the aggregate secret is reconstructed after threshold validation.",
            "Individual raw bank scores are not returned by the protocol API.",
            "Differential privacy is applied after secure reconstruction.",
            "Prototype threat model: semi-honest participants; not production banking security.",
        ],
    }
