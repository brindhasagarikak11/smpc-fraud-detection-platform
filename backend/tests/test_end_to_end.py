"""
End-to-End Integration Test Suite
"""

import pytest
from backend.baselines.proposed_smpc import run_proposed_smpc
from backend.security.audit_chain import AuditChain
from backend.security.attack_simulator import simulate_share_tampering, simulate_bank_dropout


def test_complete_secure_fraud_aggregation_flow():
    # 1. Incoming suspicious transaction
    transaction = {
        "id": "TXN-8091",
        "raw_customer_id": "CUST-DELHI-9941",
        "amount": 85000,
        "merchant_category": "Electronics",
        "location_risk": 0.82,
        "device_risk": 0.76,
        "velocity": "HIGH",
        "account_age_months": 4,
    }

    # 2. Local Bank ML Contributions
    bank_scores = [
        {"bank_id": "BANK-A", "score": 84.0, "weight": 1.2},
        {"bank_id": "BANK-B", "score": 79.0, "weight": 1.0},
        {"bank_id": "BANK-C", "score": 86.0, "weight": 0.9},
    ]

    # 3. Execute Proposed SMPC Protocol
    result = run_proposed_smpc(
        transaction,
        bank_scores,
        threshold_ratio=0.67,
        use_sharding=True,
        use_dp=True,
        epsilon=1.0,
        use_verification=True,
        aggregation_method="SECURE_WEIGHTED_AVERAGE"
    )

    # 4. Verify Protocol Assertions
    assert result["verified"] is True
    assert result["threshold_satisfied"] is True
    assert result["communication"]["messages"] > 0
    assert result["communication"]["bytes"] > 0
    assert result["raw_aggregate"] is not None
    assert result["aggregation_method"] == "SECURE_WEIGHTED_AVERAGE"
    assert result["tamper_detected"] is False
    assert result["decision"] in ["FRAUD_ALERT", "MANUAL_REVIEW"]
    assert 0.0 <= result["final_aggregate_score"] <= 100.0
    assert result["total_latency_ms"] > 0
    assert result["observed_raw_scores_revealed"] == 0

    # 5. Audit Chain Append and Integrity Verification
    audit = AuditChain()
    evt = audit.append_event(
        round_id="SMPC-2026-001",
        participant_count=len(bank_scores),
        threshold=result["threshold"],
        shard_count=result["shards"],
        commitment_hash="a82f91a0c9428b12",
        aggregation_hash=result["aggregation_hash"],
        verification_status="PASSED",
        decision=result["decision"],
        timestamp="2026-08-19 18:24:03",
    )

    assert evt["current_hash"] is not None
    chain_ver = audit.verify_integrity()
    assert chain_ver["is_valid"] is True


def test_tamper_attack_causes_verification_failure():
    sim = simulate_share_tampering("a82f91a0c9428b12", 99999)
    assert sim["tamper_detected"] is True
    assert sim["status"] == "VERIFICATION_FAILED_AGGREGATION_REJECTED"


def test_dropout_tolerance():
    # 5 banks, threshold 3 -> 2 dropouts allowed
    sim_ok = simulate_bank_dropout(total_participants=5, threshold=3, dropped_count=2)
    assert sim_ok["threshold_satisfied"] is True

    # 3 dropouts -> blocked
    sim_blocked = simulate_bank_dropout(total_participants=5, threshold=3, dropped_count=3)
    assert sim_blocked["threshold_satisfied"] is False
