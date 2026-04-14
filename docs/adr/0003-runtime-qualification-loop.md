# ADR-0003: v0.3 Runtime Qualification Loop

**Date:** 2026-04-13
**Status:** Accepted
**Deciders:** Sebastián A. Cruz Romero, Shenied E. Maldonado Guerra

---

## Context

CEMI v0.2 (ADR-0002) adds the StaticQualify gate — a one-time check at deployment
time that a model passes accuracy and behavioral equivalence thresholds. However,
once a model is deployed, its operating conditions can drift: input distributions
shift, hardware thermal state changes, and runtime dispatch may differ across
firmware versions. A model that qualifies at deployment is not guaranteed to remain
qualified during operation.

The paper *"Benchmarking Is Not Verification"* (Cruz Romero, 2026) identifies this
as **Open Problem 8.4: lightweight sequential monitoring for MCUs**. **Algorithm 2
(RuntimeQualify)** defines a continuous monitoring loop that:

1. Receives a stream of inference loss values from the running model.
2. Applies two complementary drift detectors — CUSUM for abrupt shifts and ADWIN
   for gradual distribution changes.
3. Maintains a three-way controller state: `NOMINAL`, `WARN`, `REQUALIFY`.
4. Fires a configurable actuator hook when the `REQUALIFY` signal is raised, allowing
   the practitioner to wire in an OTA update or rollback dispatcher.

CEMI needs to operationalize Algorithm 2 as a Python module (`cemi.monitor`) that:

- Runs on edge devices with constrained memory (Cortex-M class: 16–256 KB RAM).
- Has no external Python dependencies beyond the standard library.
- Integrates with the existing Writer API so that state transitions appear in the
  Console timeline view and run records automatically.

---

## Decision

### 1. `cemi.monitor` module

A new top-level module `cli/cemi/monitor.py` provides three classes with no
external dependencies:

**`CUSUMDetector`** — Page's Cumulative Sum sequential change detector.

Detects abrupt shifts in the mean of a stream of scalar values using the
recurrences:
```
C+_t = max(0, C+_{t-1} + (x_t − μ₀ − k))   # upper: detects mean increase
C-_t = max(0, C-_{t-1} − (x_t − μ₀ + k))   # lower: detects mean decrease
```
where `μ₀` is the target (nominal) mean, `k` is the allowable slack (sensitivity
parameter), and `h` is the decision threshold. Alert fires when
`max(C+, C-) > h`. Memory: O(1) — five floats, one int.

```python
detector = CUSUMDetector(target_mean=0.05, slack=0.01, threshold=5.0)
alerted = detector.update(loss_value)  # → bool
print(detector.statistic)             # → max(C+, C-)
detector.reset()                      # → reset after REQUALIFY
```

**`ADWINDetector`** — Adaptive Windowing drift detector.

Maintains a sliding window of recent observations (max length `max_window`) and
tests all possible binary splits for a statistically significant difference using
the Hoeffding bound:
```
ε_cut = sqrt( (1/(2m) + 1/(2n)) × ln(4n/δ) )
```
where `m` and `n` are the sizes of the two sub-windows, `δ` is the confidence
parameter. Drift is detected if any split satisfies `|mean(W₀) − mean(W₁)| ≥
ε_cut`. Memory: O(W) where W = `max_window`.

```python
detector = ADWINDetector(delta=0.002, max_window=200)
alerted = detector.update(loss_value)  # → bool
print(detector.window_mean)            # → float | None
```

**`RuntimeMonitor`** — Three-way controller wrapping CUSUM + ADWIN.

State machine: `NOMINAL → WARN → REQUALIFY`. Transitions are:

| Condition | New State |
|---|---|
| `cusum.statistic > requalify_threshold` | `REQUALIFY` |
| `cusum.statistic > warn_threshold` OR ADWIN drift detected | `WARN` |
| Otherwise | `NOMINAL` |

On `REQUALIFY`: fires registered hooks, then resets CUSUM (but not ADWIN, since
the window must be rebuilt from a clean nominal period before drift can be declared
resolved). On `WARN`: fires registered warn hooks.

`update(loss_value)` returns `(previous_state, new_state)` — the caller can detect
transitions without subscribing to hooks.

```python
monitor = RuntimeMonitor(
    target_mean=0.05,
    slack=0.01,
    warn_threshold=3.0,
    requalify_threshold=5.0,
)
monitor.register_requalify_hook(lambda ctx: dispatch_ota_update(ctx))
prev, new = monitor.update(loss_value)
```

### 2. OTA hook interface

`RuntimeMonitor` exposes two hook registrars:
- `register_requalify_hook(callback)` — fires on every `→ REQUALIFY` transition.
- `register_warn_hook(callback)` — fires on every `→ WARN` transition.

Each callback receives a context dict with the current monitor state, suitable for
downstream decision-making:
```python
{
    "state": "REQUALIFY",
    "cusum_statistic": 5.23,
    "adwin_window_mean": 0.082,
    "adwin_window_size": 142,
    "n_samples": 4821,
}
```

The hook interface is intentionally minimal — CEMI does not prescribe how the
actuator is implemented. Wiring to an OTA dispatcher, a rollback script, or a
notification service is the practitioner's responsibility.

### 3. `log_inference_event()` Writer method

A new Writer method records individual inference events into
`payload.inference_events`:

```python
w.log_inference_event(
    loss_value=0.072,
    input_hash="sha256:abc123",   # optional
    output_hash="sha256:def456",  # optional
    step=4821,                    # optional
)
```

Inference events are stored in `_inference_events` (a separate accumulator, not
the action event stream) to keep action events readable. They appear as
`payload.inference_events` in emitted run records.

If a `RuntimeMonitor` is attached via `writer.attach_monitor(monitor)`, each
`log_inference_event()` call automatically feeds the loss value to the monitor.
On state transition, the Writer emits a `drift_state_transition` action event
into the action event stream — the only monitor data that enters the Console feed.

### 4. `attach_monitor()` Writer method

```python
monitor = RuntimeMonitor(...)
writer.attach_monitor(monitor)
```

After attachment, every subsequent `log_inference_event()` call feeds `loss_value`
to the monitor. The `monitor_state` dict is included in every `emit_run_record()`
call as `payload.monitor_state`, giving the workspace UI a stable field to read
for the current controller state.

### 5. Schema version bump to 2.2

Two new optional payload fields are added:

- `inference_events`: list of inference event dicts (loss_value, timestamp_ms, input_hash, output_hash, step)
- `monitor_state`: dict with state, cusum_statistic, adwin_window_mean, adwin_window_size, n_samples

These are additive and optional. Readers that understand v2.1 will ignore them.

### 6. Console view integration

The ConsolePage receives state transitions as `drift_state_transition` action events
with `level="warn"` or `level="error"`, which are already in the action event
stream. Three changes are made to the Console UI:

1. **`getLevelColor` fix** — the function currently returns `#F5F5F5` for all
   levels. It is updated to return distinct colors: amber (`#F59E0B`) for `warn`,
   red (`#EF4444`) for `error`, green (`#22C55E`) for `success`.

2. **Drift row highlighting** — rows where `entry.action === "drift_state_transition"`
   get a distinct left-border accent and a slightly different background tint to
   make them scannable in a busy console feed.

3. **Monitor state banner** — when any run in the feed has a `monitor_state` field,
   a compact status line appears at the top of the console viewport showing the
   current controller state, CUSUM statistic, and ADWIN window mean. The banner
   color matches the state: green (NOMINAL), amber (WARN), red (REQUALIFY).

---

## Alternatives Considered

**Use River or scikit-multiflow for drift detection.**
Rejected. Both introduce heavyweight external dependencies (numpy, scipy) that are
incompatible with pip-only edge deployments and would consume too much memory on
Cortex-M class devices. The CUSUM and ADWIN implementations here are pure Python,
correct, and require only the standard library.

**Record every inference event as an action event.**
Rejected. At typical edge inference rates (10–1000/s), the action event list would
grow to millions of entries per run, making JSONL files unreadably large. Inference
events are stored in a separate `_inference_events` accumulator; only state
*transitions* enter the action event stream, keeping the Console readable.

**Expose a `cemi monitor` CLI command.**
Deferred. A `cemi monitor --attach-to-run RUN_ID` streaming command that tails the
JSONL file and updates a monitor in real time is a natural v0.4 addition. For v0.3,
the monitor runs entirely within the user's evaluation script via the Writer API.

**Reset both CUSUM and ADWIN on REQUALIFY.**
Rejected. ADWIN's window represents the recent history of the signal distribution.
Resetting it on REQUALIFY would throw away evidence that the distribution has
changed, making it harder to detect whether the post-requalify behavior has returned
to nominal. Only CUSUM is reset on REQUALIFY; ADWIN continues to accumulate until
the window naturally flushes old evidence.

---

## Consequences

- `CUSUMDetector`, `ADWINDetector`, and `RuntimeMonitor` are stable public API from
  v0.3 onward. They should be treated as such in future refactors of `monitor.py`.
- `log_inference_event()` and `attach_monitor()` are stable Writer API surfaces.
- Schema v2.2 is backwards compatible with v2.1 and v2.0.
- The OTA hook fires synchronously within the `log_inference_event()` call — hooks
  must be fast and non-blocking to avoid stalling the inference loop.
- The `drift_state_transition` action event is the canonical signal for Console
  visibility and run record audit. Downstream tooling that needs to detect drift
  programmatically should look for this action name in `payload.action_events`.
- Memory budget: see `docs/memory-budget.md` for CUSUM + ADWIN memory requirements
  as a function of window size, with Cortex-M minimum viable configurations.
