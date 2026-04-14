# CEMI Roadmap

**Capicú Edge ML Inference (CEMI)**
_Open-source qualification infrastructure for compressed ML models at the edge._

---

## What CEMI Is Building Toward

Compressed ML models deployed on heterogeneous edge hardware exhibit a failure
mode that benchmarking cannot detect: the same model, on different runtimes or
hardware backends, produces numerically divergent outputs. SIMD instruction
selection, convolution algorithm dispatch, and floating-point accumulation order
are all directly consequential. No existing tool verifies that a model behaves
consistently across the runtime × hardware matrix before or during deployment.

CEMI is the open-source infrastructure on which a **qualification layer for
Edge AI** is being built — a runtime-agnostic, device-agnostic system for
verifying, validating, and continuously characterizing compressed model behavior
before and during deployment.

This roadmap maps the research agenda from
_Benchmarking Is Not Verification_ (Cruz Romero, 2026) to concrete CEMI
milestones. Each phase corresponds to one or more of the paper's five open
problems.

---

## Current State — v0.1 Foundation (✅ Shipped)

CEMI currently provides the plumbing layer the qualification algorithms require:

- **Writer API** — instrument any training or evaluation script with
  `log_metric`, `log_parameter`, `log_artifact`, and `emit_run_record`
- **Local gateway** — reads JSONL run snapshots from disk, serves the
  workspace UI locally with no cloud dependency
- **Workspace UI** — Runs, Compare, and Console views for inspecting
  recorded activity and action-event streams
- **CLI** — `cemi start`, `cemi view`, `cemi gateway`, `cemi stop`
- **Local-first architecture** — all data stays on disk; works offline;
  no cloud account required; compatible with proprietary model artifacts

This foundation is intentionally minimal. The next phases add
qualification-specific capabilities on top of it.

---

## MVP Target — v0.2 Static Qualification Gate

> **Addresses:** Open Problem 8.1 (behavioral equivalence testing) and
> Open Problem 8.2 (cross-runtime divergence characterization)

### Goal

A researcher or practitioner should be able to run a compressed model against
CEMI and receive a **qualification report** that answers three questions:

1. Does the model meet an accuracy threshold on a calibration dataset?
2. Does it produce behaviorally consistent outputs across the target
   runtime and hardware backend?
3. What equivalence class (EQC) does this deployment belong to?

This corresponds to **Algorithm 1 (StaticQualify)** from the paper.

### Milestones

- [ ] **`log_platform_fingerprint()`** — Writer method to record the
  runtime identifier, hardware backend, SIMD capability flags, and
  framework version at inference time
- [ ] **`log_eqc_assignment()`** — Writer method to record the
  equivalence class assignment for a given model × runtime × hardware
  combination, based on output vector comparison against a float32 CPU
  reference
- [ ] **`log_accuracy_gate()`** — Writer method to record pass/fail
  against an accuracy threshold on a user-supplied calibration dataset
- [ ] **`cemi qualify`** — CLI command that runs StaticQualify on a
  provided model artifact and calibration dataset, emits a qualification
  record, and prints a certificate summary
- [ ] **Qualification view in workspace UI** — dedicated panel showing
  platform fingerprint, EQC assignment, accuracy gate result, and
  overall pass/fail status per run
- [ ] **EQC comparison view** — side-by-side output vector comparison
  across runs to surface behavioral divergence visually

### Out of scope for v0.2

- Lipschitz bound computation (requires LipSDP integration — v0.3)
- Continuous runtime monitoring (v0.3)
- Multi-device fleet management (v1.0)

---

## v0.3 — Runtime Qualification Loop

> **Addresses:** Open Problem 8.4 (lightweight sequential monitoring)

### Goal

A deployed model should be continuously monitored for behavioral drift. CEMI
should expose a lightweight monitoring loop that a practitioner can attach to
an inference endpoint, embedding, or evaluation harness to detect when model
behavior has degraded below qualification thresholds.

This corresponds to **Algorithm 2 (RuntimeQualify)** from the paper.

### Milestones

- [ ] **`cemi.monitor` module** — Python interface implementing CUSUM
  and ADWIN drift detection over a streaming inference loss signal
- [ ] **`log_inference_event()`** — Writer method to record individual
  inference events (input hash, output hash, loss value, timestamp)
  into the action-event stream
- [ ] **Three-way controller** — `NOMINAL / WARN / REQUALIFY` state
  machine with configurable thresholds exposed as Writer parameters
- [ ] **OTA hook interface** — pluggable actuator interface for wiring
  the REQUALIFY signal to an external update dispatcher
- [ ] **Console view integration** — surface CUSUM statistic, ADWIN
  window mean, and controller state transitions in the existing Console
  timeline view
- [ ] **Memory budget analysis** — characterize CUSUM + ADWIN memory
  requirements as a function of window size; document the minimum viable
  configuration for Cortex-M class devices

---

## v0.4 — Lipschitz Bound Integration

> **Addresses:** Open Problem 8.1 (behavioral equivalence testing),
> specifically the Lipschitz bridge between compression and verification

### Goal

CEMI should optionally compute or accept a pre-computed Lipschitz constant
upper bound for a compressed model and record it as part of the qualification
certificate. This closes the loop between the StaticQualify gate and the
formal behavioral equivalence guarantee from Equation 5 of the paper.

### Milestones

- [ ] **`log_lipschitz_bound()`** — Writer method to record an
  externally computed Lipschitz upper bound (e.g., from LipSDP) alongside
  the qualification record
- [ ] **LipSDP bridge** — optional integration with the LipSDP Python
  interface for automatic bound computation during `cemi qualify`
- [ ] **Bound-deviation check** — compare $L \cdot \|\delta W\|$ against
  a user-specified output deviation tolerance as part of the
  qualification certificate
- [ ] **Conservativeness warning** — surface a warning when the computed
  bound is loose relative to observed output deviations, prompting
  users to treat it as an upper bound rather than a tight estimate

---

## v1.0 — Qualification-Aware Compression Integration

> **Addresses:** Open Problem 8.5 (qualification-aware compression)

### Goal

CEMI should be integratable into compression pipelines so that
qualifiability becomes a co-optimization objective alongside accuracy and
efficiency. This means exposing qualification metrics as feedback signals
that a compression loop can consume.

### Milestones

- [ ] **Compression callback interface** — hook that compression
  frameworks (TFLite, ONNX, PyTorch) can call at each compression step
  to log qualification metrics without rebuilding the full pipeline
  around CEMI
- [ ] **Qualification score API** — a single scalar `qualification_score`
  computed from accuracy gate result, EQC stability, ADWIN drift
  window, and Lipschitz bound; usable as a loss term in compression
  loops
- [ ] **Pareto front visualization** — workspace view plotting the
  accuracy–efficiency–qualifiability tradeoff across compression runs
- [ ] **CEMI export format** — a portable `qualification_certificate.json`
  that can be attached to a model artifact and verified independently
  of CEMI

---

## Cross-Cutting Work (All Phases)

These items are not phase-specific but must progress continuously:

- **`CITATION.cff` maintenance** — keep the paper citation current as
  the TMLR submission progresses
- **Demo notebooks** — one demo per milestone showing end-to-end usage
  on a realistic compression workflow (TFLite quantization → CEMI qualify
  → EQC assignment → drift monitor)
- **PyPI install** — `pip install cemi-cli` should remain the canonical
  install path; remove all closed-beta wheel language from docs before
  v0.2 ships
- **Runtime coverage matrix** — document which runtime × hardware
  combinations CEMI has been tested against; target TFLite, ONNX
  Runtime, and TensorRT as the v0.2 baseline
- **Contributor guide** — `CONTRIBUTING.md` explaining how graduate
  students or external contributors can pick up one of the five open
  problems as a focused contribution

---

## Open Problems → CEMI Milestone Mapping

| Open Problem | Description | CEMI Milestone |
|---|---|---|
| 8.1 | Behavioral equivalence testing | v0.2 EQC assignment, v0.4 Lipschitz |
| 8.2 | Cross-runtime divergence characterization | v0.2 platform fingerprint + EQC comparison |
| 8.3 | Unified qualification metrics | v1.0 qualification score API |
| 8.4 | Lightweight sequential monitoring for MCUs | v0.3 CUSUM/ADWIN + memory budget analysis |
| 8.5 | Qualification-aware compression | v1.0 compression callback + Pareto view |

---

## Who This Roadmap Is For

**Researchers** looking to extend one of the five open problems will find
a concrete hook in each milestone — the Writer methods and CLI commands
are the integration points.

**Practitioners** deploying compressed models in healthcare, industrial
sensing, or embedded systems will find the v0.2 StaticQualify gate and
v0.3 drift monitor directly usable without engaging with the full research
agenda.

**Contributors** (including graduate students from the UPRM Edge Computing
Group and collaborating labs) can pick up any single milestone as a
self-contained contribution. The `CONTRIBUTING.md` will map each milestone
to the corresponding section of the paper.

---

_Last updated: April 2026_
_Maintained by Capicú Technologies — [capicu.ai](https://capicu.ai) · [cemi.capicu.ai](https://cemi.capicu.ai)_