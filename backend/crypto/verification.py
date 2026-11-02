"""Commitment verification for Shamir share points."""

import hashlib
from typing import List, Dict, Any


def create_share_commitment(
    participant_id: str,
    share_index: int,
    share_value: int,
    round_id: str,
    salt: str,
) -> str:
    payload = f"{participant_id}::{round_id}::{int(share_index)}::{int(share_value)}::{salt}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def verify_share_commitment(share: Dict[str, Any], round_id: str) -> bool:
    stored_round = share.get("round_id")
    if stored_round != round_id:
        return False

    value = int(share.get("y", share.get("share_value")))
    index = int(share.get("x", share.get("share_index")))
    expected = create_share_commitment(
        share["participant_id"], index, value, round_id, share["salt"]
    )
    return expected == share.get("commitment_hash")


def verify_aggregation_commitments(
    shares: List[Dict[str, Any]],
    round_id: str,
    force_tamper_index: int = -1,
) -> Dict[str, Any]:
    failed = None
    verified = 0

    for i, original in enumerate(shares):
        s = dict(original)
        if i == force_tamper_index:
            # Do not mutate the caller's share; simulate a modified payload.
            if "y" in s:
                s["y"] = int(s["y"]) + 1
            else:
                s["share_value"] = int(s["share_value"]) + 1

        if not verify_share_commitment(s, round_id):
            failed = s
            break
        verified += 1

    commitments = sorted(str(s.get("commitment_hash", "")) for s in shares)
    aggregation_hash = hashlib.sha256(
        ("::".join(commitments) + f"::{round_id}").encode("utf-8")
    ).hexdigest()

    return {
        "round_id": round_id,
        "total_shares": len(shares),
        "verified_count": verified,
        "all_valid": failed is None,
        "tamper_detected": failed is not None,
        "failed_participant_id": failed.get("participant_id") if failed else None,
        "reason": (
            f"Commitment mismatch for participant {failed.get('participant_id')}"
            if failed else None
        ),
        "aggregation_hash": aggregation_hash,
    }
