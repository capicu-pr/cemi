from __future__ import annotations

import json
import math
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, Mapping, Optional

from .defaults import DEFAULT_SAVE_DIR


def _parse_iso(ts: str | None) -> datetime | None:
    if not ts or not isinstance(ts, str):
        return None
    s = ts.strip()
    if not s:
        return None
    # Writer emits Z suffix; datetime.fromisoformat wants +00:00
    if s.endswith("Z"):
        s = s[:-1] + "+00:00"
    try:
        return datetime.fromisoformat(s)
    except ValueError:
        return None


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _quantile(sorted_values: list[float], q: float) -> float | None:
    if not sorted_values:
        return None
    if q <= 0:
        return sorted_values[0]
    if q >= 1:
        return sorted_values[-1]
    # Linear interpolation between closest ranks.
    n = len(sorted_values)
    pos = (n - 1) * q
    lo = int(math.floor(pos))
    hi = int(math.ceil(pos))
    if lo == hi:
        return sorted_values[lo]
    w = pos - lo
    return sorted_values[lo] * (1 - w) + sorted_values[hi] * w


def _matches_tags(have: Mapping[str, Any] | None, want: Mapping[str, Any] | None) -> bool:
    if not want:
        return True
    if not have:
        return False
    for k, v in want.items():
        if k not in have:
            return False
        if have[k] != v:
            return False
    return True


def load_contract(path: str | Path) -> dict[str, Any]:
    p = Path(path).expanduser()
    raw = p.read_text(encoding="utf-8")
    data = json.loads(raw)
    if not isinstance(data, dict):
        raise ValueError("Contract must be a JSON object.")
    return data


def default_contract_path() -> Path:
    # Deliberately scoped to the project working dir (same base as runs/artifacts).
    return Path(DEFAULT_SAVE_DIR) / "contract.json"


@dataclass(frozen=True)
class MetricSelector:
    name: str
    source: str = "summary_metrics"  # "summary_metrics" | "metrics"
    aggregation: str = "last"  # for source="metrics": last|min|max|mean|p50|p90|p95|p99
    tags: dict[str, Any] | None = None  # filter metric event tags (subset match)


def _parse_selector(obj: Mapping[str, Any]) -> MetricSelector:
    name = obj.get("name")
    if not isinstance(name, str) or not name.strip():
        raise ValueError("Metric selector requires non-empty 'name'.")
    source = obj.get("source") or "summary_metrics"
    aggregation = obj.get("aggregation") or "last"
    tags = obj.get("tags")
    if tags is not None and not isinstance(tags, dict):
        raise ValueError("Metric selector 'tags' must be an object if present.")
    return MetricSelector(
        name=name,
        source=str(source),
        aggregation=str(aggregation),
        tags=dict(tags) if isinstance(tags, dict) else None,
    )


def _metric_points(run: Mapping[str, Any], name: str, tags: Mapping[str, Any] | None) -> list[dict[str, Any]]:
    metrics = run.get("metrics") or []
    if not isinstance(metrics, list):
        return []
    out: list[dict[str, Any]] = []
    for m in metrics:
        if not isinstance(m, dict):
            continue
        if m.get("name") != name:
            continue
        if not _matches_tags(m.get("tags"), tags):
            continue
        v = m.get("value")
        if isinstance(v, (int, float)) and not isinstance(v, bool):
            out.append(m)
    return out


def resolve_metric_value(run: Mapping[str, Any], selector: MetricSelector) -> float | None:
    if selector.source == "summary_metrics":
        sm = run.get("summary_metrics") or {}
        if not isinstance(sm, dict):
            return None
        v = sm.get(selector.name)
        if isinstance(v, (int, float)) and not isinstance(v, bool):
            return float(v)
        return None

    if selector.source == "metrics":
        pts = _metric_points(run, selector.name, selector.tags)
        if not pts:
            return None

        agg = selector.aggregation
        if agg == "last":
            # Prefer highest step if present; else last in file.
            pts_sorted = sorted(
                pts,
                key=lambda m: (
                    int(m.get("step")) if isinstance(m.get("step"), int) else -1,
                    m.get("timestamp") or "",
                ),
            )
            return float(pts_sorted[-1]["value"])

        values = [float(m["value"]) for m in pts if isinstance(m.get("value"), (int, float))]
        if not values:
            return None
        values_sorted = sorted(values)

        if agg == "min":
            return values_sorted[0]
        if agg == "max":
            return values_sorted[-1]
        if agg == "mean":
            return float(sum(values_sorted) / len(values_sorted))
        if agg == "p50":
            return _quantile(values_sorted, 0.50)
        if agg == "p90":
            return _quantile(values_sorted, 0.90)
        if agg == "p95":
            return _quantile(values_sorted, 0.95)
        if agg == "p99":
            return _quantile(values_sorted, 0.99)

        raise ValueError(f"Unsupported aggregation '{agg}' for selector.source='metrics'.")

    raise ValueError(f"Unsupported selector.source '{selector.source}'.")


def _direction_worse(direction: str, run_value: float, baseline_value: float) -> bool:
    d = (direction or "").strip().lower()
    if d == "higher_is_better":
        return run_value < baseline_value
    if d == "lower_is_better":
        return run_value > baseline_value
    # Default: assume higher is better for "accuracy-like" and lower is better for "latency-like"
    return run_value < baseline_value


def _relative_degradation(direction: str, run_value: float, baseline_value: float) -> dict[str, float]:
    """
    Return degradation as {abs, pct}. Positive means "worse", negative means "better".
    """
    d = (direction or "").strip().lower()
    if d == "lower_is_better":
        worse_abs = run_value - baseline_value
    else:
        worse_abs = baseline_value - run_value
    worse_pct = (worse_abs / baseline_value * 100.0) if baseline_value not in (0.0, -0.0) else float("inf")
    return {"abs": float(worse_abs), "pct": float(worse_pct)}


def _coerce_float(x: Any) -> float | None:
    if isinstance(x, (int, float)) and not isinstance(x, bool):
        return float(x)
    return None


def _pick_baseline_run_id(
    runs: list[Mapping[str, Any]],
    contract: Mapping[str, Any],
) -> str | None:
    baseline = contract.get("baseline")
    if isinstance(baseline, dict):
        rid = baseline.get("run_id")
        if isinstance(rid, str) and rid.strip():
            return rid

    # If exactly one run advertises itself as baseline via tag.
    baseline_tag_matches: list[str] = []
    for r in runs:
        tags = r.get("tags")
        if isinstance(tags, dict) and tags.get("variant") == "baseline":
            rid = r.get("id")
            if isinstance(rid, str):
                baseline_tag_matches.append(rid)
    if len(baseline_tag_matches) == 1:
        return baseline_tag_matches[0]

    # Fallback: earliest created_at.
    with_times: list[tuple[datetime, str]] = []
    for r in runs:
        rid = r.get("id")
        if not isinstance(rid, str):
            continue
        dt = _parse_iso(r.get("created_at"))
        if dt:
            with_times.append((dt, rid))
    if with_times:
        with_times.sort(key=lambda t: t[0])
        return with_times[0][1]

    # Last resort: first run in list.
    for r in runs:
        rid = r.get("id")
        if isinstance(rid, str):
            return rid
    return None


def _rate_per_hour_for_run(cost_cfg: Mapping[str, Any], run: Mapping[str, Any]) -> float:
    rates = cost_cfg.get("rates") or {}
    if not isinstance(rates, dict):
        return 0.0

    default_rate = _coerce_float(rates.get("default_per_hour")) or 0.0
    by_tag = rates.get("by_tag") or []
    if isinstance(by_tag, list):
        tags = run.get("tags")
        tags_obj = tags if isinstance(tags, dict) else {}
        for entry in by_tag:
            if not isinstance(entry, dict):
                continue
            when = entry.get("tags")
            if when is not None and not isinstance(when, dict):
                continue
            if _matches_tags(tags_obj, when):
                rph = _coerce_float(entry.get("per_hour"))
                if rph is not None:
                    return float(rph)

    return float(default_rate)


def _runtime_seconds(run: Mapping[str, Any]) -> float | None:
    start = _parse_iso(run.get("started_at"))
    end = _parse_iso(run.get("ended_at"))
    if not start or not end:
        return None
    dt = (end - start).total_seconds()
    if dt < 0:
        return None
    return float(dt)


def _output_count(cost_cfg: Mapping[str, Any], run: Mapping[str, Any]) -> float:
    output = cost_cfg.get("output") or {}
    if isinstance(output, dict):
        metric_obj = output.get("metric")
        if isinstance(metric_obj, dict):
            sel = _parse_selector(metric_obj)
            v = resolve_metric_value(run, sel)
            if v is not None and v > 0:
                return float(v)
        fallback = _coerce_float(output.get("fallback"))
        if fallback is not None and fallback > 0:
            return float(fallback)
    return 1.0


def compute_cost_per_output(contract: Mapping[str, Any], run: Mapping[str, Any]) -> dict[str, Any]:
    cost = contract.get("cost") or {}
    if not isinstance(cost, dict):
        return {"enabled": False, "currency": None, "cost_per_output": None, "explain": "no_cost_model"}

    rph = _rate_per_hour_for_run(cost, run)
    runtime_s = _runtime_seconds(run)
    outputs = _output_count(cost, run)
    currency = cost.get("currency") if isinstance(cost.get("currency"), str) else "USD"

    if runtime_s is None:
        return {
            "enabled": True,
            "currency": currency,
            "cost_per_output": None,
            "explain": "missing_runtime_seconds (need started_at and ended_at)",
            "rate_per_hour": rph,
            "outputs": outputs,
        }
    if outputs <= 0:
        return {
            "enabled": True,
            "currency": currency,
            "cost_per_output": None,
            "explain": "missing_or_zero_outputs",
            "rate_per_hour": rph,
            "runtime_seconds": runtime_s,
            "outputs": outputs,
        }

    cost_total = (rph / 3600.0) * runtime_s
    return {
        "enabled": True,
        "currency": currency,
        "cost_per_output": float(cost_total / outputs),
        "rate_per_hour": rph,
        "runtime_seconds": runtime_s,
        "outputs": outputs,
    }


def evaluate_contract(runs: list[Mapping[str, Any]], contract: Mapping[str, Any]) -> dict[str, Any]:
    """
    Evaluate contract gates across runs and recommend the cheapest passing run.

    Contract format (v0, intentionally small):
      - baseline.run_id (optional)
      - gates: list of rules
      - cost: optional cost model (rate per hour + outputs)

    Each gate:
      {
        "id": "quality",
        "role": "quality" | "performance" | "resource" | "cost" | "custom",
        "metric": { "name": "...", "source": "summary_metrics"|"metrics", "aggregation": "p99"|... , "tags": {...} },
        "direction": "higher_is_better"|"lower_is_better",
        "absolute": { "min": 0.9 } OR { "max": 120.0 },
        "relative_degradation": { "max_abs": 0.01 } OR { "max_pct": 2.0 }
      }
    """
    baseline_run_id = _pick_baseline_run_id(runs, contract)
    baseline_run = next((r for r in runs if r.get("id") == baseline_run_id), None)

    gates = contract.get("gates") or []
    if gates is not None and not isinstance(gates, list):
        raise ValueError("Contract 'gates' must be a list.")

    evaluated: list[dict[str, Any]] = []
    for run in runs:
        run_id = run.get("id")
        if not isinstance(run_id, str):
            continue
        run_result: dict[str, Any] = {
            "run_id": run_id,
            "pass": True,
            "gate_results": [],
        }

        for g in gates:
            if not isinstance(g, dict):
                continue
            gate_id = g.get("id") if isinstance(g.get("id"), str) else "gate"
            role = g.get("role") if isinstance(g.get("role"), str) else "custom"
            direction = g.get("direction") if isinstance(g.get("direction"), str) else "higher_is_better"
            metric_obj = g.get("metric")
            if not isinstance(metric_obj, dict):
                continue
            selector = _parse_selector(metric_obj)
            run_v = resolve_metric_value(run, selector)

            baseline_v = None
            if baseline_run and baseline_run.get("id"):
                if baseline_run.get("id") == run_id:
                    baseline_v = run_v
                else:
                    baseline_v = resolve_metric_value(baseline_run, selector)

            gate_pass = True
            explain = "ok"
            absolute = g.get("absolute")
            rel = g.get("relative_degradation")

            if run_v is None:
                gate_pass = False
                explain = "missing_metric_value"
            else:
                if isinstance(absolute, dict):
                    min_v = _coerce_float(absolute.get("min"))
                    max_v = _coerce_float(absolute.get("max"))
                    if min_v is not None and run_v < min_v:
                        gate_pass = False
                        explain = f"value {run_v} < min {min_v}"
                    if max_v is not None and run_v > max_v:
                        gate_pass = False
                        explain = f"value {run_v} > max {max_v}"

                if isinstance(rel, dict):
                    if baseline_v is None:
                        gate_pass = False
                        explain = "missing_baseline_metric_value"
                    else:
                        deg = _relative_degradation(direction, run_v, baseline_v)
                        max_abs = _coerce_float(rel.get("max_abs"))
                        max_pct = _coerce_float(rel.get("max_pct"))
                        if max_abs is not None and deg["abs"] > max_abs:
                            gate_pass = False
                            explain = f"degradation_abs {deg['abs']:.6g} > {max_abs}"
                        if max_pct is not None and deg["pct"] > max_pct:
                            gate_pass = False
                            explain = f"degradation_pct {deg['pct']:.6g}% > {max_pct}%"

            if not gate_pass:
                run_result["pass"] = False

            run_result["gate_results"].append(
                {
                    "id": gate_id,
                    "role": role,
                    "metric": {
                        "name": selector.name,
                        "source": selector.source,
                        "aggregation": selector.aggregation,
                        "tags": selector.tags or {},
                    },
                    "direction": direction,
                    "run_value": run_v,
                    "baseline_value": baseline_v,
                    "pass": gate_pass,
                    "explain": explain,
                }
            )

        cost_info = compute_cost_per_output(contract, run)
        run_result["cost"] = cost_info
        evaluated.append(run_result)

    # Recommend cheapest passing run (requires cost_per_output if cost enabled).
    passing = [r for r in evaluated if r.get("pass") is True]
    recommended_run_id = None

    def _cost_key(r: Mapping[str, Any]) -> float:
        cost = r.get("cost") or {}
        if not isinstance(cost, dict):
            return float("inf")
        if cost.get("enabled") is not True:
            return 0.0
        v = cost.get("cost_per_output")
        if isinstance(v, (int, float)) and not isinstance(v, bool):
            return float(v)
        return float("inf")

    if passing:
        passing_sorted = sorted(passing, key=_cost_key)
        recommended_run_id = passing_sorted[0].get("run_id")

    return {
        "generated_at": _now_iso(),
        "baseline_run_id": baseline_run_id,
        "recommended_run_id": recommended_run_id,
        "results": evaluated,
    }


def load_run_for_evaluation(path: str | Path) -> Optional[Dict[str, Any]]:
    """
    Load the latest run_record payload from a JSONL file, normalized for evaluate_contract().

    Handles both v2 payloads (run_id, metrics.events/summary) and v1 legacy payloads (id,
    summary_metrics dict).  Returns None if no valid run_record is found.
    """
    p = Path(path).expanduser()
    if not p.is_file():
        return None
    text = p.read_text(encoding="utf-8").strip()
    if not text:
        return None

    last_payload: Optional[Dict[str, Any]] = None
    for line in text.splitlines():
        if not line.strip():
            continue
        try:
            event = json.loads(line)
        except json.JSONDecodeError:
            continue
        if event.get("type") != "run_record":
            continue
        payload = event.get("payload")
        if isinstance(payload, dict):
            last_payload = payload

    if not last_payload:
        return None

    out = dict(last_payload)

    # evaluate_contract() uses run.get("id"); v2 payloads carry run_id instead.
    if not isinstance(out.get("id"), str):
        rid = out.get("run_id")
        if isinstance(rid, str):
            out["id"] = rid

    # Build summary_metrics dict from v2 metrics.summary list so source="summary_metrics" gates work.
    if not isinstance(out.get("summary_metrics"), dict):
        metrics_obj = out.get("metrics")
        if isinstance(metrics_obj, dict):
            sm: Dict[str, Any] = {}
            for m in metrics_obj.get("summary") or []:
                if not isinstance(m, dict):
                    continue
                n, v = m.get("name"), m.get("value")
                if isinstance(n, str) and isinstance(v, (int, float)) and not isinstance(v, bool):
                    sm[n] = float(v)
            out["summary_metrics"] = sm

    # Flatten v2 metrics dict to events list so source="metrics" p-quantile gates work.
    metrics_raw = out.get("metrics")
    if isinstance(metrics_raw, dict):
        out["metrics"] = metrics_raw.get("events") or []

    return out

