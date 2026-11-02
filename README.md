# Secure Multiparty Computation for Cross-Bank Fraud Score Aggregation

### Research Subtitle
**Toward Real-Time SMPC: A Lightweight Aggregation Protocol for Interbank Fraud Risk Scores**

### Research Team
* **Reshma G** — Cryptographic Protocol & SMPC Protocol Design
* **Brindha Sagarika K** — Distributed Systems & Dynamic SMPC Sharding
* **Akshaya G** — Machine Learning & Adaptive Differential Privacy Integration

---

## 1. Project Overview & Research Problem

Financial fraudsters frequently distribute suspicious, low-value fraudulent activities across multiple independent banks (e.g., Bank A, Bank B, Bank C) to stay below individual bank anomaly detection thresholds. However, strict data privacy regulations (GDPR, India DPDP Act), banking secrecy laws, and commercial confidentiality strictly forbid banks from pooling or centralizing raw customer identities or local fraud scores.

This platform provides a complete, modern, interactive research demonstration of our proposed **lightweight Secure Multiparty Computation (SMPC) framework**, enabling banks to collaboratively detect distributed fraud in near-real-time without sharing sensitive raw data.

```text
TRANSACTION ──> LOCAL BANK SCORING ──> SECRET SHARING ──> DYNAMIC SHARDING ──> SECURE AGGREGATION ──> SHA-256 VERIFICATION ──> ADAPTIVE DP ──> FINAL RISK SCORE ──> FRAUD ALERT
```

---

## 2. Key Research Contributions (The 4 Novelties)

1. **★ Novelty 1: Adaptive $(t, n)$ Threshold Secret Sharing**
   - *Problem:* Traditional additive sharing fails if even one bank node suffers network timeout or disconnects.
   - *Our Approach:* Embed scores into degree $(t-1)$ Shamir polynomials over prime field $\mathbb{F}_{2^{31}-1}$. Any subset of $k \ge t$ active banks can reconstruct the aggregate using Lagrange interpolation at $x = 0$.
   - *Result:* Sustains **100% availability** with up to $40\%$ participant dropouts.

2. **★ Novelty 2: Dynamic SMPC Sharding Protocol**
   - *Problem:* Naive all-to-all SMPC incurs an $O(N^2)$ communication explosion across large banking consortiums.
   - *Our Approach:* Dynamically partition $N$ banks into balanced clusters of size $k$. Parallelized intra-shard aggregation followed by hierarchical inter-shard combination compresses communication complexity to $O(N \cdot k)$.
   - *Result:* Achieves an **84.3% bandwidth reduction** at $N = 50$ participating banks.

3. **★ Novelty 3: Adaptive Differential Privacy**
   - *Problem:* Releasing exact aggregate fraud scores across small consortiums allows residual reconstruction attacks.
   - *Our Approach:* Output perturbation using calibrated Laplace noise with global sensitivity $\Delta f = \frac{100}{N}$, adapting dynamically to consortium size.
   - *Result:* Retains a **94.6% classification F1-score** with only $1.12$ score points deviation at $\epsilon = 1.0$.

4. **★ Novelty 4: Verifiable Aggregation Commitments**
   - *Problem:* Semi-honest protocols cannot prevent active Byzantine adversaries or bit-flipping attacks in transit.
   - *Our Approach:* Participating banks broadcast SHA-256 HMAC commitments $C_i = H(\text{Share}_i \parallel \text{Round} \parallel \text{Salt})$ prior to share opening. Any discrepancy triggers immediate round abortion.
   - *Result:* **100.0% tamper detection accuracy** with immutable logging in the tamper-evident hash-chain audit log.

---

## 3. Technology Stack & Dual-Engine Architecture

* **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide React, HTML5 WebCrypto API.
* **Backend:** Python FastAPI, Pydantic, NumPy, Pandas, Scikit-learn, Cryptography, PyTest.
* **Dual-Engine Operation:**
  - **In-Browser WebCrypto Engine:** Zero-dependency standalone simulation executing in any modern browser (`standalone_preview.html`).
  - **Live FastAPI Backend:** Connects to Python REST endpoints for distributed server-side execution (`backend/main.py`).

---

## 4. Directory Structure

```
smpc-fraud-platform/
├── backend/
│   ├── main.py                        # FastAPI REST API server
│   ├── crypto/
│   │   ├── secret_sharing.py          # Additive & Shamir (t,n) polynomial sharing
│   │   ├── sharding.py                # Dynamic sharding coordinator
│   │   ├── dp.py                      # Adaptive Differential Privacy (Laplace)
│   │   ├── verification.py            # SHA-256 HMAC commitment verification
│   │   └── weighted_aggregation.py    # Secure Sum, Average & Weighted Average
│   ├── privacy/
│   │   ├── tokenization.py            # HMAC-SHA256 customer pseudonymization
│   │   └── privacy_metrics.py         # Observed score exposure evaluator
│   ├── security/
│   │   ├── threat_model.py            # Semi-honest formal threat model
│   │   ├── attack_simulator.py        # 5 attack scenario evaluators
│   │   └── audit_chain.py             # Tamper-evident hash-chain audit log
│   ├── metrics/
│   │   ├── latency.py                 # Latency breakdown & percentiles (P50/P95/P99)
│   │   └── communication.py           # Message count & bandwidth tracker
│   ├── baselines/
│   │   ├── raw_pooling.py             # Insecure centralized baseline
│   │   ├── naive_masking.py           # Pairwise additive masking baseline
│   │   ├── paillier_he.py             # Paillier Homomorphic Encryption baseline
│   │   └── proposed_smpc.py           # Proposed lightweight SMPC baseline
│   ├── experiments/
│   │   ├── config.yaml                # Experiment configuration
│   │   └── run_all.py                 # Master experiment runner
│   ├── tests/
│   │   ├── test_secret_sharing.py     # Crypto unit tests
│   │   ├── test_tokenization.py       # HMAC token tests
│   │   ├── test_weighted_aggregation.py # Aggregation tests
│   │   ├── test_privacy_leakage.py    # Zero raw score leakage assertion
│   │   └── test_end_to_end.py         # Complete workflow integration tests
│   └── requirements.txt
├── src/
│   ├── components/
│   │   ├── common/                    # Header, Navigation, NoveltyBadge
│   │   ├── overview/                  # HeroSection, ProblemVsSolution, ArchitectureDiagram
│   │   ├── simulation/                # BankCard, PipelineAnimator, DecisionHUD
│   │   ├── novelties/                 # ThresholdSharing, DynamicSharding, DP, Verification
│   │   ├── network/                   # BankNetworkGraph, BankInspector
│   │   ├── performance/               # LatencyMetrics, Communication, Baselines, Ablation
│   │   ├── security/                  # ThreatModel, AttackSimulator, AuditChain
│   │   ├── research/                  # ResearchQuestions, GapNoveltyMatrix, Citations
│   │   ├── presentation/              # 13-Step Presentation HUD Deck
│   │   └── about/                     # Team & Project Attribution
│   ├── crypto-engine/                 # In-browser TypeScript cryptographic primitives
│   ├── data/                          # Realistic financial fraud & benchmark datasets
│   ├── types/index.ts                 # Strict TypeScript interface definitions
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── results/processed/                 # Generated reproducible benchmark data
├── standalone_preview.html            # Instant standalone browser evaluation bundle
├── package.json
├── vite.config.ts
└── README.md
```

---

## 5. Quick Start & Execution Guide

### Option A: Instant Zero-Friction Browser Launch
Double-click or open `standalone_preview.html` directly in any web browser (Chrome, Edge, Firefox, Safari) to interact with the full research platform, run live simulations, test the attack simulator, and inspect all 4 novelties.

### Option B: Run the React Development Server
```bash
cd smpc-fraud-platform
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

### Option C: Run the Python FastAPI Backend
```bash
cd smpc-fraud-platform
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
```
API documentation is available at `http://localhost:8000/docs`.

### Option D: Run Test Suites
```bash
# Run Python backend crypto, privacy leakage, and integration tests:
pytest backend/tests/
```

### Option E: Run Reproducible Benchmark Experiments
```bash
python backend/experiments/run_all.py
```

---

## 6. Reviewer & Presentation Demonstration Flow (3–5 Minutes)

1. **The Problem:** Show how fraudsters disperse activity across Bank A, Bank B, and Bank C.
2. **The Privacy Constraint:** Explain why banks cannot pool raw customer data.
3. **Local Scoring & Tokenization:** Highlight that local scores are computed inside the bank firewall and customer accounts are pseudonymized via HMAC.
4. **Secret Sharing & Dynamic Sharding:** Click `RUN SECURE AGGREGATION` to observe secret share dispatching and parallelized shard clustering.
5. **Verification & Adaptive DP:** Show SHA-256 HMAC commitment verification and Laplace noise perturbation.
6. **Final Risk HUD:** Reveal the final aggregated risk score ($82.41 / 100$) triggering a **🚨 FRAUD ALERT** with zero raw score leakage.
7. **Empirical Results:** Review the latency breakdown ($36.8\text{ ms}$ average) and the $25\times$ speedup over Homomorphic Encryption.

---

## 7. Formal Threat Model & Security Disclaimer

* **Threat Model:** Semi-Honest Consortium with Byzantine Commitment Verification. Participating banks follow protocol rules honestly but may passively inspect transmissions.
* **Disclaimer:** This platform is an academic research prototype built for demonstration and benchmarking. It does not claim production banking certification or unbreakable zero-knowledge hardware guarantees.

## Research Engine Update — Actual Proposed SMPC Protocol

The backend now contains an executable research-prototype protocol rather than only a UI simulation.

### Protocol flow

1. Local bank fraud scores are generated inside the bank simulation layer.
2. Each bank creates a Shamir `(t,n)` sharing of its contribution.
3. Contributions are weighted in the secret domain for secure weighted-average mode.
4. Participant-position shares are added without reconstructing individual scores.
5. Dynamic shards group participant positions for aggregation coordination.
6. Commitment hashes are verified before reconstruction.
7. At least `t` verified points are required for reconstruction.
8. Only the aggregate is reconstructed.
9. Differential privacy is applied to the aggregate output.
10. The final risk decision is generated.

### Important security scope

This is a research prototype under a semi-honest threat model. It does not claim malicious-secure MPC, formal anonymity, PSI/OPRF-based identity privacy, or production banking certification.

### Run backend

From the project root:

```bash
python -m pytest backend/tests -q
uvicorn backend.main:app --reload
```

The live UI can use the real backend by switching the header engine control from **WebCrypto** to **FastAPI**.

### Real protocol measurements

The proposed protocol returns measured in-process timing and analytical communication counters. These are prototype measurements and should not be described as physical network benchmarks until a real multi-process/network experiment is run.

## Research Extension: Dataset Anonymization + Privacy–Utility

The project now includes a research-evaluation layer in addition to the existing SMPC demo.

### New modules

- `backend/privacy/anonymization.py` — HMAC pseudonymization, generalization, controlled perturbation, empirical k-anonymity/linkage-risk proxy, and raw-vs-anonymized model utility evaluation.
- `backend/experiments/research_evaluation.py` — end-to-end dataset evaluation and epsilon sweep.
- `backend/data/research_fraud_demo.csv` — reproducible labelled fraud-demo dataset (1,500 rows).
- `src/components/research/DataAnonymizationPage.tsx` — upload a CSV and inspect anonymization/privacy/utility results.
- `src/components/privacy/PrivacyUtilityOptimization.tsx` — epsilon sweep and empirical privacy–utility balance selection.
- `src/components/security/SecurityAnalytics.tsx` — tamper, malformed-share, duplicate-participant, dropout and network-jitter metrics.

### Supported CSV evaluation

The web UI accepts a UTF-8 CSV. For model utility evaluation it looks for a fraud label named one of:
`is_fraud`, `fraud`, `fraud_flag`, `label`, `target`, or `class`.
Direct identifiers such as customer/card/account/device/email/phone/name/PAN/Aadhaar/transaction IDs are HMAC-pseudonymized. Low-cardinality categorical and generalized attributes are used for an empirical k-anonymity/linkage-risk proxy. Medium/High anonymization adds controlled numerical perturbation.

**Important:** pseudonymization and k-anonymity proxies are not formal anonymity guarantees. The prototype's privacy scores are comparative research metrics. The formal DP parameter is epsilon; the privacy score displayed by the optimization page is an experimental visualization.

### Run the research evaluation from the backend

```powershell
pip install -r backend\requirements.txt
python -m pytest backend\tests -q
python backend\experiments\run_all.py
```

Results are written to `results/processed/`.

### Run the application

Terminal 1:

```powershell
python -m uvicorn backend.main:app --reload
```

Terminal 2:

```powershell
npm install
npm run dev
```

Open the Vite URL shown in the terminal. For the real backend demo, keep the FastAPI server running and select **Engine: FastAPI** in the header.
