"""
Formal Threat Model Specifications and Adversary Capabilities

DISCLAIMER & SECURITY ASSUMPTION:
Security Model: Semi-Honest Prototype with Byzantine Commitment Verification.
This research prototype does not claim full malicious-adversary security
unless explicitly implemented and experimentally verified.
"""

from typing import List, Dict, Any

THREAT_MATRIX = [
    {
        "actor": "Semi-Honest Bank",
        "description": "Follows protocol execution honestly but attempts to deduce competitor bank inputs from protocol traffic.",
        "can_see": ["Own local transaction features", "Own local ML model weights", "Final published DP risk score"],
        "must_not_see": ["Peer banks private risk scores", "Peer banks customer identity records", "Peer banks unmasked intermediate shares"],
        "status": "PROTECTED",
    },
    {
        "actor": "Semi-Honest Aggregator",
        "description": "Orchestrates multi-party communication without deviating from code, but inspects all passing packets.",
        "can_see": ["Pseudonymous customer tokens", "Random additive/polynomial shares", "Cryptographic commitment hashes"],
        "must_not_see": ["Individual raw scores S_i", "Customer identity / Account number", "Proprietary bank ML features"],
        "status": "PROTECTED",
    },
    {
        "actor": "Participant Dropout",
        "description": "One or more banks disconnect during the round due to network timeout or server failure.",
        "can_see": ["None (offline)"],
        "must_not_see": ["All active transmissions"],
        "status": "FAULT_TOLERANT (if active >= threshold t)",
    },
    {
        "actor": "Tampering Attacker (Active MitM)",
        "description": "Alters in-flight secret shares to artificially inflate or deflate fraud scores.",
        "can_see": ["Intercepted ciphertexts/packets"],
        "must_not_see": ["Forging valid commitments without detection"],
        "status": "DETECTED_AND_ABORTED (via SHA-256 HMAC commitments)",
    },
    {
        "actor": "Invalid Share Injector",
        "description": "Injects out-of-range floats, NaN payloads, or duplicate IDs.",
        "can_see": ["Consortium queue"],
        "must_not_see": ["Triggering unhandled exceptions or state leakage"],
        "status": "VALIDATED_AND_REJECTED",
    },
    {
        "actor": "Network Jitter / WAN Delay",
        "description": "Introduces variable 10ms - 500ms network packet latency.",
        "can_see": ["Network transport layer"],
        "must_not_see": ["Payload cryptographic secrets"],
        "status": "PIPELINED_ASYNCHRONOUSLY",
    },
]


def get_threat_model_summary() -> Dict[str, Any]:
    return {
        "protocol_version": "SMPC-FRAUD-v1.0",
        "security_assumptions": "Semi-Honest Model with Hash-Commitment Verification",
        "disclaimer": "Research prototype implementation. Does not claim production banking security.",
        "threat_matrix": THREAT_MATRIX,
    }
