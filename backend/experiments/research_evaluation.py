"""Research dataset, anonymization and privacy/utility experiment service."""
from typing import Any, Dict, List
from backend.privacy.anonymization import anonymize_rows, demo_dataset, evaluate_model_utility, privacy_utility_sweep


def run_research_evaluation(rows: List[Dict[str, Any]], strength: str = "MEDIUM", k: int = 5) -> Dict[str, Any]:
    anon, privacy = anonymize_rows(rows, strength=strength, k=k)
    utility = evaluate_model_utility(rows, anon)
    tradeoff = privacy_utility_sweep(rows, anon)
    label_keys = ["is_fraud", "fraud", "fraud_flag", "label", "target", "class"]
    label_key = next((k for k in label_keys if k in rows[0]), None) if rows else None
    fraud_rows = []
    if label_key:
        fraud_rows = [r for r in rows if str(r.get(label_key)).strip().lower() in {"1", "1.0", "true", "yes", "fraud"}]
    merchant_col = next((k for k in rows[0] if "merchant" in k.lower() or "category" in k.lower()), None) if rows else None
    merchant_stats = []
    if merchant_col and label_key:
        buckets = {}
        for r in rows:
            m = str(r.get(merchant_col, "Unknown"))
            b = buckets.setdefault(m, [0, 0])
            b[0] += 1
            if str(r.get(label_key)).strip().lower() in {"1", "1.0", "true", "yes", "fraud"}: b[1] += 1
        merchant_stats = [{"category": m, "transactions": v[0], "fraud_count": v[1], "fraud_rate_pct": round(100*v[1]/v[0],2)} for m,v in buckets.items()]
        merchant_stats.sort(key=lambda x: x["fraud_rate_pct"], reverse=True)
    fraud_analytics = {
        "total_transactions": len(rows),
        "fraud_transactions": len(fraud_rows),
        "non_fraud_transactions": len(rows) - len(fraud_rows),
        "fraud_rate_pct": round(100*len(fraud_rows)/max(1,len(rows)),2),
        "merchant_fraud_rate": merchant_stats,
        "label_column": label_key,
    }
    return {
        "dataset": {
            "rows": len(rows),
            "columns": list(rows[0].keys()) if rows else [],
            "fraud_rows": sum(1 for r in rows if str(r.get("is_fraud", r.get("fraud", r.get("label", "0")))) in {"1", "1.0", "True", "true"}),
            "source": "Bundled reproducible research-demo dataset; API also accepts user CSV uploads.",
        },
        "anonymization": privacy,
        "utility": utility,
        "privacy_utility": tradeoff,
        "fraud_analytics": fraud_analytics,
    }


def demo_evaluation(strength: str = "MEDIUM", k: int = 5) -> Dict[str, Any]:
    return run_research_evaluation(demo_dataset(), strength, k)
