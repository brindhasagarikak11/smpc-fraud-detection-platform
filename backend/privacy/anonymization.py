"""Dataset anonymization and privacy/utility evaluation for the research prototype.

The module intentionally distinguishes pseudonymization from anonymization. HMAC
replaces direct identifiers, while generalization and controlled perturbation are
used to reduce linkage risk. The privacy metrics are empirical proxies, not a
formal anonymity guarantee.
"""
from __future__ import annotations

import csv
import hashlib
import hmac
import io
import math
import random
from collections import Counter
from typing import Any, Dict, List, Optional, Tuple

import numpy as np


def _token(value: str, secret: str) -> str:
    return hmac.new(secret.encode(), value.strip().upper().encode(), hashlib.sha256).hexdigest()[:16]


def _is_identifier(name: str) -> bool:
    n = name.lower().replace("-", "_")
    return any(k in n for k in ["customer_id", "customerid", "card_id", "cardid", "account_id", "accountid", "device_id", "email", "phone", "name", "pan", "aadhaar", "transaction_id", "transactionid", "txn_id"])


def _find_col(headers: List[str], candidates: List[str]) -> Optional[str]:
    lower = {h.lower(): h for h in headers}
    for c in candidates:
        if c in lower:
            return lower[c]
    return None


def _to_float(v: Any) -> Optional[float]:
    try:
        if v is None or str(v).strip() == "":
            return None
        return float(v)
    except (TypeError, ValueError):
        return None


def _demo_rows(n: int = 1500, seed: int = 42) -> List[Dict[str, Any]]:
    rng = random.Random(seed)
    merchants = ["Grocery", "Fuel", "Healthcare", "Electronics", "Gaming", "Travel", "Online Services"]
    velocities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    rows: List[Dict[str, Any]] = []
    for i in range(n):
        suspicious = rng.random() < 0.085
        amount = rng.uniform(500, 18000) if not suspicious else rng.uniform(45000, 220000)
        loc = rng.uniform(0.03, 0.30) if not suspicious else rng.uniform(0.62, 0.99)
        dev = rng.uniform(0.03, 0.30) if not suspicious else rng.uniform(0.58, 0.99)
        velocity = rng.choice(["LOW", "MEDIUM"]) if not suspicious else rng.choice(["HIGH", "CRITICAL"])
        age = rng.randint(8, 60) if not suspicious else rng.randint(1, 8)
        merchant = rng.choice(merchants[:4]) if not suspicious else rng.choice(merchants[3:])
        hour = rng.randint(6, 22) if not suspicious else rng.choice(list(range(0, 6)) + list(range(23, 24)))
        # Label has a small amount of stochastic overlap to avoid a trivial classifier.
        latent = 0.000004 * amount + 1.7 * loc + 1.5 * dev + (0.8 if velocity in ("HIGH", "CRITICAL") else 0) + (0.6 if age < 3 else 0)
        p = 1 / (1 + math.exp(-(latent - 3.3)))
        label = 1 if rng.random() < (0.78 if suspicious else min(0.30, p)) else 0
        rows.append({
            "transaction_id": f"TXN-{100000+i}",
            "customer_id": f"CUST-{rng.randint(10000, 99999)}",
            "card_id": f"CARD-{rng.randint(100000, 999999)}",
            "amount": round(amount, 2),
            "merchant_category": merchant,
            "location_risk": round(loc, 4),
            "device_risk": round(dev, 4),
            "velocity": velocity,
            "account_age_months": age,
            "transaction_hour": hour,
            "is_fraud": label,
        })
    return rows


def demo_dataset() -> List[Dict[str, Any]]:
    return _demo_rows()


def parse_csv_text(text: str) -> List[Dict[str, Any]]:
    reader = csv.DictReader(io.StringIO(text))
    rows = [dict(r) for r in reader]
    if not rows:
        raise ValueError("CSV contains no data rows")
    return rows


def _coerce_rows(rows: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], List[str]]:
    headers = list(rows[0].keys())
    clean: List[Dict[str, Any]] = []
    for row in rows:
        out: Dict[str, Any] = {}
        for h in headers:
            v = row.get(h)
            num = _to_float(v)
            out[h] = num if num is not None and str(v).strip() != "" else (str(v).strip() if v is not None else "")
        clean.append(out)
    return clean, headers


def anonymize_rows(
    rows: List[Dict[str, Any]],
    strength: str = "MEDIUM",
    k: int = 5,
    secret: str = "SMPC_RESEARCH_ANONYMIZATION_2026",
    noise_scale: float = 0.03,
) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    clean, headers = _coerce_rows(rows)
    out = [dict(r) for r in clean]
    id_cols = [h for h in headers if _is_identifier(h)]

    # HMAC pseudonymization for direct identifiers.
    for row in out:
        for col in id_cols:
            row[col] = f"TOKEN-{_token(str(row[col]), secret)}"

    generalized: List[str] = []
    for row in out:
        for col in headers:
            n = col.lower()
            value = row[col]
            if isinstance(value, (int, float)):
                if "age" in n and "month" not in n:
                    row[col] = f"{int(value)//5*5}-{int(value)//5*5+4}"
                    generalized.append(col)
                elif "pincode" in n or "postal" in n or "zip" in n:
                    s = str(int(value)) if float(value).is_integer() else str(value)
                    row[col] = s[:max(1, len(s)-2)] + "**"
                    generalized.append(col)
                elif "hour" in n or "time" in n:
                    row[col] = f"{int(value)//2*2:02d}:00-{int(value)//2*2+1:02d}:59"
                    generalized.append(col)

    if strength in ("MEDIUM", "HIGH"):
        for row in out:
            for col in headers:
                n = col.lower()
                if isinstance(row[col], (int, float)):
                    if any(kword in n for kword in ["amount", "risk", "score"]):
                        row[col] = round(float(row[col]) * (1 + random.gauss(0, noise_scale)), 4)
        generalized.extend([h for h in headers if any(k in h.lower() for k in ["amount", "risk", "score"])])

    if strength == "HIGH":
        # Coarsen transaction amounts to a bucket; preserve the fraud label untouched.
        for row in out:
            for col in headers:
                if "amount" in col.lower() and isinstance(row[col], (int, float)):
                    row[col] = round(float(row[col]) / 500) * 500

    # Use practical quasi-identifiers for an empirical k-anonymity/linkage proxy.
    # Continuous amount/risk columns are excluded because exact-value grouping
    # would make every row unique and would not be a useful demo of generalization.
    quasi = []
    for h in headers:
        if h in id_cols or h.lower() in {"is_fraud", "fraud", "fraud_flag", "label", "target", "class"}:
            continue
        values = [str(r.get(h, "")) for r in out]
        cardinality = len(set(values))
        if isinstance(out[0].get(h), str) or h in generalized:
            if cardinality <= max(50, int(len(out) * 0.05)):
                quasi.append(h)
    if not quasi:
        quasi = [h for h in generalized if h not in id_cols]
    groups = Counter(tuple(str(row.get(q, "")) for q in quasi) for row in out)
    sizes = [groups[tuple(str(row.get(q, "")) for q in quasi)] for row in out]
    below_k = sum(1 for s in sizes if s < k)
    min_group = min(sizes) if sizes else 0
    uniqueness = sum(1 for s in sizes if s == 1) / len(sizes) if sizes else 0
    privacy_proxy = max(0.0, min(100.0, 100.0 * (1 - below_k / max(1, len(sizes))) * (1 - 0.5 * uniqueness)))

    return out, {
        "strength": strength,
        "rows": len(out),
        "identifier_columns_pseudonymized": id_cols,
        "generalized_columns": sorted(set(generalized)),
        "quasi_identifier_columns": quasi,
        "k": k,
        "minimum_equivalence_class": min_group,
        "rows_below_k": below_k,
        "below_k_pct": round(100 * below_k / max(1, len(out)), 2),
        "unique_row_pct": round(100 * uniqueness, 2),
        "privacy_proxy_score": round(privacy_proxy, 2),
        "privacy_metric_note": "Empirical k-anonymity/linkage-risk proxy; not a formal anonymity guarantee.",
    }


def _label_column(headers: List[str]) -> Optional[str]:
    return _find_col(headers, ["is_fraud", "fraud", "fraud_flag", "label", "target", "class"])


def _feature_frame(rows: List[Dict[str, Any]], headers: List[str], label: str):
    import pandas as pd
    df = pd.DataFrame(rows)
    y = pd.to_numeric(df[label], errors="coerce").fillna(0).astype(int)
    drop = {label} | {h for h in headers if _is_identifier(h)}
    X = df[[h for h in headers if h not in drop]].copy()
    return X, y


def evaluate_model_utility(raw_rows: List[Dict[str, Any]], anon_rows: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Train/evaluate the same simple classifier on raw vs anonymized data."""
    try:
        import pandas as pd
        from sklearn.compose import ColumnTransformer
        from sklearn.impute import SimpleImputer
        from sklearn.linear_model import LogisticRegression
        from sklearn.metrics import accuracy_score, average_precision_score, f1_score, precision_score, recall_score, roc_auc_score
        from sklearn.model_selection import train_test_split
        from sklearn.pipeline import Pipeline
        from sklearn.preprocessing import OneHotEncoder, StandardScaler
    except ImportError as exc:
        raise RuntimeError("scikit-learn and pandas are required for dataset utility evaluation") from exc

    def run(rows: List[Dict[str, Any]]) -> Dict[str, float]:
        clean, headers = _coerce_rows(rows)
        label = _label_column(headers)
        if not label:
            raise ValueError("No fraud label found. Use one of: is_fraud, fraud, fraud_flag, label, target, class")
        X, y = _feature_frame(clean, headers, label)
        if y.nunique() < 2:
            raise ValueError("Fraud label must contain both fraud and non-fraud classes")
        numeric = [c for c in X.columns if pd.api.types.is_numeric_dtype(X[c])]
        categorical = [c for c in X.columns if c not in numeric]
        def encoder():
            try:
                return OneHotEncoder(handle_unknown="ignore", sparse_output=False)
            except TypeError:
                return OneHotEncoder(handle_unknown="ignore", sparse=False)
        prep = ColumnTransformer([
            ("num", Pipeline([("impute", SimpleImputer(strategy="median")), ("scale", StandardScaler())]), numeric),
            ("cat", Pipeline([("impute", SimpleImputer(strategy="most_frequent")), ("onehot", encoder())]), categorical),
        ], remainder="drop")
        model = Pipeline([("prep", prep), ("clf", LogisticRegression(max_iter=600, class_weight="balanced", random_state=42))])
        Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.25, stratify=y, random_state=42)
        model.fit(Xtr, ytr)
        prob = model.predict_proba(Xte)[:, 1]
        pred = (prob >= 0.5).astype(int)
        return {
            "accuracy": round(float(accuracy_score(yte, pred)), 4),
            "precision": round(float(precision_score(yte, pred, zero_division=0)), 4),
            "recall": round(float(recall_score(yte, pred, zero_division=0)), 4),
            "f1": round(float(f1_score(yte, pred, zero_division=0)), 4),
            "roc_auc": round(float(roc_auc_score(yte, prob)), 4),
            "pr_auc": round(float(average_precision_score(yte, prob)), 4),
            "n_test": int(len(yte)),
            "fraud_rate_test_pct": round(float(yte.mean() * 100), 2),
        }

    raw = run(raw_rows)
    anonymized = run(anon_rows)
    return {
        "raw": raw,
        "anonymized": anonymized,
        "f1_change_pp": round((anonymized["f1"] - raw["f1"]) * 100, 2),
        "roc_auc_change_pp": round((anonymized["roc_auc"] - raw["roc_auc"]) * 100, 2),
        "utility_retained_pct": round(100 * anonymized["f1"] / max(raw["f1"], 1e-9), 2),
        "model": "Balanced Logistic Regression with one-hot preprocessing",
        "note": "Metrics are empirical on a fixed 75/25 stratified split; they are not cryptographic guarantees.",
    }


def privacy_utility_sweep(raw_rows: List[Dict[str, Any]], anon_rows: List[Dict[str, Any]], epsilons: Optional[List[float]] = None) -> Dict[str, Any]:
    """Evaluate DP on a consortium-level fraud-rate statistic.

    The released statistic is the mean predicted fraud probability. We clip each
    contribution to [0,1], use sensitivity 1/N, and add Laplace noise with scale
    sensitivity/epsilon. Utility is measured by absolute error of the released
    fraud-rate estimate. The same fixed RNG seed makes the demo reproducible.
    """
    if epsilons is None:
        epsilons = [0.1, 0.25, 0.5, 1.0, 2.0, 5.0]
    try:
        import pandas as pd
        from sklearn.compose import ColumnTransformer
        from sklearn.impute import SimpleImputer
        from sklearn.linear_model import LogisticRegression
        from sklearn.model_selection import train_test_split
        from sklearn.pipeline import Pipeline
        from sklearn.preprocessing import OneHotEncoder, StandardScaler
    except ImportError as exc:
        raise RuntimeError("scikit-learn and pandas are required for privacy-utility evaluation") from exc

    clean, headers = _coerce_rows(anon_rows)
    label = _label_column(headers)
    if not label:
        raise ValueError("No fraud label found for privacy-utility evaluation")
    X, y = _feature_frame(clean, headers, label)
    numeric = [c for c in X.columns if pd.api.types.is_numeric_dtype(X[c])]
    categorical = [c for c in X.columns if c not in numeric]
    try:
        encoder = OneHotEncoder(handle_unknown="ignore", sparse_output=False)
    except TypeError:
        encoder = OneHotEncoder(handle_unknown="ignore", sparse=False)
    prep = ColumnTransformer([
        ("num", Pipeline([("impute", SimpleImputer(strategy="median")), ("scale", StandardScaler())]), numeric),
        ("cat", Pipeline([("impute", SimpleImputer(strategy="most_frequent")), ("onehot", encoder)]), categorical),
    ])
    model = Pipeline([("prep", prep), ("clf", LogisticRegression(max_iter=600, class_weight="balanced", random_state=42))])
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.25, stratify=y, random_state=42)
    model.fit(Xtr, ytr)
    probabilities = np.clip(model.predict_proba(Xte)[:, 1], 0, 1)
    true_rate = float(yte.mean())
    base_rate = float(probabilities.mean())
    sensitivity = 1.0 / max(1, len(probabilities))
    rng = np.random.default_rng(2026)
    rows = []
    for eps in epsilons:
        scale = sensitivity / eps
        # Average several releases to make the curve stable for the UI.
        noisy = base_rate + rng.laplace(0, scale, size=40)
        noisy = np.clip(noisy, 0, 1)
        mae = float(np.mean(np.abs(noisy - base_rate)))
        utility = max(0.0, 100.0 * (1 - mae / max(base_rate, 1e-6)))
        privacy = max(0.0, min(100.0, 100.0 * (1 - eps / max(epsilons))))
        balance = 0.55 * privacy + 0.45 * utility
        rows.append({
            "epsilon": eps,
            "sensitivity": round(sensitivity, 6),
            "noise_scale": round(scale, 6),
            "mean_absolute_error": round(mae, 6),
            "utility_score": round(utility, 2),
            "privacy_score": round(privacy, 2),
            "balance_score": round(balance, 2),
        })
    best = max(rows, key=lambda r: r["balance_score"])
    return {
        "rows": rows,
        "recommended_epsilon": best["epsilon"],
        "recommended_balance_score": best["balance_score"],
        "base_predicted_fraud_rate_pct": round(base_rate * 100, 2),
        "true_fraud_rate_pct": round(true_rate * 100, 2),
        "mechanism": "Laplace mechanism on clipped consortium-level fraud-rate statistic",
        "privacy_note": "Privacy score is a comparative experimental proxy; epsilon is the formal DP parameter.",
    }
