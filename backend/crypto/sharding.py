"""Dynamic sharding for the score-level SMPC prototype.

Sharding here is a protocol-level coordination layer: each shard receives a
subset of participant x-coordinates, verifies/collects the already aggregated
Shamir points for those participants, and forwards those points to the final
reconstruction stage. We never sum points having different x-coordinates,
because doing so would destroy the Shamir polynomial structure.
"""

import math
from typing import List, Dict, Any


def compute_dynamic_shards(bank_ids: List[str], target_shard_size: int = 3) -> Dict[str, Any]:
    if target_shard_size < 1:
        raise ValueError("target_shard_size must be >= 1")

    total = len(bank_ids)
    if total == 0:
        return {
            "total_banks": 0,
            "target_shard_size": target_shard_size,
            "num_shards": 0,
            "shards": [],
            "naive_messages": 0,
            "sharded_messages": 0,
            "naive_communication_bytes": 0,
            "sharded_communication_bytes": 0,
            "bandwidth_saving_percentage": 0.0,
        }

    num_shards = math.ceil(total / target_shard_size)
    shards = [
        {"shard_id": f"SHARD-{i + 1}", "participants": []}
        for i in range(num_shards)
    ]

    # Round-robin balances shard sizes.
    for i, bank_id in enumerate(bank_ids):
        shards[i % num_shards]["participants"].append(bank_id)

    # Message model: each participant contributes one point to its shard;
    # each shard sends its collected points to the final coordinator.
    # These are protocol accounting values, not network captures.
    bytes_per_point = 64
    naive_messages = total * max(total - 1, 0)
    intra_messages = sum(len(s["participants"]) * max(len(s["participants"]) - 1, 0) for s in shards)
    inter_messages = num_shards
    sharded_messages = intra_messages + inter_messages

    naive_bytes = naive_messages * bytes_per_point
    sharded_bytes = sharded_messages * bytes_per_point
    saving = ((naive_bytes - sharded_bytes) / naive_bytes * 100.0) if naive_bytes else 0.0

    return {
        "total_banks": total,
        "target_shard_size": target_shard_size,
        "num_shards": num_shards,
        "shards": shards,
        "naive_messages": naive_messages,
        "sharded_messages": sharded_messages,
        "naive_communication_bytes": naive_bytes,
        "sharded_communication_bytes": sharded_bytes,
        "naive_communication_kb": round(naive_bytes / 1024, 3),
        "estimated_communication_kb": round(sharded_bytes / 1024, 3),
        "bandwidth_saving_percentage": round(saving, 2),
    }


def route_points_to_shards(
    aggregate_points: List[Dict[str, Any]],
    participant_ids: List[str],
    target_shard_size: int,
) -> Dict[str, Any]:
    """Route each participant's aggregate Shamir point to exactly one shard."""
    plan = compute_dynamic_shards(participant_ids, target_shard_size)
    id_to_x = {bank_id: i + 1 for i, bank_id in enumerate(participant_ids)}
    point_by_x = {int(p["x"]): p for p in aggregate_points}

    shard_results = []
    for shard in plan["shards"]:
        points = []
        for participant_id in shard["participants"]:
            x = id_to_x[participant_id]
            if x in point_by_x:
                points.append(point_by_x[x])
        shard_results.append({
            "shard_id": shard["shard_id"],
            "participants": list(shard["participants"]),
            "points": points,
            "point_count": len(points),
            "status": "READY" if points else "EMPTY",
        })

    return {"plan": plan, "shards": shard_results}
