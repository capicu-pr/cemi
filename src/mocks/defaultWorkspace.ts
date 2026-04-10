import type { RunActionEvent, RunRecord } from "../types/domain";

export const DEFAULT_DUMMY_PROJECT_ID = "default-dummy-project";

export const DEFAULT_DUMMY_PROJECT = {
  id: DEFAULT_DUMMY_PROJECT_ID,
  name: "Default",
  org_id: "local-dev",
  created_at: "2026-03-14T09:00:00.000Z",
  updated_at: "2026-03-14T09:30:00.000Z",
  owner: "local",
};

const makeSeries = (name: string, values: number[]): Array<{ name: string; step: number; value: number }> =>
  values.map((value, index) => ({
    name,
    step: index,
    value,
  }));

function getRunDeviceLabel(run: RunRecord): string {
  const deviceParam = run.params?.find((param) => param.key === "device")?.value;
  return run.target_profile?.name || (typeof deviceParam === "string" ? deviceParam : "n/a");
}

function buildDummyActionEvents(run: RunRecord): RunActionEvent[] {
  const device = getRunDeviceLabel(run);
  const runName = run.name || run.id.slice(0, 8);
  const createdAtMs = typeof run.created_at === "number" ? run.created_at : Date.parse(String(run.created_at));
  const startedAtMs = typeof run.started_at === "string" ? Date.parse(run.started_at) : createdAtMs;
  const endedAtMs = run.ended_at ? Date.parse(run.ended_at) : typeof run.updated_at === "number" ? run.updated_at : Date.parse(String(run.updated_at));

  const events: RunActionEvent[] = [
    {
      id: `${run.id}-start-run`,
      timestamp_ms: createdAtMs,
      action: "start_run",
      summary: runName,
      output: `status=${run.status} run_id=${run.id}`,
      level: "info",
      device,
      run_id: run.id,
      run_name: runName,
    },
    {
      id: `${run.id}-set-notes`,
      timestamp_ms: startedAtMs,
      action: "set_notes",
      summary: "notes",
      output: run.notes || "",
      level: "info",
      device,
      run_id: run.id,
      run_name: runName,
    },
    ...((run.metrics || []) as Array<{ name?: string; step?: number; value?: number }>).map((metric, index) => ({
      id: `${run.id}-metric-${index + 1}`,
      timestamp_ms: startedAtMs + index * 15000,
      action: "log_metric",
      summary: metric.name || "metric",
      output: `value=${metric.value ?? "n/a"} step=${metric.step ?? index}`,
      level: "info",
      device,
      run_id: run.id,
      run_name: runName,
    })),
  ];

  if (run.status === "running") {
    events.push({
      id: `${run.id}-update-status`,
      timestamp_ms: endedAtMs,
      action: "update_status",
      summary: "running",
      output: "run status set to running",
      level: "warn",
      device,
      run_id: run.id,
      run_name: runName,
    });
  } else {
    events.push({
      id: `${run.id}-end-run`,
      timestamp_ms: endedAtMs,
      action: "end_run",
      summary: run.status,
      output: `ended_at=${run.ended_at || run.updated_at}`,
      level: run.status === "failed" ? "error" : "success",
      device,
      run_id: run.id,
      run_name: runName,
    });
  }

  return events;
}

const BASE_DUMMY_RUNS: RunRecord[] = [
  {
    id: "dummy-run-alexnet-ptq",
    project_id: DEFAULT_DUMMY_PROJECT_ID,
    name: "alexnet-ptq",
    status: "succeeded",
    started_at: "2026-03-14T09:00:00.000Z",
    ended_at: "2026-03-14T09:04:10.000Z",
    created_at: "2026-03-14T09:00:00.000Z",
    updated_at: "2026-03-14T09:04:10.000Z",
    notes: "Default dummy PTQ run for local UI development.",
    tags: [
      { key: "experiment", value: "baseline" },
      { key: "method", value: "ptq" },
      { key: "quantization", value: "int8" },
      { key: "dataset", value: "CIFAR-10" },
      { key: "model", value: "AlexNet" },
    ],
    params: [
      { key: "dataset_name", value: "CIFAR-10" },
      { key: "model_architecture", value: "AlexNet" },
      { key: "batch_size", value: 32 },
      { key: "learning_rate", value: 0.001 },
      { key: "num_epochs", value: 5 },
      { key: "device", value: "cpu" },
    ],
    artifacts: [],
    summary_metrics: {
      accuracy: 0.9123,
      f1_score: 0.9044,
      latency_p50_ms: 6.2,
      latency_p95_ms: 7.9,
      model_size_mb: 8.4,
    },
    contract_result: {
      pass: true,
      run_id: "dummy-run-alexnet-ptq",
      gate_results: [
        {
          id: "accuracy_gate",
          role: "quality",
          metric: { name: "accuracy" },
          run_value: 0.9123,
          pass: true,
        },
        {
          id: "latency_p50_gate",
          role: "performance",
          metric: { name: "latency_p50_ms" },
          run_value: 6.2,
          pass: true,
        },
      ],
    },
    owner: "local",
    baseline_run_id: null,
    parent_run_id: null,
    method: "PTQ",
    quantization: "INT8",
    dataset_name: "CIFAR-10",
    num_models: 1,
    target_profile: {
      id: "cpu-x86",
      name: "CPU x86",
      architecture: "x86",
      runtime: "onnxruntime",
    },
    timestamp: Date.parse("2026-03-14T09:04:10.000Z"),
    metrics: [
      ...makeSeries("Training Loss", [1.22, 0.88, 0.64, 0.49, 0.41]),
      ...makeSeries("Validation Accuracy", [0.54, 0.67, 0.76, 0.86, 0.91]),
      ...makeSeries("Validation F1 Score", [0.5, 0.61, 0.72, 0.83, 0.9]),
      ...makeSeries("Latency P50", [7.3, 7.0, 6.7, 6.5, 6.2]),
      ...makeSeries("Latency P95", [9.4, 9.0, 8.6, 8.2, 7.9]),
    ],
  } as RunRecord,
  {
    id: "dummy-run-alexnet-qat",
    project_id: DEFAULT_DUMMY_PROJECT_ID,
    name: "alexnet-qat",
    status: "running",
    started_at: "2026-03-14T09:12:00.000Z",
    ended_at: null,
    created_at: "2026-03-14T09:12:00.000Z",
    updated_at: "2026-03-14T09:28:00.000Z",
    notes: "Ongoing QAT run for the default workspace.",
    tags: [
      { key: "experiment", value: "qat" },
      { key: "method", value: "qat" },
      { key: "quantization", value: "int8" },
      { key: "dataset", value: "CIFAR-10" },
      { key: "model", value: "AlexNet" },
    ],
    params: [
      { key: "dataset_name", value: "CIFAR-10" },
      { key: "model_architecture", value: "AlexNet" },
      { key: "batch_size", value: 64 },
      { key: "learning_rate", value: 0.0005 },
      { key: "num_epochs", value: 8 },
      { key: "device", value: "cpu" },
    ],
    artifacts: [],
    summary_metrics: {
      accuracy: 0.8871,
      f1_score: 0.8792,
      latency_p50_ms: 5.8,
      latency_p95_ms: 7.3,
      model_size_mb: 8.6,
    },
    owner: "local",
    baseline_run_id: "dummy-run-alexnet-ptq",
    parent_run_id: null,
    method: "QAT",
    quantization: "INT8",
    dataset_name: "CIFAR-10",
    num_models: 1,
    target_profile: {
      id: "cpu-x86",
      name: "CPU x86",
      architecture: "x86",
      runtime: "onnxruntime",
    },
    timestamp: Date.parse("2026-03-14T09:28:00.000Z"),
    metrics: [
      ...makeSeries("Training Loss", [1.1, 0.79, 0.59, 0.46]),
      ...makeSeries("Validation Accuracy", [0.58, 0.71, 0.81, 0.8871]),
      ...makeSeries("Validation F1 Score", [0.55, 0.67, 0.77, 0.8792]),
      ...makeSeries("Latency P50", [6.2, 6.1, 5.9, 5.8]),
      ...makeSeries("Latency P95", [8.2, 7.9, 7.6, 7.3]),
    ],
  } as RunRecord,
  {
    id: "dummy-run-mobilenet-ptq",
    project_id: DEFAULT_DUMMY_PROJECT_ID,
    name: "mobilenet-ptq",
    status: "succeeded",
    started_at: "2026-03-14T08:44:00.000Z",
    ended_at: "2026-03-14T08:49:30.000Z",
    created_at: "2026-03-14T08:44:00.000Z",
    updated_at: "2026-03-14T08:49:30.000Z",
    notes: "Reference MobileNet PTQ run.",
    tags: [
      { key: "experiment", value: "baseline" },
      { key: "method", value: "ptq" },
      { key: "quantization", value: "fp16" },
      { key: "dataset", value: "CIFAR-10" },
      { key: "model", value: "MobileNetV2" },
    ],
    params: [
      { key: "dataset_name", value: "CIFAR-10" },
      { key: "model_architecture", value: "MobileNetV2" },
      { key: "batch_size", value: 32 },
      { key: "learning_rate", value: 0.0012 },
      { key: "num_epochs", value: 5 },
      { key: "device", value: "cpu" },
    ],
    artifacts: [],
    summary_metrics: {
      accuracy: 0.9278,
      f1_score: 0.9181,
      latency_p50_ms: 4.4,
      latency_p95_ms: 5.6,
      model_size_mb: 5.1,
    },
    contract_result: {
      pass: false,
      run_id: "dummy-run-mobilenet-ptq",
      gate_results: [
        {
          id: "accuracy_gate",
          role: "quality",
          metric: { name: "accuracy" },
          run_value: 0.9278,
          pass: false,
          explain: "value 0.9278 < min 0.93",
        },
        {
          id: "latency_p50_gate",
          role: "performance",
          metric: { name: "latency_p50_ms" },
          run_value: 4.4,
          pass: true,
        },
      ],
    },
    owner: "local",
    baseline_run_id: null,
    parent_run_id: null,
    method: "PTQ",
    quantization: "FP16",
    dataset_name: "CIFAR-10",
    num_models: 1,
    target_profile: {
      id: "cpu-x86",
      name: "CPU x86",
      architecture: "x86",
      runtime: "onnxruntime",
    },
    timestamp: Date.parse("2026-03-14T08:49:30.000Z"),
    metrics: [
      ...makeSeries("Training Loss", [1.18, 0.82, 0.57, 0.43, 0.36]),
      ...makeSeries("Validation Accuracy", [0.57, 0.7, 0.8, 0.89, 0.9278]),
      ...makeSeries("Validation F1 Score", [0.53, 0.65, 0.75, 0.85, 0.9181]),
      ...makeSeries("Latency P50", [5.3, 5.0, 4.8, 4.6, 4.4]),
      ...makeSeries("Latency P95", [6.6, 6.3, 6.0, 5.8, 5.6]),
    ],
  } as RunRecord,
  {
    id: "dummy-run-resnet-failed",
    project_id: DEFAULT_DUMMY_PROJECT_ID,
    name: "resnet18-int8-failed",
    status: "failed",
    started_at: "2026-03-14T08:10:00.000Z",
    ended_at: "2026-03-14T08:14:45.000Z",
    created_at: "2026-03-14T08:10:00.000Z",
    updated_at: "2026-03-14T08:14:45.000Z",
    notes: "Synthetic failed run to exercise failure states in dev.",
    tags: [
      { key: "experiment", value: "resnet-sweep" },
      { key: "method", value: "ptq" },
      { key: "quantization", value: "int8" },
      { key: "dataset", value: "CIFAR-10" },
      { key: "model", value: "ResNet18" },
    ],
    params: [
      { key: "dataset_name", value: "CIFAR-10" },
      { key: "model_architecture", value: "ResNet18" },
      { key: "batch_size", value: 16 },
      { key: "learning_rate", value: 0.0008 },
      { key: "num_epochs", value: 4 },
      { key: "device", value: "cpu" },
    ],
    artifacts: [],
    summary_metrics: {
      accuracy: 0.0,
      f1_score: 0.0,
      latency_p50_ms: 0,
      latency_p95_ms: 0,
      model_size_mb: 0,
    },
    owner: "local",
    baseline_run_id: null,
    parent_run_id: null,
    method: "PTQ",
    quantization: "INT8",
    dataset_name: "CIFAR-10",
    num_models: 1,
    target_profile: {
      id: "cpu-x86",
      name: "CPU x86",
      architecture: "x86",
      runtime: "onnxruntime",
    },
    timestamp: Date.parse("2026-03-14T08:14:45.000Z"),
    metrics: [
      ...makeSeries("Training Loss", [1.4, 1.25, 1.18]),
      ...makeSeries("Validation Accuracy", [0.4, 0.43, 0.41]),
      ...makeSeries("Validation F1 Score", [0.36, 0.39, 0.37]),
    ],
  } as RunRecord,
];

export const DEFAULT_DUMMY_RUNS: RunRecord[] = BASE_DUMMY_RUNS.map((run) => ({
  ...run,
  action_events: buildDummyActionEvents(run),
}));

export function getDevProjects() {
  return [DEFAULT_DUMMY_PROJECT];
}

export function getDevRuns(projectId: string) {
  if (projectId !== DEFAULT_DUMMY_PROJECT_ID) return [];
  return DEFAULT_DUMMY_RUNS;
}

export function mergeProjectsWithDevDefaults(
  projects: Array<{ id: string; name: string; org_id?: string; created_at?: string; updated_at?: string; owner?: string }>
) {
  const byId = new Map(projects.map((project) => [project.id, project]));
  byId.set(DEFAULT_DUMMY_PROJECT.id, {
    ...DEFAULT_DUMMY_PROJECT,
    ...byId.get(DEFAULT_DUMMY_PROJECT.id),
  });
  return [byId.get(DEFAULT_DUMMY_PROJECT.id)!, ...projects.filter((project) => project.id !== DEFAULT_DUMMY_PROJECT.id)];
}
