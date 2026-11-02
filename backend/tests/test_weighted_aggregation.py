"""
Unit Tests for Weighted Aggregation and Differential Privacy
"""

import pytest
from backend.crypto.weighted_aggregation import secure_sum, secure_average, secure_weighted_average
from backend.crypto.dp import apply_adaptive_dp


def test_secure_sum():
    scores = [70.0, 80.0, 90.0]
    assert secure_sum(scores) == 240.0


def test_secure_average():
    scores = [70.0, 80.0, 90.0]
    assert secure_average(scores) == 80.0


def test_secure_weighted_average():
    contributions = [
        {"score": 80.0, "weight": 2.0},
        {"score": 50.0, "weight": 1.0},
    ]
    # (80*2 + 50*1) / 3 = 210 / 3 = 70.0
    assert secure_weighted_average(contributions) == 70.0


def test_adaptive_dp_preserves_bounds():
    raw_score = 82.5
    dp_res = apply_adaptive_dp(raw_score, participant_count=3, epsilon=1.0)

    assert "dp_protected_score" in dp_res
    assert 0.0 <= dp_res["dp_protected_score"] <= 100.0
    assert dp_res["sensitivity"] > 0
    assert dp_res["noise_scale"] > 0
