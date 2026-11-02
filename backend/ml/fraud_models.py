"""
Local Bank Fraud Scoring ML Models
"""

import math
import random
from typing import Dict, Any, List


class LocalBankModel:
    def __init__(self, bank_id: str, bank_name: str, model_type: str, weight: float = 1.0):
        self.bank_id = bank_id
        self.bank_name = bank_name
        self.model_type = model_type
        self.weight = weight

    def score_transaction(self, txn: Dict[str, Any]) -> float:
        """
        Calculates local bank fraud risk score [0, 100].
        Executes strictly inside the private bank enclave.
        """
        amount = txn.get("amount", 1000)
        merchant = txn.get("merchant_category", "Grocery")
        loc_risk = txn.get("location_risk", 0.1)
        dev_risk = txn.get("device_risk", 0.1)
        velocity = txn.get("velocity", "LOW")
        account_age = txn.get("account_age_months", 12)

        base = 20.0

        if amount > 100000:
            base += 28.0
        elif amount > 50000:
            base += 18.0
        elif amount > 15000:
            base += 8.0

        merchant_map = {
            "Electronics": 16.0,
            "Gaming": 18.0,
            "Travel": 12.0,
            "Online Services": 10.0,
            "Fuel": 4.0,
            "Grocery": 2.0,
            "Healthcare": 3.0,
        }
        base += merchant_map.get(merchant, 5.0)
        base += loc_risk * 22.0
        base += dev_risk * 20.0

        vel_map = {"LOW": 0.0, "MEDIUM": 8.0, "HIGH": 18.0, "CRITICAL": 26.0}
        base += vel_map.get(velocity, 5.0)

        if account_age < 3:
            base += 12.0
        elif account_age > 24:
            base -= 10.0

        # Model idiosyncratic bias
        bias_map = {"BANK-A": 4.0, "BANK-B": -3.0, "BANK-C": 6.0, "BANK-D": -2.0, "BANK-E": -5.0}
        bias = bias_map.get(self.bank_id, 0.0)

        score = max(5.0, min(98.0, base + bias + random.uniform(-1.5, 1.5)))
        return round(score, 2)


def get_default_bank_models(num_banks: int = 3) -> List[LocalBankModel]:
    all_models = [
        LocalBankModel("BANK-A", "Apex Federal Bank", "Random Forest (100 trees)", weight=1.2),
        LocalBankModel("BANK-B", "Beacon Commercial Trust", "Gradient Boosted Trees", weight=1.0),
        LocalBankModel("BANK-C", "Crestline National Bank", "Deep Multi-Layer Perceptron", weight=0.9),
        LocalBankModel("BANK-D", "Delta Merchant Union", "LightGBM Classifier", weight=1.1),
        LocalBankModel("BANK-E", "Evergreen Savings Group", "Regularized Logistic Regression", weight=0.8),
    ]
    return all_models[:num_banks]
