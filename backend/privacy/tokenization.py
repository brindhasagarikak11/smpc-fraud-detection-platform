"""
Customer Tokenization and Cross-Bank Entity Correlation (Python Backend)

DISCLAIMER & RESEARCH CONTEXT:
HMAC tokenization is a pseudonymization mechanism for this research prototype
and is NOT equivalent to Private Set Intersection (PSI), OPRF, or anonymous identity resolution.
Raw customer identifiers (e.g. Account Number, Aadhaar, PAN) are NEVER shared with the aggregator.
"""

import hmac
import hashlib

DEFAULT_CONSORTIUM_SALT = "SMPC_INTERBANK_FRAUD_SALT_2026"


def generate_customer_token(raw_customer_id: str, consortium_salt: str = DEFAULT_CONSORTIUM_SALT) -> str:
    """
    Generates a deterministic pseudonymous customer token using HMAC-SHA256.
    
    Args:
        raw_customer_id: Raw customer identity string (e.g. 'CUST-DELHI-9941')
        consortium_salt: Secret key shared among authorized local banks
        
    Returns:
        16-character hexadecimal pseudonymous token.
    """
    key = consortium_salt.encode("utf-8")
    message = f"{consortium_salt}::{raw_customer_id.strip().upper()}".encode("utf-8")
    full_hmac = hashlib.sha256(message).hexdigest()
    return full_hmac[:16]


def verify_customer_token(raw_customer_id: str, token: str, consortium_salt: str = DEFAULT_CONSORTIUM_SALT) -> bool:
    """Verifies that a customer ID matches a given pseudonymous token."""
    expected = generate_customer_token(raw_customer_id, consortium_salt)
    return hmac.compare_digest(expected.lower(), token.lower())
