"""
Privacy Metrics & Information Leakage Evaluator
"""

from typing import Dict, Any, List


def evaluate_score_exposure(
    protocol_name: str,
    participant_scores: List[float],
    shared_data_payload: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Evaluates observed individual score exposure.
    
    DISCLAIMER:
    Observed Individual Score Exposure measures raw unmasked numeric score values
    present in the aggregation payload. It is an empirical audit check, not a formal
    cryptographic proof of zero knowledge.
    """
    exposed_count = 0
    exposed_values = []

    # Check if raw scores appear in the payload
    payload_str = str(shared_data_payload)
    for s in participant_scores:
        if f": {s}" in payload_str or f"={s}" in payload_str or f"'{s}'" in payload_str:
            exposed_count += 1
            exposed_values.append(s)

    is_private = exposed_count == 0

    return {
        "protocol": protocol_name,
        "total_participants": len(participant_scores),
        "observed_raw_scores_revealed": exposed_count,
        "is_privacy_preserved": is_private,
        "metric_label": "Observed Individual Score Exposure",
        "description": "Zero raw scores revealed to the aggregator" if is_private else f"Leakage: {exposed_count} scores exposed directly.",
    }
