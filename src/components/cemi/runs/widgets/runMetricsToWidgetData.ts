// src/components/cemi/runs/widgets/runMetricsToWidgetData.ts
// Transform real run.metrics from API into RunMetricData[] for MetricWidget

import type { RunRecord } from "../../../../types/domain";

export interface MetricDataPoint {
  step: number;
  value: number;
  wallTime?: number;
}

export interface RunMetricData {
  runId: string;
  runName: string;
  data: MetricDataPoint[];
  color?: string;
  visible?: boolean;
}

/** True when every run has a single logged value — compare runs with a bar chart instead of a time series. */
export function isScalarMetricSeries(runs: RunMetricData[]): boolean {
  if (runs.length === 0) return false;
  return runs.every((r) => r.data.length === 1);
}

const RUN_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
  "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9",
];

type MetricPoint = { name?: string; step?: number; value: number };

function getRunMetrics(run: RunRecord): MetricPoint[] {
  const m: any = (run as any).metrics;
  if (Array.isArray(m)) return m as MetricPoint[];
  // plan.md model-neutral RunRecord: metrics = { events: MetricEvent[], summary: MetricEvent[] }
  if (m && typeof m === "object" && Array.isArray(m.events)) return m.events as MetricPoint[];
  return [];
}

/** Match metric name to metricKey (e.g. "accuracy" matches "train/accuracy", "val/accuracy") */
function metricMatches(metricName: string, metricKey: string): boolean {
  const a = (metricName || "").trim().toLowerCase();
  const b = (metricKey || "").trim().toLowerCase();
  if (!a || !b) return false;
  if (a === b) return true;

  const tokenize = (s: string) =>
    s
      .split(/[/._]+/g)
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

  const stripUnitSuffix = (s: string) => s.replace(/_(ms|mb|gb|ips|pct)$/i, "");

  const aNorm = stripUnitSuffix(a);
  const bNorm = stripUnitSuffix(b);
  if (aNorm === bNorm) return true;

  // Short-key matching: "accuracy" matches "train/accuracy"
  const shortKey = b.split("/").pop() || b;
  if (a === shortKey || aNorm === stripUnitSuffix(shortKey)) return true;

  // Token-prefix matching: "latency_p90_ms" matches "latency/p90"
  const aTokens = tokenize(aNorm);
  const bTokens = tokenize(bNorm);
  if (bTokens.length > 0 && aTokens.length >= bTokens.length) {
    let ok = true;
    for (let i = 0; i < bTokens.length; i++) {
      if (aTokens[i] !== bTokens[i]) {
        ok = false;
        break;
      }
    }
    if (ok) return true;
  }

  // Suffix matching: "val/accuracy" matches "accuracy"
  return aTokens.length > 0 && bTokens.length > 0 && aTokens[aTokens.length - 1] === bTokens[bTokens.length - 1];
}

/**
 * Build RunMetricData[] for a given metricKey from real runs.
 * Only includes runs that have at least one data point for that metric.
 */
export function runsToMetricWidgetData(
  runs: RunRecord[],
  metricKey: string
): RunMetricData[] {
  const result: RunMetricData[] = [];

  runs.forEach((run, idx) => {
    const metrics = getRunMetrics(run);
    const points = metrics
      .filter((p) => metricMatches(p.name || "value", metricKey))
      .map((p) => ({
        step: p.step ?? 0,
        value: p.value,
      }))
      .sort((a, b) => a.step - b.step);

    if (points.length > 0) {
      result.push({
        runId: run.id,
        runName: run.name || `Run ${run.id.slice(0, 8)}`,
        data: points,
        color: RUN_COLORS[idx % RUN_COLORS.length],
      });
    }
  });

  return result;
}

/**
 * Exact-match variant: only matches metrics whose name is exactly `metricKey`.
 */
export function runsToMetricWidgetDataExact(
  runs: RunRecord[],
  metricKey: string
): RunMetricData[] {
  const result: RunMetricData[] = [];
  const key = metricKey.trim().toLowerCase();

  runs.forEach((run, idx) => {
    const metrics = getRunMetrics(run);
    const points = metrics
      .filter((p) => (p.name || "").trim().toLowerCase() === key)
      .map((p) => ({
        step: p.step ?? 0,
        value: p.value,
      }))
      .sort((a, b) => a.step - b.step);

    if (points.length > 0) {
      result.push({
        runId: run.id,
        runName: run.name || `Run ${run.id.slice(0, 8)}`,
        data: points,
        color: RUN_COLORS[idx % RUN_COLORS.length],
      });
    }
  });

  return result;
}

/**
 * Discover all distinct metric names across runs that have at least one data point for that metric.
 */
export function discoverMetricNames(runs: RunRecord[]): string[] {
  const nameSet = new Set<string>();
  for (const run of runs) {
    const metrics = getRunMetrics(run);
    const counts = new Map<string, number>();
    for (const p of metrics) {
      const name = (p.name || "").trim();
      if (name) counts.set(name, (counts.get(name) || 0) + 1);
    }
    for (const [name, count] of counts) {
      if (count > 0) nameSet.add(name);
    }
  }
  return Array.from(nameSet).sort((a, b) => a.localeCompare(b));
}
