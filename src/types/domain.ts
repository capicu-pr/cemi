// src/types/domain.ts

export type UUID = string;
export type ISODateTime = string;

export type ArtifactType =
  | "model"
  | "report"
  | "log"
  | "checkpoint"
  | "dataset"
  | "config"
  | "results"
  | "profile"
  | "other";

export type RunSummaryMetrics = Record<string, unknown>;

export interface RunParam {
  key: string;
  value: string | number | boolean | null;
}

export interface RunTag {
  key: string;
  value: string;
}

export interface RunArtifact {
  id?: UUID;
  name: string;
  type: ArtifactType;
  uri?: string;
  url?: string;
  path?: string;
  media_type?: string;
  size_bytes?: number;
  created_at?: ISODateTime | number;
  metadata?: Record<string, unknown>;
}

export interface TargetProfile {
  id: string;
  name: string;
  description?: string;
  architecture: string;
  runtime?: string;
}

export interface RunContextCase {
  suite?: string;
  task?: string;
  scenario?: string;
  dataset?: string;
  [key: string]: unknown;
}

export interface RunContextPolicy {
  name?: string;
  objective_metric?: string;
  objective_direction?: string;
  [key: string]: unknown;
}

export interface RunContextDevice {
  board?: string;
  runtime?: string;
  memory_budget?: string | number;
  flash_budget?: string | number;
  ram_budget?: string | number;
  [key: string]: unknown;
}

export interface RunContext {
  case?: RunContextCase;
  policy?: RunContextPolicy;
  device?: RunContextDevice;
  [key: string]: unknown;
}

export interface RunMetricEvent {
  name?: string;
  step?: number;
  value: number;
  timestamp?: ISODateTime | number;
  timestamp_ms?: number;
  wall_time?: number;
  tags?: Record<string, string>;
}

export interface RunActionEvent {
  id?: UUID;
  timestamp?: ISODateTime | number;
  timestamp_ms?: number;
  action?: string;
  summary?: string;
  output?: string;
  level?: "info" | "success" | "warn" | "error" | string;
  device?: string;
  run_id?: UUID;
  run_name?: string;
}

export interface MonitorState {
  state: "NOMINAL" | "WARN" | "REQUALIFY";
  cusum_statistic: number;
  adwin_window_mean: number | null;
  adwin_window_size: number;
  n_samples: number;
}

export interface InferenceEvent {
  loss_value: number;
  timestamp_ms: number;
  input_hash?: string;
  output_hash?: string;
  step?: number;
  [key: string]: unknown;
}

export interface PlatformFingerprint {
  runtime: string;
  hardware_backend: string;
  simd_flags?: string[];
  framework_version?: string;
  recorded_at?: ISODateTime;
  [key: string]: unknown;
}

export interface EQCAssignment {
  eqc_id: string;
  reference_runtime: string;
  reference_hardware: string;
  output_delta_norm: number;
  delta_within_tolerance: boolean;
  tolerance?: number;
  recorded_at?: ISODateTime;
  [key: string]: unknown;
}

export interface AccuracyGate {
  metric_name: string;
  metric_value: number;
  threshold: number;
  direction: "higher_is_better" | "lower_is_better" | string;
  pass: boolean;
  recorded_at?: ISODateTime;
  [key: string]: unknown;
}

export interface ContractGateResult {
  id: string;
  role: string;
  metric?: { name: string; source?: string; aggregation?: string };
  run_value?: number | null;
  baseline_value?: number | null;
  pass: boolean;
  explain?: string;
}

export interface ContractResult {
  pass: boolean;
  gate_results?: ContractGateResult[];
  run_id?: string;
}

export interface Run {
  id: UUID;
  project_id?: UUID;
  name?: string;
  status: string;
  started_at?: ISODateTime | null;
  ended_at?: ISODateTime | null;
  created_at?: ISODateTime | number;
  updated_at?: ISODateTime | number;
  notes?: string;
  tags?: RunTag[];
  params?: RunParam[];
  parameters?: RunParam[];
  artifacts?: RunArtifact[];
  summary_metrics?: RunSummaryMetrics;
  owner?: string | null;
  baseline_run_id?: UUID | null;
  parent_run_id?: UUID | null;
  method?: string;
  quantization?: string;
  dataset_name?: string;
  num_models?: number;
  target_profile?: TargetProfile;
  context?: RunContext;
  timestamp?: number;
  metrics?: RunMetricEvent[] | { events?: RunMetricEvent[]; summary?: RunMetricEvent[] };
  action_events?: RunActionEvent[];
  contract_result?: ContractResult;
  platform_fingerprint?: PlatformFingerprint;
  eqc_assignment?: EQCAssignment;
  accuracy_gate?: AccuracyGate;
  monitor_state?: MonitorState;
  inference_events?: InferenceEvent[];
}

export interface RunRecord extends Run {}

export interface MetricPoint {
  step: number;
  value: number;
  timestamp?: ISODateTime;
  wall_time?: number;
}

export interface MetricSeries {
  run_id: UUID;
  metric_key: string;
  points: MetricPoint[];
}

export interface MetricQuery {
  run_ids: UUID[];
  metric_keys: string[];
  start_step?: number;
  end_step?: number;
}

export interface Project {
  id: UUID;
  name: string;
  description?: string;
  created_at?: ISODateTime;
  updated_at?: ISODateTime;
}
