"""
Tamper-Evident Hash-Chain Audit Log (Python Backend)

DISCLAIMER:
This is a Tamper-Evident Hash-Chain Audit Log for research integrity verification,
NOT a decentralized blockchain consensus mechanism.
"""

import hashlib
from typing import List, Dict, Any, Tuple

GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000"


def compute_event_hash(
    previous_hash: str,
    event_id: str,
    round_id: str,
    participant_count: int,
    threshold: int,
    shard_count: int,
    protocol_version: str,
    commitment_hash: str,
    aggregation_hash: str,
    verification_status: str,
    decision: str,
    timestamp: str,
) -> str:
    payload = "|".join([
        previous_hash,
        event_id,
        round_id,
        str(participant_count),
        str(threshold),
        str(shard_count),
        protocol_version,
        commitment_hash,
        aggregation_hash,
        verification_status,
        decision,
        timestamp,
    ])
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


class AuditChain:
    def __init__(self):
        self.chain: List[Dict[str, Any]] = []

    def append_event(
        self,
        round_id: str,
        participant_count: int,
        threshold: int,
        shard_count: int,
        commitment_hash: str,
        aggregation_hash: str,
        verification_status: str,
        decision: str,
        timestamp: str,
    ) -> Dict[str, Any]:
        previous_hash = self.chain[-1]["current_hash"] if self.chain else GENESIS_HASH
        event_index = len(self.chain) + 1
        event_id = f"EVT-{str(event_index).zfill(4)}"
        protocol_version = "SMPC-FRAUD-v1.0"

        current_hash = compute_event_hash(
            previous_hash,
            event_id,
            round_id,
            participant_count,
            threshold,
            shard_count,
            protocol_version,
            commitment_hash,
            aggregation_hash,
            verification_status,
            decision,
            timestamp,
        )

        event = {
            "event_id": event_id,
            "timestamp": timestamp,
            "round_id": round_id,
            "participant_count": participant_count,
            "threshold": threshold,
            "shard_count": shard_count,
            "protocol_version": protocol_version,
            "commitment_hash": commitment_hash,
            "aggregation_hash": aggregation_hash,
            "verification_status": verification_status,
            "decision": decision,
            "previous_hash": previous_hash,
            "current_hash": current_hash,
        }
        self.chain.append(event)
        return event

    def verify_integrity(self) -> Dict[str, Any]:
        if not self.chain:
            return {"is_valid": True, "total_events": 0, "message": "Audit chain is empty."}

        prev_hash = GENESIS_HASH
        for i, event in enumerate(self.chain):
            if event["previous_hash"] != prev_hash:
                return {
                    "is_valid": False,
                    "total_events": len(self.chain),
                    "broken_link_index": i,
                    "compromised_event_id": event["event_id"],
                    "message": f"Broken linkage at Event {event['event_id']} (Index {i})",
                }

            expected_hash = compute_event_hash(
                event["previous_hash"],
                event["event_id"],
                event["round_id"],
                event["participant_count"],
                event["threshold"],
                event["shard_count"],
                event["protocol_version"],
                event["commitment_hash"],
                event["aggregation_hash"],
                event["verification_status"],
                event["decision"],
                event["timestamp"],
            )

            if event["current_hash"] != expected_hash:
                return {
                    "is_valid": False,
                    "total_events": len(self.chain),
                    "broken_link_index": i,
                    "compromised_event_id": event["event_id"],
                    "message": f"Tampered hash at Event {event['event_id']} (Index {i})",
                }

            prev_hash = event["current_hash"]

        return {
            "is_valid": True,
            "total_events": len(self.chain),
            "message": f"All {len(self.chain)} audit chain events verified with zero tampering.",
        }
