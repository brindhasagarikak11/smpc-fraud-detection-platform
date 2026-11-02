"""
Adaptive Differential Privacy Engine
"""

import math
import random
from typing import Dict, Any


def sample_laplace(scale: float) -> float:
    """Samples zero-mean Laplace distributed random noise using inverse CDF."""
    if scale <= 0:
        return 0.0
    u = random.random()
    sign = -1.0 if u < 0.5 else 1.0
    return -scale * sign * math.log(1.0 - 2.0 * abs(u - 0.5) + 1e-12)


def apply_adaptive_dp(
    raw_aggregate: float,
    participant_count: int = 3,
    epsilon: float = 1.0,
    clipping_bound: float = 100.0,
    enabled: bool = True
) -> Dict[str, Any]:
    """
    Applies adaptive differential privacy to an aggregated risk score.
    Sensitivity Delta f = clipping_bound / participant_count
    Noise scale b = Delta f / epsilon
    """
    clipped = max(0.0, min(clipping_bound, raw_aggregate))

    if not enabled or epsilon <= 0:
        return {
            "raw_score": raw_aggregate,
            "clipped_score": clipped,
            "dp_protected_score": clipped,
            "noise_added": 0.0,
            "sensitivity": 0.0,
            "noise_scale": 0.0,
            "epsilon": epsilon,
            "clipping_bound": clipping_bound,
            "utility_score": 100,
            "privacy_level_score": 0,
        }

    sensitivity = round(clipping_bound / max(1, participant_count), 3)
    noise_scale = round(sensitivity / epsilon, 3)
    noise = sample_laplace(noise_scale)
    noise_added = round(noise, 2)

    dp_score = round(max(0.0, min(100.0, clipped + noise_added)), 2)

    privacy_level = max(5, min(99, int(((5.0 - min(5.0, epsilon)) / 4.9) * 94 + 5)))
    abs_error = abs(dp_score - raw_aggregate)
    utility = max(10, min(100, int(100 - (abs_error * 2.5))))

    return {
        "raw_score": raw_aggregate,
        "clipped_score": clipped,
        "dp_protected_score": dp_score,
        "noise_added": noise_added,
        "sensitivity": sensitivity,
        "noise_scale": noise_scale,
        "epsilon": epsilon,
        "clipping_bound": clipping_bound,
        "utility_score": utility,
        "privacy_level_score": privacy_level,
    }
