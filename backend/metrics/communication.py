"""
Communication Cost Metrics & Bandwidth Tracker
"""

from typing import Dict, Any


def compute_communication_metrics(
    num_banks: int,
    use_dynamic_sharding: bool = True,
    target_shard_size: int = 3,
    bytes_per_share_msg: int = 192,
) -> Dict[str, Any]:
    """
    Computes communication cost metrics.
    Tracks: messages_sent, messages_received, bytes_sent, bytes_received, total_bytes, bytes_per_transaction
    """
    if not use_dynamic_sharding or num_banks <= target_shard_size:
        # Naive all-to-all: N * (N - 1)
        total_messages = num_banks * (num_banks - 1)
    else:
        # Sharded architecture: intra-shard + inter-shard
        num_shards = max(1, (num_banks + target_shard_size - 1) // target_shard_size)
        base_size = num_banks // num_shards
        rem = num_banks % num_shards
        
        intra_messages = 0
        for i in range(num_shards):
            s_size = base_size + (1 if i < rem else 0)
            intra_messages += s_size * (s_size - 1)
        inter_messages = num_shards * (num_shards - 1)
        total_messages = intra_messages + inter_messages

    messages_sent = total_messages
    messages_received = total_messages
    bytes_sent = messages_sent * bytes_per_share_msg
    bytes_received = messages_received * bytes_per_share_msg
    total_bytes = bytes_sent + bytes_received

    return {
        "num_banks": num_banks,
        "use_dynamic_sharding": use_dynamic_sharding,
        "messages_sent": messages_sent,
        "messages_received": messages_received,
        "bytes_sent": bytes_sent,
        "bytes_received": bytes_received,
        "total_bytes": total_bytes,
        "total_kb": round(total_bytes / 1024, 2),
        "bytes_per_transaction": total_bytes,
        "average_message_size_bytes": bytes_per_share_msg,
    }
