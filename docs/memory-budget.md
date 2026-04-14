# CEMI Runtime Monitor — Memory Budget Analysis

**Addresses:** Open Problem 8.4 — Lightweight sequential monitoring for MCUs
**Component:** `cemi.monitor` (v0.3)

---

## Summary

The `cemi.monitor` module implements CUSUM and ADWIN drift detection for
continuous monitoring of deployed compressed models. This document characterizes
memory requirements as a function of configurable parameters and identifies
minimum viable configurations for Cortex-M class devices (16–256 KB RAM).

---

## Component Breakdown

### 1. CUSUMDetector — O(1) memory

CUSUM maintains only five floats and one integer regardless of observation count:

| Field | Type | Bytes |
|---|---|---|
| `target_mean` | float64 | 8 |
| `slack` | float64 | 8 |
| `threshold` | float64 | 8 |
| `_c_plus` | float64 | 8 |
| `_c_minus` | float64 | 8 |
| `_n` | int64 | 8 |
| **Total** | | **48 bytes** |

CUSUM is always Cortex-M viable. Its memory cost does not grow with observation count.

### 2. ADWINDetector — O(W) memory

ADWIN maintains a sliding window of at most `max_window` float observations:

| `max_window` | Window memory | Python deque overhead | Total (approx.) |
|---|---|---|---|
| 16  | 128 B  | ~200 B | ~330 B |
| 32  | 256 B  | ~200 B | ~460 B |
| 64  | 512 B  | ~200 B | ~710 B |
| 100 | 800 B  | ~200 B | ~1.0 KB |
| 200 | 1.6 KB | ~200 B | ~1.8 KB |
| 500 | 4.0 KB | ~200 B | ~4.2 KB |

*Python float64 = 8 bytes per element. `collections.deque` overhead is fixed at ~200 B.*

Each `update()` call is O(`max_window`) time (the Hoeffding split scan). At
100 inferences/second with `max_window=200`, this is ~20,000 float additions
per second — well within Cortex-M4 (168 MHz, FPU) capacity.

### 3. RuntimeMonitor — O(W) memory (dominated by ADWIN)

| Component | Memory |
|---|---|
| `CUSUMDetector` | 48 B |
| `ADWINDetector(max_window=W)` | ~200 B + 8W B |
| Hook lists (empty) | ~56 B each |
| Controller state + counters | ~32 B |
| **Total** | **~400 B + 8W B** |

### 4. Writer inference event buffer — O(N) memory

`_inference_events` accumulates events in memory until `emit_run_record()` is
called. Each event is a Python dict with ~5 fields:

| `N` events buffered | Approx. memory |
|---|---|
| 100 | ~15 KB |
| 1,000 | ~150 KB |
| 10,000 | ~1.5 MB |

**Recommendation:** Call `emit_run_record()` frequently (e.g., every 100
inferences or every 10 seconds) to flush the buffer to disk and bound memory
growth. The buffer is cleared at the next `start_run()` call, not at emit time
(emit appends a snapshot; the buffer persists for the run duration).

> **Note for MCU deployments:** The Writer and inference event buffer are
> Python-only constructs intended for the evaluation harness (host-side tool).
> On bare-metal MCUs, use `CUSUMDetector` and `ADWINDetector` directly without
> the Writer; the controller state machine is lightweight enough to embed.

---

## Minimum Viable Configurations for Cortex-M Class Devices

### Cortex-M0 / M0+ (16–32 KB RAM, no FPU)

CUSUM only — ADWIN window too large.

```python
monitor = RuntimeMonitor(
    target_mean=0.05,
    slack=0.01,
    warn_threshold=2.0,
    requalify_threshold=4.0,
    adwin_window=0,   # disable ADWIN by setting window to minimum
)
# Or use CUSUMDetector directly:
detector = CUSUMDetector(target_mean=0.05, slack=0.01, threshold=4.0)
```

*Footprint: 48 bytes (CUSUM only). ADWIN disabled.*

### Cortex-M4 / M7 with FPU (128–256 KB RAM)

Full CUSUM + ADWIN with small window.

```python
monitor = RuntimeMonitor(
    target_mean=0.05,
    slack=0.01,
    warn_threshold=2.5,
    requalify_threshold=5.0,
    adwin_delta=0.01,   # higher delta = less sensitive, fewer false positives
    adwin_window=32,    # 460 B total for ADWIN
)
```

*Total footprint: ~500 B. Recommended baseline for Cortex-M4.*

### Cortex-A class (Linux embedded, ≥4 MB RAM)

Full configuration with default window.

```python
monitor = RuntimeMonitor(
    target_mean=0.05,
    slack=0.01,
    warn_threshold=3.0,
    requalify_threshold=5.0,
    adwin_delta=0.002,
    adwin_window=200,   # 1.8 KB total for ADWIN
)
```

*Total footprint: ~2.2 KB. No constraints on this class.*

---

## Parameter Tuning Guide

### CUSUM parameters

| Parameter | Effect of increasing |
|---|---|
| `target_mean` | Shifts the null hypothesis; set to the loss mean observed during qualification |
| `slack` (k) | Reduces sensitivity to small shifts; set to half the minimum detectable shift |
| `warn_threshold` | Delays WARN signal; reduces false positives under noisy signals |
| `requalify_threshold` | Delays REQUALIFY signal; set 1.5–2× `warn_threshold` |

**Rule of thumb:** Set `slack = 0.5 × (shift_to_detect - 0)`. For a model where
you want to detect a 0.02 increase in loss from a nominal of 0.05:
`slack = 0.01`, `requalify_threshold = 5 × slack = 0.05`.

### ADWIN parameters

| Parameter | Effect of increasing |
|---|---|
| `delta` | More false positives (lower confidence); faster detection of subtle drift |
| `max_window` | Better sensitivity to subtle shifts; higher memory and compute cost |

**Rule of thumb:** Start with `delta=0.002` (99.8% confidence) and
`max_window=min(200, available_ram_bytes / 8)`.

---

## Update Complexity

| Operation | CUSUM | ADWIN (window=W) |
|---|---|---|
| `update(x)` | O(1) | O(W) |
| Memory per call | 0 (in-place) | 0 (in-place, deque rotation O(1)) |
| Reset | O(1) | O(W) (clears deque) |

At W=200 and 100 inferences/second: ADWIN performs 20,000 addition operations per
second. On a Cortex-M4 at 168 MHz this is approximately 120 μs per update — well
within budget for models with >1 ms inference latency.

---

*Last updated: April 2026*
*Maintained by Capicú Technologies*
