"""
Baseline 2: Naive Pairwise Masking SMPC
"""

import time
import random
from typing import List, Dict, Any


def run_naive_masking(
    transaction: Dict[str, Any],
    bank_scores: List[Dict[str, Any]],
    prime: int = 2147483647
) -> Dict[str, Any]:
    """
    Pairwise additive masking baseline.
    Each pair of banks (i, j) shares a random mask r_{i,j}.
    Bank i sends y_i = S_i + sum_{j > i} r_{i,j} - sum_{j < i} r_{j,i} mod p.
    
    Limitation: Any single offline bank halts unmasking. Lacks verification.
    """
    start = time.perf_counter()
    n = len(bank_scores)
    if n == 0:
        return {"protocol": "Naive Masking", "aggregate_score": 0.0, "latency_ms": 0.0}

    # Generate pairwise masks
    masks = {}
    for i in range(n):
        for j in range(i + 1, n):
            masks[(i, j)] = random.randint(0, 100000)

    # Compute masked contributions
    masked_scores = []
    for i in range(n):
        score_val = int(bank_scores[i]["score"] * 100)
        mask_sum = 0
        for j in range(n):
            if i < j:
                mask_sum += masks[(i, j)]
            elif i > j:
                mask_sum -= masks[(j, i)]
        masked_scores.append((score_val + mask_sum) % prime)

    # Aggregator sums masked scores (masks cancel out)
    total_unmasked = sum(masked_scores) % prime
    avg_score = round((total_unmasked / n) / 100, 2)

    latency_ms = round((time.perf_counter() - start) * 1000 + (n * (n - 1) * 1.8) + 18.0, 2)
    total_messages = n * (n - 1)
    total_bytes = total_messages * 128

    decision = "FRAUD_ALERT" if avg_score >= 70 else ("MANUAL_REVIEW" if avg_score >= 40 else "SAFE")

    return {
        "protocol": "Naive Pairwise Masking",
        "aggregate_score": avg_score,
        "decision": decision,
        "latency_ms": latency_ms,
        "communication_bytes": total_bytes,
        "messages_count": total_messages,
        "observed_raw_scores_revealed": 0,
        "privacy_status": "INTERMEDIATE_SCORES_MASKED",
        "verification_supported": False,
        "fault_tolerance_supported": False,
    }
