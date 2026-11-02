"""
FastAPI Server for Secure Multiparty Computation Cross-Bank Fraud Aggregation
Authors: Reshma G, Brindha Sagarika K, Akshaya G
"""

import time
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from backend.privacy.tokenization import generate_customer_token
from backend.baselines.proposed_smpc import run_proposed_smpc
from backend.security.threat_model import get_threat_model_summary
from backend.security.attack_simulator import (
    simulate_bank_dropout,
    simulate_share_tampering,
    simulate_invalid_share,
    simulate_duplicate_share,
    simulate_network_jitter,
)
from backend.security.audit_chain import AuditChain
from backend.ml.fraud_models import get_default_bank_models
from backend.experiments.research_evaluation import demo_evaluation, run_research_evaluation
from backend.privacy.anonymization import parse_csv_text

app = FastAPI(
    title="SMPC Cross-Bank Fraud Score Aggregation API",
    description="Real-Time Secure Multiparty Computation Research Protocol API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global in-memory audit chain
audit_chain_instance = AuditChain()

# Initialize with sample audit events
for i in range(1, 4):
    audit_chain_instance.append_event(
        round_id=f"SMPC-2026-00{i}",
        participant_count=3,
        threshold=2,
        shard_count=1,
        commitment_hash=f"a82f{i}01c9428b12",
        aggregation_hash=f"e41c{i}98a002bc45",
        verification_status="PASSED",
        decision="FRAUD_ALERT" if i == 1 else "SAFE",
        timestamp=f"2026-08-19 18:2{i}:00",
    )


# --- Request / Response Models ---

class TransactionScoreRequest(BaseModel):
    transaction_id: str = "TXN-8091"
    raw_customer_id: str = "CUST-DELHI-9941"
    amount: float = 85000.0
    merchant_category: str = "Electronics"
    location_risk: float = 0.82
    device_risk: float = 0.76
    velocity: str = "HIGH"
    account_age_months: int = 4
    num_banks: int = 3
    threshold_ratio: float = 0.67
    aggregation_method: str = "SECURE_WEIGHTED_AVERAGE"
    epsilon: float = 1.0
    use_sharding: bool = True
    use_dp: bool = True
    use_verification: bool = True
    educational_debug_mode: bool = False
    dropped_bank_ids: List[str] = Field(default_factory=list)


class TamperSimulationRequest(BaseModel):
    commitment_hash: str
    altered_share: int = 99999


class DropoutSimulationRequest(BaseModel):
    total_banks: int = 5
    threshold: int = 3
    dropped_count: int = 2


# --- Endpoints ---

@app.get("/api/health")
def health_check():
    return {
        "status": "ONLINE",
        "protocol_version": "SMPC-FRAUD-v1.0",
        "smpc_engine": "READY",
        "verification_engine": "ACTIVE",
        "audit_log": "ACTIVE",
        "threat_model": "SEMI_HONEST_PROTOTYPE",
    }


@app.get("/api/banks")
def get_banks():
    models = get_default_bank_models(5)
    return [
        {
            "id": m.bank_id,
            "name": m.bank_name,
            "model": m.model_type,
            "weight": m.weight,
            "status": "ONLINE",
        }
        for m in models
    ]


@app.get("/api/threat-model")
def get_threat_model():
    return get_threat_model_summary()


@app.post("/api/simulation/start")
def start_simulation(req: TransactionScoreRequest):
    """
    Executes full multi-bank fraud scoring simulation through SMPC.
    Guarantees zero leakage of private bank scores in normal response.
    """
    bank_models = get_default_bank_models(req.num_banks)
    txn_dict = req.dict()

    # Local Scoring inside bank enclaves
    bank_contributions = []
    for m in bank_models:
        score = m.score_transaction(txn_dict)
        bank_contributions.append({
            "bank_id": m.bank_id,
            "score": score,
            "weight": m.weight,
        })

    # Run SMPC protocol
    smpc_res = run_proposed_smpc(
        txn_dict,
        bank_contributions,
        threshold_ratio=req.threshold_ratio,
        use_sharding=req.use_sharding,
        use_dp=req.use_dp,
        epsilon=req.epsilon,
        use_verification=req.use_verification,
        aggregation_method=req.aggregation_method,
        available_bank_ids=[m.bank_id for m in bank_models if m.bank_id not in req.dropped_bank_ids],
    )

    # Append to Audit Log
    round_id = f"SMPC-2026-{int(time.time()) % 10000:04d}"
    evt = audit_chain_instance.append_event(
        round_id=round_id,
        participant_count=req.num_banks,
        threshold=smpc_res["threshold"],
        shard_count=smpc_res["shards"],
        commitment_hash=smpc_res.get("aggregation_hash", "")[:16],
        aggregation_hash=smpc_res.get("aggregation_hash", ""),
        verification_status="PASSED" if smpc_res["verified"] else "REJECTED",
        decision=smpc_res["decision"],
        timestamp=time.strftime("%Y-%m-%d %H:%M:%S"),
    )

    response = {
        "transaction_id": req.transaction_id,
        "customer_token": smpc_res["customer_token"],
        "participants": smpc_res["participants"],
        "available_participants": smpc_res.get("available_participants", smpc_res["participants"]),
        "threshold": smpc_res["threshold"],
        "shards": smpc_res["shards"],
        "aggregation_method": req.aggregation_method,
        "final_aggregate_score": smpc_res["final_aggregate_score"],
        "dp_noise_added": smpc_res["dp_noise_added"],
        "risk_level": smpc_res["risk_level"],
        "decision": smpc_res["decision"],
        "verified": smpc_res["verified"],
        "tamper_detected": smpc_res["tamper_detected"],
        "total_latency_ms": smpc_res["latency_breakdown"]["total_ms"],
        "latency_breakdown": smpc_res["latency_breakdown"],
        "communication": smpc_res.get("communication", {}),
        "round_id": smpc_res.get("round_id", ""),
        "protocol_notes": smpc_res.get("protocol_notes", []),
        "audit_event_id": evt["event_id"],
    }

    # Only include individual scores if Educational Debug Mode was explicitly requested
    if req.educational_debug_mode:
        response["educational_debug"] = {
            "warning": "⚠ INSECURE DEMONSTRATION MODE - Individual local scores shown for classroom inspection only",
            "bank_scores": bank_contributions,
        }

    return response


@app.post("/api/simulation/tamper")
def simulate_tampering_endpoint(req: TamperSimulationRequest):
    return simulate_share_tampering(req.commitment_hash, req.altered_share)


@app.post("/api/simulation/dropout")
def simulate_dropout_endpoint(req: DropoutSimulationRequest):
    return simulate_bank_dropout(req.total_banks, req.threshold, req.dropped_count)


@app.get("/api/audit")
def get_audit_trail():
    return {
        "chain": audit_chain_instance.chain,
        "verification": audit_chain_instance.verify_integrity(),
    }


# --- Research Dataset / Privacy-Utility Endpoints ---

class ResearchEvaluationRequest(BaseModel):
    strength: str = "MEDIUM"
    k: int = 5


@app.get("/api/research/evaluation")
def get_research_evaluation(strength: str = "MEDIUM", k: int = 5):
    """Run the reproducible bundled fraud dataset evaluation."""
    try:
        return demo_evaluation(strength=strength, k=k)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/research/evaluation")
async def evaluate_uploaded_dataset(
    file: UploadFile = File(...),
    strength: str = "MEDIUM",
    k: int = 5,
):
    """Evaluate an uploaded CSV with a fraud label and compare raw vs anonymized utility."""
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a CSV file.")
    try:
        text = (await file.read()).decode("utf-8-sig")
        rows = parse_csv_text(text)
        if len(rows) > 20000:
            raise ValueError("Demo evaluator accepts at most 20,000 rows.")
        return run_research_evaluation(rows, strength=strength, k=k)
    except UnicodeDecodeError as exc:
        raise HTTPException(status_code=400, detail="CSV must be UTF-8 encoded.") from exc
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/api/research/security-metrics")
def get_security_metrics():
    """Run repeatable security/resilience checks used by the research dashboard."""
    dropout_cases = [simulate_bank_dropout(5, 3, d) for d in range(0, 4)]
    tamper_cases = [simulate_share_tampering("a82f101c9428b12e", 99999) for _ in range(20)]
    invalid_values = [None, "NaN", float("nan"), float("inf"), -1, 10, 999999999999]
    invalid_cases = [simulate_invalid_share(v) for v in invalid_values]
    duplicate_cases = [simulate_duplicate_share(["BANK-A", "BANK-B", "BANK-A"])]
    jitter_cases = [simulate_network_jitter(36.8, d) for d in (0, 25, 50, 100, 150)]
    tamper_detection_rate = 100.0 * sum(1 for x in tamper_cases if x["tamper_detected"]) / len(tamper_cases)
    invalid_rejection_rate = 100.0 * sum(1 for x in invalid_cases if x["status"].startswith("REJECTED")) / len(invalid_cases)
    duplicate_rejection_rate = 100.0 * sum(1 for x in duplicate_cases if x["status"].startswith("REJECTED")) / len(duplicate_cases)
    return {
        "tampering": {"attempts": len(tamper_cases), "detected": sum(1 for x in tamper_cases if x["tamper_detected"]), "detection_rate_pct": round(tamper_detection_rate, 2)},
        "invalid_share": {"cases": len(invalid_cases), "rejected": sum(1 for x in invalid_cases if x["status"].startswith("REJECTED")), "rejection_rate_pct": round(invalid_rejection_rate, 2)},
        "duplicate_participant": {"tests": len(duplicate_cases), "rejected": sum(1 for x in duplicate_cases if x["status"].startswith("REJECTED")), "rejection_rate_pct": round(duplicate_rejection_rate, 2)},
        "dropout": [{"dropped": x["dropped_count"], "available": x["available_participants"], "threshold": x["threshold"], "continues": x["threshold_satisfied"]} for x in dropout_cases],
        "network_jitter": [{"jitter_ms": x["jitter_delay_ms"], "latency_ms": x["total_latency_ms"], "throughput_tps": x["estimated_throughput_tps"]} for x in jitter_cases],
        "note": "Metrics are repeatable prototype security/resilience tests, not production penetration-test results.",
    }
