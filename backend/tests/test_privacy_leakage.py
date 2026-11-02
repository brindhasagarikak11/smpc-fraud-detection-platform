"""
Privacy Leakage Test Suite

Asserts that normal aggregation responses NEVER leak:
- Individual bank scores (bank_a_score, bank_b_score, etc.)
- Raw customer IDs or account numbers
- Private keys or cryptographic salt secrets
"""

import pytest
from backend.baselines.proposed_smpc import run_proposed_smpc


def test_no_raw_bank_scores_in_response():
    transaction = {
        "id": "TXN-8091",
        "raw_customer_id": "CUST-DELHI-SECRET-9941",
        "amount": 85000,
        "merchant_category": "Electronics",
    }
    bank_scores = [
        {"bank_id": "BANK-A", "score": 88.5, "weight": 1.2},
        {"bank_id": "BANK-B", "score": 76.2, "weight": 1.0},
        {"bank_id": "BANK-C", "score": 91.0, "weight": 0.9},
    ]

    res = run_proposed_smpc(transaction, bank_scores)

    # 1. Ensure forbidden keys do NOT exist
    forbidden_keys = [
        "bank_a_score", "bank_b_score", "bank_c_score",
        "raw_customer_id", "account_number", "phone", "email",
        "private_key", "secret_key"
    ]
    for key in forbidden_keys:
        assert key not in res, f"Privacy violation: {key} found in response"

    # 2. Ensure raw customer ID is NOT in the string representation
    res_str = str(res)
    assert "CUST-DELHI-SECRET-9941" not in res_str

    # 3. Ensure individual raw scores are NOT exposed in normal mode
    assert res.get("observed_raw_scores_revealed") == 0
    assert "customer_token" in res
    assert "final_aggregate_score" in res
    assert "decision" in res
