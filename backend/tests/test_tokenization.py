"""
Unit Tests for Customer Tokenization
"""

import pytest
from backend.privacy.tokenization import generate_customer_token, verify_customer_token


def test_customer_token_determinism():
    raw_id = "CUST-DELHI-9941"
    token1 = generate_customer_token(raw_id)
    token2 = generate_customer_token(raw_id)

    assert len(token1) == 16
    assert token1 == token2
    assert verify_customer_token(raw_id, token1) is True


def test_customer_token_different_ids():
    token_a = generate_customer_token("CUST-1001")
    token_b = generate_customer_token("CUST-1002")

    assert token_a != token_b
    assert verify_customer_token("CUST-1001", token_b) is False
