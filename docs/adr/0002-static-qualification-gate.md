# ADR-0002: v0.2 Static Qualification Gate

**Date:** 2026-04-13
**Status:** Accepted
**Deciders:** Sebastián A. Cruz Romero, Shenied E. Maldonado Guerra

---

## Context

CEMI v0.1 ships contract verification (`cemi verify`, `log_contract_result`) — a
user-defined pass/fail gate over arbitrary metrics. This is useful but does not
address the structural problem identified in *"Benchmarking Is Not Verification"*
(Cruz Romero, 2026): compressed models deployed across heterogeneous edge runtimes
and hardware backends can exhibit numerically divergent outputs that benchmark
scores do not capture.

The paper defines **Algorithm 1 (StaticQualify)** as the first-level qualification
procedure that answers three questions before a model is deployed:

1. **Accuracy gate** — Does the model meet a minimum accuracy threshold on a
   calibration dataset?
2. **Behavioral equivalence** — Is the model's output vector sufficiently close to a
   float32 CPU reference across the target runtime × hardware combination?
3. **Platform identity** — What runtime, hardware backend, and capability flags
   produced this result?

CEMI needs to operationalize these three checks as Writer API methods and surface
them in the CLI and workspace UI, analogous to how `log_contract_result` and
`cemi verify` operationalized contract evaluation in v0.1.

---

## Decision

### 1. Three new Writer methods

Add to `cemi.writer.Writer`:

**`log_platform_fingerprint(*, runtime, hardware_backend, simd_flags=None, framework_version=None, **extra)`**

Records the execution environment for this run. Stored as
`payload.platform_fingerprint`. This is always informational — it has no
pass/fail semantics of its own. It is the prerequisite for EQC assignment
because the reference runtime and hardware must be known.

```python
w.log_platform_fingerprint(
    runtime="tflite",
    hardware_backend="arm_cortex_m4",
    simd_flags=["neon", "fp16"],
    framework_version="2.14.0",
)
```

**`log_eqc_assignment(*, eqc_id, reference_runtime, reference_hardware, output_delta_norm, tolerance=None, **extra)`**

Records the equivalence class assignment for this model × runtime × hardware
combination. `output_delta_norm` is the normalized output distance
`‖y_ref − y_test‖ / ‖y_ref‖` against the float32 CPU reference. The method
computes `delta_within_tolerance = output_delta_norm <= tolerance` if `tolerance`
is supplied; otherwise defaults to `True` (informational). Stored as
`payload.eqc_assignment`.

```python
w.log_eqc_assignment(
    eqc_id="EQC-A",
    reference_runtime="tflite",
    reference_hardware="x86_avx2",
    output_delta_norm=0.0023,
    tolerance=0.01,
)
```

**`log_accuracy_gate(*, metric_name, metric_value, threshold, direction="higher_is_better", **extra)`**

Records the accuracy qualification gate. The method computes `pass` from
`metric_value`, `threshold`, and `direction` — the caller does not supply it.
`direction` follows the same vocabulary as contract gates:
`"higher_is_better"` or `"lower_is_better"`. Stored as `payload.accuracy_gate`.

```python
w.log_accuracy_gate(
    metric_name="top1_accuracy",
    metric_value=0.923,
    threshold=0.90,
    direction="higher_is_better",
)
```

All three methods follow the same Writer convention:
- Call `_require_run()` first.
- Validate inputs with typed checks.
- Store in a private instance variable reset by `start_run()`.
- Call `_record_action_event()` for the audit trail.
- Include in the next `emit_run_record()` call.

### 2. Schema version bump to 2.1

The `Writer.schema_version` default is bumped from `"2.0"` to `"2.1"`. The three
new payload fields (`platform_fingerprint`, `eqc_assignment`, `accuracy_gate`) are
optional — their absence is semantically neutral ("not yet qualified"). The gateway
and contract engine do not need changes; they pass through arbitrary payload fields.

### 3. `cemi qualify` CLI command

Add a `cemi qualify --run RUN_ID` command that:

- Resolves the run by ID or direct `.jsonl` path (same `_resolve_run_jsonl`
  helper used by `cemi verify`).
- Reads `platform_fingerprint`, `eqc_assignment`, and `accuracy_gate` from the
  latest run record snapshot.
- Renders a **qualification certificate** to stdout (rich text, default) or
  structured JSON (`--output json`).
- Computes the overall **qualified** verdict:
  - `accuracy_gate.pass` must be `True` (if the field is present).
  - `eqc_assignment.delta_within_tolerance` must be `True` (if the field is
    present).
  - If neither `accuracy_gate` nor `eqc_assignment` is present, exits `2` with
    an error — no qualification data to evaluate.
- Exits `0` (qualified), `1` (not qualified), `2` (missing data or parse error).

The certificate shows: platform identity, EQC assignment, accuracy gate, overall
verdict, and the run ID. This is the machine-readable qualification evidence
referenced in the paper.

### 4. Qualification UI panel

Add a `QualificationPanel` React component in
`src/components/cemi/runs/QualificationPanel.tsx`. It renders:

- **Platform** section — runtime, hardware_backend, SIMD flags, framework version.
- **Behavioral Equivalence** section — EQC id, output δ norm vs tolerance,
  pass/fail indicator.
- **Accuracy Gate** section — metric name, actual value vs threshold, pass/fail.
- Overall qualified badge (green / red).

The panel appears in the `RunDetailPage` Results tab when any qualification field
is present on the run, alongside the existing `ContractResultPanel`.

---

## Alternatives Considered

**Compute EQC assignment inside CEMI (`cemi qualify --model FILE --dataset FILE`).**
Rejected for v0.2. The full StaticQualify algorithm requires runtime execution,
which is outside CEMI's local-first, runtime-agnostic scope. The Writer methods
record the *result* of an algorithm the practitioner runs in their own evaluation
harness — the same separation of concerns as `log_contract_result` vs `cemi verify`.
A full `cemi qualify --model FILE` that drives inference internally is deferred to
v0.3 as part of the runtime qualification loop.

**Fold platform fingerprint into the existing `w.device.set()` namespace.**
Rejected. `device` is a context namespace for deployment targets (board, budgets).
`platform_fingerprint` is a qualification artifact — it captures execution-time
facts (SIMD flags dispatched at runtime, framework version loaded) that are not
known at run setup time. Keeping them separate preserves the distinction between
planning context and observed execution context.

**Add a `qualified` boolean field computed by the Writer on `emit_run_record()`.**
Rejected. The overall verdict depends on which qualification fields are present,
and the CLI (`cemi qualify`) is the right place to compute and render it. Computing
it eagerly in the Writer would create an implicit coupling between the three methods
(e.g., requiring all three before the verdict is valid) that complicates partial
workflows where only an accuracy gate is run.

**Use a single `log_qualification(result_dict)` method (like `log_contract_result`).**
Rejected. The three methods (`log_platform_fingerprint`, `log_eqc_assignment`,
`log_accuracy_gate`) correspond to three distinct steps in Algorithm 1. Keeping
them separate lets users log partial results as their evaluation harness runs, and
lets the CLI distinguish which steps were completed.

---

## Consequences

- `log_platform_fingerprint`, `log_eqc_assignment`, and `log_accuracy_gate` are
  stable public API surfaces from v0.2 onward. They must be treated as such in
  future refactors of `writer.py`.
- Schema v2.1 is backwards compatible with v2.0. Readers that understand v2.0 will
  simply ignore the three new optional fields.
- `cemi qualify` exit code `1` is meaningful in CI: a model that fails the accuracy
  or equivalence gate blocks the pipeline without requiring wrapper scripts.
- The `QualificationPanel` is the first workspace UI component that reads
  qualification evidence rather than contract evidence. Its field names must stay
  in sync with the Writer method outputs.
- v0.3 (RuntimeQualify / CUSUM-ADWIN loop) builds on top of `log_platform_fingerprint`
  — the platform identity recorded here becomes the anchor for drift monitoring.
