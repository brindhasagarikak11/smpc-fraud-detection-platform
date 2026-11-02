"""
Additive and Shamir (t,n) secret sharing for the research prototype.

Important: this module implements the arithmetic used by the demo. It is
not a production banking cryptosystem and does not claim malicious-adversary
security by itself.
"""

import random
import hashlib
from typing import List, Dict, Tuple, Any

SMPC_PRIME = 2147483647  # 2^31 - 1
SCORE_SCALE = 100


def sha256_hash(data: str) -> str:
    return hashlib.sha256(data.encode("utf-8")).hexdigest()


# ---------------------------------------------------------
# Additive Secret Sharing
# ---------------------------------------------------------

def generate_additive_shares(
    participant_id: str,
    raw_score: float,
    num_recipients: int,
    prime: int = SMPC_PRIME,
    round_id: str = "UNSPECIFIED",
) -> List[Dict[str, Any]]:
    """Split a score in [0,100] into N additive shares."""
    scaled_secret = int(round(max(0.0, min(100.0, raw_score)) * SCORE_SCALE))
    return generate_additive_secret_shares(
        participant_id, scaled_secret, num_recipients, prime=prime, round_id=round_id
    )


def generate_additive_secret_shares(
    participant_id: str,
    secret_int: int,
    num_recipients: int,
    prime: int = SMPC_PRIME,
    round_id: str = "UNSPECIFIED",
) -> List[Dict[str, Any]]:
    if num_recipients < 2:
        raise ValueError("num_recipients must be >= 2")
    if not 0 <= secret_int < prime:
        raise ValueError("secret_int must be in [0, prime)")

    shares: List[Dict[str, Any]] = []
    random_sum = 0
    for i in range(num_recipients - 1):
        r = random.randrange(0, prime)
        random_sum = (random_sum + r) % prime
        salt = f"{random.randint(100000, 999999)}"
        commitment = sha256_hash(
            f"{participant_id}::{round_id}::{i}::{r}::{salt}"
        )
        shares.append({
            "participant_id": participant_id,
            "share_index": i,
            "share_value": r,
            "salt": salt,
            "round_id": round_id,
            "commitment_hash": commitment,
        })

    final_share = (secret_int - random_sum) % prime
    salt = f"{random.randint(100000, 999999)}"
    commitment = sha256_hash(
        f"{participant_id}::{round_id}::{num_recipients - 1}::{final_share}::{salt}"
    )
    shares.append({
        "participant_id": participant_id,
        "share_index": num_recipients - 1,
        "share_value": final_share,
        "salt": salt,
        "round_id": round_id,
        "commitment_hash": commitment,
    })
    return shares


def reconstruct_additive_secret(shares: List[Dict[str, Any]], prime: int = SMPC_PRIME) -> int:
    if not shares:
        return 0
    return sum(int(s["share_value"]) for s in shares) % prime


def reconstruct_additive_score(shares: List[Dict[str, Any]], prime: int = SMPC_PRIME) -> float:
    return round(reconstruct_additive_secret(shares, prime) / SCORE_SCALE, 2)


# ---------------------------------------------------------
# Shamir (t,n) Polynomial Threshold Secret Sharing
# ---------------------------------------------------------

def _mod_inverse(a: int, p: int) -> int:
    def egcd(x, y):
        if x == 0:
            return y, 0, 1
        gcd, x1, y1 = egcd(y % x, x)
        return gcd, y1 - (y // x) * x1, x1
    _, x, _ = egcd(a % p, p)
    return (x % p + p) % p


def generate_shamir_secret_shares(
    participant_id: str,
    secret_int: int,
    threshold: int,
    total_participants: int,
    prime: int = SMPC_PRIME,
    round_id: str = "UNSPECIFIED",
) -> List[Dict[str, Any]]:
    """Generate Shamir points for an arbitrary integer secret < prime."""
    if not (2 <= threshold <= total_participants):
        raise ValueError("threshold must satisfy 2 <= threshold <= total_participants")
    if not 0 <= secret_int < prime:
        raise ValueError("secret_int must be in [0, prime)")

    coefficients = [secret_int] + [random.randrange(1, prime) for _ in range(threshold - 1)]
    points: List[Dict[str, Any]] = []

    for x in range(1, total_participants + 1):
        y = 0
        x_pow = 1
        for coeff in coefficients:
            y = (y + coeff * x_pow) % prime
            x_pow = (x_pow * x) % prime

        salt = f"{random.randint(100000, 999999)}"
        commitment = sha256_hash(
            f"{participant_id}::{round_id}::{x}::{y}::{salt}"
        )
        points.append({
            "participant_id": participant_id,
            "x": x,
            "y": y,
            "salt": salt,
            "round_id": round_id,
            "commitment_hash": commitment,
        })
    return points


def generate_shamir_shares(
    participant_id: str,
    raw_score: float,
    threshold: int,
    total_participants: int,
    prime: int = SMPC_PRIME,
    round_id: str = "UNSPECIFIED",
) -> List[Dict[str, Any]]:
    secret = int(round(max(0.0, min(100.0, raw_score)) * SCORE_SCALE))
    return generate_shamir_secret_shares(
        participant_id,
        secret,
        threshold,
        total_participants,
        prime=prime,
        round_id=round_id,
    )


def reconstruct_shamir_integer(
    shares: List[Dict[str, Any]],
    threshold: int,
    prime: int = SMPC_PRIME,
) -> Tuple[bool, int, str]:
    """Reconstruct arbitrary integer secret from any >= threshold points."""
    if len(shares) < threshold:
        return False, 0, f"Insufficient shares: got {len(shares)}, required {threshold}"

    active = shares[:threshold]
    xs = [int(s["x"]) for s in active]
    if len(set(xs)) != len(xs):
        return False, 0, "Duplicate x-coordinates are not allowed"

    reconstructed = 0
    for j, s_j in enumerate(active):
        xj = int(s_j["x"])
        yj = int(s_j["y"])
        num = 1
        den = 1
        for m, s_m in enumerate(active):
            if m == j:
                continue
            xm = int(s_m["x"])
            num = (num * (-xm)) % prime
            den = (den * (xj - xm)) % prime
        basis = (num * _mod_inverse(den, prime)) % prime
        reconstructed = (reconstructed + yj * basis) % prime

    return True, reconstructed, "Reconstruction successful"


def reconstruct_shamir_secret(
    shares: List[Dict[str, Any]],
    threshold: int,
    prime: int = SMPC_PRIME,
) -> Tuple[bool, float, str]:
    success, reconstructed, msg = reconstruct_shamir_integer(shares, threshold, prime)
    return success, round(reconstructed / SCORE_SCALE, 2), msg
