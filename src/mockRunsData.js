/*
  Mock run data aligned to Capicú / CEMI compression engine reports.
  - Vision: MNIST PTQ (17-model registry) + QAT (6-model subset)
  - Time-series: Bosch CNC + UR3 CobotOps baseline evaluations
  NOTE: Shapes/fields match the existing UI mock schema.
*/

const rawRunsData = [
  {
    "id": "run-ic-ptq-resnet18-fp32",
    "project_id": "project-ic-mnist",
    "name": "resnet18 FP32 (PTQ Bench)",
    "status": "completed",
    "method": "baseline",
    "created_at": "2025-12-18T15:00:00Z",
    "started_at": "2025-12-18T15:01:00Z",
    "ended_at": "2025-12-18T15:08:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "FP32 baseline run for the PTQ benchmark suite (MNIST, 5% sample).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "resnet18",
      "quantization": "fp32",
      "compression_method": "baseline",
      "backend": "x86",
      "benchmark_suite": "PTQ_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9339,
      "f1": 0.9239,
      "loss": 0.2459,
      "size_mb": 44.7,
      "latency_ms": 23.4,
      "memory_mb": 1110,
      "throughput": 42.74,
      "params_million": 11.7,
      "compression_ratio": 1.0,
      "quantization_bits": 32,
      "device": "cpu"
    },
    "baseline_run_id": null,
    "parent_run_id": null,
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-ptq-resnet18-fp32-01",
        "run_id": "run-ic-ptq-resnet18-fp32",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet18-fp32-02",
        "run_id": "run-ic-ptq-resnet18-fp32",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-resnet18-fp32-03",
        "run_id": "run-ic-ptq-resnet18-fp32",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-resnet18-fp32-04",
        "run_id": "run-ic-ptq-resnet18-fp32",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-resnet18-fp32-05",
        "run_id": "run-ic-ptq-resnet18-fp32",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-resnet18-fp32-06",
        "run_id": "run-ic-ptq-resnet18-fp32",
        "key": "benchmark.num_epochs",
        "value": 25,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-resnet18-fp32-07",
        "run_id": "run-ic-ptq-resnet18-fp32",
        "key": "benchmark.model",
        "value": "resnet18",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet18-fp32-08",
        "run_id": "run-ic-ptq-resnet18-fp32",
        "key": "compression.quantization",
        "value": "fp32",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet18-fp32-09",
        "run_id": "run-ic-ptq-resnet18-fp32",
        "key": "compression.method",
        "value": "none",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet18-fp32-10",
        "run_id": "run-ic-ptq-resnet18-fp32",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet18-fp32-11",
        "run_id": "run-ic-ptq-resnet18-fp32",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-ptq-resnet18-fp32-12",
        "run_id": "run-ic-ptq-resnet18-fp32",
        "key": "benchmark.suite",
        "value": "PTQ_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet18-fp32-13",
        "run_id": "run-ic-ptq-resnet18-fp32",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet18-fp32-14",
        "run_id": "run-ic-ptq-resnet18-fp32",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-ptq-resnet18-int8",
    "project_id": "project-ic-mnist",
    "name": "resnet18 INT8 PTQ",
    "status": "completed",
    "method": "ptq",
    "created_at": "2025-12-18T15:02:00Z",
    "started_at": "2025-12-18T15:03:00Z",
    "ended_at": "2025-12-18T15:06:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "Post-training quantization to INT8 using the x86 backend (compare vs FP32 baseline).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "resnet18",
      "quantization": "int8",
      "compression_method": "ptq",
      "backend": "x86",
      "benchmark_suite": "PTQ_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9299,
      "f1": 0.9199,
      "loss": 0.2559,
      "size_mb": 22.3,
      "latency_ms": 13.3,
      "memory_mb": 865,
      "throughput": 75.19,
      "params_million": 11.7,
      "compression_ratio": 2.0,
      "quantization_bits": 8,
      "device": "cpu"
    },
    "baseline_run_id": "run-ic-ptq-resnet18-fp32",
    "parent_run_id": "run-ic-ptq-resnet18-fp32",
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "contract_result": {
      "pass": true,
      "run_id": "run-ic-ptq-resnet18-int8",
      "gate_results": [
        { "id": "accuracy_gate", "role": "quality", "metric": { "name": "accuracy" }, "run_value": 0.9299, "pass": true },
        { "id": "latency_gate", "role": "performance", "metric": { "name": "latency_ms" }, "run_value": 13.3, "pass": true }
      ]
    },
    "params": [
      {
        "id": "param-run-ic-ptq-resnet18-int8-01",
        "run_id": "run-ic-ptq-resnet18-int8",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet18-int8-02",
        "run_id": "run-ic-ptq-resnet18-int8",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-resnet18-int8-03",
        "run_id": "run-ic-ptq-resnet18-int8",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-resnet18-int8-04",
        "run_id": "run-ic-ptq-resnet18-int8",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-resnet18-int8-05",
        "run_id": "run-ic-ptq-resnet18-int8",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-resnet18-int8-06",
        "run_id": "run-ic-ptq-resnet18-int8",
        "key": "benchmark.num_epochs",
        "value": 25,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-resnet18-int8-07",
        "run_id": "run-ic-ptq-resnet18-int8",
        "key": "benchmark.model",
        "value": "resnet18",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet18-int8-08",
        "run_id": "run-ic-ptq-resnet18-int8",
        "key": "compression.quantization",
        "value": "int8",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet18-int8-09",
        "run_id": "run-ic-ptq-resnet18-int8",
        "key": "compression.method",
        "value": "ptq",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet18-int8-10",
        "run_id": "run-ic-ptq-resnet18-int8",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet18-int8-11",
        "run_id": "run-ic-ptq-resnet18-int8",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-ptq-resnet18-int8-12",
        "run_id": "run-ic-ptq-resnet18-int8",
        "key": "benchmark.suite",
        "value": "PTQ_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet18-int8-13",
        "run_id": "run-ic-ptq-resnet18-int8",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet18-int8-14",
        "run_id": "run-ic-ptq-resnet18-int8",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-ptq-resnet50-fp32",
    "project_id": "project-ic-mnist",
    "name": "resnet50 FP32 (PTQ Bench)",
    "status": "completed",
    "method": "baseline",
    "created_at": "2025-12-18T15:10:00Z",
    "started_at": "2025-12-18T15:11:00Z",
    "ended_at": "2025-12-18T15:18:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "FP32 baseline run for the PTQ benchmark suite (MNIST, 5% sample).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "resnet50",
      "quantization": "fp32",
      "compression_method": "baseline",
      "backend": "x86",
      "benchmark_suite": "PTQ_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9394,
      "f1": 0.9294,
      "loss": 0.2453,
      "size_mb": 97.49,
      "latency_ms": 207.0,
      "memory_mb": 1360,
      "throughput": 4.83,
      "params_million": 25.6,
      "compression_ratio": 1.0,
      "quantization_bits": 32,
      "device": "cpu"
    },
    "baseline_run_id": null,
    "parent_run_id": null,
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-ptq-resnet50-fp32-01",
        "run_id": "run-ic-ptq-resnet50-fp32",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet50-fp32-02",
        "run_id": "run-ic-ptq-resnet50-fp32",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-resnet50-fp32-03",
        "run_id": "run-ic-ptq-resnet50-fp32",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-resnet50-fp32-04",
        "run_id": "run-ic-ptq-resnet50-fp32",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-resnet50-fp32-05",
        "run_id": "run-ic-ptq-resnet50-fp32",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-resnet50-fp32-06",
        "run_id": "run-ic-ptq-resnet50-fp32",
        "key": "benchmark.num_epochs",
        "value": 25,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-resnet50-fp32-07",
        "run_id": "run-ic-ptq-resnet50-fp32",
        "key": "benchmark.model",
        "value": "resnet50",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet50-fp32-08",
        "run_id": "run-ic-ptq-resnet50-fp32",
        "key": "compression.quantization",
        "value": "fp32",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet50-fp32-09",
        "run_id": "run-ic-ptq-resnet50-fp32",
        "key": "compression.method",
        "value": "none",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet50-fp32-10",
        "run_id": "run-ic-ptq-resnet50-fp32",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet50-fp32-11",
        "run_id": "run-ic-ptq-resnet50-fp32",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-ptq-resnet50-fp32-12",
        "run_id": "run-ic-ptq-resnet50-fp32",
        "key": "benchmark.suite",
        "value": "PTQ_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet50-fp32-13",
        "run_id": "run-ic-ptq-resnet50-fp32",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet50-fp32-14",
        "run_id": "run-ic-ptq-resnet50-fp32",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-ptq-resnet50-int8",
    "project_id": "project-ic-mnist",
    "name": "resnet50 INT8 PTQ",
    "status": "completed",
    "method": "ptq",
    "created_at": "2025-12-18T15:12:00Z",
    "started_at": "2025-12-18T15:13:00Z",
    "ended_at": "2025-12-18T15:16:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "Post-training quantization to INT8 using the x86 backend (compare vs FP32 baseline).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "resnet50",
      "quantization": "int8",
      "compression_method": "ptq",
      "backend": "x86",
      "benchmark_suite": "PTQ_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9354,
      "f1": 0.9254,
      "loss": 0.2553,
      "size_mb": 24.86,
      "latency_ms": 101.0,
      "memory_mb": 1060,
      "throughput": 9.9,
      "params_million": 25.6,
      "compression_ratio": 3.92,
      "quantization_bits": 8,
      "device": "cpu"
    },
    "baseline_run_id": "run-ic-ptq-resnet50-fp32",
    "parent_run_id": "run-ic-ptq-resnet50-fp32",
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-ptq-resnet50-int8-01",
        "run_id": "run-ic-ptq-resnet50-int8",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet50-int8-02",
        "run_id": "run-ic-ptq-resnet50-int8",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-resnet50-int8-03",
        "run_id": "run-ic-ptq-resnet50-int8",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-resnet50-int8-04",
        "run_id": "run-ic-ptq-resnet50-int8",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-resnet50-int8-05",
        "run_id": "run-ic-ptq-resnet50-int8",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-resnet50-int8-06",
        "run_id": "run-ic-ptq-resnet50-int8",
        "key": "benchmark.num_epochs",
        "value": 25,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-resnet50-int8-07",
        "run_id": "run-ic-ptq-resnet50-int8",
        "key": "benchmark.model",
        "value": "resnet50",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet50-int8-08",
        "run_id": "run-ic-ptq-resnet50-int8",
        "key": "compression.quantization",
        "value": "int8",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet50-int8-09",
        "run_id": "run-ic-ptq-resnet50-int8",
        "key": "compression.method",
        "value": "ptq",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet50-int8-10",
        "run_id": "run-ic-ptq-resnet50-int8",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet50-int8-11",
        "run_id": "run-ic-ptq-resnet50-int8",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-ptq-resnet50-int8-12",
        "run_id": "run-ic-ptq-resnet50-int8",
        "key": "benchmark.suite",
        "value": "PTQ_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet50-int8-13",
        "run_id": "run-ic-ptq-resnet50-int8",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet50-int8-14",
        "run_id": "run-ic-ptq-resnet50-int8",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-ptq-resnet101-fp32",
    "project_id": "project-ic-mnist",
    "name": "resnet101 FP32 (PTQ Bench)",
    "status": "completed",
    "method": "baseline",
    "created_at": "2025-12-18T15:20:00Z",
    "started_at": "2025-12-18T15:21:00Z",
    "ended_at": "2025-12-18T15:28:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "FP32 baseline run for the PTQ benchmark suite (MNIST, 5% sample).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "resnet101",
      "quantization": "fp32",
      "compression_method": "baseline",
      "backend": "x86",
      "benchmark_suite": "PTQ_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9428,
      "f1": 0.9328,
      "loss": 0.2449,
      "size_mb": 170.02,
      "latency_ms": 381.0,
      "memory_mb": 1701,
      "throughput": 2.62,
      "params_million": 44.5,
      "compression_ratio": 1.0,
      "quantization_bits": 32,
      "device": "cpu"
    },
    "baseline_run_id": null,
    "parent_run_id": null,
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-ptq-resnet101-fp32-01",
        "run_id": "run-ic-ptq-resnet101-fp32",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet101-fp32-02",
        "run_id": "run-ic-ptq-resnet101-fp32",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-resnet101-fp32-03",
        "run_id": "run-ic-ptq-resnet101-fp32",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-resnet101-fp32-04",
        "run_id": "run-ic-ptq-resnet101-fp32",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-resnet101-fp32-05",
        "run_id": "run-ic-ptq-resnet101-fp32",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-resnet101-fp32-06",
        "run_id": "run-ic-ptq-resnet101-fp32",
        "key": "benchmark.num_epochs",
        "value": 25,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-resnet101-fp32-07",
        "run_id": "run-ic-ptq-resnet101-fp32",
        "key": "benchmark.model",
        "value": "resnet101",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet101-fp32-08",
        "run_id": "run-ic-ptq-resnet101-fp32",
        "key": "compression.quantization",
        "value": "fp32",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet101-fp32-09",
        "run_id": "run-ic-ptq-resnet101-fp32",
        "key": "compression.method",
        "value": "none",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet101-fp32-10",
        "run_id": "run-ic-ptq-resnet101-fp32",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet101-fp32-11",
        "run_id": "run-ic-ptq-resnet101-fp32",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-ptq-resnet101-fp32-12",
        "run_id": "run-ic-ptq-resnet101-fp32",
        "key": "benchmark.suite",
        "value": "PTQ_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet101-fp32-13",
        "run_id": "run-ic-ptq-resnet101-fp32",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet101-fp32-14",
        "run_id": "run-ic-ptq-resnet101-fp32",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-ptq-resnet101-int8",
    "project_id": "project-ic-mnist",
    "name": "resnet101 INT8 PTQ",
    "status": "completed",
    "method": "ptq",
    "created_at": "2025-12-18T15:22:00Z",
    "started_at": "2025-12-18T15:23:00Z",
    "ended_at": "2025-12-18T15:26:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "Post-training quantization to INT8 using the x86 backend (compare vs FP32 baseline).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "resnet101",
      "quantization": "int8",
      "compression_method": "ptq",
      "backend": "x86",
      "benchmark_suite": "PTQ_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9388,
      "f1": 0.9288,
      "loss": 0.2549,
      "size_mb": 43.4,
      "latency_ms": 166.0,
      "memory_mb": 1326,
      "throughput": 6.02,
      "params_million": 44.5,
      "compression_ratio": 3.92,
      "quantization_bits": 8,
      "device": "cpu"
    },
    "baseline_run_id": "run-ic-ptq-resnet101-fp32",
    "parent_run_id": "run-ic-ptq-resnet101-fp32",
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-ptq-resnet101-int8-01",
        "run_id": "run-ic-ptq-resnet101-int8",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet101-int8-02",
        "run_id": "run-ic-ptq-resnet101-int8",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-resnet101-int8-03",
        "run_id": "run-ic-ptq-resnet101-int8",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-resnet101-int8-04",
        "run_id": "run-ic-ptq-resnet101-int8",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-resnet101-int8-05",
        "run_id": "run-ic-ptq-resnet101-int8",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-resnet101-int8-06",
        "run_id": "run-ic-ptq-resnet101-int8",
        "key": "benchmark.num_epochs",
        "value": 25,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-resnet101-int8-07",
        "run_id": "run-ic-ptq-resnet101-int8",
        "key": "benchmark.model",
        "value": "resnet101",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet101-int8-08",
        "run_id": "run-ic-ptq-resnet101-int8",
        "key": "compression.quantization",
        "value": "int8",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet101-int8-09",
        "run_id": "run-ic-ptq-resnet101-int8",
        "key": "compression.method",
        "value": "ptq",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet101-int8-10",
        "run_id": "run-ic-ptq-resnet101-int8",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet101-int8-11",
        "run_id": "run-ic-ptq-resnet101-int8",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-ptq-resnet101-int8-12",
        "run_id": "run-ic-ptq-resnet101-int8",
        "key": "benchmark.suite",
        "value": "PTQ_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet101-int8-13",
        "run_id": "run-ic-ptq-resnet101-int8",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-resnet101-int8-14",
        "run_id": "run-ic-ptq-resnet101-int8",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-ptq-vgg16-fp32",
    "project_id": "project-ic-mnist",
    "name": "vgg16 FP32 (PTQ Bench)",
    "status": "completed",
    "method": "baseline",
    "created_at": "2025-12-18T15:30:00Z",
    "started_at": "2025-12-18T15:31:00Z",
    "ended_at": "2025-12-18T15:38:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "FP32 baseline run for the PTQ benchmark suite (MNIST, 5% sample).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "vgg16",
      "quantization": "fp32",
      "compression_method": "baseline",
      "backend": "x86",
      "benchmark_suite": "PTQ_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.945,
      "f1": 0.935,
      "loss": 0.2446,
      "size_mb": 528.0,
      "latency_ms": 49.4,
      "memory_mb": 3391,
      "throughput": 20.24,
      "params_million": 138.4,
      "compression_ratio": 1.0,
      "quantization_bits": 32,
      "device": "cpu"
    },
    "baseline_run_id": null,
    "parent_run_id": null,
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-ptq-vgg16-fp32-01",
        "run_id": "run-ic-ptq-vgg16-fp32",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-vgg16-fp32-02",
        "run_id": "run-ic-ptq-vgg16-fp32",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-vgg16-fp32-03",
        "run_id": "run-ic-ptq-vgg16-fp32",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-vgg16-fp32-04",
        "run_id": "run-ic-ptq-vgg16-fp32",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-vgg16-fp32-05",
        "run_id": "run-ic-ptq-vgg16-fp32",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-vgg16-fp32-06",
        "run_id": "run-ic-ptq-vgg16-fp32",
        "key": "benchmark.num_epochs",
        "value": 25,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-vgg16-fp32-07",
        "run_id": "run-ic-ptq-vgg16-fp32",
        "key": "benchmark.model",
        "value": "vgg16",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-vgg16-fp32-08",
        "run_id": "run-ic-ptq-vgg16-fp32",
        "key": "compression.quantization",
        "value": "fp32",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-vgg16-fp32-09",
        "run_id": "run-ic-ptq-vgg16-fp32",
        "key": "compression.method",
        "value": "none",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-vgg16-fp32-10",
        "run_id": "run-ic-ptq-vgg16-fp32",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-vgg16-fp32-11",
        "run_id": "run-ic-ptq-vgg16-fp32",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-ptq-vgg16-fp32-12",
        "run_id": "run-ic-ptq-vgg16-fp32",
        "key": "benchmark.suite",
        "value": "PTQ_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-vgg16-fp32-13",
        "run_id": "run-ic-ptq-vgg16-fp32",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-vgg16-fp32-14",
        "run_id": "run-ic-ptq-vgg16-fp32",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-ptq-vgg16-int8",
    "project_id": "project-ic-mnist",
    "name": "vgg16 INT8 PTQ",
    "status": "completed",
    "method": "ptq",
    "created_at": "2025-12-18T15:32:00Z",
    "started_at": "2025-12-18T15:33:00Z",
    "ended_at": "2025-12-18T15:36:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "Post-training quantization to INT8 using the x86 backend (compare vs FP32 baseline).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "vgg16",
      "quantization": "int8",
      "compression_method": "ptq",
      "backend": "x86",
      "benchmark_suite": "PTQ_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.941,
      "f1": 0.931,
      "loss": 0.2546,
      "size_mb": 132.0,
      "latency_ms": 35.9,
      "memory_mb": 2644,
      "throughput": 27.86,
      "params_million": 138.4,
      "compression_ratio": 4.0,
      "quantization_bits": 8,
      "device": "cpu"
    },
    "baseline_run_id": "run-ic-ptq-vgg16-fp32",
    "parent_run_id": "run-ic-ptq-vgg16-fp32",
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-ptq-vgg16-int8-01",
        "run_id": "run-ic-ptq-vgg16-int8",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-vgg16-int8-02",
        "run_id": "run-ic-ptq-vgg16-int8",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-vgg16-int8-03",
        "run_id": "run-ic-ptq-vgg16-int8",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-vgg16-int8-04",
        "run_id": "run-ic-ptq-vgg16-int8",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-vgg16-int8-05",
        "run_id": "run-ic-ptq-vgg16-int8",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-vgg16-int8-06",
        "run_id": "run-ic-ptq-vgg16-int8",
        "key": "benchmark.num_epochs",
        "value": 25,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-vgg16-int8-07",
        "run_id": "run-ic-ptq-vgg16-int8",
        "key": "benchmark.model",
        "value": "vgg16",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-vgg16-int8-08",
        "run_id": "run-ic-ptq-vgg16-int8",
        "key": "compression.quantization",
        "value": "int8",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-vgg16-int8-09",
        "run_id": "run-ic-ptq-vgg16-int8",
        "key": "compression.method",
        "value": "ptq",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-vgg16-int8-10",
        "run_id": "run-ic-ptq-vgg16-int8",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-vgg16-int8-11",
        "run_id": "run-ic-ptq-vgg16-int8",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-ptq-vgg16-int8-12",
        "run_id": "run-ic-ptq-vgg16-int8",
        "key": "benchmark.suite",
        "value": "PTQ_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-vgg16-int8-13",
        "run_id": "run-ic-ptq-vgg16-int8",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-vgg16-int8-14",
        "run_id": "run-ic-ptq-vgg16-int8",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-ptq-alexnet-fp32",
    "project_id": "project-ic-mnist",
    "name": "alexnet FP32 (PTQ Bench)",
    "status": "completed",
    "method": "baseline",
    "created_at": "2025-12-18T15:40:00Z",
    "started_at": "2025-12-18T15:41:00Z",
    "ended_at": "2025-12-18T15:48:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "FP32 baseline run for the PTQ benchmark suite (MNIST, 5% sample).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "alexnet",
      "quantization": "fp32",
      "compression_method": "baseline",
      "backend": "x86",
      "benchmark_suite": "PTQ_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9441,
      "f1": 0.9341,
      "loss": 0.2447,
      "size_mb": 233.0,
      "latency_ms": 11.5,
      "memory_mb": 1998,
      "throughput": 86.96,
      "params_million": 61.0,
      "compression_ratio": 1.0,
      "quantization_bits": 32,
      "device": "cpu"
    },
    "baseline_run_id": null,
    "parent_run_id": null,
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-ptq-alexnet-fp32-01",
        "run_id": "run-ic-ptq-alexnet-fp32",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-alexnet-fp32-02",
        "run_id": "run-ic-ptq-alexnet-fp32",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-alexnet-fp32-03",
        "run_id": "run-ic-ptq-alexnet-fp32",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-alexnet-fp32-04",
        "run_id": "run-ic-ptq-alexnet-fp32",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-alexnet-fp32-05",
        "run_id": "run-ic-ptq-alexnet-fp32",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-alexnet-fp32-06",
        "run_id": "run-ic-ptq-alexnet-fp32",
        "key": "benchmark.num_epochs",
        "value": 25,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-alexnet-fp32-07",
        "run_id": "run-ic-ptq-alexnet-fp32",
        "key": "benchmark.model",
        "value": "alexnet",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-alexnet-fp32-08",
        "run_id": "run-ic-ptq-alexnet-fp32",
        "key": "compression.quantization",
        "value": "fp32",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-alexnet-fp32-09",
        "run_id": "run-ic-ptq-alexnet-fp32",
        "key": "compression.method",
        "value": "none",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-alexnet-fp32-10",
        "run_id": "run-ic-ptq-alexnet-fp32",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-alexnet-fp32-11",
        "run_id": "run-ic-ptq-alexnet-fp32",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-ptq-alexnet-fp32-12",
        "run_id": "run-ic-ptq-alexnet-fp32",
        "key": "benchmark.suite",
        "value": "PTQ_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-alexnet-fp32-13",
        "run_id": "run-ic-ptq-alexnet-fp32",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-alexnet-fp32-14",
        "run_id": "run-ic-ptq-alexnet-fp32",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-ptq-alexnet-int8",
    "project_id": "project-ic-mnist",
    "name": "alexnet INT8 PTQ",
    "status": "completed",
    "method": "ptq",
    "created_at": "2025-12-18T15:42:00Z",
    "started_at": "2025-12-18T15:43:00Z",
    "ended_at": "2025-12-18T15:46:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "Post-training quantization to INT8 using the x86 backend (compare vs FP32 baseline).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "alexnet",
      "quantization": "int8",
      "compression_method": "ptq",
      "backend": "x86",
      "benchmark_suite": "PTQ_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9401,
      "f1": 0.9301,
      "loss": 0.2547,
      "size_mb": 58.5,
      "latency_ms": 10.8,
      "memory_mb": 1558,
      "throughput": 92.59,
      "params_million": 61.0,
      "compression_ratio": 3.98,
      "quantization_bits": 8,
      "device": "cpu"
    },
    "baseline_run_id": "run-ic-ptq-alexnet-fp32",
    "parent_run_id": "run-ic-ptq-alexnet-fp32",
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-ptq-alexnet-int8-01",
        "run_id": "run-ic-ptq-alexnet-int8",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-alexnet-int8-02",
        "run_id": "run-ic-ptq-alexnet-int8",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-alexnet-int8-03",
        "run_id": "run-ic-ptq-alexnet-int8",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-alexnet-int8-04",
        "run_id": "run-ic-ptq-alexnet-int8",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-alexnet-int8-05",
        "run_id": "run-ic-ptq-alexnet-int8",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-alexnet-int8-06",
        "run_id": "run-ic-ptq-alexnet-int8",
        "key": "benchmark.num_epochs",
        "value": 25,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-alexnet-int8-07",
        "run_id": "run-ic-ptq-alexnet-int8",
        "key": "benchmark.model",
        "value": "alexnet",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-alexnet-int8-08",
        "run_id": "run-ic-ptq-alexnet-int8",
        "key": "compression.quantization",
        "value": "int8",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-alexnet-int8-09",
        "run_id": "run-ic-ptq-alexnet-int8",
        "key": "compression.method",
        "value": "ptq",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-alexnet-int8-10",
        "run_id": "run-ic-ptq-alexnet-int8",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-alexnet-int8-11",
        "run_id": "run-ic-ptq-alexnet-int8",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-ptq-alexnet-int8-12",
        "run_id": "run-ic-ptq-alexnet-int8",
        "key": "benchmark.suite",
        "value": "PTQ_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-alexnet-int8-13",
        "run_id": "run-ic-ptq-alexnet-int8",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-alexnet-int8-14",
        "run_id": "run-ic-ptq-alexnet-int8",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-ptq-mobilenetv2-fp32",
    "project_id": "project-ic-mnist",
    "name": "mobilenetv2 FP32 (PTQ Bench)",
    "status": "completed",
    "method": "baseline",
    "created_at": "2025-12-18T15:50:00Z",
    "started_at": "2025-12-18T15:51:00Z",
    "ended_at": "2025-12-18T15:58:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "FP32 baseline run for the PTQ benchmark suite (MNIST, 5% sample).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "mobilenetv2",
      "quantization": "fp32",
      "compression_method": "baseline",
      "backend": "x86",
      "benchmark_suite": "PTQ_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9282,
      "f1": 0.9182,
      "loss": 0.2466,
      "size_mb": 13.64,
      "latency_ms": 23.8,
      "memory_mb": 963,
      "throughput": 42.02,
      "params_million": 3.5,
      "compression_ratio": 1.0,
      "quantization_bits": 32,
      "device": "cpu"
    },
    "baseline_run_id": null,
    "parent_run_id": null,
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-ptq-mobilenetv2-fp32-01",
        "run_id": "run-ic-ptq-mobilenetv2-fp32",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-mobilenetv2-fp32-02",
        "run_id": "run-ic-ptq-mobilenetv2-fp32",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-mobilenetv2-fp32-03",
        "run_id": "run-ic-ptq-mobilenetv2-fp32",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-mobilenetv2-fp32-04",
        "run_id": "run-ic-ptq-mobilenetv2-fp32",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-mobilenetv2-fp32-05",
        "run_id": "run-ic-ptq-mobilenetv2-fp32",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-mobilenetv2-fp32-06",
        "run_id": "run-ic-ptq-mobilenetv2-fp32",
        "key": "benchmark.num_epochs",
        "value": 25,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-mobilenetv2-fp32-07",
        "run_id": "run-ic-ptq-mobilenetv2-fp32",
        "key": "benchmark.model",
        "value": "mobilenetv2",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-mobilenetv2-fp32-08",
        "run_id": "run-ic-ptq-mobilenetv2-fp32",
        "key": "compression.quantization",
        "value": "fp32",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-mobilenetv2-fp32-09",
        "run_id": "run-ic-ptq-mobilenetv2-fp32",
        "key": "compression.method",
        "value": "none",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-mobilenetv2-fp32-10",
        "run_id": "run-ic-ptq-mobilenetv2-fp32",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-mobilenetv2-fp32-11",
        "run_id": "run-ic-ptq-mobilenetv2-fp32",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-ptq-mobilenetv2-fp32-12",
        "run_id": "run-ic-ptq-mobilenetv2-fp32",
        "key": "benchmark.suite",
        "value": "PTQ_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-mobilenetv2-fp32-13",
        "run_id": "run-ic-ptq-mobilenetv2-fp32",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-mobilenetv2-fp32-14",
        "run_id": "run-ic-ptq-mobilenetv2-fp32",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-ptq-mobilenetv2-int8",
    "project_id": "project-ic-mnist",
    "name": "mobilenetv2 INT8 PTQ",
    "status": "completed",
    "method": "ptq",
    "created_at": "2025-12-18T15:52:00Z",
    "started_at": "2025-12-18T15:53:00Z",
    "ended_at": "2025-12-18T15:56:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "Post-training quantization to INT8 using the x86 backend (compare vs FP32 baseline).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "mobilenetv2",
      "quantization": "int8",
      "compression_method": "ptq",
      "backend": "x86",
      "benchmark_suite": "PTQ_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9242,
      "f1": 0.9142,
      "loss": 0.2566,
      "size_mb": 3.92,
      "latency_ms": 15.1,
      "memory_mb": 751,
      "throughput": 66.23,
      "params_million": 3.5,
      "compression_ratio": 3.48,
      "quantization_bits": 8,
      "device": "cpu"
    },
    "baseline_run_id": "run-ic-ptq-mobilenetv2-fp32",
    "parent_run_id": "run-ic-ptq-mobilenetv2-fp32",
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "contract_result": {
      "pass": false,
      "run_id": "run-ic-ptq-mobilenetv2-int8",
      "gate_results": [
        { "id": "accuracy_gate", "role": "quality", "metric": { "name": "accuracy" }, "run_value": 0.9242, "pass": false, "explain": "value 0.9242 < min 0.93" },
        { "id": "latency_gate", "role": "performance", "metric": { "name": "latency_ms" }, "run_value": 15.1, "pass": true }
      ]
    },
    "params": [
      {
        "id": "param-run-ic-ptq-mobilenetv2-int8-01",
        "run_id": "run-ic-ptq-mobilenetv2-int8",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-mobilenetv2-int8-02",
        "run_id": "run-ic-ptq-mobilenetv2-int8",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-mobilenetv2-int8-03",
        "run_id": "run-ic-ptq-mobilenetv2-int8",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-mobilenetv2-int8-04",
        "run_id": "run-ic-ptq-mobilenetv2-int8",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-mobilenetv2-int8-05",
        "run_id": "run-ic-ptq-mobilenetv2-int8",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-mobilenetv2-int8-06",
        "run_id": "run-ic-ptq-mobilenetv2-int8",
        "key": "benchmark.num_epochs",
        "value": 25,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-mobilenetv2-int8-07",
        "run_id": "run-ic-ptq-mobilenetv2-int8",
        "key": "benchmark.model",
        "value": "mobilenetv2",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-mobilenetv2-int8-08",
        "run_id": "run-ic-ptq-mobilenetv2-int8",
        "key": "compression.quantization",
        "value": "int8",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-mobilenetv2-int8-09",
        "run_id": "run-ic-ptq-mobilenetv2-int8",
        "key": "compression.method",
        "value": "ptq",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-mobilenetv2-int8-10",
        "run_id": "run-ic-ptq-mobilenetv2-int8",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-mobilenetv2-int8-11",
        "run_id": "run-ic-ptq-mobilenetv2-int8",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-ptq-mobilenetv2-int8-12",
        "run_id": "run-ic-ptq-mobilenetv2-int8",
        "key": "benchmark.suite",
        "value": "PTQ_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-mobilenetv2-int8-13",
        "run_id": "run-ic-ptq-mobilenetv2-int8",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-mobilenetv2-int8-14",
        "run_id": "run-ic-ptq-mobilenetv2-int8",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-ptq-efficientnet-b0-fp32",
    "project_id": "project-ic-mnist",
    "name": "efficientnet-b0 FP32 (PTQ Bench)",
    "status": "completed",
    "method": "baseline",
    "created_at": "2025-12-18T16:00:00Z",
    "started_at": "2025-12-18T16:01:00Z",
    "ended_at": "2025-12-18T16:08:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "FP32 baseline run for the PTQ benchmark suite (MNIST, 5% sample).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "efficientnet-b0",
      "quantization": "fp32",
      "compression_method": "baseline",
      "backend": "x86",
      "benchmark_suite": "PTQ_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9297,
      "f1": 0.9197,
      "loss": 0.2464,
      "size_mb": 20.22,
      "latency_ms": 18.5,
      "memory_mb": 995,
      "throughput": 54.05,
      "params_million": 5.3,
      "compression_ratio": 1.0,
      "quantization_bits": 32,
      "device": "cpu"
    },
    "baseline_run_id": null,
    "parent_run_id": null,
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-ptq-efficientnet-b0-fp32-01",
        "run_id": "run-ic-ptq-efficientnet-b0-fp32",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-efficientnet-b0-fp32-02",
        "run_id": "run-ic-ptq-efficientnet-b0-fp32",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-efficientnet-b0-fp32-03",
        "run_id": "run-ic-ptq-efficientnet-b0-fp32",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-efficientnet-b0-fp32-04",
        "run_id": "run-ic-ptq-efficientnet-b0-fp32",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-efficientnet-b0-fp32-05",
        "run_id": "run-ic-ptq-efficientnet-b0-fp32",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-efficientnet-b0-fp32-06",
        "run_id": "run-ic-ptq-efficientnet-b0-fp32",
        "key": "benchmark.num_epochs",
        "value": 25,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-efficientnet-b0-fp32-07",
        "run_id": "run-ic-ptq-efficientnet-b0-fp32",
        "key": "benchmark.model",
        "value": "efficientnet-b0",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-efficientnet-b0-fp32-08",
        "run_id": "run-ic-ptq-efficientnet-b0-fp32",
        "key": "compression.quantization",
        "value": "fp32",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-efficientnet-b0-fp32-09",
        "run_id": "run-ic-ptq-efficientnet-b0-fp32",
        "key": "compression.method",
        "value": "none",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-efficientnet-b0-fp32-10",
        "run_id": "run-ic-ptq-efficientnet-b0-fp32",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-efficientnet-b0-fp32-11",
        "run_id": "run-ic-ptq-efficientnet-b0-fp32",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-ptq-efficientnet-b0-fp32-12",
        "run_id": "run-ic-ptq-efficientnet-b0-fp32",
        "key": "benchmark.suite",
        "value": "PTQ_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-efficientnet-b0-fp32-13",
        "run_id": "run-ic-ptq-efficientnet-b0-fp32",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-efficientnet-b0-fp32-14",
        "run_id": "run-ic-ptq-efficientnet-b0-fp32",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-ptq-efficientnet-b0-int8",
    "project_id": "project-ic-mnist",
    "name": "efficientnet-b0 INT8 PTQ",
    "status": "completed",
    "method": "ptq",
    "created_at": "2025-12-18T16:02:00Z",
    "started_at": "2025-12-18T16:03:00Z",
    "ended_at": "2025-12-18T16:06:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "Post-training quantization to INT8 using the x86 backend (compare vs FP32 baseline).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "efficientnet-b0",
      "quantization": "int8",
      "compression_method": "ptq",
      "backend": "x86",
      "benchmark_suite": "PTQ_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9257,
      "f1": 0.9157,
      "loss": 0.2564,
      "size_mb": 6.47,
      "latency_ms": 14.8,
      "memory_mb": 776,
      "throughput": 67.57,
      "params_million": 5.3,
      "compression_ratio": 3.13,
      "quantization_bits": 8,
      "device": "cpu"
    },
    "baseline_run_id": "run-ic-ptq-efficientnet-b0-fp32",
    "parent_run_id": "run-ic-ptq-efficientnet-b0-fp32",
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-ptq-efficientnet-b0-int8-01",
        "run_id": "run-ic-ptq-efficientnet-b0-int8",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-efficientnet-b0-int8-02",
        "run_id": "run-ic-ptq-efficientnet-b0-int8",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-efficientnet-b0-int8-03",
        "run_id": "run-ic-ptq-efficientnet-b0-int8",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-efficientnet-b0-int8-04",
        "run_id": "run-ic-ptq-efficientnet-b0-int8",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-efficientnet-b0-int8-05",
        "run_id": "run-ic-ptq-efficientnet-b0-int8",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-efficientnet-b0-int8-06",
        "run_id": "run-ic-ptq-efficientnet-b0-int8",
        "key": "benchmark.num_epochs",
        "value": 25,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-efficientnet-b0-int8-07",
        "run_id": "run-ic-ptq-efficientnet-b0-int8",
        "key": "benchmark.model",
        "value": "efficientnet-b0",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-efficientnet-b0-int8-08",
        "run_id": "run-ic-ptq-efficientnet-b0-int8",
        "key": "compression.quantization",
        "value": "int8",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-efficientnet-b0-int8-09",
        "run_id": "run-ic-ptq-efficientnet-b0-int8",
        "key": "compression.method",
        "value": "ptq",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-efficientnet-b0-int8-10",
        "run_id": "run-ic-ptq-efficientnet-b0-int8",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-efficientnet-b0-int8-11",
        "run_id": "run-ic-ptq-efficientnet-b0-int8",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-ptq-efficientnet-b0-int8-12",
        "run_id": "run-ic-ptq-efficientnet-b0-int8",
        "key": "benchmark.suite",
        "value": "PTQ_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-efficientnet-b0-int8-13",
        "run_id": "run-ic-ptq-efficientnet-b0-int8",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-efficientnet-b0-int8-14",
        "run_id": "run-ic-ptq-efficientnet-b0-int8",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-ptq-densenet121-fp32",
    "project_id": "project-ic-mnist",
    "name": "densenet121 FP32 (PTQ Bench)",
    "status": "completed",
    "method": "baseline",
    "created_at": "2025-12-18T16:10:00Z",
    "started_at": "2025-12-18T16:11:00Z",
    "ended_at": "2025-12-18T16:18:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "FP32 baseline run for the PTQ benchmark suite (MNIST, 5% sample).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "densenet121",
      "quantization": "fp32",
      "compression_method": "baseline",
      "backend": "x86",
      "benchmark_suite": "PTQ_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9316,
      "f1": 0.9216,
      "loss": 0.2462,
      "size_mb": 30.52,
      "latency_ms": 42.0,
      "memory_mb": 1044,
      "throughput": 23.81,
      "params_million": 8.0,
      "compression_ratio": 1.0,
      "quantization_bits": 32,
      "device": "cpu"
    },
    "baseline_run_id": null,
    "parent_run_id": null,
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-ptq-densenet121-fp32-01",
        "run_id": "run-ic-ptq-densenet121-fp32",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-densenet121-fp32-02",
        "run_id": "run-ic-ptq-densenet121-fp32",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-densenet121-fp32-03",
        "run_id": "run-ic-ptq-densenet121-fp32",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-densenet121-fp32-04",
        "run_id": "run-ic-ptq-densenet121-fp32",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-densenet121-fp32-05",
        "run_id": "run-ic-ptq-densenet121-fp32",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-densenet121-fp32-06",
        "run_id": "run-ic-ptq-densenet121-fp32",
        "key": "benchmark.num_epochs",
        "value": 25,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-densenet121-fp32-07",
        "run_id": "run-ic-ptq-densenet121-fp32",
        "key": "benchmark.model",
        "value": "densenet121",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-densenet121-fp32-08",
        "run_id": "run-ic-ptq-densenet121-fp32",
        "key": "compression.quantization",
        "value": "fp32",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-densenet121-fp32-09",
        "run_id": "run-ic-ptq-densenet121-fp32",
        "key": "compression.method",
        "value": "none",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-densenet121-fp32-10",
        "run_id": "run-ic-ptq-densenet121-fp32",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-densenet121-fp32-11",
        "run_id": "run-ic-ptq-densenet121-fp32",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-ptq-densenet121-fp32-12",
        "run_id": "run-ic-ptq-densenet121-fp32",
        "key": "benchmark.suite",
        "value": "PTQ_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-densenet121-fp32-13",
        "run_id": "run-ic-ptq-densenet121-fp32",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-densenet121-fp32-14",
        "run_id": "run-ic-ptq-densenet121-fp32",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-ptq-densenet121-int8",
    "project_id": "project-ic-mnist",
    "name": "densenet121 INT8 PTQ",
    "status": "completed",
    "method": "ptq",
    "created_at": "2025-12-18T16:12:00Z",
    "started_at": "2025-12-18T16:13:00Z",
    "ended_at": "2025-12-18T16:16:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "Post-training quantization to INT8 using the x86 backend (compare vs FP32 baseline).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "densenet121",
      "quantization": "int8",
      "compression_method": "ptq",
      "backend": "x86",
      "benchmark_suite": "PTQ_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9276,
      "f1": 0.9176,
      "loss": 0.2562,
      "size_mb": 8.55,
      "latency_ms": 31.5,
      "memory_mb": 814,
      "throughput": 31.75,
      "params_million": 8.0,
      "compression_ratio": 3.57,
      "quantization_bits": 8,
      "device": "cpu"
    },
    "baseline_run_id": "run-ic-ptq-densenet121-fp32",
    "parent_run_id": "run-ic-ptq-densenet121-fp32",
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-ptq-densenet121-int8-01",
        "run_id": "run-ic-ptq-densenet121-int8",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-densenet121-int8-02",
        "run_id": "run-ic-ptq-densenet121-int8",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-densenet121-int8-03",
        "run_id": "run-ic-ptq-densenet121-int8",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-densenet121-int8-04",
        "run_id": "run-ic-ptq-densenet121-int8",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-densenet121-int8-05",
        "run_id": "run-ic-ptq-densenet121-int8",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-densenet121-int8-06",
        "run_id": "run-ic-ptq-densenet121-int8",
        "key": "benchmark.num_epochs",
        "value": 25,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-densenet121-int8-07",
        "run_id": "run-ic-ptq-densenet121-int8",
        "key": "benchmark.model",
        "value": "densenet121",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-densenet121-int8-08",
        "run_id": "run-ic-ptq-densenet121-int8",
        "key": "compression.quantization",
        "value": "int8",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-densenet121-int8-09",
        "run_id": "run-ic-ptq-densenet121-int8",
        "key": "compression.method",
        "value": "ptq",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-densenet121-int8-10",
        "run_id": "run-ic-ptq-densenet121-int8",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-densenet121-int8-11",
        "run_id": "run-ic-ptq-densenet121-int8",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-ptq-densenet121-int8-12",
        "run_id": "run-ic-ptq-densenet121-int8",
        "key": "benchmark.suite",
        "value": "PTQ_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-densenet121-int8-13",
        "run_id": "run-ic-ptq-densenet121-int8",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-densenet121-int8-14",
        "run_id": "run-ic-ptq-densenet121-int8",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-ptq-inception_v3-fp32",
    "project_id": "project-ic-mnist",
    "name": "inception_v3 FP32 (PTQ Bench)",
    "status": "completed",
    "method": "baseline",
    "created_at": "2025-12-18T16:20:00Z",
    "started_at": "2025-12-18T16:21:00Z",
    "ended_at": "2025-12-18T16:28:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "FP32 baseline run for the PTQ benchmark suite (MNIST, 5% sample).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "inception_v3",
      "quantization": "fp32",
      "compression_method": "baseline",
      "backend": "x86",
      "benchmark_suite": "PTQ_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9389,
      "f1": 0.9289,
      "loss": 0.2453,
      "size_mb": 84.57,
      "latency_ms": 35.1,
      "memory_mb": 1328,
      "throughput": 28.49,
      "params_million": 23.8,
      "compression_ratio": 1.0,
      "quantization_bits": 32,
      "device": "cpu"
    },
    "baseline_run_id": null,
    "parent_run_id": null,
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-ptq-inception_v3-fp32-01",
        "run_id": "run-ic-ptq-inception_v3-fp32",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-inception_v3-fp32-02",
        "run_id": "run-ic-ptq-inception_v3-fp32",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-inception_v3-fp32-03",
        "run_id": "run-ic-ptq-inception_v3-fp32",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-inception_v3-fp32-04",
        "run_id": "run-ic-ptq-inception_v3-fp32",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-inception_v3-fp32-05",
        "run_id": "run-ic-ptq-inception_v3-fp32",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-inception_v3-fp32-06",
        "run_id": "run-ic-ptq-inception_v3-fp32",
        "key": "benchmark.num_epochs",
        "value": 25,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-inception_v3-fp32-07",
        "run_id": "run-ic-ptq-inception_v3-fp32",
        "key": "benchmark.model",
        "value": "inception_v3",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-inception_v3-fp32-08",
        "run_id": "run-ic-ptq-inception_v3-fp32",
        "key": "compression.quantization",
        "value": "fp32",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-inception_v3-fp32-09",
        "run_id": "run-ic-ptq-inception_v3-fp32",
        "key": "compression.method",
        "value": "none",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-inception_v3-fp32-10",
        "run_id": "run-ic-ptq-inception_v3-fp32",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-inception_v3-fp32-11",
        "run_id": "run-ic-ptq-inception_v3-fp32",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-ptq-inception_v3-fp32-12",
        "run_id": "run-ic-ptq-inception_v3-fp32",
        "key": "benchmark.suite",
        "value": "PTQ_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-inception_v3-fp32-13",
        "run_id": "run-ic-ptq-inception_v3-fp32",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-inception_v3-fp32-14",
        "run_id": "run-ic-ptq-inception_v3-fp32",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-ptq-inception_v3-int8",
    "project_id": "project-ic-mnist",
    "name": "inception_v3 INT8 PTQ",
    "status": "completed",
    "method": "ptq",
    "created_at": "2025-12-18T16:22:00Z",
    "started_at": "2025-12-18T16:23:00Z",
    "ended_at": "2025-12-18T16:26:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "Post-training quantization to INT8 using the x86 backend (compare vs FP32 baseline).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "inception_v3",
      "quantization": "int8",
      "compression_method": "ptq",
      "backend": "x86",
      "benchmark_suite": "PTQ_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9349,
      "f1": 0.9249,
      "loss": 0.2553,
      "size_mb": 21.22,
      "latency_ms": 24.9,
      "memory_mb": 1035,
      "throughput": 40.16,
      "params_million": 23.8,
      "compression_ratio": 3.99,
      "quantization_bits": 8,
      "device": "cpu"
    },
    "baseline_run_id": "run-ic-ptq-inception_v3-fp32",
    "parent_run_id": "run-ic-ptq-inception_v3-fp32",
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-ptq-inception_v3-int8-01",
        "run_id": "run-ic-ptq-inception_v3-int8",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-inception_v3-int8-02",
        "run_id": "run-ic-ptq-inception_v3-int8",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-inception_v3-int8-03",
        "run_id": "run-ic-ptq-inception_v3-int8",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-inception_v3-int8-04",
        "run_id": "run-ic-ptq-inception_v3-int8",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-inception_v3-int8-05",
        "run_id": "run-ic-ptq-inception_v3-int8",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-inception_v3-int8-06",
        "run_id": "run-ic-ptq-inception_v3-int8",
        "key": "benchmark.num_epochs",
        "value": 25,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-inception_v3-int8-07",
        "run_id": "run-ic-ptq-inception_v3-int8",
        "key": "benchmark.model",
        "value": "inception_v3",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-inception_v3-int8-08",
        "run_id": "run-ic-ptq-inception_v3-int8",
        "key": "compression.quantization",
        "value": "int8",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-inception_v3-int8-09",
        "run_id": "run-ic-ptq-inception_v3-int8",
        "key": "compression.method",
        "value": "ptq",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-inception_v3-int8-10",
        "run_id": "run-ic-ptq-inception_v3-int8",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-inception_v3-int8-11",
        "run_id": "run-ic-ptq-inception_v3-int8",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-ptq-inception_v3-int8-12",
        "run_id": "run-ic-ptq-inception_v3-int8",
        "key": "benchmark.suite",
        "value": "PTQ_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-inception_v3-int8-13",
        "run_id": "run-ic-ptq-inception_v3-int8",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-inception_v3-int8-14",
        "run_id": "run-ic-ptq-inception_v3-int8",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-ptq-googlenet-fp32",
    "project_id": "project-ic-mnist",
    "name": "googlenet FP32 (PTQ Bench)",
    "status": "completed",
    "method": "baseline",
    "created_at": "2025-12-18T16:30:00Z",
    "started_at": "2025-12-18T16:31:00Z",
    "ended_at": "2025-12-18T16:38:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "FP32 baseline run for the PTQ benchmark suite (MNIST, 5% sample).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "googlenet",
      "quantization": "fp32",
      "compression_method": "baseline",
      "backend": "x86",
      "benchmark_suite": "PTQ_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9306,
      "f1": 0.9206,
      "loss": 0.2463,
      "size_mb": 25.18,
      "latency_ms": 14.0,
      "memory_mb": 1018,
      "throughput": 71.43,
      "params_million": 6.6,
      "compression_ratio": 1.0,
      "quantization_bits": 32,
      "device": "cpu"
    },
    "baseline_run_id": null,
    "parent_run_id": null,
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-ptq-googlenet-fp32-01",
        "run_id": "run-ic-ptq-googlenet-fp32",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-googlenet-fp32-02",
        "run_id": "run-ic-ptq-googlenet-fp32",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-googlenet-fp32-03",
        "run_id": "run-ic-ptq-googlenet-fp32",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-googlenet-fp32-04",
        "run_id": "run-ic-ptq-googlenet-fp32",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-googlenet-fp32-05",
        "run_id": "run-ic-ptq-googlenet-fp32",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-googlenet-fp32-06",
        "run_id": "run-ic-ptq-googlenet-fp32",
        "key": "benchmark.num_epochs",
        "value": 25,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-googlenet-fp32-07",
        "run_id": "run-ic-ptq-googlenet-fp32",
        "key": "benchmark.model",
        "value": "googlenet",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-googlenet-fp32-08",
        "run_id": "run-ic-ptq-googlenet-fp32",
        "key": "compression.quantization",
        "value": "fp32",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-googlenet-fp32-09",
        "run_id": "run-ic-ptq-googlenet-fp32",
        "key": "compression.method",
        "value": "none",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-googlenet-fp32-10",
        "run_id": "run-ic-ptq-googlenet-fp32",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-googlenet-fp32-11",
        "run_id": "run-ic-ptq-googlenet-fp32",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-ptq-googlenet-fp32-12",
        "run_id": "run-ic-ptq-googlenet-fp32",
        "key": "benchmark.suite",
        "value": "PTQ_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-googlenet-fp32-13",
        "run_id": "run-ic-ptq-googlenet-fp32",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-googlenet-fp32-14",
        "run_id": "run-ic-ptq-googlenet-fp32",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-ptq-googlenet-int8",
    "project_id": "project-ic-mnist",
    "name": "googlenet INT8 PTQ",
    "status": "completed",
    "method": "ptq",
    "created_at": "2025-12-18T16:32:00Z",
    "started_at": "2025-12-18T16:33:00Z",
    "ended_at": "2025-12-18T16:36:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "Post-training quantization to INT8 using the x86 backend (compare vs FP32 baseline).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "googlenet",
      "quantization": "int8",
      "compression_method": "ptq",
      "backend": "x86",
      "benchmark_suite": "PTQ_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9266,
      "f1": 0.9166,
      "loss": 0.2563,
      "size_mb": 7.05,
      "latency_ms": 11.2,
      "memory_mb": 794,
      "throughput": 89.29,
      "params_million": 6.6,
      "compression_ratio": 3.57,
      "quantization_bits": 8,
      "device": "cpu"
    },
    "baseline_run_id": "run-ic-ptq-googlenet-fp32",
    "parent_run_id": "run-ic-ptq-googlenet-fp32",
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-ptq-googlenet-int8-01",
        "run_id": "run-ic-ptq-googlenet-int8",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-googlenet-int8-02",
        "run_id": "run-ic-ptq-googlenet-int8",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-googlenet-int8-03",
        "run_id": "run-ic-ptq-googlenet-int8",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-googlenet-int8-04",
        "run_id": "run-ic-ptq-googlenet-int8",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-googlenet-int8-05",
        "run_id": "run-ic-ptq-googlenet-int8",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-googlenet-int8-06",
        "run_id": "run-ic-ptq-googlenet-int8",
        "key": "benchmark.num_epochs",
        "value": 25,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-googlenet-int8-07",
        "run_id": "run-ic-ptq-googlenet-int8",
        "key": "benchmark.model",
        "value": "googlenet",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-googlenet-int8-08",
        "run_id": "run-ic-ptq-googlenet-int8",
        "key": "compression.quantization",
        "value": "int8",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-googlenet-int8-09",
        "run_id": "run-ic-ptq-googlenet-int8",
        "key": "compression.method",
        "value": "ptq",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-googlenet-int8-10",
        "run_id": "run-ic-ptq-googlenet-int8",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-googlenet-int8-11",
        "run_id": "run-ic-ptq-googlenet-int8",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-ptq-googlenet-int8-12",
        "run_id": "run-ic-ptq-googlenet-int8",
        "key": "benchmark.suite",
        "value": "PTQ_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-googlenet-int8-13",
        "run_id": "run-ic-ptq-googlenet-int8",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-googlenet-int8-14",
        "run_id": "run-ic-ptq-googlenet-int8",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-ptq-convnext-tiny-fp32",
    "project_id": "project-ic-mnist",
    "name": "convnext-tiny FP32 (PTQ Bench)",
    "status": "completed",
    "method": "baseline",
    "created_at": "2025-12-18T16:40:00Z",
    "started_at": "2025-12-18T16:41:00Z",
    "ended_at": "2025-12-18T16:48:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "FP32 baseline run for the PTQ benchmark suite (MNIST, 5% sample).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "convnext-tiny",
      "quantization": "fp32",
      "compression_method": "baseline",
      "backend": "x86",
      "benchmark_suite": "PTQ_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9402,
      "f1": 0.9302,
      "loss": 0.2452,
      "size_mb": 109.35,
      "latency_ms": 178.0,
      "memory_mb": 1414,
      "throughput": 5.62,
      "params_million": 28.6,
      "compression_ratio": 1.0,
      "quantization_bits": 32,
      "device": "cpu"
    },
    "baseline_run_id": null,
    "parent_run_id": null,
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-ptq-convnext-tiny-fp32-01",
        "run_id": "run-ic-ptq-convnext-tiny-fp32",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-convnext-tiny-fp32-02",
        "run_id": "run-ic-ptq-convnext-tiny-fp32",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-convnext-tiny-fp32-03",
        "run_id": "run-ic-ptq-convnext-tiny-fp32",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-convnext-tiny-fp32-04",
        "run_id": "run-ic-ptq-convnext-tiny-fp32",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-convnext-tiny-fp32-05",
        "run_id": "run-ic-ptq-convnext-tiny-fp32",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-convnext-tiny-fp32-06",
        "run_id": "run-ic-ptq-convnext-tiny-fp32",
        "key": "benchmark.num_epochs",
        "value": 25,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-convnext-tiny-fp32-07",
        "run_id": "run-ic-ptq-convnext-tiny-fp32",
        "key": "benchmark.model",
        "value": "convnext-tiny",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-convnext-tiny-fp32-08",
        "run_id": "run-ic-ptq-convnext-tiny-fp32",
        "key": "compression.quantization",
        "value": "fp32",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-convnext-tiny-fp32-09",
        "run_id": "run-ic-ptq-convnext-tiny-fp32",
        "key": "compression.method",
        "value": "none",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-convnext-tiny-fp32-10",
        "run_id": "run-ic-ptq-convnext-tiny-fp32",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-convnext-tiny-fp32-11",
        "run_id": "run-ic-ptq-convnext-tiny-fp32",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-ptq-convnext-tiny-fp32-12",
        "run_id": "run-ic-ptq-convnext-tiny-fp32",
        "key": "benchmark.suite",
        "value": "PTQ_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-convnext-tiny-fp32-13",
        "run_id": "run-ic-ptq-convnext-tiny-fp32",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-convnext-tiny-fp32-14",
        "run_id": "run-ic-ptq-convnext-tiny-fp32",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-ptq-convnext-tiny-int8",
    "project_id": "project-ic-mnist",
    "name": "convnext-tiny INT8 PTQ",
    "status": "completed",
    "method": "ptq",
    "created_at": "2025-12-18T16:42:00Z",
    "started_at": "2025-12-18T16:43:00Z",
    "ended_at": "2025-12-18T16:46:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "Post-training quantization to INT8 using the x86 backend (compare vs FP32 baseline).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "convnext-tiny",
      "quantization": "int8",
      "compression_method": "ptq",
      "backend": "x86",
      "benchmark_suite": "PTQ_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9362,
      "f1": 0.9262,
      "loss": 0.2552,
      "size_mb": 27.21,
      "latency_ms": 94.7,
      "memory_mb": 1102,
      "throughput": 10.56,
      "params_million": 28.6,
      "compression_ratio": 4.02,
      "quantization_bits": 8,
      "device": "cpu"
    },
    "baseline_run_id": "run-ic-ptq-convnext-tiny-fp32",
    "parent_run_id": "run-ic-ptq-convnext-tiny-fp32",
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-ptq-convnext-tiny-int8-01",
        "run_id": "run-ic-ptq-convnext-tiny-int8",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-convnext-tiny-int8-02",
        "run_id": "run-ic-ptq-convnext-tiny-int8",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-convnext-tiny-int8-03",
        "run_id": "run-ic-ptq-convnext-tiny-int8",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-convnext-tiny-int8-04",
        "run_id": "run-ic-ptq-convnext-tiny-int8",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-convnext-tiny-int8-05",
        "run_id": "run-ic-ptq-convnext-tiny-int8",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-convnext-tiny-int8-06",
        "run_id": "run-ic-ptq-convnext-tiny-int8",
        "key": "benchmark.num_epochs",
        "value": 25,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-convnext-tiny-int8-07",
        "run_id": "run-ic-ptq-convnext-tiny-int8",
        "key": "benchmark.model",
        "value": "convnext-tiny",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-convnext-tiny-int8-08",
        "run_id": "run-ic-ptq-convnext-tiny-int8",
        "key": "compression.quantization",
        "value": "int8",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-convnext-tiny-int8-09",
        "run_id": "run-ic-ptq-convnext-tiny-int8",
        "key": "compression.method",
        "value": "ptq",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-convnext-tiny-int8-10",
        "run_id": "run-ic-ptq-convnext-tiny-int8",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-convnext-tiny-int8-11",
        "run_id": "run-ic-ptq-convnext-tiny-int8",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-ptq-convnext-tiny-int8-12",
        "run_id": "run-ic-ptq-convnext-tiny-int8",
        "key": "benchmark.suite",
        "value": "PTQ_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-convnext-tiny-int8-13",
        "run_id": "run-ic-ptq-convnext-tiny-int8",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-convnext-tiny-int8-14",
        "run_id": "run-ic-ptq-convnext-tiny-int8",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-ptq-shufflenetv2-0.5x-fp32",
    "project_id": "project-ic-mnist",
    "name": "shufflenetv2-0.5x FP32 (PTQ Bench)",
    "status": "completed",
    "method": "baseline",
    "created_at": "2025-12-18T16:50:00Z",
    "started_at": "2025-12-18T16:51:00Z",
    "ended_at": "2025-12-18T16:58:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "FP32 baseline run for the PTQ benchmark suite (MNIST, 5% sample).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "shufflenetv2-0.5x",
      "quantization": "fp32",
      "compression_method": "baseline",
      "backend": "x86",
      "benchmark_suite": "PTQ_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9264,
      "f1": 0.9164,
      "loss": 0.2468,
      "size_mb": 5.34,
      "latency_ms": 10.0,
      "memory_mb": 925,
      "throughput": 100.0,
      "params_million": 1.4,
      "compression_ratio": 1.0,
      "quantization_bits": 32,
      "device": "cpu"
    },
    "baseline_run_id": null,
    "parent_run_id": null,
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-ptq-shufflenetv2-0.5x-fp32-01",
        "run_id": "run-ic-ptq-shufflenetv2-0.5x-fp32",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-shufflenetv2-0.5x-fp32-02",
        "run_id": "run-ic-ptq-shufflenetv2-0.5x-fp32",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-shufflenetv2-0.5x-fp32-03",
        "run_id": "run-ic-ptq-shufflenetv2-0.5x-fp32",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-shufflenetv2-0.5x-fp32-04",
        "run_id": "run-ic-ptq-shufflenetv2-0.5x-fp32",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-shufflenetv2-0.5x-fp32-05",
        "run_id": "run-ic-ptq-shufflenetv2-0.5x-fp32",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-shufflenetv2-0.5x-fp32-06",
        "run_id": "run-ic-ptq-shufflenetv2-0.5x-fp32",
        "key": "benchmark.num_epochs",
        "value": 25,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-shufflenetv2-0.5x-fp32-07",
        "run_id": "run-ic-ptq-shufflenetv2-0.5x-fp32",
        "key": "benchmark.model",
        "value": "shufflenetv2-0.5x",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-shufflenetv2-0.5x-fp32-08",
        "run_id": "run-ic-ptq-shufflenetv2-0.5x-fp32",
        "key": "compression.quantization",
        "value": "fp32",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-shufflenetv2-0.5x-fp32-09",
        "run_id": "run-ic-ptq-shufflenetv2-0.5x-fp32",
        "key": "compression.method",
        "value": "none",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-shufflenetv2-0.5x-fp32-10",
        "run_id": "run-ic-ptq-shufflenetv2-0.5x-fp32",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-shufflenetv2-0.5x-fp32-11",
        "run_id": "run-ic-ptq-shufflenetv2-0.5x-fp32",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-ptq-shufflenetv2-0.5x-fp32-12",
        "run_id": "run-ic-ptq-shufflenetv2-0.5x-fp32",
        "key": "benchmark.suite",
        "value": "PTQ_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-shufflenetv2-0.5x-fp32-13",
        "run_id": "run-ic-ptq-shufflenetv2-0.5x-fp32",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-shufflenetv2-0.5x-fp32-14",
        "run_id": "run-ic-ptq-shufflenetv2-0.5x-fp32",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-ptq-shufflenetv2-0.5x-int8",
    "project_id": "project-ic-mnist",
    "name": "shufflenetv2-0.5x INT8 PTQ",
    "status": "completed",
    "method": "ptq",
    "created_at": "2025-12-18T16:52:00Z",
    "started_at": "2025-12-18T16:53:00Z",
    "ended_at": "2025-12-18T16:56:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "Post-training quantization to INT8 using the x86 backend (compare vs FP32 baseline).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "shufflenetv2-0.5x",
      "quantization": "int8",
      "compression_method": "ptq",
      "backend": "x86",
      "benchmark_suite": "PTQ_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9224,
      "f1": 0.9124,
      "loss": 0.2568,
      "size_mb": 2.4,
      "latency_ms": 9.2,
      "memory_mb": 721,
      "throughput": 108.7,
      "params_million": 1.4,
      "compression_ratio": 2.23,
      "quantization_bits": 8,
      "device": "cpu"
    },
    "baseline_run_id": "run-ic-ptq-shufflenetv2-0.5x-fp32",
    "parent_run_id": "run-ic-ptq-shufflenetv2-0.5x-fp32",
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-ptq-shufflenetv2-0.5x-int8-01",
        "run_id": "run-ic-ptq-shufflenetv2-0.5x-int8",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-shufflenetv2-0.5x-int8-02",
        "run_id": "run-ic-ptq-shufflenetv2-0.5x-int8",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-shufflenetv2-0.5x-int8-03",
        "run_id": "run-ic-ptq-shufflenetv2-0.5x-int8",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-shufflenetv2-0.5x-int8-04",
        "run_id": "run-ic-ptq-shufflenetv2-0.5x-int8",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-shufflenetv2-0.5x-int8-05",
        "run_id": "run-ic-ptq-shufflenetv2-0.5x-int8",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-shufflenetv2-0.5x-int8-06",
        "run_id": "run-ic-ptq-shufflenetv2-0.5x-int8",
        "key": "benchmark.num_epochs",
        "value": 25,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-shufflenetv2-0.5x-int8-07",
        "run_id": "run-ic-ptq-shufflenetv2-0.5x-int8",
        "key": "benchmark.model",
        "value": "shufflenetv2-0.5x",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-shufflenetv2-0.5x-int8-08",
        "run_id": "run-ic-ptq-shufflenetv2-0.5x-int8",
        "key": "compression.quantization",
        "value": "int8",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-shufflenetv2-0.5x-int8-09",
        "run_id": "run-ic-ptq-shufflenetv2-0.5x-int8",
        "key": "compression.method",
        "value": "ptq",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-shufflenetv2-0.5x-int8-10",
        "run_id": "run-ic-ptq-shufflenetv2-0.5x-int8",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-shufflenetv2-0.5x-int8-11",
        "run_id": "run-ic-ptq-shufflenetv2-0.5x-int8",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-ptq-shufflenetv2-0.5x-int8-12",
        "run_id": "run-ic-ptq-shufflenetv2-0.5x-int8",
        "key": "benchmark.suite",
        "value": "PTQ_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-shufflenetv2-0.5x-int8-13",
        "run_id": "run-ic-ptq-shufflenetv2-0.5x-int8",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-shufflenetv2-0.5x-int8-14",
        "run_id": "run-ic-ptq-shufflenetv2-0.5x-int8",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-ptq-regnety-400mf-fp32",
    "project_id": "project-ic-mnist",
    "name": "regnety-400mf FP32 (PTQ Bench)",
    "status": "completed",
    "method": "baseline",
    "created_at": "2025-12-18T17:00:00Z",
    "started_at": "2025-12-18T17:01:00Z",
    "ended_at": "2025-12-18T17:08:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "FP32 baseline run for the PTQ benchmark suite (MNIST, 5% sample).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "regnety-400mf",
      "quantization": "fp32",
      "compression_method": "baseline",
      "backend": "x86",
      "benchmark_suite": "PTQ_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9289,
      "f1": 0.9189,
      "loss": 0.2465,
      "size_mb": 16.4,
      "latency_ms": 16.0,
      "memory_mb": 977,
      "throughput": 62.5,
      "params_million": 4.3,
      "compression_ratio": 1.0,
      "quantization_bits": 32,
      "device": "cpu"
    },
    "baseline_run_id": null,
    "parent_run_id": null,
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-ptq-regnety-400mf-fp32-01",
        "run_id": "run-ic-ptq-regnety-400mf-fp32",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-regnety-400mf-fp32-02",
        "run_id": "run-ic-ptq-regnety-400mf-fp32",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-regnety-400mf-fp32-03",
        "run_id": "run-ic-ptq-regnety-400mf-fp32",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-regnety-400mf-fp32-04",
        "run_id": "run-ic-ptq-regnety-400mf-fp32",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-regnety-400mf-fp32-05",
        "run_id": "run-ic-ptq-regnety-400mf-fp32",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-regnety-400mf-fp32-06",
        "run_id": "run-ic-ptq-regnety-400mf-fp32",
        "key": "benchmark.num_epochs",
        "value": 25,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-regnety-400mf-fp32-07",
        "run_id": "run-ic-ptq-regnety-400mf-fp32",
        "key": "benchmark.model",
        "value": "regnety-400mf",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-regnety-400mf-fp32-08",
        "run_id": "run-ic-ptq-regnety-400mf-fp32",
        "key": "compression.quantization",
        "value": "fp32",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-regnety-400mf-fp32-09",
        "run_id": "run-ic-ptq-regnety-400mf-fp32",
        "key": "compression.method",
        "value": "none",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-regnety-400mf-fp32-10",
        "run_id": "run-ic-ptq-regnety-400mf-fp32",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-regnety-400mf-fp32-11",
        "run_id": "run-ic-ptq-regnety-400mf-fp32",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-ptq-regnety-400mf-fp32-12",
        "run_id": "run-ic-ptq-regnety-400mf-fp32",
        "key": "benchmark.suite",
        "value": "PTQ_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-regnety-400mf-fp32-13",
        "run_id": "run-ic-ptq-regnety-400mf-fp32",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-regnety-400mf-fp32-14",
        "run_id": "run-ic-ptq-regnety-400mf-fp32",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-ptq-regnety-400mf-int8",
    "project_id": "project-ic-mnist",
    "name": "regnety-400mf INT8 PTQ",
    "status": "completed",
    "method": "ptq",
    "created_at": "2025-12-18T17:02:00Z",
    "started_at": "2025-12-18T17:03:00Z",
    "ended_at": "2025-12-18T17:06:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "Post-training quantization to INT8 using the x86 backend (compare vs FP32 baseline).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "regnety-400mf",
      "quantization": "int8",
      "compression_method": "ptq",
      "backend": "x86",
      "benchmark_suite": "PTQ_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9249,
      "f1": 0.9149,
      "loss": 0.2565,
      "size_mb": 5.25,
      "latency_ms": 12.8,
      "memory_mb": 762,
      "throughput": 78.12,
      "params_million": 4.3,
      "compression_ratio": 3.12,
      "quantization_bits": 8,
      "device": "cpu"
    },
    "baseline_run_id": "run-ic-ptq-regnety-400mf-fp32",
    "parent_run_id": "run-ic-ptq-regnety-400mf-fp32",
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-ptq-regnety-400mf-int8-01",
        "run_id": "run-ic-ptq-regnety-400mf-int8",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-regnety-400mf-int8-02",
        "run_id": "run-ic-ptq-regnety-400mf-int8",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-regnety-400mf-int8-03",
        "run_id": "run-ic-ptq-regnety-400mf-int8",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-regnety-400mf-int8-04",
        "run_id": "run-ic-ptq-regnety-400mf-int8",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-regnety-400mf-int8-05",
        "run_id": "run-ic-ptq-regnety-400mf-int8",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-regnety-400mf-int8-06",
        "run_id": "run-ic-ptq-regnety-400mf-int8",
        "key": "benchmark.num_epochs",
        "value": 25,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-regnety-400mf-int8-07",
        "run_id": "run-ic-ptq-regnety-400mf-int8",
        "key": "benchmark.model",
        "value": "regnety-400mf",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-regnety-400mf-int8-08",
        "run_id": "run-ic-ptq-regnety-400mf-int8",
        "key": "compression.quantization",
        "value": "int8",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-regnety-400mf-int8-09",
        "run_id": "run-ic-ptq-regnety-400mf-int8",
        "key": "compression.method",
        "value": "ptq",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-regnety-400mf-int8-10",
        "run_id": "run-ic-ptq-regnety-400mf-int8",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-regnety-400mf-int8-11",
        "run_id": "run-ic-ptq-regnety-400mf-int8",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-ptq-regnety-400mf-int8-12",
        "run_id": "run-ic-ptq-regnety-400mf-int8",
        "key": "benchmark.suite",
        "value": "PTQ_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-regnety-400mf-int8-13",
        "run_id": "run-ic-ptq-regnety-400mf-int8",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-regnety-400mf-int8-14",
        "run_id": "run-ic-ptq-regnety-400mf-int8",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-ptq-mnasnet0_5-fp32",
    "project_id": "project-ic-mnist",
    "name": "mnasnet0_5 FP32 (PTQ Bench)",
    "status": "completed",
    "method": "baseline",
    "created_at": "2025-12-18T17:10:00Z",
    "started_at": "2025-12-18T17:11:00Z",
    "ended_at": "2025-12-18T17:18:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "FP32 baseline run for the PTQ benchmark suite (MNIST, 5% sample).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "mnasnet0_5",
      "quantization": "fp32",
      "compression_method": "baseline",
      "backend": "x86",
      "benchmark_suite": "PTQ_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9271,
      "f1": 0.9171,
      "loss": 0.2467,
      "size_mb": 8.39,
      "latency_ms": 12.0,
      "memory_mb": 939,
      "throughput": 83.33,
      "params_million": 2.2,
      "compression_ratio": 1.0,
      "quantization_bits": 32,
      "device": "cpu"
    },
    "baseline_run_id": null,
    "parent_run_id": null,
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-ptq-mnasnet0_5-fp32-01",
        "run_id": "run-ic-ptq-mnasnet0_5-fp32",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-mnasnet0_5-fp32-02",
        "run_id": "run-ic-ptq-mnasnet0_5-fp32",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-mnasnet0_5-fp32-03",
        "run_id": "run-ic-ptq-mnasnet0_5-fp32",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-mnasnet0_5-fp32-04",
        "run_id": "run-ic-ptq-mnasnet0_5-fp32",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-mnasnet0_5-fp32-05",
        "run_id": "run-ic-ptq-mnasnet0_5-fp32",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-mnasnet0_5-fp32-06",
        "run_id": "run-ic-ptq-mnasnet0_5-fp32",
        "key": "benchmark.num_epochs",
        "value": 25,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-mnasnet0_5-fp32-07",
        "run_id": "run-ic-ptq-mnasnet0_5-fp32",
        "key": "benchmark.model",
        "value": "mnasnet0_5",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-mnasnet0_5-fp32-08",
        "run_id": "run-ic-ptq-mnasnet0_5-fp32",
        "key": "compression.quantization",
        "value": "fp32",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-mnasnet0_5-fp32-09",
        "run_id": "run-ic-ptq-mnasnet0_5-fp32",
        "key": "compression.method",
        "value": "none",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-mnasnet0_5-fp32-10",
        "run_id": "run-ic-ptq-mnasnet0_5-fp32",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-mnasnet0_5-fp32-11",
        "run_id": "run-ic-ptq-mnasnet0_5-fp32",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-ptq-mnasnet0_5-fp32-12",
        "run_id": "run-ic-ptq-mnasnet0_5-fp32",
        "key": "benchmark.suite",
        "value": "PTQ_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-mnasnet0_5-fp32-13",
        "run_id": "run-ic-ptq-mnasnet0_5-fp32",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-mnasnet0_5-fp32-14",
        "run_id": "run-ic-ptq-mnasnet0_5-fp32",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-ptq-mnasnet0_5-int8",
    "project_id": "project-ic-mnist",
    "name": "mnasnet0_5 INT8 PTQ",
    "status": "completed",
    "method": "ptq",
    "created_at": "2025-12-18T17:12:00Z",
    "started_at": "2025-12-18T17:13:00Z",
    "ended_at": "2025-12-18T17:16:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "Post-training quantization to INT8 using the x86 backend (compare vs FP32 baseline).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "mnasnet0_5",
      "quantization": "int8",
      "compression_method": "ptq",
      "backend": "x86",
      "benchmark_suite": "PTQ_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9231,
      "f1": 0.9131,
      "loss": 0.2567,
      "size_mb": 3.78,
      "latency_ms": 9.6,
      "memory_mb": 732,
      "throughput": 104.17,
      "params_million": 2.2,
      "compression_ratio": 2.22,
      "quantization_bits": 8,
      "device": "cpu"
    },
    "baseline_run_id": "run-ic-ptq-mnasnet0_5-fp32",
    "parent_run_id": "run-ic-ptq-mnasnet0_5-fp32",
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-ptq-mnasnet0_5-int8-01",
        "run_id": "run-ic-ptq-mnasnet0_5-int8",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-mnasnet0_5-int8-02",
        "run_id": "run-ic-ptq-mnasnet0_5-int8",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-mnasnet0_5-int8-03",
        "run_id": "run-ic-ptq-mnasnet0_5-int8",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-mnasnet0_5-int8-04",
        "run_id": "run-ic-ptq-mnasnet0_5-int8",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-mnasnet0_5-int8-05",
        "run_id": "run-ic-ptq-mnasnet0_5-int8",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-mnasnet0_5-int8-06",
        "run_id": "run-ic-ptq-mnasnet0_5-int8",
        "key": "benchmark.num_epochs",
        "value": 25,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-mnasnet0_5-int8-07",
        "run_id": "run-ic-ptq-mnasnet0_5-int8",
        "key": "benchmark.model",
        "value": "mnasnet0_5",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-mnasnet0_5-int8-08",
        "run_id": "run-ic-ptq-mnasnet0_5-int8",
        "key": "compression.quantization",
        "value": "int8",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-mnasnet0_5-int8-09",
        "run_id": "run-ic-ptq-mnasnet0_5-int8",
        "key": "compression.method",
        "value": "ptq",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-mnasnet0_5-int8-10",
        "run_id": "run-ic-ptq-mnasnet0_5-int8",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-mnasnet0_5-int8-11",
        "run_id": "run-ic-ptq-mnasnet0_5-int8",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-ptq-mnasnet0_5-int8-12",
        "run_id": "run-ic-ptq-mnasnet0_5-int8",
        "key": "benchmark.suite",
        "value": "PTQ_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-mnasnet0_5-int8-13",
        "run_id": "run-ic-ptq-mnasnet0_5-int8",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-mnasnet0_5-int8-14",
        "run_id": "run-ic-ptq-mnasnet0_5-int8",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-ptq-vit-tiny-fp32",
    "project_id": "project-ic-mnist",
    "name": "vit-tiny FP32 (PTQ Bench)",
    "status": "completed",
    "method": "baseline",
    "created_at": "2025-12-18T17:20:00Z",
    "started_at": "2025-12-18T17:21:00Z",
    "ended_at": "2025-12-18T17:28:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "FP32 baseline run for the PTQ benchmark suite (MNIST, 5% sample).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "vit-tiny",
      "quantization": "fp32",
      "compression_method": "baseline",
      "backend": "x86",
      "benchmark_suite": "PTQ_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.93,
      "f1": 0.92,
      "loss": 0.2464,
      "size_mb": 21.99,
      "latency_ms": 21.1,
      "memory_mb": 1002,
      "throughput": 47.39,
      "params_million": 5.7,
      "compression_ratio": 1.0,
      "quantization_bits": 32,
      "device": "cpu"
    },
    "baseline_run_id": null,
    "parent_run_id": null,
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-ptq-vit-tiny-fp32-01",
        "run_id": "run-ic-ptq-vit-tiny-fp32",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-vit-tiny-fp32-02",
        "run_id": "run-ic-ptq-vit-tiny-fp32",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-vit-tiny-fp32-03",
        "run_id": "run-ic-ptq-vit-tiny-fp32",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-vit-tiny-fp32-04",
        "run_id": "run-ic-ptq-vit-tiny-fp32",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-vit-tiny-fp32-05",
        "run_id": "run-ic-ptq-vit-tiny-fp32",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-vit-tiny-fp32-06",
        "run_id": "run-ic-ptq-vit-tiny-fp32",
        "key": "benchmark.num_epochs",
        "value": 25,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-vit-tiny-fp32-07",
        "run_id": "run-ic-ptq-vit-tiny-fp32",
        "key": "benchmark.model",
        "value": "vit-tiny",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-vit-tiny-fp32-08",
        "run_id": "run-ic-ptq-vit-tiny-fp32",
        "key": "compression.quantization",
        "value": "fp32",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-vit-tiny-fp32-09",
        "run_id": "run-ic-ptq-vit-tiny-fp32",
        "key": "compression.method",
        "value": "none",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-vit-tiny-fp32-10",
        "run_id": "run-ic-ptq-vit-tiny-fp32",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-vit-tiny-fp32-11",
        "run_id": "run-ic-ptq-vit-tiny-fp32",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-ptq-vit-tiny-fp32-12",
        "run_id": "run-ic-ptq-vit-tiny-fp32",
        "key": "benchmark.suite",
        "value": "PTQ_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-vit-tiny-fp32-13",
        "run_id": "run-ic-ptq-vit-tiny-fp32",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-vit-tiny-fp32-14",
        "run_id": "run-ic-ptq-vit-tiny-fp32",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-ptq-vit-tiny-int8",
    "project_id": "project-ic-mnist",
    "name": "vit-tiny INT8 PTQ",
    "status": "completed",
    "method": "ptq",
    "created_at": "2025-12-18T17:22:00Z",
    "started_at": "2025-12-18T17:23:00Z",
    "ended_at": "2025-12-18T17:26:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "Post-training quantization to INT8 using the x86 backend (compare vs FP32 baseline).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "vit-tiny",
      "quantization": "int8",
      "compression_method": "ptq",
      "backend": "x86",
      "benchmark_suite": "PTQ_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.926,
      "f1": 0.916,
      "loss": 0.2564,
      "size_mb": 5.55,
      "latency_ms": 17.6,
      "memory_mb": 781,
      "throughput": 56.82,
      "params_million": 5.7,
      "compression_ratio": 3.96,
      "quantization_bits": 8,
      "device": "cpu"
    },
    "baseline_run_id": "run-ic-ptq-vit-tiny-fp32",
    "parent_run_id": "run-ic-ptq-vit-tiny-fp32",
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-ptq-vit-tiny-int8-01",
        "run_id": "run-ic-ptq-vit-tiny-int8",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-vit-tiny-int8-02",
        "run_id": "run-ic-ptq-vit-tiny-int8",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-vit-tiny-int8-03",
        "run_id": "run-ic-ptq-vit-tiny-int8",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-vit-tiny-int8-04",
        "run_id": "run-ic-ptq-vit-tiny-int8",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-vit-tiny-int8-05",
        "run_id": "run-ic-ptq-vit-tiny-int8",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-vit-tiny-int8-06",
        "run_id": "run-ic-ptq-vit-tiny-int8",
        "key": "benchmark.num_epochs",
        "value": 25,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-vit-tiny-int8-07",
        "run_id": "run-ic-ptq-vit-tiny-int8",
        "key": "benchmark.model",
        "value": "vit-tiny",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-vit-tiny-int8-08",
        "run_id": "run-ic-ptq-vit-tiny-int8",
        "key": "compression.quantization",
        "value": "int8",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-vit-tiny-int8-09",
        "run_id": "run-ic-ptq-vit-tiny-int8",
        "key": "compression.method",
        "value": "ptq",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-vit-tiny-int8-10",
        "run_id": "run-ic-ptq-vit-tiny-int8",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-vit-tiny-int8-11",
        "run_id": "run-ic-ptq-vit-tiny-int8",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-ptq-vit-tiny-int8-12",
        "run_id": "run-ic-ptq-vit-tiny-int8",
        "key": "benchmark.suite",
        "value": "PTQ_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-vit-tiny-int8-13",
        "run_id": "run-ic-ptq-vit-tiny-int8",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-vit-tiny-int8-14",
        "run_id": "run-ic-ptq-vit-tiny-int8",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-ptq-ghostnetv2-fp32",
    "project_id": "project-ic-mnist",
    "name": "ghostnetv2 FP32 (PTQ Bench)",
    "status": "completed",
    "method": "baseline",
    "created_at": "2025-12-18T17:30:00Z",
    "started_at": "2025-12-18T17:31:00Z",
    "ended_at": "2025-12-18T17:38:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "FP32 baseline run for the PTQ benchmark suite (MNIST, 5% sample).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "ghostnetv2",
      "quantization": "fp32",
      "compression_method": "baseline",
      "backend": "x86",
      "benchmark_suite": "PTQ_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9294,
      "f1": 0.9194,
      "loss": 0.2465,
      "size_mb": 19.07,
      "latency_ms": 13.0,
      "memory_mb": 990,
      "throughput": 76.92,
      "params_million": 5.0,
      "compression_ratio": 1.0,
      "quantization_bits": 32,
      "device": "cpu"
    },
    "baseline_run_id": null,
    "parent_run_id": null,
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-ptq-ghostnetv2-fp32-01",
        "run_id": "run-ic-ptq-ghostnetv2-fp32",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-ghostnetv2-fp32-02",
        "run_id": "run-ic-ptq-ghostnetv2-fp32",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-ghostnetv2-fp32-03",
        "run_id": "run-ic-ptq-ghostnetv2-fp32",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-ghostnetv2-fp32-04",
        "run_id": "run-ic-ptq-ghostnetv2-fp32",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-ghostnetv2-fp32-05",
        "run_id": "run-ic-ptq-ghostnetv2-fp32",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-ghostnetv2-fp32-06",
        "run_id": "run-ic-ptq-ghostnetv2-fp32",
        "key": "benchmark.num_epochs",
        "value": 25,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-ghostnetv2-fp32-07",
        "run_id": "run-ic-ptq-ghostnetv2-fp32",
        "key": "benchmark.model",
        "value": "ghostnetv2",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-ghostnetv2-fp32-08",
        "run_id": "run-ic-ptq-ghostnetv2-fp32",
        "key": "compression.quantization",
        "value": "fp32",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-ghostnetv2-fp32-09",
        "run_id": "run-ic-ptq-ghostnetv2-fp32",
        "key": "compression.method",
        "value": "none",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-ghostnetv2-fp32-10",
        "run_id": "run-ic-ptq-ghostnetv2-fp32",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-ghostnetv2-fp32-11",
        "run_id": "run-ic-ptq-ghostnetv2-fp32",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-ptq-ghostnetv2-fp32-12",
        "run_id": "run-ic-ptq-ghostnetv2-fp32",
        "key": "benchmark.suite",
        "value": "PTQ_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-ghostnetv2-fp32-13",
        "run_id": "run-ic-ptq-ghostnetv2-fp32",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-ghostnetv2-fp32-14",
        "run_id": "run-ic-ptq-ghostnetv2-fp32",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-ptq-ghostnetv2-int8",
    "project_id": "project-ic-mnist",
    "name": "ghostnetv2 INT8 PTQ",
    "status": "completed",
    "method": "ptq",
    "created_at": "2025-12-18T17:32:00Z",
    "started_at": "2025-12-18T17:33:00Z",
    "ended_at": "2025-12-18T17:36:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "Post-training quantization to INT8 using the x86 backend (compare vs FP32 baseline).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "ghostnetv2",
      "quantization": "int8",
      "compression_method": "ptq",
      "backend": "x86",
      "benchmark_suite": "PTQ_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9254,
      "f1": 0.9154,
      "loss": 0.2565,
      "size_mb": 6.1,
      "latency_ms": 10.4,
      "memory_mb": 772,
      "throughput": 96.15,
      "params_million": 5.0,
      "compression_ratio": 3.13,
      "quantization_bits": 8,
      "device": "cpu"
    },
    "baseline_run_id": "run-ic-ptq-ghostnetv2-fp32",
    "parent_run_id": "run-ic-ptq-ghostnetv2-fp32",
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-ptq-ghostnetv2-int8-01",
        "run_id": "run-ic-ptq-ghostnetv2-int8",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-ghostnetv2-int8-02",
        "run_id": "run-ic-ptq-ghostnetv2-int8",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-ghostnetv2-int8-03",
        "run_id": "run-ic-ptq-ghostnetv2-int8",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-ghostnetv2-int8-04",
        "run_id": "run-ic-ptq-ghostnetv2-int8",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-ghostnetv2-int8-05",
        "run_id": "run-ic-ptq-ghostnetv2-int8",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-ghostnetv2-int8-06",
        "run_id": "run-ic-ptq-ghostnetv2-int8",
        "key": "benchmark.num_epochs",
        "value": 25,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-ghostnetv2-int8-07",
        "run_id": "run-ic-ptq-ghostnetv2-int8",
        "key": "benchmark.model",
        "value": "ghostnetv2",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-ghostnetv2-int8-08",
        "run_id": "run-ic-ptq-ghostnetv2-int8",
        "key": "compression.quantization",
        "value": "int8",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-ghostnetv2-int8-09",
        "run_id": "run-ic-ptq-ghostnetv2-int8",
        "key": "compression.method",
        "value": "ptq",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-ghostnetv2-int8-10",
        "run_id": "run-ic-ptq-ghostnetv2-int8",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-ghostnetv2-int8-11",
        "run_id": "run-ic-ptq-ghostnetv2-int8",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-ptq-ghostnetv2-int8-12",
        "run_id": "run-ic-ptq-ghostnetv2-int8",
        "key": "benchmark.suite",
        "value": "PTQ_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-ghostnetv2-int8-13",
        "run_id": "run-ic-ptq-ghostnetv2-int8",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-ghostnetv2-int8-14",
        "run_id": "run-ic-ptq-ghostnetv2-int8",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-ptq-tinynet-a-fp32",
    "project_id": "project-ic-mnist",
    "name": "tinynet-a FP32 (PTQ Bench)",
    "status": "completed",
    "method": "baseline",
    "created_at": "2025-12-18T17:40:00Z",
    "started_at": "2025-12-18T17:41:00Z",
    "ended_at": "2025-12-18T17:48:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "FP32 baseline run for the PTQ benchmark suite (MNIST, 5% sample).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "tinynet-a",
      "quantization": "fp32",
      "compression_method": "baseline",
      "backend": "x86",
      "benchmark_suite": "PTQ_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9278,
      "f1": 0.9178,
      "loss": 0.2467,
      "size_mb": 11.44,
      "latency_ms": 8.5,
      "memory_mb": 954,
      "throughput": 117.65,
      "params_million": 3.0,
      "compression_ratio": 1.0,
      "quantization_bits": 32,
      "device": "cpu"
    },
    "baseline_run_id": null,
    "parent_run_id": null,
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-ptq-tinynet-a-fp32-01",
        "run_id": "run-ic-ptq-tinynet-a-fp32",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-tinynet-a-fp32-02",
        "run_id": "run-ic-ptq-tinynet-a-fp32",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-tinynet-a-fp32-03",
        "run_id": "run-ic-ptq-tinynet-a-fp32",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-tinynet-a-fp32-04",
        "run_id": "run-ic-ptq-tinynet-a-fp32",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-tinynet-a-fp32-05",
        "run_id": "run-ic-ptq-tinynet-a-fp32",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-tinynet-a-fp32-06",
        "run_id": "run-ic-ptq-tinynet-a-fp32",
        "key": "benchmark.num_epochs",
        "value": 25,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-tinynet-a-fp32-07",
        "run_id": "run-ic-ptq-tinynet-a-fp32",
        "key": "benchmark.model",
        "value": "tinynet-a",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-tinynet-a-fp32-08",
        "run_id": "run-ic-ptq-tinynet-a-fp32",
        "key": "compression.quantization",
        "value": "fp32",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-tinynet-a-fp32-09",
        "run_id": "run-ic-ptq-tinynet-a-fp32",
        "key": "compression.method",
        "value": "none",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-tinynet-a-fp32-10",
        "run_id": "run-ic-ptq-tinynet-a-fp32",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-tinynet-a-fp32-11",
        "run_id": "run-ic-ptq-tinynet-a-fp32",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-ptq-tinynet-a-fp32-12",
        "run_id": "run-ic-ptq-tinynet-a-fp32",
        "key": "benchmark.suite",
        "value": "PTQ_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-tinynet-a-fp32-13",
        "run_id": "run-ic-ptq-tinynet-a-fp32",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-tinynet-a-fp32-14",
        "run_id": "run-ic-ptq-tinynet-a-fp32",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-ptq-tinynet-a-int8",
    "project_id": "project-ic-mnist",
    "name": "tinynet-a INT8 PTQ",
    "status": "completed",
    "method": "ptq",
    "created_at": "2025-12-18T17:42:00Z",
    "started_at": "2025-12-18T17:43:00Z",
    "ended_at": "2025-12-18T17:46:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "Post-training quantization to INT8 using the x86 backend (compare vs FP32 baseline).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "tinynet-a",
      "quantization": "int8",
      "compression_method": "ptq",
      "backend": "x86",
      "benchmark_suite": "PTQ_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9238,
      "f1": 0.9138,
      "loss": 0.2567,
      "size_mb": 3.66,
      "latency_ms": 7.82,
      "memory_mb": 744,
      "throughput": 127.88,
      "params_million": 3.0,
      "compression_ratio": 3.13,
      "quantization_bits": 8,
      "device": "cpu"
    },
    "baseline_run_id": "run-ic-ptq-tinynet-a-fp32",
    "parent_run_id": "run-ic-ptq-tinynet-a-fp32",
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-ptq-tinynet-a-int8-01",
        "run_id": "run-ic-ptq-tinynet-a-int8",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-tinynet-a-int8-02",
        "run_id": "run-ic-ptq-tinynet-a-int8",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-tinynet-a-int8-03",
        "run_id": "run-ic-ptq-tinynet-a-int8",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-tinynet-a-int8-04",
        "run_id": "run-ic-ptq-tinynet-a-int8",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-tinynet-a-int8-05",
        "run_id": "run-ic-ptq-tinynet-a-int8",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-tinynet-a-int8-06",
        "run_id": "run-ic-ptq-tinynet-a-int8",
        "key": "benchmark.num_epochs",
        "value": 25,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-ptq-tinynet-a-int8-07",
        "run_id": "run-ic-ptq-tinynet-a-int8",
        "key": "benchmark.model",
        "value": "tinynet-a",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-tinynet-a-int8-08",
        "run_id": "run-ic-ptq-tinynet-a-int8",
        "key": "compression.quantization",
        "value": "int8",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-tinynet-a-int8-09",
        "run_id": "run-ic-ptq-tinynet-a-int8",
        "key": "compression.method",
        "value": "ptq",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-tinynet-a-int8-10",
        "run_id": "run-ic-ptq-tinynet-a-int8",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-tinynet-a-int8-11",
        "run_id": "run-ic-ptq-tinynet-a-int8",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-ptq-tinynet-a-int8-12",
        "run_id": "run-ic-ptq-tinynet-a-int8",
        "key": "benchmark.suite",
        "value": "PTQ_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-tinynet-a-int8-13",
        "run_id": "run-ic-ptq-tinynet-a-int8",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-ptq-tinynet-a-int8-14",
        "run_id": "run-ic-ptq-tinynet-a-int8",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-qat-resnet18-fp32",
    "project_id": "project-ic-mnist",
    "name": "resnet18 FP32 (QAT Bench)",
    "status": "completed",
    "method": "baseline",
    "created_at": "2025-12-19T17:00:00Z",
    "started_at": "2025-12-19T17:01:00Z",
    "ended_at": "2025-12-19T17:07:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "FP32 baseline run for the QAT benchmark suite (short run used as reference for QAT).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "resnet18",
      "quantization": "fp32",
      "compression_method": "baseline",
      "backend": "x86",
      "benchmark_suite": "QAT_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9139,
      "f1": 0.9019,
      "loss": 0.3479,
      "size_mb": 21.25,
      "latency_ms": 14.18,
      "memory_mb": 1037,
      "throughput": 70.52,
      "params_million": 11.7,
      "compression_ratio": 1.0,
      "quantization_bits": 32,
      "device": "cpu"
    },
    "baseline_run_id": null,
    "parent_run_id": null,
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-qat-resnet18-fp32-01",
        "run_id": "run-ic-qat-resnet18-fp32",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-resnet18-fp32-02",
        "run_id": "run-ic-qat-resnet18-fp32",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-resnet18-fp32-03",
        "run_id": "run-ic-qat-resnet18-fp32",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-resnet18-fp32-04",
        "run_id": "run-ic-qat-resnet18-fp32",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-resnet18-fp32-05",
        "run_id": "run-ic-qat-resnet18-fp32",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-resnet18-fp32-06",
        "run_id": "run-ic-qat-resnet18-fp32",
        "key": "benchmark.num_epochs",
        "value": 3,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-resnet18-fp32-07",
        "run_id": "run-ic-qat-resnet18-fp32",
        "key": "benchmark.model",
        "value": "resnet18",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-resnet18-fp32-08",
        "run_id": "run-ic-qat-resnet18-fp32",
        "key": "compression.quantization",
        "value": "fp32",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-resnet18-fp32-09",
        "run_id": "run-ic-qat-resnet18-fp32",
        "key": "compression.method",
        "value": "none",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-resnet18-fp32-10",
        "run_id": "run-ic-qat-resnet18-fp32",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-resnet18-fp32-11",
        "run_id": "run-ic-qat-resnet18-fp32",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-qat-resnet18-fp32-12",
        "run_id": "run-ic-qat-resnet18-fp32",
        "key": "benchmark.suite",
        "value": "QAT_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-resnet18-fp32-13",
        "run_id": "run-ic-qat-resnet18-fp32",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-resnet18-fp32-14",
        "run_id": "run-ic-qat-resnet18-fp32",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-qat-resnet18-int8",
    "project_id": "project-ic-mnist",
    "name": "resnet18 INT8 QAT",
    "status": "completed",
    "method": "qat",
    "created_at": "2025-12-19T17:02:00Z",
    "started_at": "2025-12-19T17:03:00Z",
    "ended_at": "2025-12-19T17:10:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "Quantization-aware training to INT8 (short fine-tune run, compare vs FP32 QAT baseline).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "resnet18",
      "quantization": "int8",
      "compression_method": "qat",
      "backend": "x86",
      "benchmark_suite": "QAT_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9109,
      "f1": 0.8989,
      "loss": 0.3559,
      "size_mb": 5.43,
      "latency_ms": 11.53,
      "memory_mb": 829,
      "throughput": 86.73,
      "params_million": 11.7,
      "compression_ratio": 3.91,
      "quantization_bits": 8,
      "device": "cpu"
    },
    "baseline_run_id": "run-ic-qat-resnet18-fp32",
    "parent_run_id": "run-ic-qat-resnet18-fp32",
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "contract_result": {
      "pass": true,
      "run_id": "run-ic-qat-resnet18-int8",
      "gate_results": [
        { "id": "accuracy_gate", "role": "quality", "metric": { "name": "accuracy" }, "run_value": 0.9109, "pass": true },
        { "id": "latency_gate", "role": "performance", "metric": { "name": "latency_ms" }, "run_value": 11.53, "pass": true }
      ]
    },
    "params": [
      {
        "id": "param-run-ic-qat-resnet18-int8-01",
        "run_id": "run-ic-qat-resnet18-int8",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-resnet18-int8-02",
        "run_id": "run-ic-qat-resnet18-int8",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-resnet18-int8-03",
        "run_id": "run-ic-qat-resnet18-int8",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-resnet18-int8-04",
        "run_id": "run-ic-qat-resnet18-int8",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-resnet18-int8-05",
        "run_id": "run-ic-qat-resnet18-int8",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-resnet18-int8-06",
        "run_id": "run-ic-qat-resnet18-int8",
        "key": "benchmark.num_epochs",
        "value": 3,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-resnet18-int8-07",
        "run_id": "run-ic-qat-resnet18-int8",
        "key": "benchmark.model",
        "value": "resnet18",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-resnet18-int8-08",
        "run_id": "run-ic-qat-resnet18-int8",
        "key": "compression.quantization",
        "value": "int8",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-resnet18-int8-09",
        "run_id": "run-ic-qat-resnet18-int8",
        "key": "compression.method",
        "value": "qat",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-resnet18-int8-10",
        "run_id": "run-ic-qat-resnet18-int8",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-resnet18-int8-11",
        "run_id": "run-ic-qat-resnet18-int8",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-qat-resnet18-int8-12",
        "run_id": "run-ic-qat-resnet18-int8",
        "key": "benchmark.suite",
        "value": "QAT_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-resnet18-int8-13",
        "run_id": "run-ic-qat-resnet18-int8",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-resnet18-int8-14",
        "run_id": "run-ic-qat-resnet18-int8",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-qat-resnet50-fp32",
    "project_id": "project-ic-mnist",
    "name": "resnet50 FP32 (QAT Bench)",
    "status": "completed",
    "method": "baseline",
    "created_at": "2025-12-19T17:12:00Z",
    "started_at": "2025-12-19T17:13:00Z",
    "ended_at": "2025-12-19T17:19:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "FP32 baseline run for the QAT benchmark suite (short run used as reference for QAT).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "resnet50",
      "quantization": "fp32",
      "compression_method": "baseline",
      "backend": "x86",
      "benchmark_suite": "QAT_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9194,
      "f1": 0.9074,
      "loss": 0.3471,
      "size_mb": 91.65,
      "latency_ms": 22.47,
      "memory_mb": 1259,
      "throughput": 44.5,
      "params_million": 25.6,
      "compression_ratio": 1.0,
      "quantization_bits": 32,
      "device": "cpu"
    },
    "baseline_run_id": null,
    "parent_run_id": null,
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-qat-resnet50-fp32-01",
        "run_id": "run-ic-qat-resnet50-fp32",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-resnet50-fp32-02",
        "run_id": "run-ic-qat-resnet50-fp32",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-resnet50-fp32-03",
        "run_id": "run-ic-qat-resnet50-fp32",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-resnet50-fp32-04",
        "run_id": "run-ic-qat-resnet50-fp32",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-resnet50-fp32-05",
        "run_id": "run-ic-qat-resnet50-fp32",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-resnet50-fp32-06",
        "run_id": "run-ic-qat-resnet50-fp32",
        "key": "benchmark.num_epochs",
        "value": 3,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-resnet50-fp32-07",
        "run_id": "run-ic-qat-resnet50-fp32",
        "key": "benchmark.model",
        "value": "resnet50",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-resnet50-fp32-08",
        "run_id": "run-ic-qat-resnet50-fp32",
        "key": "compression.quantization",
        "value": "fp32",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-resnet50-fp32-09",
        "run_id": "run-ic-qat-resnet50-fp32",
        "key": "compression.method",
        "value": "none",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-resnet50-fp32-10",
        "run_id": "run-ic-qat-resnet50-fp32",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-resnet50-fp32-11",
        "run_id": "run-ic-qat-resnet50-fp32",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-qat-resnet50-fp32-12",
        "run_id": "run-ic-qat-resnet50-fp32",
        "key": "benchmark.suite",
        "value": "QAT_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-resnet50-fp32-13",
        "run_id": "run-ic-qat-resnet50-fp32",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-resnet50-fp32-14",
        "run_id": "run-ic-qat-resnet50-fp32",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-qat-resnet50-int8",
    "project_id": "project-ic-mnist",
    "name": "resnet50 INT8 QAT",
    "status": "completed",
    "method": "qat",
    "created_at": "2025-12-19T17:14:00Z",
    "started_at": "2025-12-19T17:15:00Z",
    "ended_at": "2025-12-19T17:22:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "Quantization-aware training to INT8 (short fine-tune run, compare vs FP32 QAT baseline).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "resnet50",
      "quantization": "int8",
      "compression_method": "qat",
      "backend": "x86",
      "benchmark_suite": "QAT_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9164,
      "f1": 0.9044,
      "loss": 0.3551,
      "size_mb": 23.39,
      "latency_ms": 22.79,
      "memory_mb": 1007,
      "throughput": 43.88,
      "params_million": 25.6,
      "compression_ratio": 3.92,
      "quantization_bits": 8,
      "device": "cpu"
    },
    "baseline_run_id": "run-ic-qat-resnet50-fp32",
    "parent_run_id": "run-ic-qat-resnet50-fp32",
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-qat-resnet50-int8-01",
        "run_id": "run-ic-qat-resnet50-int8",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-resnet50-int8-02",
        "run_id": "run-ic-qat-resnet50-int8",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-resnet50-int8-03",
        "run_id": "run-ic-qat-resnet50-int8",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-resnet50-int8-04",
        "run_id": "run-ic-qat-resnet50-int8",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-resnet50-int8-05",
        "run_id": "run-ic-qat-resnet50-int8",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-resnet50-int8-06",
        "run_id": "run-ic-qat-resnet50-int8",
        "key": "benchmark.num_epochs",
        "value": 3,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-resnet50-int8-07",
        "run_id": "run-ic-qat-resnet50-int8",
        "key": "benchmark.model",
        "value": "resnet50",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-resnet50-int8-08",
        "run_id": "run-ic-qat-resnet50-int8",
        "key": "compression.quantization",
        "value": "int8",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-resnet50-int8-09",
        "run_id": "run-ic-qat-resnet50-int8",
        "key": "compression.method",
        "value": "qat",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-resnet50-int8-10",
        "run_id": "run-ic-qat-resnet50-int8",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-resnet50-int8-11",
        "run_id": "run-ic-qat-resnet50-int8",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-qat-resnet50-int8-12",
        "run_id": "run-ic-qat-resnet50-int8",
        "key": "benchmark.suite",
        "value": "QAT_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-resnet50-int8-13",
        "run_id": "run-ic-qat-resnet50-int8",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-resnet50-int8-14",
        "run_id": "run-ic-qat-resnet50-int8",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-qat-mobilenetv2-fp32",
    "project_id": "project-ic-mnist",
    "name": "mobilenetv2 FP32 (QAT Bench)",
    "status": "completed",
    "method": "baseline",
    "created_at": "2025-12-19T17:24:00Z",
    "started_at": "2025-12-19T17:25:00Z",
    "ended_at": "2025-12-19T17:31:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "FP32 baseline run for the QAT benchmark suite (short run used as reference for QAT).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "mobilenetv2",
      "quantization": "fp32",
      "compression_method": "baseline",
      "backend": "x86",
      "benchmark_suite": "QAT_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9082,
      "f1": 0.8962,
      "loss": 0.3488,
      "size_mb": 8.99,
      "latency_ms": 15.05,
      "memory_mb": 906,
      "throughput": 66.45,
      "params_million": 3.5,
      "compression_ratio": 1.0,
      "quantization_bits": 32,
      "device": "cpu"
    },
    "baseline_run_id": null,
    "parent_run_id": null,
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-qat-mobilenetv2-fp32-01",
        "run_id": "run-ic-qat-mobilenetv2-fp32",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-mobilenetv2-fp32-02",
        "run_id": "run-ic-qat-mobilenetv2-fp32",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-mobilenetv2-fp32-03",
        "run_id": "run-ic-qat-mobilenetv2-fp32",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-mobilenetv2-fp32-04",
        "run_id": "run-ic-qat-mobilenetv2-fp32",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-mobilenetv2-fp32-05",
        "run_id": "run-ic-qat-mobilenetv2-fp32",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-mobilenetv2-fp32-06",
        "run_id": "run-ic-qat-mobilenetv2-fp32",
        "key": "benchmark.num_epochs",
        "value": 3,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-mobilenetv2-fp32-07",
        "run_id": "run-ic-qat-mobilenetv2-fp32",
        "key": "benchmark.model",
        "value": "mobilenetv2",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-mobilenetv2-fp32-08",
        "run_id": "run-ic-qat-mobilenetv2-fp32",
        "key": "compression.quantization",
        "value": "fp32",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-mobilenetv2-fp32-09",
        "run_id": "run-ic-qat-mobilenetv2-fp32",
        "key": "compression.method",
        "value": "none",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-mobilenetv2-fp32-10",
        "run_id": "run-ic-qat-mobilenetv2-fp32",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-mobilenetv2-fp32-11",
        "run_id": "run-ic-qat-mobilenetv2-fp32",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-qat-mobilenetv2-fp32-12",
        "run_id": "run-ic-qat-mobilenetv2-fp32",
        "key": "benchmark.suite",
        "value": "QAT_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-mobilenetv2-fp32-13",
        "run_id": "run-ic-qat-mobilenetv2-fp32",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-mobilenetv2-fp32-14",
        "run_id": "run-ic-qat-mobilenetv2-fp32",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-qat-mobilenetv2-int8",
    "project_id": "project-ic-mnist",
    "name": "mobilenetv2 INT8 QAT",
    "status": "completed",
    "method": "qat",
    "created_at": "2025-12-19T17:26:00Z",
    "started_at": "2025-12-19T17:27:00Z",
    "ended_at": "2025-12-19T17:34:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "Quantization-aware training to INT8 (short fine-tune run, compare vs FP32 QAT baseline).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "mobilenetv2",
      "quantization": "int8",
      "compression_method": "qat",
      "backend": "x86",
      "benchmark_suite": "QAT_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9052,
      "f1": 0.8932,
      "loss": 0.3568,
      "size_mb": 2.55,
      "latency_ms": 12.13,
      "memory_mb": 724,
      "throughput": 82.44,
      "params_million": 3.5,
      "compression_ratio": 3.53,
      "quantization_bits": 8,
      "device": "cpu"
    },
    "baseline_run_id": "run-ic-qat-mobilenetv2-fp32",
    "parent_run_id": "run-ic-qat-mobilenetv2-fp32",
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-qat-mobilenetv2-int8-01",
        "run_id": "run-ic-qat-mobilenetv2-int8",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-mobilenetv2-int8-02",
        "run_id": "run-ic-qat-mobilenetv2-int8",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-mobilenetv2-int8-03",
        "run_id": "run-ic-qat-mobilenetv2-int8",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-mobilenetv2-int8-04",
        "run_id": "run-ic-qat-mobilenetv2-int8",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-mobilenetv2-int8-05",
        "run_id": "run-ic-qat-mobilenetv2-int8",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-mobilenetv2-int8-06",
        "run_id": "run-ic-qat-mobilenetv2-int8",
        "key": "benchmark.num_epochs",
        "value": 3,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-mobilenetv2-int8-07",
        "run_id": "run-ic-qat-mobilenetv2-int8",
        "key": "benchmark.model",
        "value": "mobilenetv2",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-mobilenetv2-int8-08",
        "run_id": "run-ic-qat-mobilenetv2-int8",
        "key": "compression.quantization",
        "value": "int8",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-mobilenetv2-int8-09",
        "run_id": "run-ic-qat-mobilenetv2-int8",
        "key": "compression.method",
        "value": "qat",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-mobilenetv2-int8-10",
        "run_id": "run-ic-qat-mobilenetv2-int8",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-mobilenetv2-int8-11",
        "run_id": "run-ic-qat-mobilenetv2-int8",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-qat-mobilenetv2-int8-12",
        "run_id": "run-ic-qat-mobilenetv2-int8",
        "key": "benchmark.suite",
        "value": "QAT_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-mobilenetv2-int8-13",
        "run_id": "run-ic-qat-mobilenetv2-int8",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-mobilenetv2-int8-14",
        "run_id": "run-ic-qat-mobilenetv2-int8",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-qat-inception_v3-fp32",
    "project_id": "project-ic-mnist",
    "name": "inception_v3 FP32 (QAT Bench)",
    "status": "completed",
    "method": "baseline",
    "created_at": "2025-12-19T17:36:00Z",
    "started_at": "2025-12-19T17:37:00Z",
    "ended_at": "2025-12-19T17:43:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "FP32 baseline run for the QAT benchmark suite (short run used as reference for QAT).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "inception_v3",
      "quantization": "fp32",
      "compression_method": "baseline",
      "backend": "x86",
      "benchmark_suite": "QAT_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9189,
      "f1": 0.9069,
      "loss": 0.3472,
      "size_mb": 81.58,
      "latency_ms": 33.77,
      "memory_mb": 1230,
      "throughput": 29.61,
      "params_million": 23.8,
      "compression_ratio": 1.0,
      "quantization_bits": 32,
      "device": "cpu"
    },
    "baseline_run_id": null,
    "parent_run_id": null,
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-qat-inception_v3-fp32-01",
        "run_id": "run-ic-qat-inception_v3-fp32",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-inception_v3-fp32-02",
        "run_id": "run-ic-qat-inception_v3-fp32",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-inception_v3-fp32-03",
        "run_id": "run-ic-qat-inception_v3-fp32",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-inception_v3-fp32-04",
        "run_id": "run-ic-qat-inception_v3-fp32",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-inception_v3-fp32-05",
        "run_id": "run-ic-qat-inception_v3-fp32",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-inception_v3-fp32-06",
        "run_id": "run-ic-qat-inception_v3-fp32",
        "key": "benchmark.num_epochs",
        "value": 3,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-inception_v3-fp32-07",
        "run_id": "run-ic-qat-inception_v3-fp32",
        "key": "benchmark.model",
        "value": "inception_v3",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-inception_v3-fp32-08",
        "run_id": "run-ic-qat-inception_v3-fp32",
        "key": "compression.quantization",
        "value": "fp32",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-inception_v3-fp32-09",
        "run_id": "run-ic-qat-inception_v3-fp32",
        "key": "compression.method",
        "value": "none",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-inception_v3-fp32-10",
        "run_id": "run-ic-qat-inception_v3-fp32",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-inception_v3-fp32-11",
        "run_id": "run-ic-qat-inception_v3-fp32",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-qat-inception_v3-fp32-12",
        "run_id": "run-ic-qat-inception_v3-fp32",
        "key": "benchmark.suite",
        "value": "QAT_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-inception_v3-fp32-13",
        "run_id": "run-ic-qat-inception_v3-fp32",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-inception_v3-fp32-14",
        "run_id": "run-ic-qat-inception_v3-fp32",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-qat-inception_v3-int8",
    "project_id": "project-ic-mnist",
    "name": "inception_v3 INT8 QAT",
    "status": "completed",
    "method": "qat",
    "created_at": "2025-12-19T17:38:00Z",
    "started_at": "2025-12-19T17:39:00Z",
    "ended_at": "2025-12-19T17:46:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "Quantization-aware training to INT8 (short fine-tune run, compare vs FP32 QAT baseline).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "inception_v3",
      "quantization": "int8",
      "compression_method": "qat",
      "backend": "x86",
      "benchmark_suite": "QAT_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9159,
      "f1": 0.9039,
      "loss": 0.3552,
      "size_mb": 20.61,
      "latency_ms": 25.49,
      "memory_mb": 984,
      "throughput": 39.23,
      "params_million": 23.8,
      "compression_ratio": 3.96,
      "quantization_bits": 8,
      "device": "cpu"
    },
    "baseline_run_id": "run-ic-qat-inception_v3-fp32",
    "parent_run_id": "run-ic-qat-inception_v3-fp32",
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-qat-inception_v3-int8-01",
        "run_id": "run-ic-qat-inception_v3-int8",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-inception_v3-int8-02",
        "run_id": "run-ic-qat-inception_v3-int8",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-inception_v3-int8-03",
        "run_id": "run-ic-qat-inception_v3-int8",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-inception_v3-int8-04",
        "run_id": "run-ic-qat-inception_v3-int8",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-inception_v3-int8-05",
        "run_id": "run-ic-qat-inception_v3-int8",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-inception_v3-int8-06",
        "run_id": "run-ic-qat-inception_v3-int8",
        "key": "benchmark.num_epochs",
        "value": 3,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-inception_v3-int8-07",
        "run_id": "run-ic-qat-inception_v3-int8",
        "key": "benchmark.model",
        "value": "inception_v3",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-inception_v3-int8-08",
        "run_id": "run-ic-qat-inception_v3-int8",
        "key": "compression.quantization",
        "value": "int8",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-inception_v3-int8-09",
        "run_id": "run-ic-qat-inception_v3-int8",
        "key": "compression.method",
        "value": "qat",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-inception_v3-int8-10",
        "run_id": "run-ic-qat-inception_v3-int8",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-inception_v3-int8-11",
        "run_id": "run-ic-qat-inception_v3-int8",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-qat-inception_v3-int8-12",
        "run_id": "run-ic-qat-inception_v3-int8",
        "key": "benchmark.suite",
        "value": "QAT_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-inception_v3-int8-13",
        "run_id": "run-ic-qat-inception_v3-int8",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-inception_v3-int8-14",
        "run_id": "run-ic-qat-inception_v3-int8",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-qat-googlenet-fp32",
    "project_id": "project-ic-mnist",
    "name": "googlenet FP32 (QAT Bench)",
    "status": "completed",
    "method": "baseline",
    "created_at": "2025-12-19T17:48:00Z",
    "started_at": "2025-12-19T17:49:00Z",
    "ended_at": "2025-12-19T17:55:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "FP32 baseline run for the QAT benchmark suite (short run used as reference for QAT).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "googlenet",
      "quantization": "fp32",
      "compression_method": "baseline",
      "backend": "x86",
      "benchmark_suite": "QAT_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9106,
      "f1": 0.8986,
      "loss": 0.3484,
      "size_mb": 25.21,
      "latency_ms": 12.22,
      "memory_mb": 955,
      "throughput": 81.83,
      "params_million": 6.6,
      "compression_ratio": 1.0,
      "quantization_bits": 32,
      "device": "cpu"
    },
    "baseline_run_id": null,
    "parent_run_id": null,
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-qat-googlenet-fp32-01",
        "run_id": "run-ic-qat-googlenet-fp32",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-googlenet-fp32-02",
        "run_id": "run-ic-qat-googlenet-fp32",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-googlenet-fp32-03",
        "run_id": "run-ic-qat-googlenet-fp32",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-googlenet-fp32-04",
        "run_id": "run-ic-qat-googlenet-fp32",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-googlenet-fp32-05",
        "run_id": "run-ic-qat-googlenet-fp32",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-googlenet-fp32-06",
        "run_id": "run-ic-qat-googlenet-fp32",
        "key": "benchmark.num_epochs",
        "value": 3,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-googlenet-fp32-07",
        "run_id": "run-ic-qat-googlenet-fp32",
        "key": "benchmark.model",
        "value": "googlenet",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-googlenet-fp32-08",
        "run_id": "run-ic-qat-googlenet-fp32",
        "key": "compression.quantization",
        "value": "fp32",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-googlenet-fp32-09",
        "run_id": "run-ic-qat-googlenet-fp32",
        "key": "compression.method",
        "value": "none",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-googlenet-fp32-10",
        "run_id": "run-ic-qat-googlenet-fp32",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-googlenet-fp32-11",
        "run_id": "run-ic-qat-googlenet-fp32",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-qat-googlenet-fp32-12",
        "run_id": "run-ic-qat-googlenet-fp32",
        "key": "benchmark.suite",
        "value": "QAT_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-googlenet-fp32-13",
        "run_id": "run-ic-qat-googlenet-fp32",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-googlenet-fp32-14",
        "run_id": "run-ic-qat-googlenet-fp32",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-qat-googlenet-int8",
    "project_id": "project-ic-mnist",
    "name": "googlenet INT8 QAT",
    "status": "completed",
    "method": "qat",
    "created_at": "2025-12-19T17:50:00Z",
    "started_at": "2025-12-19T17:51:00Z",
    "ended_at": "2025-12-19T17:58:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "Quantization-aware training to INT8 (short fine-tune run, compare vs FP32 QAT baseline).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "googlenet",
      "quantization": "int8",
      "compression_method": "qat",
      "backend": "x86",
      "benchmark_suite": "QAT_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9076,
      "f1": 0.8956,
      "loss": 0.3564,
      "size_mb": 6.39,
      "latency_ms": 9.54,
      "memory_mb": 764,
      "throughput": 104.82,
      "params_million": 6.6,
      "compression_ratio": 3.95,
      "quantization_bits": 8,
      "device": "cpu"
    },
    "baseline_run_id": "run-ic-qat-googlenet-fp32",
    "parent_run_id": "run-ic-qat-googlenet-fp32",
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-qat-googlenet-int8-01",
        "run_id": "run-ic-qat-googlenet-int8",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-googlenet-int8-02",
        "run_id": "run-ic-qat-googlenet-int8",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-googlenet-int8-03",
        "run_id": "run-ic-qat-googlenet-int8",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-googlenet-int8-04",
        "run_id": "run-ic-qat-googlenet-int8",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-googlenet-int8-05",
        "run_id": "run-ic-qat-googlenet-int8",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-googlenet-int8-06",
        "run_id": "run-ic-qat-googlenet-int8",
        "key": "benchmark.num_epochs",
        "value": 3,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-googlenet-int8-07",
        "run_id": "run-ic-qat-googlenet-int8",
        "key": "benchmark.model",
        "value": "googlenet",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-googlenet-int8-08",
        "run_id": "run-ic-qat-googlenet-int8",
        "key": "compression.quantization",
        "value": "int8",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-googlenet-int8-09",
        "run_id": "run-ic-qat-googlenet-int8",
        "key": "compression.method",
        "value": "qat",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-googlenet-int8-10",
        "run_id": "run-ic-qat-googlenet-int8",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-googlenet-int8-11",
        "run_id": "run-ic-qat-googlenet-int8",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-qat-googlenet-int8-12",
        "run_id": "run-ic-qat-googlenet-int8",
        "key": "benchmark.suite",
        "value": "QAT_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-googlenet-int8-13",
        "run_id": "run-ic-qat-googlenet-int8",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-googlenet-int8-14",
        "run_id": "run-ic-qat-googlenet-int8",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-qat-shufflenetv2-0.5x-fp32",
    "project_id": "project-ic-mnist",
    "name": "shufflenetv2-0.5x FP32 (QAT Bench)",
    "status": "completed",
    "method": "baseline",
    "created_at": "2025-12-19T18:00:00Z",
    "started_at": "2025-12-19T18:01:00Z",
    "ended_at": "2025-12-19T18:07:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "FP32 baseline run for the QAT benchmark suite (short run used as reference for QAT).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "shufflenetv2-0.5x",
      "quantization": "fp32",
      "compression_method": "baseline",
      "backend": "x86",
      "benchmark_suite": "QAT_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9064,
      "f1": 0.8944,
      "loss": 0.349,
      "size_mb": 15.71,
      "latency_ms": 11.85,
      "memory_mb": 872,
      "throughput": 84.39,
      "params_million": 1.4,
      "compression_ratio": 1.0,
      "quantization_bits": 32,
      "device": "cpu"
    },
    "baseline_run_id": null,
    "parent_run_id": null,
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-qat-shufflenetv2-0.5x-fp32-01",
        "run_id": "run-ic-qat-shufflenetv2-0.5x-fp32",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-shufflenetv2-0.5x-fp32-02",
        "run_id": "run-ic-qat-shufflenetv2-0.5x-fp32",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-shufflenetv2-0.5x-fp32-03",
        "run_id": "run-ic-qat-shufflenetv2-0.5x-fp32",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-shufflenetv2-0.5x-fp32-04",
        "run_id": "run-ic-qat-shufflenetv2-0.5x-fp32",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-shufflenetv2-0.5x-fp32-05",
        "run_id": "run-ic-qat-shufflenetv2-0.5x-fp32",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-shufflenetv2-0.5x-fp32-06",
        "run_id": "run-ic-qat-shufflenetv2-0.5x-fp32",
        "key": "benchmark.num_epochs",
        "value": 3,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-shufflenetv2-0.5x-fp32-07",
        "run_id": "run-ic-qat-shufflenetv2-0.5x-fp32",
        "key": "benchmark.model",
        "value": "shufflenetv2-0.5x",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-shufflenetv2-0.5x-fp32-08",
        "run_id": "run-ic-qat-shufflenetv2-0.5x-fp32",
        "key": "compression.quantization",
        "value": "fp32",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-shufflenetv2-0.5x-fp32-09",
        "run_id": "run-ic-qat-shufflenetv2-0.5x-fp32",
        "key": "compression.method",
        "value": "none",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-shufflenetv2-0.5x-fp32-10",
        "run_id": "run-ic-qat-shufflenetv2-0.5x-fp32",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-shufflenetv2-0.5x-fp32-11",
        "run_id": "run-ic-qat-shufflenetv2-0.5x-fp32",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-qat-shufflenetv2-0.5x-fp32-12",
        "run_id": "run-ic-qat-shufflenetv2-0.5x-fp32",
        "key": "benchmark.suite",
        "value": "QAT_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-shufflenetv2-0.5x-fp32-13",
        "run_id": "run-ic-qat-shufflenetv2-0.5x-fp32",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-shufflenetv2-0.5x-fp32-14",
        "run_id": "run-ic-qat-shufflenetv2-0.5x-fp32",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ic-qat-shufflenetv2-0.5x-int8",
    "project_id": "project-ic-mnist",
    "name": "shufflenetv2-0.5x INT8 QAT",
    "status": "completed",
    "method": "qat",
    "created_at": "2025-12-19T18:02:00Z",
    "started_at": "2025-12-19T18:03:00Z",
    "ended_at": "2025-12-19T18:10:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "Quantization-aware training to INT8 (short fine-tune run, compare vs FP32 QAT baseline).",
    "tags": {
      "domain": "vision",
      "task": "image_classification",
      "dataset": "MNIST",
      "sample_rate": "0.05",
      "model": "shufflenetv2-0.5x",
      "quantization": "int8",
      "compression_method": "qat",
      "backend": "x86",
      "benchmark_suite": "QAT_001",
      "report": "PTQ_QAT_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9034,
      "f1": 0.8914,
      "loss": 0.357,
      "size_mb": 4.0,
      "latency_ms": 8.87,
      "memory_mb": 697,
      "throughput": 112.74,
      "params_million": 1.4,
      "compression_ratio": 3.93,
      "quantization_bits": 8,
      "device": "cpu"
    },
    "baseline_run_id": "run-ic-qat-shufflenetv2-0.5x-fp32",
    "parent_run_id": "run-ic-qat-shufflenetv2-0.5x-fp32",
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ic-qat-shufflenetv2-0.5x-int8-01",
        "run_id": "run-ic-qat-shufflenetv2-0.5x-int8",
        "key": "benchmark.dataset.name",
        "value": "MNIST",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-shufflenetv2-0.5x-int8-02",
        "run_id": "run-ic-qat-shufflenetv2-0.5x-int8",
        "key": "benchmark.dataset.sample_rate",
        "value": 0.05,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-shufflenetv2-0.5x-int8-03",
        "run_id": "run-ic-qat-shufflenetv2-0.5x-int8",
        "key": "benchmark.num_classes",
        "value": 10,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-shufflenetv2-0.5x-int8-04",
        "run_id": "run-ic-qat-shufflenetv2-0.5x-int8",
        "key": "benchmark.batch_size",
        "value": 32,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-shufflenetv2-0.5x-int8-05",
        "run_id": "run-ic-qat-shufflenetv2-0.5x-int8",
        "key": "benchmark.learning_rate",
        "value": 0.0001,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-shufflenetv2-0.5x-int8-06",
        "run_id": "run-ic-qat-shufflenetv2-0.5x-int8",
        "key": "benchmark.num_epochs",
        "value": 3,
        "value_type": "number"
      },
      {
        "id": "param-run-ic-qat-shufflenetv2-0.5x-int8-07",
        "run_id": "run-ic-qat-shufflenetv2-0.5x-int8",
        "key": "benchmark.model",
        "value": "shufflenetv2-0.5x",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-shufflenetv2-0.5x-int8-08",
        "run_id": "run-ic-qat-shufflenetv2-0.5x-int8",
        "key": "compression.quantization",
        "value": "int8",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-shufflenetv2-0.5x-int8-09",
        "run_id": "run-ic-qat-shufflenetv2-0.5x-int8",
        "key": "compression.method",
        "value": "qat",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-shufflenetv2-0.5x-int8-10",
        "run_id": "run-ic-qat-shufflenetv2-0.5x-int8",
        "key": "compression.backend",
        "value": "x86",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-shufflenetv2-0.5x-int8-11",
        "run_id": "run-ic-qat-shufflenetv2-0.5x-int8",
        "key": "compression.compare_to_baseline",
        "value": true,
        "value_type": "boolean"
      },
      {
        "id": "param-run-ic-qat-shufflenetv2-0.5x-int8-12",
        "run_id": "run-ic-qat-shufflenetv2-0.5x-int8",
        "key": "benchmark.suite",
        "value": "QAT_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-shufflenetv2-0.5x-int8-13",
        "run_id": "run-ic-qat-shufflenetv2-0.5x-int8",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ic-qat-shufflenetv2-0.5x-int8-14",
        "run_id": "run-ic-qat-shufflenetv2-0.5x-int8",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ts-cnc-cnn_lstm-fp32",
    "project_id": "project-ts-cnc",
    "name": "cnn_lstm FP32",
    "status": "completed",
    "method": "baseline",
    "created_at": "2025-12-15T16:00:00Z",
    "started_at": "2025-12-15T16:02:00Z",
    "ended_at": "2025-12-15T16:25:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "Baseline model evaluation on Bosch CNC industrial time-series dataset (machine-wise split).",
    "tags": {
      "domain": "timeseries",
      "task": "multiclass_classification",
      "dataset": "Bosch CNC",
      "split_strategy": "machine-wise",
      "model": "cnn_lstm",
      "quantization": "fp32",
      "compression_method": "baseline",
      "benchmark_suite": "TS_BASELINES_001",
      "report": "BASELINES_TS_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9765,
      "f1": 0.96,
      "loss": 0.04,
      "size_mb": 1.156,
      "latency_ms": 1.92,
      "memory_mb": 289,
      "throughput": 520.83,
      "params_million": 0.3031,
      "compression_ratio": 1.0,
      "quantization_bits": 32,
      "device": "cpu"
    },
    "baseline_run_id": null,
    "parent_run_id": null,
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ts-cnc-cnn_lstm-fp32-01",
        "run_id": "run-ts-cnc-cnn_lstm-fp32",
        "key": "dataset.name",
        "value": "Bosch CNC",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-cnc-cnn_lstm-fp32-02",
        "run_id": "run-ts-cnc-cnn_lstm-fp32",
        "key": "dataset.split_strategy",
        "value": "machine-wise",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-cnc-cnn_lstm-fp32-03",
        "run_id": "run-ts-cnc-cnn_lstm-fp32",
        "key": "model.architecture",
        "value": "cnn_lstm",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-cnc-cnn_lstm-fp32-04",
        "run_id": "run-ts-cnc-cnn_lstm-fp32",
        "key": "training.best_epoch",
        "value": 20,
        "value_type": "number"
      },
      {
        "id": "param-run-ts-cnc-cnn_lstm-fp32-05",
        "run_id": "run-ts-cnc-cnn_lstm-fp32",
        "key": "compression.quantization",
        "value": "fp32",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-cnc-cnn_lstm-fp32-06",
        "run_id": "run-ts-cnc-cnn_lstm-fp32",
        "key": "compression.method",
        "value": "none",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-cnc-cnn_lstm-fp32-07",
        "run_id": "run-ts-cnc-cnn_lstm-fp32",
        "key": "benchmark.suite",
        "value": "BASELINE_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-cnc-cnn_lstm-fp32-08",
        "run_id": "run-ts-cnc-cnn_lstm-fp32",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-cnc-cnn_lstm-fp32-09",
        "run_id": "run-ts-cnc-cnn_lstm-fp32",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ts-cnc-tcn-fp32",
    "project_id": "project-ts-cnc",
    "name": "tcn FP32",
    "status": "completed",
    "method": "baseline",
    "created_at": "2025-12-15T16:07:00Z",
    "started_at": "2025-12-15T16:09:00Z",
    "ended_at": "2025-12-15T16:32:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "Baseline model evaluation on Bosch CNC industrial time-series dataset (machine-wise split).",
    "tags": {
      "domain": "timeseries",
      "task": "multiclass_classification",
      "dataset": "Bosch CNC",
      "split_strategy": "machine-wise",
      "model": "tcn",
      "quantization": "fp32",
      "compression_method": "baseline",
      "benchmark_suite": "TS_BASELINES_001",
      "report": "BASELINES_TS_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.991,
      "f1": 0.9879,
      "loss": 0.0121,
      "size_mb": 0.127,
      "latency_ms": 1.1,
      "memory_mb": 227,
      "throughput": 909.09,
      "params_million": 0.0332,
      "compression_ratio": 1.0,
      "quantization_bits": 32,
      "device": "cpu"
    },
    "baseline_run_id": null,
    "parent_run_id": null,
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ts-cnc-tcn-fp32-01",
        "run_id": "run-ts-cnc-tcn-fp32",
        "key": "dataset.name",
        "value": "Bosch CNC",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-cnc-tcn-fp32-02",
        "run_id": "run-ts-cnc-tcn-fp32",
        "key": "dataset.split_strategy",
        "value": "machine-wise",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-cnc-tcn-fp32-03",
        "run_id": "run-ts-cnc-tcn-fp32",
        "key": "model.architecture",
        "value": "tcn",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-cnc-tcn-fp32-04",
        "run_id": "run-ts-cnc-tcn-fp32",
        "key": "training.best_epoch",
        "value": 27,
        "value_type": "number"
      },
      {
        "id": "param-run-ts-cnc-tcn-fp32-05",
        "run_id": "run-ts-cnc-tcn-fp32",
        "key": "compression.quantization",
        "value": "fp32",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-cnc-tcn-fp32-06",
        "run_id": "run-ts-cnc-tcn-fp32",
        "key": "compression.method",
        "value": "none",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-cnc-tcn-fp32-07",
        "run_id": "run-ts-cnc-tcn-fp32",
        "key": "benchmark.suite",
        "value": "BASELINE_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-cnc-tcn-fp32-08",
        "run_id": "run-ts-cnc-tcn-fp32",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-cnc-tcn-fp32-09",
        "run_id": "run-ts-cnc-tcn-fp32",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ts-cnc-cnn_transformer-fp32",
    "project_id": "project-ts-cnc",
    "name": "cnn_transformer FP32",
    "status": "completed",
    "method": "baseline",
    "created_at": "2025-12-15T16:14:00Z",
    "started_at": "2025-12-15T16:16:00Z",
    "ended_at": "2025-12-15T16:39:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "Baseline model evaluation on Bosch CNC industrial time-series dataset (machine-wise split).",
    "tags": {
      "domain": "timeseries",
      "task": "multiclass_classification",
      "dataset": "Bosch CNC",
      "split_strategy": "machine-wise",
      "model": "cnn_transformer",
      "quantization": "fp32",
      "compression_method": "baseline",
      "benchmark_suite": "TS_BASELINES_001",
      "report": "BASELINES_TS_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9832,
      "f1": 0.9778,
      "loss": 0.0222,
      "size_mb": 1.467,
      "latency_ms": 2.17,
      "memory_mb": 308,
      "throughput": 460.83,
      "params_million": 0.3845,
      "compression_ratio": 1.0,
      "quantization_bits": 32,
      "device": "cpu"
    },
    "baseline_run_id": null,
    "parent_run_id": null,
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ts-cnc-cnn_transformer-fp32-01",
        "run_id": "run-ts-cnc-cnn_transformer-fp32",
        "key": "dataset.name",
        "value": "Bosch CNC",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-cnc-cnn_transformer-fp32-02",
        "run_id": "run-ts-cnc-cnn_transformer-fp32",
        "key": "dataset.split_strategy",
        "value": "machine-wise",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-cnc-cnn_transformer-fp32-03",
        "run_id": "run-ts-cnc-cnn_transformer-fp32",
        "key": "model.architecture",
        "value": "cnn_transformer",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-cnc-cnn_transformer-fp32-04",
        "run_id": "run-ts-cnc-cnn_transformer-fp32",
        "key": "training.best_epoch",
        "value": 6,
        "value_type": "number"
      },
      {
        "id": "param-run-ts-cnc-cnn_transformer-fp32-05",
        "run_id": "run-ts-cnc-cnn_transformer-fp32",
        "key": "compression.quantization",
        "value": "fp32",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-cnc-cnn_transformer-fp32-06",
        "run_id": "run-ts-cnc-cnn_transformer-fp32",
        "key": "compression.method",
        "value": "none",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-cnc-cnn_transformer-fp32-07",
        "run_id": "run-ts-cnc-cnn_transformer-fp32",
        "key": "benchmark.suite",
        "value": "BASELINE_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-cnc-cnn_transformer-fp32-08",
        "run_id": "run-ts-cnc-cnn_transformer-fp32",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-cnc-cnn_transformer-fp32-09",
        "run_id": "run-ts-cnc-cnn_transformer-fp32",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ts-cnc-resnet1d-fp32",
    "project_id": "project-ts-cnc",
    "name": "resnet1d FP32",
    "status": "completed",
    "method": "baseline",
    "created_at": "2025-12-15T16:21:00Z",
    "started_at": "2025-12-15T16:23:00Z",
    "ended_at": "2025-12-15T16:46:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "Baseline model evaluation on Bosch CNC industrial time-series dataset (machine-wise split).",
    "tags": {
      "domain": "timeseries",
      "task": "multiclass_classification",
      "dataset": "Bosch CNC",
      "split_strategy": "machine-wise",
      "model": "resnet1d",
      "quantization": "fp32",
      "compression_method": "baseline",
      "benchmark_suite": "TS_BASELINES_001",
      "report": "BASELINES_TS_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.9703,
      "f1": 0.9548,
      "loss": 0.0452,
      "size_mb": 0.516,
      "latency_ms": 1.41,
      "memory_mb": 250,
      "throughput": 709.22,
      "params_million": 0.1354,
      "compression_ratio": 1.0,
      "quantization_bits": 32,
      "device": "cpu"
    },
    "baseline_run_id": null,
    "parent_run_id": null,
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ts-cnc-resnet1d-fp32-01",
        "run_id": "run-ts-cnc-resnet1d-fp32",
        "key": "dataset.name",
        "value": "Bosch CNC",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-cnc-resnet1d-fp32-02",
        "run_id": "run-ts-cnc-resnet1d-fp32",
        "key": "dataset.split_strategy",
        "value": "machine-wise",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-cnc-resnet1d-fp32-03",
        "run_id": "run-ts-cnc-resnet1d-fp32",
        "key": "model.architecture",
        "value": "resnet1d",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-cnc-resnet1d-fp32-04",
        "run_id": "run-ts-cnc-resnet1d-fp32",
        "key": "training.best_epoch",
        "value": 8,
        "value_type": "number"
      },
      {
        "id": "param-run-ts-cnc-resnet1d-fp32-05",
        "run_id": "run-ts-cnc-resnet1d-fp32",
        "key": "compression.quantization",
        "value": "fp32",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-cnc-resnet1d-fp32-06",
        "run_id": "run-ts-cnc-resnet1d-fp32",
        "key": "compression.method",
        "value": "none",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-cnc-resnet1d-fp32-07",
        "run_id": "run-ts-cnc-resnet1d-fp32",
        "key": "benchmark.suite",
        "value": "BASELINE_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-cnc-resnet1d-fp32-08",
        "run_id": "run-ts-cnc-resnet1d-fp32",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-cnc-resnet1d-fp32-09",
        "run_id": "run-ts-cnc-resnet1d-fp32",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ts-ur3-cnn_lstm-fp32",
    "project_id": "project-ts-ur3",
    "name": "cnn_lstm FP32",
    "status": "completed",
    "method": "baseline",
    "created_at": "2025-12-16T13:00:00Z",
    "started_at": "2025-12-16T13:03:00Z",
    "ended_at": "2025-12-16T13:30:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "Baseline multi-label evaluation on UR3 CobotOps industrial time-series dataset (job-wise split).",
    "tags": {
      "domain": "timeseries",
      "task": "multilabel_classification",
      "dataset": "UR3 CobotOps",
      "split_strategy": "job-wise",
      "model": "cnn_lstm",
      "quantization": "fp32",
      "compression_method": "baseline",
      "benchmark_suite": "TS_BASELINES_001",
      "report": "BASELINES_TS_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.6555,
      "f1": 0.7651,
      "loss": 0.0364,
      "size_mb": 0.723,
      "latency_ms": 1.48,
      "memory_mb": 263,
      "throughput": 675.68,
      "params_million": 0.1894,
      "compression_ratio": 1.0,
      "quantization_bits": 32,
      "device": "cpu"
    },
    "baseline_run_id": null,
    "parent_run_id": null,
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ts-ur3-cnn_lstm-fp32-01",
        "run_id": "run-ts-ur3-cnn_lstm-fp32",
        "key": "dataset.name",
        "value": "UR3 CobotOps",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-ur3-cnn_lstm-fp32-02",
        "run_id": "run-ts-ur3-cnn_lstm-fp32",
        "key": "dataset.split_strategy",
        "value": "job-wise",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-ur3-cnn_lstm-fp32-03",
        "run_id": "run-ts-ur3-cnn_lstm-fp32",
        "key": "model.architecture",
        "value": "cnn_lstm",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-ur3-cnn_lstm-fp32-04",
        "run_id": "run-ts-ur3-cnn_lstm-fp32",
        "key": "training.best_epoch",
        "value": 0,
        "value_type": "number"
      },
      {
        "id": "param-run-ts-ur3-cnn_lstm-fp32-05",
        "run_id": "run-ts-ur3-cnn_lstm-fp32",
        "key": "compression.quantization",
        "value": "fp32",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-ur3-cnn_lstm-fp32-06",
        "run_id": "run-ts-ur3-cnn_lstm-fp32",
        "key": "compression.method",
        "value": "none",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-ur3-cnn_lstm-fp32-07",
        "run_id": "run-ts-ur3-cnn_lstm-fp32",
        "key": "benchmark.suite",
        "value": "BASELINE_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-ur3-cnn_lstm-fp32-08",
        "run_id": "run-ts-ur3-cnn_lstm-fp32",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-ur3-cnn_lstm-fp32-09",
        "run_id": "run-ts-ur3-cnn_lstm-fp32",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ts-ur3-tcn-fp32",
    "project_id": "project-ts-ur3",
    "name": "tcn FP32",
    "status": "completed",
    "method": "baseline",
    "created_at": "2025-12-16T13:07:00Z",
    "started_at": "2025-12-16T13:10:00Z",
    "ended_at": "2025-12-16T13:37:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "Baseline multi-label evaluation on UR3 CobotOps industrial time-series dataset (job-wise split).",
    "tags": {
      "domain": "timeseries",
      "task": "multilabel_classification",
      "dataset": "UR3 CobotOps",
      "split_strategy": "job-wise",
      "model": "tcn",
      "quantization": "fp32",
      "compression_method": "baseline",
      "benchmark_suite": "TS_BASELINES_001",
      "report": "BASELINES_TS_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.5864,
      "f1": 0.7209,
      "loss": 0.0404,
      "size_mb": 0.089,
      "latency_ms": 0.97,
      "memory_mb": 225,
      "throughput": 1030.93,
      "params_million": 0.0233,
      "compression_ratio": 1.0,
      "quantization_bits": 32,
      "device": "cpu"
    },
    "baseline_run_id": null,
    "parent_run_id": null,
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ts-ur3-tcn-fp32-01",
        "run_id": "run-ts-ur3-tcn-fp32",
        "key": "dataset.name",
        "value": "UR3 CobotOps",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-ur3-tcn-fp32-02",
        "run_id": "run-ts-ur3-tcn-fp32",
        "key": "dataset.split_strategy",
        "value": "job-wise",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-ur3-tcn-fp32-03",
        "run_id": "run-ts-ur3-tcn-fp32",
        "key": "model.architecture",
        "value": "tcn",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-ur3-tcn-fp32-04",
        "run_id": "run-ts-ur3-tcn-fp32",
        "key": "training.best_epoch",
        "value": 0,
        "value_type": "number"
      },
      {
        "id": "param-run-ts-ur3-tcn-fp32-05",
        "run_id": "run-ts-ur3-tcn-fp32",
        "key": "compression.quantization",
        "value": "fp32",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-ur3-tcn-fp32-06",
        "run_id": "run-ts-ur3-tcn-fp32",
        "key": "compression.method",
        "value": "none",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-ur3-tcn-fp32-07",
        "run_id": "run-ts-ur3-tcn-fp32",
        "key": "benchmark.suite",
        "value": "BASELINE_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-ur3-tcn-fp32-08",
        "run_id": "run-ts-ur3-tcn-fp32",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-ur3-tcn-fp32-09",
        "run_id": "run-ts-ur3-tcn-fp32",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ts-ur3-cnn_transformer-fp32",
    "project_id": "project-ts-ur3",
    "name": "cnn_transformer FP32",
    "status": "completed",
    "method": "baseline",
    "created_at": "2025-12-16T13:14:00Z",
    "started_at": "2025-12-16T13:17:00Z",
    "ended_at": "2025-12-16T13:44:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "Baseline multi-label evaluation on UR3 CobotOps industrial time-series dataset (job-wise split).",
    "tags": {
      "domain": "timeseries",
      "task": "multilabel_classification",
      "dataset": "UR3 CobotOps",
      "split_strategy": "job-wise",
      "model": "cnn_transformer",
      "quantization": "fp32",
      "compression_method": "baseline",
      "benchmark_suite": "TS_BASELINES_001",
      "report": "BASELINES_TS_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.6264,
      "f1": 0.746,
      "loss": 0.0378,
      "size_mb": 1.141,
      "latency_ms": 1.81,
      "memory_mb": 288,
      "throughput": 552.49,
      "params_million": 0.2992,
      "compression_ratio": 1.0,
      "quantization_bits": 32,
      "device": "cpu"
    },
    "baseline_run_id": null,
    "parent_run_id": null,
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ts-ur3-cnn_transformer-fp32-01",
        "run_id": "run-ts-ur3-cnn_transformer-fp32",
        "key": "dataset.name",
        "value": "UR3 CobotOps",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-ur3-cnn_transformer-fp32-02",
        "run_id": "run-ts-ur3-cnn_transformer-fp32",
        "key": "dataset.split_strategy",
        "value": "job-wise",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-ur3-cnn_transformer-fp32-03",
        "run_id": "run-ts-ur3-cnn_transformer-fp32",
        "key": "model.architecture",
        "value": "cnn_transformer",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-ur3-cnn_transformer-fp32-04",
        "run_id": "run-ts-ur3-cnn_transformer-fp32",
        "key": "training.best_epoch",
        "value": 0,
        "value_type": "number"
      },
      {
        "id": "param-run-ts-ur3-cnn_transformer-fp32-05",
        "run_id": "run-ts-ur3-cnn_transformer-fp32",
        "key": "compression.quantization",
        "value": "fp32",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-ur3-cnn_transformer-fp32-06",
        "run_id": "run-ts-ur3-cnn_transformer-fp32",
        "key": "compression.method",
        "value": "none",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-ur3-cnn_transformer-fp32-07",
        "run_id": "run-ts-ur3-cnn_transformer-fp32",
        "key": "benchmark.suite",
        "value": "BASELINE_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-ur3-cnn_transformer-fp32-08",
        "run_id": "run-ts-ur3-cnn_transformer-fp32",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-ur3-cnn_transformer-fp32-09",
        "run_id": "run-ts-ur3-cnn_transformer-fp32",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  },
  {
    "id": "run-ts-ur3-resnet1d-fp32",
    "project_id": "project-ts-ur3",
    "name": "resnet1d FP32",
    "status": "completed",
    "method": "baseline",
    "created_at": "2025-12-16T13:21:00Z",
    "started_at": "2025-12-16T13:24:00Z",
    "ended_at": "2025-12-16T13:51:00Z",
    "owner": {
      "id": "user-001",
      "name": "Sebastian A Cruz Romero",
      "email": "sebastian.cruz@ocyonbio.com",
      "avatar_url": "https://i.pravatar.cc/150?img=12"
    },
    "notes": "Baseline multi-label evaluation on UR3 CobotOps industrial time-series dataset (job-wise split).",
    "tags": {
      "domain": "timeseries",
      "task": "multilabel_classification",
      "dataset": "UR3 CobotOps",
      "split_strategy": "job-wise",
      "model": "resnet1d",
      "quantization": "fp32",
      "compression_method": "baseline",
      "benchmark_suite": "TS_BASELINES_001",
      "report": "BASELINES_TS_00-TPR-01"
    },
    "summary_metrics": {
      "accuracy": 0.5897,
      "f1": 0.7275,
      "loss": 0.0402,
      "size_mb": 0.432,
      "latency_ms": 1.25,
      "memory_mb": 245,
      "throughput": 800.0,
      "params_million": 0.1134,
      "compression_ratio": 1.0,
      "quantization_bits": 32,
      "device": "cpu"
    },
    "baseline_run_id": null,
    "parent_run_id": null,
    "target_profile": {
      "id": "profile-jetstream2-x86",
      "kind": "cpu",
      "name": "JetStream2 x86 CPU (Skylake)",
      "cpu_cores": 32,
      "memory_mb": 256000,
      "gpu": null
    },
    "artifacts": [],
    "params": [
      {
        "id": "param-run-ts-ur3-resnet1d-fp32-01",
        "run_id": "run-ts-ur3-resnet1d-fp32",
        "key": "dataset.name",
        "value": "UR3 CobotOps",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-ur3-resnet1d-fp32-02",
        "run_id": "run-ts-ur3-resnet1d-fp32",
        "key": "dataset.split_strategy",
        "value": "job-wise",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-ur3-resnet1d-fp32-03",
        "run_id": "run-ts-ur3-resnet1d-fp32",
        "key": "model.architecture",
        "value": "resnet1d",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-ur3-resnet1d-fp32-04",
        "run_id": "run-ts-ur3-resnet1d-fp32",
        "key": "training.best_epoch",
        "value": 0,
        "value_type": "number"
      },
      {
        "id": "param-run-ts-ur3-resnet1d-fp32-05",
        "run_id": "run-ts-ur3-resnet1d-fp32",
        "key": "compression.quantization",
        "value": "fp32",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-ur3-resnet1d-fp32-06",
        "run_id": "run-ts-ur3-resnet1d-fp32",
        "key": "compression.method",
        "value": "none",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-ur3-resnet1d-fp32-07",
        "run_id": "run-ts-ur3-resnet1d-fp32",
        "key": "benchmark.suite",
        "value": "BASELINE_001",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-ur3-resnet1d-fp32-08",
        "run_id": "run-ts-ur3-resnet1d-fp32",
        "key": "engine.name",
        "value": "CEMI",
        "value_type": "string"
      },
      {
        "id": "param-run-ts-ur3-resnet1d-fp32-09",
        "run_id": "run-ts-ur3-resnet1d-fp32",
        "key": "engine.version",
        "value": "0.1.0-dev",
        "value_type": "string"
      }
    ],
    "metrics": []
  }
];

// ---------------------------------------------------------------------------
// Normalize CEMI run data to the UI's current `RunRecord` expectations.
//
// The CEMI Runs table + detail views read these `summary_metrics` keys:
// - accuracy, accuracy_delta
// - latency_p50_ms, latency_p95_ms
// - throughput_ips
// - model_size_mb, peak_memory_mb
// - (optional) int8_coverage_pct, fallback_ops_count, top_sensitive_layer, calibration_quality_score
//
// They also expect:
// - owner: string
// - tags: Array<{ key, value }>
// - params: Array<{ key, value, value_type? }>
// - target_profile: { id, kind, label? }
// ---------------------------------------------------------------------------

function coerceOwner(owner) {
  if (!owner) return null;
  if (typeof owner === "string") return owner;
  const email = owner.email || "";
  if (email.includes("@")) return email.split("@")[0].toLowerCase();
  const name = owner.name || "";
  if (name) return name.trim().toLowerCase().replace(/\s+/g, ".");
  return null;
}

function tagsToArray(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  if (typeof tags === "object") {
    return Object.entries(tags).map(([key, value]) => ({
      key,
      value: value == null ? "" : String(value),
    }));
  }
  return [];
}

function upsertTag(tagsArr, key, value) {
  const idx = tagsArr.findIndex((t) => t?.key === key);
  const nextVal = value == null ? "" : String(value);
  if (idx >= 0) tagsArr[idx] = { key, value: nextVal };
  else tagsArr.push({ key, value: nextVal });
}

function hasParam(params, key) {
  return Array.isArray(params) && params.some((p) => p?.key === key);
}

function upsertParam(params, key, value, value_type) {
  const idx = params.findIndex((p) => p?.key === key);
  const next = { key, value, value_type };
  if (idx >= 0) params[idx] = { ...(params[idx] || {}), ...next };
  else params.push(next);
}

function deriveRuntime(domain, method) {
  // Heuristic for the current mock UX:
  // - Vision baselines + PTQ: ONNX Runtime
  // - Vision QAT + time-series: Torch
  if (domain === "vision") return method === "qat" ? "torch" : "onnxruntime";
  if (domain === "timeseries") return "torch";
  return "onnxruntime";
}

const rawById = new Map(rawRunsData.map((r) => [r.id, r]));

function normalizeRun(raw) {
  const tags = tagsToArray(raw.tags);
  const tagsObj = Object.fromEntries(tags.map((t) => [t.key, t.value]));

  const domain = tagsObj.domain || "";
  const model = tagsObj.model || "";
  const quant = (tagsObj.quantization || raw.quantization || "").toLowerCase();

  // Ensure an `experiment` tag exists (used by RunsPage for grouping).
  upsertTag(tags, "experiment", raw.method || "baseline");
  if (model) upsertTag(tags, "model_architecture", model);
  if (!tagsObj.dataset && raw.project_id) {
    // Best-effort; dataset is present for these mocks, but keep it safe.
    upsertTag(tags, "dataset", "");
  }

  // Params: preserve original array, but add helper-friendly keys used by runHelpers.
  const params = Array.isArray(raw.params) ? [...raw.params] : [];
  if (!hasParam(params, "runtime")) {
    upsertParam(params, "runtime", deriveRuntime(domain, raw.method), "string");
  }
  if (model && !hasParam(params, "model_architecture")) {
    upsertParam(params, "model_architecture", model, "string");
  }
  if (tagsObj.dataset && !hasParam(params, "dataset_name")) {
    upsertParam(params, "dataset_name", tagsObj.dataset, "string");
  }

  // Metrics mapping (legacy -> UI keys)
  const sm = raw.summary_metrics || {};
  const p50 = sm.latency_p50_ms ?? sm.latency_ms ?? null;
  const p95 = sm.latency_p95_ms ?? (typeof p50 === "number" ? Number((p50 * 1.25).toFixed(2)) : null);
  const throughput = sm.throughput_ips ?? sm.throughput ?? null;
  const sizeMb = sm.model_size_mb ?? sm.size_mb ?? null;
  const peakMem = sm.peak_memory_mb ?? sm.memory_mb ?? null;

  const baseline = raw.baseline_run_id ? rawById.get(raw.baseline_run_id) : null;
  const baselineAcc = baseline?.summary_metrics?.accuracy;
  const accuracyDelta =
    typeof sm.accuracy === "number"
      ? typeof baselineAcc === "number"
        ? Number((sm.accuracy - baselineAcc).toFixed(6))
        : 0
      : undefined;

  const isInt8 = quant === "int8";
  const diagnostics = {
    int8_coverage_pct:
      sm.int8_coverage_pct ??
      (isInt8 ? 95 : 0),
    fallback_ops_count:
      sm.fallback_ops_count ??
      (isInt8 ? 5 : 0),
    top_sensitive_layer:
      sm.top_sensitive_layer ??
      (isInt8 ? "conv_1" : ""),
    calibration_quality_score:
      sm.calibration_quality_score ??
      (isInt8 ? 0.98 : 0),
  };

  const targetProfile = raw.target_profile
    ? {
        ...raw.target_profile,
        label: raw.target_profile.label || raw.target_profile.name || raw.target_profile.id,
      }
    : null;

  return {
    ...raw,
    owner: coerceOwner(raw.owner),
    tags,
    params,
    quantization: quant || null,
    target_profile: targetProfile,
    summary_metrics: {
      ...sm,
      accuracy: sm.accuracy,
      accuracy_delta: accuracyDelta,
      latency_p50_ms: p50,
      latency_p95_ms: p95,
      throughput_ips: throughput,
      model_size_mb: sizeMb,
      peak_memory_mb: peakMem,
      ...diagnostics,
    },
    artifacts: Array.isArray(raw.artifacts) ? raw.artifacts : [],
  };
}

export const mockRunsData = rawRunsData.map(normalizeRun);

export default mockRunsData;
