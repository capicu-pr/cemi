#!/usr/bin/env python3
"""
generate_mock_data.py
---------------------
Generates realistic mock run data using the real cemi Writer.

Project scenario
----------------
"Cross-Platform MobileNetV3-Small Compression" — an ML researcher at Capicú is
compressing MobileNetV3-Small (ImageNet-pretrained, fine-tuned on a proprietary
vision dataset) for two deployment targets:

  HPC  — NVIDIA H100 80GB SXM5 (server batch inference, CUDA/TensorRT)
  Edge — Raspberry Pi 4B, ARM Cortex-A72 @ 1.8 GHz (TFLite / ONNX Runtime)

The run set is designed to surface common research pain points:

  Subtle differences  Two INT8 PTQ runs (TFLite vs ONNX Runtime) look nearly
                      identical in every scalar metric — 0.0002 accuracy gap,
                      same size, similar latency — but one fails the EQC gate
                      because kernel dispatch diverges in specific output dims.

  Obvious problems    FP32 on edge: 1800 ms latency, deployment non-starter.
                      Failed run: training loss spikes to NaN after step 11.
                      Overfit run: 6-pt train/val accuracy gap.

  Notable wins        INT8 QAT on RPi4: best edge accuracy, passes all gates.
                      INT4 QAT on RPi4: recovers from INT4 PTQ's accuracy drop,
                        passes all gates — smallest qualifying model.
                      FP16 on H100: best HPC speed/accuracy ratio.

Run:
    python scripts/generate_mock_data.py

Writes:
    src/mockRunsData.js
    (also patches mockProjects block in src/mockData.js)
"""

from __future__ import annotations

import json
import math
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "cli"))
from cemi.writer import Writer  # noqa: E402

# ---------------------------------------------------------------------------
# Plumbing
# ---------------------------------------------------------------------------

PROJECT_ID = "project-mobilenetv3-compression"

class _Capture:
    def __init__(self):
        self.last: dict | None = None
    def write(self, record: dict) -> None:
        self.last = record

def _writer(name: str) -> tuple[Writer, _Capture]:
    sink = _Capture()
    return Writer(sink=sink, project=PROJECT_ID), sink

# ---------------------------------------------------------------------------
# Deterministic curves — no Math.random(), stable across reruns
# ---------------------------------------------------------------------------

def _decay(n: int, start: float, end: float, rate: float = 0.28) -> list[float]:
    return [end + (start - end) * math.exp(-rate * i) for i in range(n)]

def _sigmoid(n: int, plateau: float, k: float = 0.45, mid: float | None = None) -> list[float]:
    c = mid if mid is not None else n / 2.0
    return [plateau / (1 + math.exp(-k * (i - c))) for i in range(n)]

def _wave(values: list[float], amp: float, freq: float = 0.85) -> list[float]:
    """Adds a deterministic ripple — not random, but visually noisy."""
    return [v + amp * math.sin(i * freq + 1.7) for i, v in enumerate(values)]

def _diverge(base: list[float], pull: float, start: int) -> list[float]:
    """After `start`, values drift upward — simulates val loss divergence."""
    out = list(base)
    for i in range(start, len(out)):
        out[i] += pull * (i - start + 1)
    return out

# ---------------------------------------------------------------------------
# Timestamp helpers
# ---------------------------------------------------------------------------

# Anchor: 2026-03-01T08:00:00Z
_BASE_MS = 1_740_816_000_000

def _ts(offset_min: int) -> str:
    from datetime import datetime, timezone
    dt = datetime.fromtimestamp((_BASE_MS + offset_min * 60_000) / 1000.0, tz=timezone.utc)
    return dt.isoformat().replace("+00:00", "Z")

# ---------------------------------------------------------------------------
# Shared target profiles
# ---------------------------------------------------------------------------

def _h100_profile() -> dict:
    return dict(
        id="profile-h100-sxm5",
        name="NVIDIA H100 80GB SXM5",
        architecture="cuda_hopper",
        runtime="tensorrt",
        description="HPC server — batch inference, NVLink interconnect",
    )

def _rpi4_profile(runtime: str) -> dict:
    return dict(
        id=f"profile-rpi4-{runtime}",
        name="Raspberry Pi 4B (ARM Cortex-A72)",
        architecture="arm_cortex_a72",
        runtime=runtime,
        description="Edge device — 4 GB LPDDR4, 1.8 GHz quad-core",
    )

# ---------------------------------------------------------------------------
# Run builders
# ---------------------------------------------------------------------------

def run_fp32_h100() -> dict:
    """Reference FP32 on H100 — the gold standard, everything should beat this on size/speed."""
    w, s = _writer("MobileNetV3-Small FP32 — H100 Baseline")
    w.start_run(run_id="run-mv3-fp32-h100", name="MobileNetV3-Small FP32 — H100 Baseline",
                created_at=_ts(0), started_at=_ts(1))
    w.set_notes(
        "FP32 reference on H100. Sets the accuracy ceiling and defines EQC-A "
        "reference for all subsequent compression runs."
    )
    w.set_tags({
        "domain": "vision", "task": "image_classification",
        "dataset": "capicu_vision_v2", "model": "mobilenetv3_small",
        "quantization": "fp32", "compression_method": "baseline",
        "environment": "hpc", "device_class": "gpu",
        "suite": "cross_platform_compression_v1",
    })
    w.set_target_profile(**_h100_profile())
    w.log_platform_fingerprint(
        runtime="tensorrt", hardware_backend="cuda_hopper",
        simd_flags=[], framework_version="8.6.1",
    )
    w.log_parameter(key="dataset.name",        value="capicu_vision_v2")
    w.log_parameter(key="dataset.num_classes",  value=67)
    w.log_parameter(key="dataset.train_size",   value=84_200)
    w.log_parameter(key="compression.method",   value="baseline")
    w.log_parameter(key="compression.bits",     value=32)
    w.log_parameter(key="train.batch_size",     value=256)
    w.log_parameter(key="train.optimizer",      value="adamw")
    w.log_parameter(key="train.lr",             value=0.0003)
    w.log_parameter(key="train.epochs",         value=30)

    loss_tr  = _wave(_decay(30, 2.18, 0.231, 0.19), 0.018)
    loss_val = _wave(_decay(30, 2.24, 0.248, 0.18), 0.012)
    acc_tr   = _wave(_sigmoid(30, 0.9621, 0.41),    0.005)
    acc_val  = _wave(_sigmoid(30, 0.9542, 0.40),    0.004)
    for step, vals in enumerate(zip(loss_tr, loss_val, acc_tr, acc_val)):
        lt, lv, at, av = vals
        w.log_metric(name="train_loss",     value=round(lt, 6), step=step)
        w.log_metric(name="val_loss",       value=round(lv, 6), step=step)
        w.log_metric(name="train_accuracy", value=round(min(at, 0.9999), 6), step=step)
        w.log_metric(name="val_accuracy",   value=round(min(av, 0.9999), 6), step=step)

    w.log_summary_metrics({
        "accuracy": 0.9542, "val_accuracy": 0.9542, "f1": 0.9487,
        "loss": 0.248, "val_loss": 0.248,
        "size_mb": 48.2, "latency_ms": 2.1, "throughput": 4761.9,
        "memory_mb": 2048.0, "compression_ratio": 1.0, "quantization_bits": 32,
        "top1_accuracy": 0.9542,
    })
    w.end_run(status="completed", ended_at=_ts(95))
    w.emit_run_record()
    return s.last["payload"]


def run_fp32_rpi4() -> dict:
    """
    FP32 on RPi4 — obvious deployment failure.
    Same accuracy as H100 (identical weights) but 1847 ms latency — non-starter.
    Researcher sees this and knows they need to compress.
    """
    w, s = _writer("MobileNetV3-Small FP32 — RPi4 Baseline")
    w.start_run(run_id="run-mv3-fp32-rpi4", name="MobileNetV3-Small FP32 — RPi4 Baseline",
                created_at=_ts(100), started_at=_ts(101))
    w.set_notes(
        "FP32 inference on Raspberry Pi 4B. Establishes the edge deployment ceiling: "
        "accuracy is identical to H100 but latency is ~880× worse. "
        "This run exists to justify the compression programme."
    )
    w.set_tags({
        "domain": "vision", "task": "image_classification",
        "dataset": "capicu_vision_v2", "model": "mobilenetv3_small",
        "quantization": "fp32", "compression_method": "baseline",
        "environment": "edge", "device_class": "arm",
        "suite": "cross_platform_compression_v1",
    })
    w.set_target_profile(**_rpi4_profile("tflite"))
    w.log_platform_fingerprint(
        runtime="tflite", hardware_backend="arm_cortex_a72",
        simd_flags=["neon"], framework_version="2.14.0",
    )
    w.log_parameter(key="dataset.name",       value="capicu_vision_v2")
    w.log_parameter(key="dataset.num_classes", value=67)
    w.log_parameter(key="compression.method", value="baseline")
    w.log_parameter(key="compression.bits",   value=32)

    # Single-step eval metrics (no training loop — one-shot inference profiling)
    w.log_metric(name="accuracy",   value=0.9542, step=0)
    w.log_metric(name="val_accuracy", value=0.9542, step=0)
    w.log_metric(name="f1",         value=0.9487, step=0)
    w.log_metric(name="loss",       value=0.248,  step=0)
    w.log_metric(name="size_mb",    value=48.2,   step=0)
    w.log_metric(name="latency_ms", value=1847.3, step=0)
    w.log_summary_metrics({
        "accuracy": 0.9542, "val_accuracy": 0.9542, "f1": 0.9487,
        "loss": 0.248,
        "size_mb": 48.2, "latency_ms": 1847.3, "throughput": 0.54,
        "memory_mb": 512.0, "compression_ratio": 1.0, "quantization_bits": 32,
        "top1_accuracy": 0.9542,
    })
    # No contract — no gates defined at this stage, it's just profiling
    w.end_run(status="completed", ended_at=_ts(115))
    w.emit_run_record()
    return s.last["payload"]


def run_fp16_h100() -> dict:
    """FP16 on H100 — notable HPC win: half the memory, 2× the throughput, <0.01 accuracy drop."""
    w, s = _writer("MobileNetV3-Small FP16 — H100")
    w.start_run(run_id="run-mv3-fp16-h100", name="MobileNetV3-Small FP16 — H100",
                created_at=_ts(110), started_at=_ts(111))
    w.set_notes(
        "FP16 mixed-precision on H100. Best HPC result: memory halved, "
        "throughput 2.1× baseline, accuracy within 0.0001 of FP32. "
        "Recommended for all H100 serving workloads."
    )
    w.set_tags({
        "domain": "vision", "task": "image_classification",
        "dataset": "capicu_vision_v2", "model": "mobilenetv3_small",
        "quantization": "fp16", "compression_method": "ptq",
        "environment": "hpc", "device_class": "gpu",
        "suite": "cross_platform_compression_v1",
    })
    w.set_target_profile(**_h100_profile())
    w.set_lineage(baseline_run_id="run-mv3-fp32-h100")
    w.log_platform_fingerprint(
        runtime="tensorrt", hardware_backend="cuda_hopper",
        simd_flags=[], framework_version="8.6.1",
    )
    w.log_parameter(key="dataset.name",        value="capicu_vision_v2")
    w.log_parameter(key="dataset.num_classes",  value=67)
    w.log_parameter(key="compression.method",   value="ptq")
    w.log_parameter(key="compression.bits",     value=16)
    w.log_parameter(key="compression.calibration_samples", value=1024)

    # Single-step eval metrics (PTQ — no training loop)
    w.log_metric(name="accuracy",   value=0.9541, step=0)
    w.log_metric(name="val_accuracy", value=0.9541, step=0)
    w.log_metric(name="f1",         value=0.9486, step=0)
    w.log_metric(name="loss",       value=0.2493, step=0)
    w.log_metric(name="size_mb",    value=24.1,   step=0)
    w.log_metric(name="latency_ms", value=1.0,    step=0)
    w.log_summary_metrics({
        "accuracy": 0.9541, "val_accuracy": 0.9541, "f1": 0.9486,
        "loss": 0.2493,
        "size_mb": 24.1, "latency_ms": 1.0, "throughput": 10_000.0,
        "memory_mb": 1024.0, "compression_ratio": 2.0, "quantization_bits": 16,
        "top1_accuracy": 0.9541,
    })
    w.log_eqc_assignment(
        eqc_id="EQC-A",
        reference_runtime="tensorrt", reference_hardware="cuda_hopper",
        output_delta_norm=0.000412, tolerance=0.01,
        per_class_delta=[
            {"label": str(i), "delta": round(0.0001 + i * 0.000006, 6)} for i in range(67)
        ],
    )
    w.log_accuracy_gate(metric_name="top1_accuracy", metric_value=0.9541,
                        threshold=0.92, direction="higher_is_better")
    w.log_contract_result({
        "pass": True, "run_id": "run-mv3-fp16-h100",
        "gate_results": [
            {"id": "accuracy_gate", "role": "quality",
             "metric": {"name": "top1_accuracy"}, "run_value": 0.9541, "pass": True,
             "explain": "0.9541 >= 0.92"},
            {"id": "latency_gate", "role": "performance",
             "metric": {"name": "latency_ms"}, "run_value": 1.0, "pass": True,
             "explain": "1.0ms <= 5ms (HPC SLA)"},
        ],
    })
    w.end_run(status="completed", ended_at=_ts(130))
    w.emit_run_record()
    return s.last["payload"]


def run_int8_ptq_rpi4_tflite() -> dict:
    """
    INT8 PTQ, RPi4, TFLite — the first real edge win.
    Latency drops from 1847ms to 48.7ms. Passes all gates. Notable success.
    """
    w, s = _writer("MobileNetV3-Small INT8 PTQ — RPi4/TFLite")
    w.start_run(run_id="run-mv3-int8-ptq-rpi4-tflite",
                name="MobileNetV3-Small INT8 PTQ — RPi4/TFLite",
                created_at=_ts(140), started_at=_ts(141))
    w.set_notes(
        "INT8 post-training quantization via TFLite calibration on RPi4. "
        "38× latency improvement over FP32 edge baseline. "
        "Passes accuracy, latency, and EQC gates. Primary edge candidate."
    )
    w.set_tags({
        "domain": "vision", "task": "image_classification",
        "dataset": "capicu_vision_v2", "model": "mobilenetv3_small",
        "quantization": "int8", "compression_method": "ptq",
        "environment": "edge", "device_class": "arm",
        "suite": "cross_platform_compression_v1",
    })
    w.set_target_profile(**_rpi4_profile("tflite"))
    w.set_lineage(baseline_run_id="run-mv3-fp32-h100",
                  parent_run_id="run-mv3-fp32-rpi4")
    w.log_platform_fingerprint(
        runtime="tflite", hardware_backend="arm_cortex_a72",
        simd_flags=["neon", "dotprod"], framework_version="2.14.0",
    )
    w.log_parameter(key="dataset.name",        value="capicu_vision_v2")
    w.log_parameter(key="dataset.num_classes",  value=67)
    w.log_parameter(key="compression.method",   value="ptq")
    w.log_parameter(key="compression.bits",     value=8)
    w.log_parameter(key="compression.calibration_samples", value=512)
    w.log_parameter(key="compression.per_channel", value=True)

    # Operator hotspot profile (post-quantization profiling)
    hotspots = [
        (0, "Conv2d",        "features.0.0",          "CONV_2D",           "3×3",   True,  8.42, 17.3),
        (1, "DepthwiseConv", "features.1.conv.0",      "DEPTHWISE_CONV_2D", "3×3",   True,  6.71, 13.8),
        (2, "Conv2d",        "features.2.block.0.0",   "CONV_2D",           "1×1",   True,  5.38, 11.1),
        (3, "DepthwiseConv", "features.3.block.1.0",   "DEPTHWISE_CONV_2D", "3×3",   True,  4.87, 10.0),
        (4, "Conv2d",        "features.4.block.0.0",   "CONV_2D",           "1×1",   True,  3.94,  8.1),
        (5, "Linear",        "classifier.3",           "FULLY_CONNECTED",   "576×67",True,  2.11,  4.3),
    ]
    for idx, op, layer, op_type, kernel, quantized, t_ms, pct in hotspots:
        w.log_operator_hotspot(index=idx, operator=op, layer=layer, op_type=op_type,
                               kernel=kernel, quantized=quantized,
                               time_ms=t_ms, percentage=pct)

    n_cls = 67
    per_class = [
        {"label": str(i), "delta": round(0.0011 + i * 0.000031 + 0.0002 * math.sin(i * 1.2), 6)}
        for i in range(n_cls)
    ]
    n_s = 40
    matrix = [
        [round(per_class[c]["delta"] * (0.55 + 0.9 * abs(math.sin(c * 1.7 + s * 0.9))), 6)
         for s in range(n_s)]
        for c in range(n_cls)
    ]
    w.log_eqc_assignment(
        eqc_id="EQC-A",
        reference_runtime="tensorrt", reference_hardware="cuda_hopper",
        output_delta_norm=0.003184, tolerance=0.01,
        per_class_delta=per_class,
        divergence_matrix={"classes": [str(i) for i in range(n_cls)],
                           "samples": [str(s) for s in range(n_s)],
                           "values": matrix},
    )
    w.log_accuracy_gate(metric_name="top1_accuracy", metric_value=0.9521,
                        threshold=0.92, direction="higher_is_better")
    w.log_contract_result({
        "pass": True, "run_id": "run-mv3-int8-ptq-rpi4-tflite",
        "gate_results": [
            {"id": "accuracy_gate", "role": "quality",
             "metric": {"name": "top1_accuracy"}, "run_value": 0.9521, "pass": True,
             "explain": "0.9521 >= 0.92"},
            {"id": "eqc_delta_gate", "role": "quality",
             "metric": {"name": "output_delta_norm"}, "run_value": 0.003184, "pass": True,
             "explain": "0.003184 <= 0.01 (EQC-A boundary)"},
            {"id": "latency_gate", "role": "performance",
             "metric": {"name": "latency_ms"}, "run_value": 48.7, "pass": True,
             "explain": "48.7ms <= 100ms (edge SLA)"},
        ],
    })
    # Single-step eval metrics (PTQ — no training loop)
    w.log_metric(name="accuracy",   value=0.9521, step=0)
    w.log_metric(name="val_accuracy", value=0.9521, step=0)
    w.log_metric(name="f1",         value=0.9463, step=0)
    w.log_metric(name="loss",       value=0.2617, step=0)
    w.log_metric(name="size_mb",    value=12.1,   step=0)
    w.log_metric(name="latency_ms", value=48.7,   step=0)
    w.log_summary_metrics({
        "accuracy": 0.9521, "val_accuracy": 0.9521, "f1": 0.9463,
        "loss": 0.2617,
        "size_mb": 12.1, "latency_ms": 48.7, "throughput": 20.5,
        "memory_mb": 128.0, "compression_ratio": 3.98, "quantization_bits": 8,
        "top1_accuracy": 0.9521,
    })
    w.end_run(status="completed", ended_at=_ts(160))
    w.emit_run_record()
    return s.last["payload"]


def run_int8_ptq_rpi4_onnx() -> dict:
    """
    INT8 PTQ, RPi4, ONNX Runtime — HARD TO DISTINGUISH from TFLite run.

    Scalar table: accuracy 0.9519 vs 0.9521 (diff = 0.0002), latency 51.2 vs 48.7 ms.
    Looks like a tie. But EQC delta is 0.01247 — just above the 0.01 tolerance.
    Kernel dispatch differs in class dims 12 and 41 (Conv2d int8 saturation).
    CEMI flags it NOT QUALIFIED. This is the exact problem CEMI is built to find.
    """
    w, s = _writer("MobileNetV3-Small INT8 PTQ — RPi4/ONNX")
    w.start_run(run_id="run-mv3-int8-ptq-rpi4-onnx",
                name="MobileNetV3-Small INT8 PTQ — RPi4/ONNX",
                created_at=_ts(165), started_at=_ts(166))
    w.set_notes(
        "INT8 PTQ on ONNX Runtime (RPi4). Metrics look nearly identical to the "
        "TFLite run — 0.0002 accuracy gap, 2.5ms extra latency — but the EQC "
        "delta exceeds tolerance due to INT8 saturation in Conv2d layers 12 and 41. "
        "NOT QUALIFIED despite passing scalar gates."
    )
    w.set_tags({
        "domain": "vision", "task": "image_classification",
        "dataset": "capicu_vision_v2", "model": "mobilenetv3_small",
        "quantization": "int8", "compression_method": "ptq",
        "environment": "edge", "device_class": "arm",
        "suite": "cross_platform_compression_v1",
    })
    w.set_target_profile(**_rpi4_profile("onnxruntime"))
    w.set_lineage(baseline_run_id="run-mv3-fp32-h100")
    w.log_platform_fingerprint(
        runtime="onnxruntime", hardware_backend="arm_cortex_a72",
        simd_flags=["neon"], framework_version="1.17.1",
    )
    w.log_parameter(key="dataset.name",        value="capicu_vision_v2")
    w.log_parameter(key="dataset.num_classes",  value=67)
    w.log_parameter(key="compression.method",   value="ptq")
    w.log_parameter(key="compression.bits",     value=8)
    w.log_parameter(key="compression.calibration_samples", value=512)
    w.log_parameter(key="compression.per_channel", value=True)

    n_cls = 67
    # Class 12 and 41 have elevated deltas — localized saturation
    per_class = []
    for i in range(n_cls):
        base = 0.0011 + i * 0.000031 + 0.0002 * math.sin(i * 1.2)
        if i in (12, 41):
            base += 0.028   # localized divergence — the hidden defect
        per_class.append({"label": str(i), "delta": round(base, 6)})

    n_s = 40
    matrix = [
        [round(per_class[c]["delta"] * (0.55 + 0.9 * abs(math.sin(c * 1.7 + s * 0.9))), 6)
         for s in range(n_s)]
        for c in range(n_cls)
    ]
    w.log_eqc_assignment(
        eqc_id="EQC-B",
        reference_runtime="tensorrt", reference_hardware="cuda_hopper",
        output_delta_norm=0.01247, tolerance=0.01,
        per_class_delta=per_class,
        divergence_matrix={"classes": [str(i) for i in range(n_cls)],
                           "samples": [str(s) for s in range(n_s)],
                           "values": matrix},
    )
    w.log_accuracy_gate(metric_name="top1_accuracy", metric_value=0.9519,
                        threshold=0.92, direction="higher_is_better")
    w.log_contract_result({
        "pass": False, "run_id": "run-mv3-int8-ptq-rpi4-onnx",
        "gate_results": [
            {"id": "accuracy_gate", "role": "quality",
             "metric": {"name": "top1_accuracy"}, "run_value": 0.9519, "pass": True,
             "explain": "0.9519 >= 0.92"},
            {"id": "eqc_delta_gate", "role": "quality",
             "metric": {"name": "output_delta_norm"}, "run_value": 0.01247, "pass": False,
             "explain": "0.01247 > 0.01 — INT8 saturation in cls 12, 41"},
            {"id": "latency_gate", "role": "performance",
             "metric": {"name": "latency_ms"}, "run_value": 51.2, "pass": True,
             "explain": "51.2ms <= 100ms"},
        ],
    })
    # Single-step eval metrics (PTQ — no training loop)
    w.log_metric(name="accuracy",   value=0.9519, step=0)
    w.log_metric(name="val_accuracy", value=0.9519, step=0)
    w.log_metric(name="f1",         value=0.9461, step=0)
    w.log_metric(name="loss",       value=0.2624, step=0)
    w.log_metric(name="size_mb",    value=12.1,   step=0)
    w.log_metric(name="latency_ms", value=51.2,   step=0)
    w.log_summary_metrics({
        "accuracy": 0.9519, "val_accuracy": 0.9519, "f1": 0.9461,
        "loss": 0.2624,
        "size_mb": 12.1, "latency_ms": 51.2, "throughput": 19.5,
        "memory_mb": 128.0, "compression_ratio": 3.98, "quantization_bits": 8,
        "top1_accuracy": 0.9519,
    })
    w.end_run(status="completed", ended_at=_ts(180))
    w.emit_run_record()
    return s.last["payload"]


def run_int8_qat_rpi4() -> dict:
    """
    INT8 QAT on RPi4 — notable edge success.
    QAT recovers +0.001 accuracy vs PTQ and passes all gates.
    Tradeoff: +13ms latency vs PTQ due to activation quantization overhead.
    Best edge accuracy of any compressed run.
    """
    w, s = _writer("MobileNetV3-Small INT8 QAT — RPi4/TFLite")
    w.start_run(run_id="run-mv3-int8-qat-rpi4",
                name="MobileNetV3-Small INT8 QAT — RPi4/TFLite",
                created_at=_ts(200), started_at=_ts(201))
    w.set_notes(
        "INT8 quantization-aware training. QAT recovers 0.001 accuracy vs PTQ "
        "with identical model size. Latency is 13ms higher than PTQ due to "
        "activation quantisation fused into training ops. "
        "Best accuracy of all edge candidates — passes all gates."
    )
    w.set_tags({
        "domain": "vision", "task": "image_classification",
        "dataset": "capicu_vision_v2", "model": "mobilenetv3_small",
        "quantization": "int8", "compression_method": "qat",
        "environment": "edge", "device_class": "arm",
        "suite": "cross_platform_compression_v1",
    })
    w.set_target_profile(**_rpi4_profile("tflite"))
    w.set_lineage(baseline_run_id="run-mv3-fp32-h100",
                  parent_run_id="run-mv3-int8-ptq-rpi4-tflite")
    w.log_platform_fingerprint(
        runtime="tflite", hardware_backend="arm_cortex_a72",
        simd_flags=["neon", "dotprod"], framework_version="2.14.0",
    )
    w.log_parameter(key="dataset.name",        value="capicu_vision_v2")
    w.log_parameter(key="dataset.num_classes",  value=67)
    w.log_parameter(key="compression.method",   value="qat")
    w.log_parameter(key="compression.bits",     value=8)
    w.log_parameter(key="train.finetune_epochs", value=12)
    w.log_parameter(key="train.lr",             value=0.00004)
    w.log_parameter(key="train.warmup_steps",   value=500)

    loss_tr  = _wave(_decay(12, 0.31, 0.218, 0.31), 0.010)
    loss_val = _wave(_decay(12, 0.33, 0.229, 0.29), 0.008)
    acc_tr   = _wave(_sigmoid(12, 0.9619, 0.65, 5), 0.003)
    acc_val  = _wave(_sigmoid(12, 0.9531, 0.63, 5), 0.003)
    for step, (lt, lv, at, av) in enumerate(zip(loss_tr, loss_val, acc_tr, acc_val)):
        w.log_metric(name="train_loss",     value=round(lt, 6), step=step)
        w.log_metric(name="val_loss",       value=round(lv, 6), step=step)
        w.log_metric(name="train_accuracy", value=round(min(at, 0.9999), 6), step=step)
        w.log_metric(name="val_accuracy",   value=round(min(av, 0.9999), 6), step=step)

    n_cls = 67
    per_class = [
        {"label": str(i), "delta": round(0.00092 + i * 0.000027 + 0.00015 * math.sin(i * 1.2), 6)}
        for i in range(n_cls)
    ]
    w.log_eqc_assignment(
        eqc_id="EQC-A",
        reference_runtime="tensorrt", reference_hardware="cuda_hopper",
        output_delta_norm=0.002918, tolerance=0.01,
        per_class_delta=per_class,
    )
    w.log_accuracy_gate(metric_name="top1_accuracy", metric_value=0.9531,
                        threshold=0.92, direction="higher_is_better")
    w.log_contract_result({
        "pass": True, "run_id": "run-mv3-int8-qat-rpi4",
        "gate_results": [
            {"id": "accuracy_gate", "role": "quality",
             "metric": {"name": "top1_accuracy"}, "run_value": 0.9531, "pass": True,
             "explain": "0.9531 >= 0.92"},
            {"id": "eqc_delta_gate", "role": "quality",
             "metric": {"name": "output_delta_norm"}, "run_value": 0.002918, "pass": True,
             "explain": "0.002918 <= 0.01"},
            {"id": "latency_gate", "role": "performance",
             "metric": {"name": "latency_ms"}, "run_value": 61.4, "pass": True,
             "explain": "61.4ms <= 100ms"},
        ],
    })
    w.log_summary_metrics({
        "accuracy": 0.9531, "val_accuracy": 0.9531, "f1": 0.9477,
        "loss": 0.2291,
        "size_mb": 12.1, "latency_ms": 61.4, "throughput": 16.3,
        "memory_mb": 128.0, "compression_ratio": 3.98, "quantization_bits": 8,
        "top1_accuracy": 0.9531,
    })
    w.end_run(status="completed", ended_at=_ts(260))
    w.emit_run_record()
    return s.last["payload"]


def run_int4_ptq_rpi4() -> dict:
    """
    INT4 PTQ on RPi4 — aggressive compression, accuracy drops below gate threshold.
    The size and latency wins are real but the accuracy gate fails.
    Sets up the INT4 QAT run as the recovery story.
    """
    w, s = _writer("MobileNetV3-Small INT4 PTQ — RPi4/TFLite")
    w.start_run(run_id="run-mv3-int4-ptq-rpi4",
                name="MobileNetV3-Small INT4 PTQ — RPi4/TFLite",
                created_at=_ts(270), started_at=_ts(271))
    w.set_notes(
        "INT4 PTQ — 8× compression, 30ms latency, but accuracy drops to 0.9174 "
        "(threshold 0.92). The contract fails on accuracy. See INT4 QAT run for recovery."
    )
    w.set_tags({
        "domain": "vision", "task": "image_classification",
        "dataset": "capicu_vision_v2", "model": "mobilenetv3_small",
        "quantization": "int4", "compression_method": "ptq",
        "environment": "edge", "device_class": "arm",
        "suite": "cross_platform_compression_v1",
    })
    w.set_target_profile(**_rpi4_profile("tflite"))
    w.set_lineage(baseline_run_id="run-mv3-fp32-h100",
                  parent_run_id="run-mv3-int8-ptq-rpi4-tflite")
    w.log_platform_fingerprint(
        runtime="tflite", hardware_backend="arm_cortex_a72",
        simd_flags=["neon"], framework_version="2.14.0",
    )
    w.log_parameter(key="dataset.name",        value="capicu_vision_v2")
    w.log_parameter(key="dataset.num_classes",  value=67)
    w.log_parameter(key="compression.method",   value="ptq")
    w.log_parameter(key="compression.bits",     value=4)
    w.log_parameter(key="compression.calibration_samples", value=1024)

    w.log_accuracy_gate(metric_name="top1_accuracy", metric_value=0.9174,
                        threshold=0.92, direction="higher_is_better")
    w.log_contract_result({
        "pass": False, "run_id": "run-mv3-int4-ptq-rpi4",
        "gate_results": [
            {"id": "accuracy_gate", "role": "quality",
             "metric": {"name": "top1_accuracy"}, "run_value": 0.9174, "pass": False,
             "explain": "0.9174 < 0.92 — INT4 PTQ degrades accuracy below threshold"},
            {"id": "latency_gate", "role": "performance",
             "metric": {"name": "latency_ms"}, "run_value": 30.1, "pass": True,
             "explain": "30.1ms <= 100ms"},
        ],
    })
    # Single-step eval metrics (PTQ — no training loop)
    w.log_metric(name="accuracy",   value=0.9174, step=0)
    w.log_metric(name="val_accuracy", value=0.9174, step=0)
    w.log_metric(name="f1",         value=0.9089, step=0)
    w.log_metric(name="loss",       value=0.3814, step=0)
    w.log_metric(name="size_mb",    value=6.1,    step=0)
    w.log_metric(name="latency_ms", value=30.1,   step=0)
    w.log_summary_metrics({
        "accuracy": 0.9174, "val_accuracy": 0.9174, "f1": 0.9089,
        "loss": 0.3814,
        "size_mb": 6.1, "latency_ms": 30.1, "throughput": 33.2,
        "memory_mb": 64.0, "compression_ratio": 7.90, "quantization_bits": 4,
        "top1_accuracy": 0.9174,
    })
    w.end_run(status="completed", ended_at=_ts(284))
    w.emit_run_record()
    return s.last["payload"]


def run_int4_qat_rpi4() -> dict:
    """
    INT4 QAT on RPi4 — notable win: recovers accuracy above the gate threshold.
    The smallest model that qualifies. Researcher headline result.
    """
    w, s = _writer("MobileNetV3-Small INT4 QAT — RPi4/TFLite")
    w.start_run(run_id="run-mv3-int4-qat-rpi4",
                name="MobileNetV3-Small INT4 QAT — RPi4/TFLite",
                created_at=_ts(290), started_at=_ts(291))
    w.set_notes(
        "INT4 QAT recovers the accuracy lost in INT4 PTQ: 0.9284 vs 0.9174. "
        "Passes all gates. 6.1 MB, 33ms — the smallest qualifying model in this study. "
        "Recommended for memory-constrained edge deployments."
    )
    w.set_tags({
        "domain": "vision", "task": "image_classification",
        "dataset": "capicu_vision_v2", "model": "mobilenetv3_small",
        "quantization": "int4", "compression_method": "qat",
        "environment": "edge", "device_class": "arm",
        "suite": "cross_platform_compression_v1",
    })
    w.set_target_profile(**_rpi4_profile("tflite"))
    w.set_lineage(baseline_run_id="run-mv3-fp32-h100",
                  parent_run_id="run-mv3-int4-ptq-rpi4")
    w.log_platform_fingerprint(
        runtime="tflite", hardware_backend="arm_cortex_a72",
        simd_flags=["neon"], framework_version="2.14.0",
    )
    w.log_parameter(key="dataset.name",        value="capicu_vision_v2")
    w.log_parameter(key="dataset.num_classes",  value=67)
    w.log_parameter(key="compression.method",   value="qat")
    w.log_parameter(key="compression.bits",     value=4)
    w.log_parameter(key="train.finetune_epochs", value=20)
    w.log_parameter(key="train.lr",             value=0.00002)
    w.log_parameter(key="train.warmup_steps",   value=800)
    w.log_parameter(key="train.weight_decay",   value=0.01)

    loss_tr  = _wave(_decay(20, 0.51, 0.311, 0.22), 0.016)
    loss_val = _wave(_decay(20, 0.54, 0.328, 0.21), 0.011)
    acc_tr   = _wave(_sigmoid(20, 0.9381, 0.38, 9), 0.006)
    acc_val  = _wave(_sigmoid(20, 0.9284, 0.37, 9), 0.005)
    for step, (lt, lv, at, av) in enumerate(zip(loss_tr, loss_val, acc_tr, acc_val)):
        w.log_metric(name="train_loss",     value=round(lt, 6), step=step)
        w.log_metric(name="val_loss",       value=round(lv, 6), step=step)
        w.log_metric(name="train_accuracy", value=round(min(at, 0.9999), 6), step=step)
        w.log_metric(name="val_accuracy",   value=round(min(av, 0.9999), 6), step=step)

    w.log_eqc_assignment(
        eqc_id="EQC-A",
        reference_runtime="tensorrt", reference_hardware="cuda_hopper",
        output_delta_norm=0.00741, tolerance=0.01,
        per_class_delta=[
            {"label": str(i),
             "delta": round(0.0031 + i * 0.000048 + 0.0006 * math.sin(i * 1.2), 6)}
            for i in range(67)
        ],
    )
    w.log_accuracy_gate(metric_name="top1_accuracy", metric_value=0.9284,
                        threshold=0.92, direction="higher_is_better")
    w.log_contract_result({
        "pass": True, "run_id": "run-mv3-int4-qat-rpi4",
        "gate_results": [
            {"id": "accuracy_gate", "role": "quality",
             "metric": {"name": "top1_accuracy"}, "run_value": 0.9284, "pass": True,
             "explain": "0.9284 >= 0.92 — QAT recovered INT4 accuracy"},
            {"id": "eqc_delta_gate", "role": "quality",
             "metric": {"name": "output_delta_norm"}, "run_value": 0.00741, "pass": True,
             "explain": "0.00741 <= 0.01"},
            {"id": "latency_gate", "role": "performance",
             "metric": {"name": "latency_ms"}, "run_value": 33.4, "pass": True,
             "explain": "33.4ms <= 100ms"},
        ],
    })
    w.log_summary_metrics({
        "accuracy": 0.9284, "val_accuracy": 0.9284, "f1": 0.9201,
        "loss": 0.3281,
        "size_mb": 6.1, "latency_ms": 33.4, "throughput": 29.9,
        "memory_mb": 64.0, "compression_ratio": 7.90, "quantization_bits": 4,
        "top1_accuracy": 0.9284,
    })
    w.end_run(status="completed", ended_at=_ts(380))
    w.emit_run_record()
    return s.last["payload"]


def run_unstable_qat() -> dict:
    """
    Failed QAT run — training loss spikes to NaN at step 11.
    Bad data: lr too high, no warmup. Shows what a blown run looks like in CEMI.
    """
    w, s = _writer("MobileNetV3-Small INT8 QAT — Unstable (lr=0.01)")
    w.start_run(run_id="run-mv3-int8-qat-unstable",
                name="MobileNetV3-Small INT8 QAT — Unstable (lr=0.01)",
                created_at=_ts(400), started_at=_ts(401))
    w.set_notes(
        "FAILED. Learning rate 0.01 with no warmup caused gradient explosion "
        "at step 11. Loss went to NaN. Run terminated early. "
        "Bad data — do not use for comparison."
    )
    w.set_tags({
        "domain": "vision", "task": "image_classification",
        "dataset": "capicu_vision_v2", "model": "mobilenetv3_small",
        "quantization": "int8", "compression_method": "qat",
        "environment": "hpc", "device_class": "gpu",
        "suite": "cross_platform_compression_v1",
    })
    w.set_target_profile(**_h100_profile())
    w.log_parameter(key="compression.method",   value="qat")
    w.log_parameter(key="compression.bits",     value=8)
    w.log_parameter(key="train.lr",             value=0.01)   # too high
    w.log_parameter(key="train.warmup_steps",   value=0)      # no warmup

    # Loss looks ok for a few steps, then explodes
    stable_loss = _wave(_decay(8, 0.41, 0.31, 0.25), 0.012)
    for step, v in enumerate(stable_loss):
        w.log_metric(name="train_loss",     value=round(v, 6),          step=step)
        w.log_metric(name="train_accuracy", value=round(0.82 + step * 0.012, 6), step=step)
    # Step 8: loss spikes; step 9-11: NaN (represented as a very large number and then coded as -1)
    w.log_metric(name="train_loss", value=4.8812, step=8)
    w.log_metric(name="train_loss", value=18.441, step=9)
    w.log_metric(name="train_loss", value=312.17, step=10)
    # Step 11 — run terminates

    w.end_run(status="failed", ended_at=_ts(415))
    w.emit_run_record()
    return s.last["payload"]


def run_overfit_qat() -> dict:
    """
    Overfit QAT run — training accuracy looks good (0.9612) but val accuracy
    diverges after epoch 14 and ends at 0.9102. A 5-pt train/val gap.
    The summary metric shows val_accuracy 0.9102 which is below the gate.
    """
    w, s = _writer("MobileNetV3-Small INT8 QAT — Overfit (no weight decay)")
    w.start_run(run_id="run-mv3-int8-qat-overfit",
                name="MobileNetV3-Small INT8 QAT — Overfit (no weight decay)",
                created_at=_ts(420), started_at=_ts(421))
    w.set_notes(
        "QAT fine-tune without weight decay or dropout. Training accuracy reaches "
        "0.9612 but validation diverges at epoch 14 — final val_accuracy 0.9102. "
        "The train/val gap is visible in the chart. "
        "Fails accuracy gate. Add weight_decay=0.01 and revisit."
    )
    w.set_tags({
        "domain": "vision", "task": "image_classification",
        "dataset": "capicu_vision_v2", "model": "mobilenetv3_small",
        "quantization": "int8", "compression_method": "qat",
        "environment": "hpc", "device_class": "gpu",
        "suite": "cross_platform_compression_v1",
    })
    w.set_target_profile(**_h100_profile())
    w.log_parameter(key="compression.method",   value="qat")
    w.log_parameter(key="compression.bits",     value=8)
    w.log_parameter(key="train.finetune_epochs", value=25)
    w.log_parameter(key="train.lr",             value=0.0001)
    w.log_parameter(key="train.weight_decay",   value=0.0)  # culprit
    w.log_parameter(key="train.dropout",        value=0.0)  # culprit

    n = 25
    loss_tr  = _wave(_decay(n, 0.38, 0.178, 0.23), 0.010)
    acc_tr   = _wave(_sigmoid(n, 0.9612, 0.42, 10), 0.004)
    # Val: improves then diverges after step 14
    loss_val_base = _wave(_decay(n, 0.41, 0.248, 0.21), 0.009)
    loss_val = _diverge(loss_val_base, 0.014, 14)
    acc_val_base = _wave(_sigmoid(n, 0.9411, 0.39, 10), 0.004)
    acc_val  = [v - max(0, 0.008 * (i - 13)) for i, v in enumerate(acc_val_base)]
    for step, (lt, lv, at, av) in enumerate(zip(loss_tr, loss_val, acc_tr, acc_val)):
        w.log_metric(name="train_loss",     value=round(lt, 6), step=step)
        w.log_metric(name="val_loss",       value=round(lv, 6), step=step)
        w.log_metric(name="train_accuracy", value=round(min(at, 0.9999), 6), step=step)
        w.log_metric(name="val_accuracy",   value=round(max(min(av, 0.9999), 0.0), 6), step=step)

    w.log_accuracy_gate(metric_name="top1_accuracy", metric_value=0.9102,
                        threshold=0.92, direction="higher_is_better")
    w.log_contract_result({
        "pass": False, "run_id": "run-mv3-int8-qat-overfit",
        "gate_results": [
            {"id": "accuracy_gate", "role": "quality",
             "metric": {"name": "top1_accuracy"}, "run_value": 0.9102, "pass": False,
             "explain": "0.9102 < 0.92 — overfitting, train=0.9612 vs val=0.9102"},
        ],
    })
    w.log_summary_metrics({
        "accuracy": 0.9102, "val_accuracy": 0.9102, "f1": 0.9021,
        "train_accuracy": 0.9612,
        "loss": 0.178, "val_loss": 0.412,
        "size_mb": 12.1, "latency_ms": 1.2, "throughput": 8333.3,
        "memory_mb": 1024.0, "compression_ratio": 3.98, "quantization_bits": 8,
        "top1_accuracy": 0.9102,
    })
    w.end_run(status="completed", ended_at=_ts(520))
    w.emit_run_record()
    return s.last["payload"]


def run_drift_rpi4() -> dict:
    """
    Deployed INT8 model on RPi4 showing inference drift.
    Initial inference is nominal. Around sample 18 CUSUM starts rising.
    monitor_state = WARN. Researcher needs to requalify.
    """
    w, s = _writer("MobileNetV3-Small INT8 — RPi4 Runtime Qualification (drift detected)")
    w.start_run(run_id="run-mv3-int8-drift-rpi4",
                name="MobileNetV3-Small INT8 — RPi4 Runtime Qualification (drift detected)",
                created_at=_ts(530), started_at=_ts(531))
    w.set_notes(
        "RuntimeQualify run on deployed INT8 TFLite model. "
        "Inference loss is nominal for samples 0–17 then begins to rise. "
        "CUSUM threshold crossed at ~sample 22. monitor_state=WARN. "
        "Distribution shift suspected — new calibration data required."
    )
    w.set_tags({
        "domain": "vision", "task": "image_classification",
        "dataset": "capicu_vision_v2", "model": "mobilenetv3_small",
        "quantization": "int8", "compression_method": "ptq",
        "environment": "edge", "device_class": "arm",
        "suite": "cross_platform_compression_v1",
    })
    w.set_target_profile(**_rpi4_profile("tflite"))
    w.set_lineage(baseline_run_id="run-mv3-int8-ptq-rpi4-tflite")
    w.log_platform_fingerprint(
        runtime="tflite", hardware_backend="arm_cortex_a72",
        simd_flags=["neon", "dotprod"], framework_version="2.14.0",
    )
    w.log_parameter(key="compression.method", value="ptq")
    w.log_parameter(key="compression.bits",   value=8)

    n = 40
    # Nominal phase (0–17): loss around 0.248 with small ripple
    # Drift phase (18–39): loss trends upward
    for s_idx in range(n):
        if s_idx < 18:
            loss = 0.248 + 0.004 * math.sin(s_idx * 0.9 + 0.3)
        else:
            loss = 0.248 + 0.009 * (s_idx - 17) + 0.004 * math.sin(s_idx * 0.9 + 0.3)
        w.log_inference_event(loss_value=round(loss, 6), step=s_idx)

    # Single-step eval metrics so the RunsPage table has values to show
    w.log_metric(name="accuracy",   value=0.9521, step=0)
    w.log_metric(name="size_mb",    value=12.1,   step=0)
    w.log_metric(name="latency_ms", value=48.7,   step=0)
    w.log_summary_metrics({
        "accuracy": 0.9521, "top1_accuracy": 0.9521,
        "size_mb": 12.1, "latency_ms": 48.7, "throughput": 20.5,
        "compression_ratio": 3.98, "quantization_bits": 8,
    })
    # Manually set monitor_state (would normally be set by attached RuntimeMonitor)
    w._run["monitor_state"] = {
        "state": "WARN",
        "cusum_statistic": 0.06714,
        "adwin_window_mean": 0.29847,
        "adwin_window_size": 14,
        "n_samples": 40,
    }
    w.end_run(status="completed", ended_at=_ts(550))
    w.emit_run_record()
    # Promote monitor_state to payload level (writer puts it there on emit)
    payload = s.last["payload"]
    if "monitor_state" not in payload:
        payload["monitor_state"] = w._run["monitor_state"]
    return payload


# ---------------------------------------------------------------------------
# Assemble + write
# ---------------------------------------------------------------------------

NEW_PROJECT = {
    "id": PROJECT_ID,
    "name": "Cross-Platform MobileNetV3-Small Compression",
    "org_id": "org-001",
    "created_at": _ts(0),
}

BUILDERS = [
    run_fp32_h100,
    run_fp32_rpi4,
    run_fp16_h100,
    run_int8_ptq_rpi4_tflite,
    run_int8_ptq_rpi4_onnx,
    run_int8_qat_rpi4,
    run_int4_ptq_rpi4,
    run_int4_qat_rpi4,
    run_unstable_qat,
    run_overfit_qat,
    run_drift_rpi4,
]


def _patch_projects(mock_data_path: Path, new_project: dict) -> None:
    """Insert new_project into mockProjects in mockData.js if not already present."""
    src = mock_data_path.read_text(encoding="utf-8")
    if new_project["id"] in src:
        return  # already present

    entry = json.dumps(new_project, indent=2)
    # Indent each line by 2 spaces to match the array style
    indented = "\n".join("  " + line for line in entry.splitlines())
    # Insert before the closing bracket of mockProjects
    patched = src.replace(
        "];\n\n// Runs",
        f",\n{indented}\n];\n\n// Runs",
        1,
    )
    if patched == src:
        print(f"  WARNING: could not patch mockProjects in {mock_data_path}")
        return
    mock_data_path.write_text(patched, encoding="utf-8")
    print(f"  Patched {mock_data_path.name} — added project '{new_project['name']}'")


def main() -> None:
    repo = Path(__file__).parent.parent
    runs_path     = repo / "src" / "mockRunsData.js"
    mock_data_path = repo / "src" / "mockData.js"

    payloads = [b() for b in BUILDERS]

    runs_json = json.dumps(payloads, indent=2, ensure_ascii=True)
    js = f"""\
/*
  mockRunsData.js — AUTO-GENERATED by scripts/generate_mock_data.py
  DO NOT EDIT BY HAND. Re-run the script to regenerate.

  Project: Cross-Platform MobileNetV3-Small Compression
  Scenario: HPC (H100/TensorRT) vs Edge (RPi4/TFLite + ONNX Runtime)

  Run inventory:
    fp32-h100             FP32 reference — gold standard accuracy ceiling
    fp32-rpi4             FP32 on edge — obvious non-starter (1847ms latency)
    fp16-h100             FP16 HPC — best server speed/accuracy ratio  [PASS]
    int8-ptq-rpi4-tflite  INT8 PTQ TFLite — first real edge win         [PASS]
    int8-ptq-rpi4-onnx    INT8 PTQ ONNX — looks identical, hidden defect [FAIL EQC]
    int8-qat-rpi4         INT8 QAT edge — best edge accuracy             [PASS]
    int4-ptq-rpi4         INT4 PTQ — too aggressive, accuracy drops      [FAIL acc]
    int4-qat-rpi4         INT4 QAT — recovers, smallest qualifying model  [PASS]
    int8-qat-unstable     Failed run — loss exploded to NaN at step 11   [FAILED]
    int8-qat-overfit      Overfit — 5pt train/val gap, val below gate    [FAIL acc]
    int8-drift-rpi4       Runtime qualification — drift detected WARN    [deployed]

  Schema version: 2.2
*/

export const mockRunsData = {runs_json};
"""
    runs_path.write_text(js, encoding="utf-8")
    print(f"Wrote {len(payloads)} runs → {runs_path}")

    _patch_projects(mock_data_path, NEW_PROJECT)

    # Summary table
    print(f"\n{'Run ID':<48} {'status':<10} {'owner':<22} {'target':<18} {'verdict'}")
    print("-" * 130)
    for p in payloads:
        rid    = p.get("run_id", "?")
        status = p.get("status", "?")
        owner  = p.get("owner", "(none)")
        tgt    = p.get("target_profile", {}).get("name", "n/a").replace("MobileNetV3-Small ", "")
        cr     = p.get("contract_result")
        eqc    = p.get("eqc_assignment")
        ag     = p.get("accuracy_gate")
        if cr:
            verdict = "PASS" if cr.get("pass") else "FAIL"
        elif status == "failed":
            verdict = "FAILED"
        elif eqc and not eqc.get("delta_within_tolerance"):
            verdict = "FAIL (EQC)"
        else:
            verdict = "—"
        print(f"  {rid:<46} {status:<10} {owner:<22} {tgt:<18} {verdict}")


if __name__ == "__main__":
    main()
