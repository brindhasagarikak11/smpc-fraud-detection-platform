from backend.baselines.proposed_smpc import run_proposed_smpc
from backend.crypto.secret_sharing import generate_shamir_secret_shares, reconstruct_shamir_integer
from backend.crypto.verification import verify_aggregation_commitments


def test_shamir_threshold_reconstructs_exact_secret():
    shares = generate_shamir_secret_shares("BANK-A", 8123, 3, 5, round_id="R1")
    ok, value, _ = reconstruct_shamir_integer(shares[:3], 3)
    assert ok
    assert value == 8123


def test_shamir_fails_below_threshold():
    shares = generate_shamir_secret_shares("BANK-A", 8123, 3, 5, round_id="R1")
    ok, _, _ = reconstruct_shamir_integer(shares[:2], 3)
    assert not ok


def test_commitment_tampering_is_detected():
    shares = generate_shamir_secret_shares("BANK-A", 8123, 2, 3, round_id="R2")
    result = verify_aggregation_commitments(shares, "R2", force_tamper_index=0)
    assert result["all_valid"] is False
    assert result["tamper_detected"] is True


def test_proposed_protocol_reconstructs_weighted_average_without_exposing_scores():
    txn = {"id": "TX-1", "raw_customer_id": "C1"}
    banks = [
        {"bank_id": "BANK-A", "score": 80.0, "weight": 2.0},
        {"bank_id": "BANK-B", "score": 50.0, "weight": 1.0},
        {"bank_id": "BANK-C", "score": 70.0, "weight": 1.0},
    ]
    result = run_proposed_smpc(
        txn,
        banks,
        threshold_ratio=0.67,
        use_sharding=True,
        use_dp=False,
        use_verification=True,
        aggregation_method="SECURE_WEIGHTED_AVERAGE",
        target_shard_size=2,
    )
    assert result["verified"] is True
    assert result["threshold_satisfied"] is True
    assert result["raw_aggregate"] == 70.0
    assert result["observed_raw_scores_revealed"] == 0
    assert result["shards"] == 2
    assert result["communication"]["total_messages"] > 0


def test_dropout_blocks_below_threshold():
    txn = {"id": "TX-2", "raw_customer_id": "C2"}
    banks = [
        {"bank_id": "A", "score": 80.0},
        {"bank_id": "B", "score": 60.0},
        {"bank_id": "C", "score": 40.0},
        {"bank_id": "D", "score": 30.0},
    ]
    result = run_proposed_smpc(
        txn,
        banks,
        threshold_ratio=0.75,
        use_dp=False,
        available_bank_ids=["A", "B"],
        aggregation_method="SECURE_AVERAGE",
    )
    assert result["threshold"] == 3
    assert result["threshold_satisfied"] is False
    assert result["decision"] == "REJECTED_THRESHOLD"
