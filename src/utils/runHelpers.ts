// src/utils/runHelpers.ts

import type { RunRecord } from "../types/domain";

/**
 * Prefer `id`, then `run_id` — backend payloads sometimes only set `run_id`.
 * Used for routing, compare selection, and lookups so UI stays consistent.
 */
export function resolveRunRecordId(run: RunRecord): string | null {
  const r = run as { id?: unknown; run_id?: unknown };
  const a = r.id;
  const b = r.run_id;
  const pick = (v: unknown): string | null => {
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
    return null;
  };
  return pick(a) ?? pick(b);
}

/**
 * True when the metric name indicates per-epoch training/validation metrics,
 * so the UI should label the x-axis "Epoch" instead of "Step".
 */
export function isEpochAxisMetric(metricName: string): boolean {
  const n = (metricName || "").toLowerCase();
  return n.startsWith("train_") || n.startsWith("val_") || n.startsWith("validation_");
}

/**
 * Compute duration from started_at and ended_at in milliseconds
 */
export function getDuration(run: RunRecord): number | null {
  if (!run.started_at) return null;
  const start = new Date(run.started_at).getTime();
  const end = run.ended_at ? new Date(run.ended_at).getTime() : Date.now();
  return end - start;
}

/**
 * Format duration as human-readable string
 */
export function formatDuration(ms: number | null): string {
  if (ms === null) return "N/A";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
  return `${(ms / 3600000).toFixed(1)}h`;
}
