"""
Unit Tests for Additive and Shamir Secret Sharing
"""

import pytest
from backend.crypto.secret_sharing import (
    generate_additive_shares,
    reconstruct_additive_score,
    generate_shamir_shares,
    reconstruct_shamir_secret,
)


def test_additive_secret_sharing_reconstruction():
    original_score = 78.45
    num_banks = 5
    shares = generate_additive_shares("BANK-A", original_score, num_banks)

    assert len(shares) == num_banks
    reconstructed = reconstruct_additive_score(shares)
    assert abs(reconstructed - original_score) < 0.05


def test_shamir_threshold_reconstruction_with_quorum():
    original_score = 82.5
    threshold = 3
    total = 5
    shares = generate_shamir_shares("BANK-A", original_score, threshold, total)

    assert len(shares) == total
    # Any subset of size 3 should reconstruct
    subset = [shares[0], shares[2], shares[4]]
    success, reconstructed, msg = reconstruct_shamir_secret(subset, threshold)

    assert success is True
    assert abs(reconstructed - original_score) < 0.05


def test_shamir_threshold_fails_with_insufficient_shares():
    original_score = 82.5
    threshold = 3
    total = 5
    shares = generate_shamir_shares("BANK-A", original_score, threshold, total)

    # Only 2 shares (below threshold 3)
    subset = [shares[0], shares[1]]
    success, reconstructed, msg = reconstruct_shamir_secret(subset, threshold)

    assert success is False
    assert "Insufficient shares" in msg
