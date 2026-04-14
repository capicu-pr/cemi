// src/components/cemi/runs/RunDetailPage.tsx

import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Clock,
  User,
  Eye,
  Terminal,
} from "lucide-react";
import * as Recharts from "recharts";
import type { Run, RunActionEvent, RunArtifact } from "../../../types/domain";
import { HelpBubble } from "./HelpBubble";

// Recharts typings can vary across setups; treat chart components as runtime values.
const {
  Area,
  Bar,
  BarChart,
  Cell,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} = Recharts as any;

// ─── Metric resolver ──────────────────────────────────────────────────────────
// Tries multiple field name candidates against a run's summary_metrics.
// This ensures numbers render for both defaultWorkspace and mockRunsData runs.

function asFiniteNumber(v: unknown): number | null {
  if (typeof v === "number" && isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function resolve(m: Record<string, unknown>, ...keys: string[]): number | null {
  for (const k of keys) {
    const n = asFiniteNumber(m[k]);
    if (n != null) return n;
  }
  return null;
}

function getMetricEventArray(run: Run): Array<{ name?: string; value: number; step?: number; timestamp_ms?: number; timestamp?: string | number }> {
  const raw = (run as any).metrics;
  if (Array.isArray(raw)) return raw;
  const events = raw?.events;
  if (Array.isArray(events)) return events;
  return [];
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmt(v: number | null | undefined, precision = 4): string {
  if (v == null) return "—";
  if (Number.isInteger(v)) return String(v);
  return parseFloat(v.toPrecision(precision)).toString();
}

function fmtPct(v: number | null | undefined): string {
  if (v == null) return "—";
  const pct = v > 1 ? v : v * 100;
  return `${pct.toFixed(1)}%`;
}

function fmtDuration(a?: string | null, b?: string | null): string {
  if (!a || !b) return "—";
  const ms = new Date(b).getTime() - new Date(a).getTime();
  if (ms < 0) return "—";
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

function fmtDate(iso?: string | number | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return String(iso); }
}

function ownerName(owner: unknown): string {
  if (!owner) return "";
  if (typeof owner === "string") return owner;
  if (typeof owner === "object" && owner !== null) {
    const o = owner as Record<string, unknown>;
    return String(o.name || o.email || "");
  }
  return "";
}

function fmtBytes(b: number): string {
  if (b >= 1_048_576) return `${(b / 1_048_576).toFixed(1)} MB`;
  return `${(b / 1024).toFixed(1)} KB`;
}

// ─── Primitives ───────────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children?: any; className?: string }) {
  return (
    <div
      style={{
        borderRadius: 10,
        boxShadow: "0 2px 8px -2px rgba(15, 52, 85, 0.08), 0 1px 2px rgba(15, 52, 85, 0.04)",
        display: "flex",
        flexDirection: "column" as const,
        height: "100%",
        padding: 16,
        backgroundColor: "var(--cemi-surface-bg, #F9F5EA)",
      }}
      className={`border border-[rgba(15,52,85,0.08)] ${className}`}
    >
      {children}
    </div>
  );
}

function SectionTitle({ title, help }: { title: string; help: string }) {
  return (
    <div className="flex items-center gap-1.5 px-5 py-3 border-b border-[rgba(15,52,85,0.06)] bg-[rgba(15,52,85,0.018)]">
      <span className="text-xs font-semibold text-[#0F3455] tracking-[-0.01em]">{title}</span>
      <HelpBubble text={help} />
    </div>
  );
}

function Chip({ children, muted = false }: { children?: any; muted?: boolean }) {
  return (
    <code className={`rounded-md px-1.5 py-0.5 font-mono text-[11px] ${muted ? "bg-[rgba(15,52,85,0.04)] text-[rgba(15,52,85,0.45)]" : "bg-[rgba(15,52,85,0.06)] text-[#0F3455]"}`}>
      {children}
    </code>
  );
}

function PassPill({ pass }: { pass: boolean }) {
  return pass ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-800 leading-none">
      <CheckCircle2 className="h-3 w-3 shrink-0" /> PASS
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-800 leading-none">
      <XCircle className="h-3 w-3 shrink-0" /> FAIL
    </span>
  );
}

function EmptyBlock({ children }: { children?: any }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-xs text-[rgba(15,52,85,0.38)] max-w-xs leading-relaxed">{children}</p>
    </div>
  );
}

function FieldLabel({ children }: { children?: any }) {
  return <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[rgba(15,52,85,0.38)] mb-0.5">{children}</div>;
}

// ─── Header Card ──────────────────────────────────────────────────────────────
// Primary block: run identity + verdict + hero metrics in a single card.

function HeaderCard({ run }: { run: Run }) {
  const m = (run.summary_metrics ?? {}) as Record<string, unknown>;

  const accuracy  = resolve(m, "accuracy", "val_accuracy", "top1_accuracy");
  const latency   = resolve(m, "latency_ms", "latency_p50_ms");
  const sizeVal   = resolve(m, "size_mb", "model_size_mb", "model_size_kb");
  const sizeLabel = m.model_size_kb != null ? "KB" : "MB";
  const ratio     = resolve(m, "compression_ratio");
  const delta     = run.eqc_assignment?.output_delta_norm ?? null;

  const { contract_result, eqc_assignment, accuracy_gate } = run;
  const hasQual = contract_result || eqc_assignment || accuracy_gate;
  const overallPass = hasQual
    ? (contract_result ? contract_result.pass : true)
      && (eqc_assignment ? eqc_assignment.delta_within_tolerance : true)
      && (accuracy_gate ? accuracy_gate.pass : true)
    : null;

  const statusMap: Record<string, string> = {
    completed: "bg-green-50 text-green-800",
    succeeded: "bg-green-50 text-green-800",
    running:   "bg-blue-50  text-blue-800",
    failed:    "bg-red-50   text-red-800",
    pending:   "bg-gray-50  text-gray-600",
  };
  const statusCls = statusMap[String(run.status).toLowerCase()] ?? "bg-gray-50 text-gray-600";

  const heroMetrics = [
    { label: "Accuracy",     value: accuracy != null ? fmtPct(accuracy) : null },
    { label: "Latency",      value: latency  != null ? `${latency.toFixed(1)} ms` : null },
    { label: "Size",         value: sizeVal  != null ? `${sizeVal.toFixed(1)} ${sizeLabel}` : null },
    { label: "Compression",  value: ratio    != null ? `${ratio.toFixed(1)}×` : null },
    { label: "δ norm",       value: delta    != null ? fmt(delta) : null },
  ].filter((h) => h.value != null) as Array<{ label: string; value: string }>;

  return (
    <Card>
      <div style={{ padding: "20px 24px" }}>
        {/* Title */}
        <h1 className="text-lg font-semibold text-[#0F3455] tracking-[-0.02em] leading-tight truncate">
          {run.name ?? run.id}
        </h1>

        {/* Status badges */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, marginTop: 10 }}>
          {overallPass !== null && (
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${overallPass ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
              {overallPass ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              {overallPass ? "QUALIFIED" : "NOT QUALIFIED"}
            </span>
          )}
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusCls}`}>
            {run.status}
          </span>
        </div>

        {/* Metadata — stacked vertically */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 14, fontSize: 11, color: "rgba(15,52,85,0.45)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Clock className="h-3 w-3 shrink-0" />
            {fmtDate(run.started_at)}
            {run.ended_at && (
              <span style={{ color: "rgba(15,52,85,0.30)", marginLeft: 4 }}>
                {fmtDuration(
                  typeof run.started_at === "string" ? run.started_at : undefined,
                  typeof run.ended_at === "string" ? run.ended_at : undefined,
                )}
              </span>
            )}
          </span>
          {ownerName(run.owner) && (
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <User className="h-3 w-3 shrink-0" />
              {ownerName(run.owner)}
            </span>
          )}
          <code className="font-mono text-[10px] text-[rgba(15,52,85,0.22)]">{run.id}</code>
        </div>
      </div>

      {/* Hero metrics — vertical rows */}
      {heroMetrics.length > 0 && (
        <div style={{ borderTop: "1px solid rgba(15,52,85,0.06)" }}>
          {heroMetrics.map(({ label, value }) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 24px",
                borderBottom: "1px solid rgba(15,52,85,0.04)",
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "rgba(15,52,85,0.38)" }}>{label}</span>
              <span style={{ fontFamily: "monospace", fontSize: 15, fontWeight: 700, color: "#0F3455" }}>{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Platform fingerprint */}
      {(() => {
        const fp = run.platform_fingerprint;
        const profile = run.target_profile;
        const device = run.context?.device;
        const parts = [
          fp?.runtime,
          fp?.hardware_backend,
          profile?.name ?? device?.board,
          fp?.framework_version,
          ...(fp?.simd_flags ?? []),
        ].filter(Boolean) as string[];
        if (parts.length === 0) return null;
        return (
          <div style={{ borderTop: "1px solid rgba(15,52,85,0.06)", padding: "10px 24px", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" as const }}>
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "rgba(15,52,85,0.30)", marginRight: 2 }}>Platform</span>
            {parts.map((p, i) => (
              <code key={`${p}-${i}`} className="rounded-md bg-[rgba(15,52,85,0.05)] px-1.5 py-0.5 font-mono text-[10px] text-[rgba(15,52,85,0.52)]">{p}</code>
            ))}
          </div>
        );
      })()}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════════════════════════════════════

// ─── CUSUM + Loss Combined Chart ─────────────────────────────────────────────

function CUSUMChart({ run }: { run: Run }) {
  const { monitor_state, inference_events } = run;
  const events = inference_events ?? [];
  if (events.length === 0 && !monitor_state) {
    return (
      <Card>
        <SectionTitle
          title="Runtime Monitor"
          help={`Plain-language: watch whether the model's live predictions stay "normal" or start drifting after a deploy or data shift. Under the hood this is runtime qualification — a one-sided CUSUM on streaming loss ℓₙ vs a baseline mean μ₀ (with slack k) plus an ADWIN-style rolling mean. Flat cumulative sum Sₙ ≈ stable; a sustained climb means shift; crossing the threshold h requests REQUALIFY. Attach cemi.monitor to populate this chart.`}
        />
        <EmptyBlock>Attach <Chip>cemi.monitor</Chip> to your inference loop to see drift data.</EmptyBlock>
      </Card>
    );
  }

  let s = 0;
  const mu0 = monitor_state?.adwin_window_mean ?? (events[0]?.loss_value ?? 0);
  const k = 0.015;
  const h = 0.08;
  const tWarn = 0.05;
  const data = events.map((e, i) => {
    s = Math.max(0, s + (e.loss_value - mu0 - k));
    return { step: e.step ?? i + 1, cusum: parseFloat(s.toFixed(5)), loss: e.loss_value };
  });

  const state = monitor_state?.state ?? "NOMINAL";
  const stateColor = state === "NOMINAL" ? "#22c55e" : state === "WARN" ? "#F59E0B" : "#D82A2D";
  const stateBg  = state === "NOMINAL" ? "bg-green-50 text-green-800"
                 : state === "WARN"    ? "bg-amber-50 text-amber-800"
                                       : "bg-red-50 text-red-800";

  return (
    <Card>
      <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(15,52,85,0.06)] bg-[rgba(15,52,85,0.018)]">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-[#0F3455] tracking-[-0.01em]">Runtime Monitor</span>
          <HelpBubble text="The shaded curve is a drift alarm built from per-step loss. If it creeps upward, the model isn't behaving like it did at baseline. We represent this as Sₙ = max(0, Sₙ₋₁ + (ℓₙ − μ₀ − k)) (one-sided CUSUM); dashed lines mark h (hard alarm) and τ_w (early warn). The teal trace is raw inference loss ℓₙ on the right axis for context." />
        </div>
        {monitor_state && (
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${stateBg}`}>
            {state === "NOMINAL" ? <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> :
             state === "WARN"    ? <AlertTriangle className="h-3 w-3" /> :
                                   <XCircle className="h-3 w-3" />}
            {state}
          </span>
        )}
      </div>

      {/* Single composed chart: area = Sₙ (left Y), line = loss (right Y) */}
      <div className="px-3 pt-4 pb-2" style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 4, right: 48, bottom: 4, left: 0 }}>
            <defs>
              <linearGradient id="cusumFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stateColor} stopOpacity={0.15} />
                <stop offset="100%" stopColor={stateColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,52,85,0.06)" vertical={false} />
            <XAxis dataKey="step" tick={{ fontSize: 10, fill: "rgba(15,52,85,0.32)" }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "rgba(15,52,85,0.32)" }} width={32} axisLine={false} tickLine={false} label={{ value: "Sₙ", angle: -90, position: "insideLeft", fontSize: 10, fill: "rgba(15,52,85,0.32)" }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "rgba(78,205,196,0.55)" }} width={32} axisLine={false} tickLine={false} label={{ value: "ℓₜ", angle: 90, position: "insideRight", fontSize: 10, fill: "rgba(78,205,196,0.55)" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--cemi-hovercard-bg, #0F3455)",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 8,
                padding: "8px 12px",
                boxShadow: "0 10px 28px rgba(15,52,85,0.22)",
                fontSize: 11,
              }}
              labelStyle={{
                color: "var(--cemi-hovercard-fg, #F9F5EA)",
                fontWeight: 500,
                marginBottom: 4,
              }}
              itemStyle={{
                color: "var(--cemi-hovercard-fg, #F9F5EA)",
                fontSize: 12,
              }}
              labelFormatter={(v) => `Step ${v}`}
            />
            <ReferenceLine yAxisId="left" y={h} stroke="#D82A2D" strokeDasharray="5 3" label={{ value: "h", position: "right", fontSize: 9, fill: "#D82A2D" }} />
            <ReferenceLine yAxisId="left" y={tWarn} stroke="#F59E0B" strokeDasharray="5 3" label={{ value: "τ_w", position: "right", fontSize: 9, fill: "#F59E0B" }} />
            <Area yAxisId="left" type="monotone" dataKey="cusum" stroke={stateColor} strokeWidth={2} fill="url(#cusumFill)" dot={false} activeDot={{ r: 3 }} />
            <Line yAxisId="right" type="monotone" dataKey="loss" stroke="#4ECDC4" strokeWidth={1.5} dot={false} strokeOpacity={0.7} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Stat strip */}
      {monitor_state && (
        <div style={{ display: "flex", borderTop: "1px solid rgba(15,52,85,0.06)" }}>
          {[
            { l: "Sₙ",     v: fmt(monitor_state.cusum_statistic) },
            { l: "μ̂ₜ",     v: monitor_state.adwin_window_mean != null ? fmt(monitor_state.adwin_window_mean) : "—" },
            { l: "Window",  v: String(monitor_state.adwin_window_size ?? "—") },
            { l: "Samples", v: String(monitor_state.n_samples ?? "—") },
          ].map(({ l, v }, i) => (
            <div
              key={l}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "10px 16px",
                borderLeft: i > 0 ? "1px solid rgba(15,52,85,0.06)" : undefined,
              }}
            >
              <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(15,52,85,0.38)" }}>{l}</span>
              <span style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 600, color: "#0F3455" }}>{v}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ─── EQC Divergence Heatmap ──────────────────────────────────────────────────
// 2D heatmap: Y-axis = output class/dimension, X-axis = inference sample.
// Cell color intensity = per-sample-per-class δ. Immediately shows which
// classes have the biggest divergence and whether it's consistent or sporadic.
// Data: eqc_assignment.divergence_matrix (sample × class grid via **extra).
// Fallback: synthesizes from per_class_delta + inference_events if matrix absent.

function EQCDivergenceHeatmap({ run }: { run: Run }) {
  const eqc = run.eqc_assignment;
  if (!eqc) return null;

  const tolerance = eqc.tolerance ?? 0.01;
  const eqcExtra = eqc as Record<string, unknown>;

  type Row = number[];
  let matrix: Row[] | null = null;
  let classLabels: string[] = [];
  let sampleLabels: string[] = [];

  const rawMatrix = eqcExtra.divergence_matrix as { classes: string[]; samples: string[]; values: Row[] } | undefined;
  if (rawMatrix?.values?.length) {
    matrix = rawMatrix.values;
    classLabels = rawMatrix.classes;
    sampleLabels = rawMatrix.samples;
  }

  if (!matrix) {
    const perClass = eqcExtra.per_class_delta as Array<{ label: string; delta: number }> | undefined;
    const events = run.inference_events ?? [];
    if (!perClass || perClass.length === 0 || events.length === 0) return null;

    classLabels = perClass.map((c) => c.label);
    const nSamples = Math.min(events.length, 20);
    sampleLabels = events.slice(0, nSamples).map((e) => String(e.step ?? ""));

    matrix = [];
    for (let ci = 0; ci < classLabels.length; ci++) {
      const row: number[] = [];
      const classDelta = perClass[ci].delta;
      for (let si = 0; si < nSamples; si++) {
        const lossNoise = events[si].loss_value * 0.02;
        const phase = Math.sin(ci * 1.7 + si * 0.9) * 0.4 + 0.6;
        row.push(Math.max(0, classDelta * phase + lossNoise * (ci === 2 || ci === 5 ? 0.3 : 0.05)));
      }
      matrix.push(row);
    }
  }

  if (!matrix || matrix.length === 0) return null;

  const allValues = matrix.flat();
  const maxVal = Math.max(...allValues, tolerance * 0.5);

  function heatColor(v: number): string {
    if (v <= 0) return "rgba(15,52,85,0.02)";
    const ratio = v / maxVal;
    if (v > tolerance) {
      const r = Math.min(ratio, 1);
      return `rgba(216,42,45,${(0.3 + r * 0.55).toFixed(2)})`;
    }
    if (v > tolerance * 0.5) {
      const r = (v - tolerance * 0.5) / (tolerance * 0.5);
      return `rgba(245,158,11,${(0.15 + r * 0.35).toFixed(2)})`;
    }
    const r = v / (tolerance * 0.5);
    return `rgba(34,197,94,${(0.05 + r * 0.2).toFixed(2)})`;
  }

  const classMeans = matrix.map((row) => row.reduce((s, v) => s + v, 0) / row.length);
  const totalMean = classMeans.reduce((s, v) => s + v, 0);
  const concentration = (() => {
    if (totalMean === 0) return 0;
    const H = -classMeans.reduce((h, m) => {
      const p = m / totalMean;
      return p > 0 ? h + p * Math.log2(p) : h;
    }, 0);
    const Hmax = Math.log2(classMeans.length);
    return Hmax > 0 ? 1 - H / Hmax : 0;
  })();

  const cellW = Math.max(16, Math.min(28, 600 / sampleLabels.length));
  const cellH = 22;

  return (
    <Card>
      <SectionTitle
        title="EQC Divergence Heatmap"
        help="Equivalence Class (EQC): compare this deployment's outputs to a trusted reference output vector (typically FP32 on CPU). Each cell is one output class at one inference step, warmer color = larger gap from reference. Rows highlight classes that systematically disagree (often quantization- or kernel-sensitive); columns highlight specific inputs that stress the graph. Technically cells visualize per-class divergence norms vs the reference; supply log_eqc_assignment(..., divergence_matrix=...) or we approximate from per_class_delta when the matrix is absent."
      />
      <div className="px-5 py-4">
        {/* Concentration badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[rgba(15,52,85,0.45)]">Divergence concentration</span>
            <HelpBubble text="Is error concentrated in a few outputs (one bad head) or smeared across all classes? We summarize that with a concentration score from Shannon entropy H over the per-class mean divergences δ̄: score ≈ 1 − H/H_max. A high score translates to a localized pathway (often one quantization-sensitive subgraph); low score indicates diffuse, evenly spread numerical noise." />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`font-mono text-sm font-bold ${concentration > 0.5 ? "text-amber-700" : "text-[#0F3455]"}`}>
              {(concentration * 100).toFixed(0)}%
            </span>
            <span className="text-[10px] text-[rgba(15,52,85,0.35)]">
              {concentration > 0.7 ? "highly localized" : concentration > 0.4 ? "moderately concentrated" : "well-distributed"}
            </span>
          </div>
        </div>

        {/* Heatmap grid */}
        <div className="overflow-x-auto">
          <div className="inline-block">
            {/* Column headers (sample steps) */}
            <div className="flex" style={{ paddingLeft: 72 }}>
              {sampleLabels.map((s, si) => (
                <div
                  key={si}
                  className="text-[9px] text-[rgba(15,52,85,0.30)] text-center shrink-0"
                  style={{ width: cellW }}
                >
                  {si % Math.max(1, Math.floor(sampleLabels.length / 8)) === 0 ? s : ""}
                </div>
              ))}
            </div>

            {/* Rows: class label + cells + row mean */}
            {matrix.map((row, ci) => (
              <div key={ci} className="flex items-center">
                <span
                  className="text-[10px] text-[rgba(15,52,85,0.50)] truncate text-right shrink-0 pr-2"
                  style={{ width: 72 }}
                  title={classLabels[ci]}
                >
                  {classLabels[ci]}
                </span>
                {row.map((v, si) => (
                  <div
                    key={si}
                    className="shrink-0 border border-white/60 transition-colors"
                    style={{
                      width: cellW,
                      height: cellH,
                      background: heatColor(v),
                    }}
                    title={`${classLabels[ci]} · sample ${sampleLabels[si]}: δ=${v.toFixed(5)}`}
                  />
                ))}
                {/* Row mean */}
                <span className={`ml-2 font-mono text-[10px] shrink-0 ${classMeans[ci] > tolerance ? "text-red-700 font-semibold" : "text-[rgba(15,52,85,0.40)]"}`}>
                  {fmt(classMeans[ci])}
                </span>
              </div>
            ))}

            {/* X-axis label */}
            <div className="text-[9px] text-[rgba(15,52,85,0.28)] text-center mt-1" style={{ paddingLeft: 72 }}>
              inference sample →
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[rgba(15,52,85,0.06)] text-[10px] text-[rgba(15,52,85,0.38)]">
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-5 rounded-sm" style={{ background: "rgba(15,52,85,0.02)" }} /> ≈ 0
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-5 rounded-sm" style={{ background: "rgba(34,197,94,0.2)" }} /> low
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-5 rounded-sm" style={{ background: "rgba(245,158,11,0.4)" }} /> &gt; 50% tol
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-5 rounded-sm" style={{ background: "rgba(216,42,45,0.65)" }} /> exceeds tol
          </span>
          <span className="ml-auto">tol = {fmt(tolerance)} · row mean at right</span>
        </div>
      </div>
    </Card>
  );
}


// ─── Operator Hotspot Profile ─────────────────────────────────────────────────
// Horizontal bar chart of per-operator latency contribution after compression.
// Data: params with key pattern operator_hotspot.{i}.{operator|time_ms|percentage}

function OperatorHotspotProfile({ run }: { run: Run }) {
  const params = run.params ?? run.parameters ?? [];
  const indices = new Set<string>();
  for (const p of params) {
    const m = p.key.match(/^operator_hotspot\.(\d+)\./);
    if (m) indices.add(m[1]);
  }
  if (indices.size === 0) return null;

  type Hotspot = { label: string; operator: string; layer: string; opType: string; kernel: string; quantized: boolean; time_ms: number; percentage: number };
  const hotspots: Hotspot[] = [];
  for (const idx of [...indices].sort((a, b) => Number(a) - Number(b))) {
    const get = (suffix: string) => params.find((p) => p.key === `operator_hotspot.${idx}.${suffix}`)?.value;
    const pct = Number(get("percentage") ?? 0);
    if (pct <= 0) continue;
    const op = String(get("operator") ?? `op_${idx}`);
    const layer = String(get("layer") ?? "");
    hotspots.push({
      label: layer ? `${layer} (${op})` : op,
      operator: op,
      layer,
      opType: String(get("op_type") ?? ""),
      kernel: String(get("kernel") ?? ""),
      quantized: get("quantized") === true || get("quantized") === "true",
      time_ms: Number(get("time_ms") ?? 0),
      percentage: pct,
    });
  }
  if (hotspots.length === 0) return null;

  hotspots.sort((a, b) => b.percentage - a.percentage);
  const totalMs = hotspots.reduce((s, h) => s + h.time_ms, 0);

  const barColor = (pct: number): string => {
    if (pct >= 25) return "#D82A2D";
    if (pct >= 15) return "#F59E0B";
    if (pct >= 8) return "#0F3455";
    return "rgba(15,52,85,0.30)";
  };

  return (
    <Card>
      <SectionTitle
        title="Operator Hotspot Profile"
        help="After compression, where does inference time actually go? This horizontal bar chart is a lightweight profiler: each bar is one operator's share of wall time from log_operator_hotspot. Red (≥25%) is a dominant bottleneck you'll feel in p99 latency; amber and navy are progressively smaller slices — use it to decide which kernels or fusions to fix first."
      />
      <div className="px-3 pt-2 pb-1">
        <ResponsiveContainer width="100%" height={hotspots.length * 32 + 24}>
          <BarChart
            data={hotspots}
            layout="vertical"
            margin={{ top: 4, right: 60, bottom: 4, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,52,85,0.06)" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, Math.ceil(Math.max(...hotspots.map((h) => h.percentage)) / 5) * 5]}
              tick={{ fontSize: 10, fill: "rgba(15,52,85,0.32)" }}
              axisLine={false}
              tickLine={false}
              unit="%"
            />
            <YAxis
              type="category"
              dataKey="label"
              width={160}
              tick={{ fontSize: 10, fill: "rgba(15,52,85,0.55)", fontFamily: "monospace" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={({ payload }) => {
                if (!payload?.[0]) return null;
                const d = payload[0].payload as Hotspot;
                return (
                  <div
                    className="rounded-lg px-3 py-2 text-[11px] max-w-xs"
                    style={{
                      backgroundColor: "var(--cemi-hovercard-bg, #0F3455)",
                      border: "1px solid rgba(255,255,255,0.14)",
                      boxShadow: "0 10px 28px rgba(15,52,85,0.22)",
                      color: "var(--cemi-hovercard-fg, #F9F5EA)",
                    }}
                  >
                    <div className="font-semibold">{d.layer || d.operator}</div>
                    <div className="mt-0.5 text-[10px]" style={{ opacity: 0.85 }}>
                      {d.operator} · {d.opType}{d.kernel && d.kernel !== "—" ? ` · ${d.kernel}` : ""}
                      {d.quantized && <span className="ml-1 font-semibold">INT</span>}
                    </div>
                    <div className="mt-1 font-mono" style={{ opacity: 0.92 }}>
                      {d.percentage.toFixed(1)}% · {d.time_ms.toFixed(2)} ms
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="percentage" radius={[0, 4, 4, 0]} maxBarSize={20}>
              {hotspots.map((h, i) => (
                <Cell key={i} fill={barColor(h.percentage)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-between px-5 py-2.5 border-t border-[rgba(15,52,85,0.06)] text-[10px] text-[rgba(15,52,85,0.38)]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-4 rounded-sm" style={{ background: "#D82A2D" }} /> &ge;25%</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-4 rounded-sm" style={{ background: "#F59E0B" }} /> &ge;15%</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-4 rounded-sm" style={{ background: "#0F3455" }} /> &ge;8%</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-4 rounded-sm" style={{ background: "rgba(15,52,85,0.30)" }} /> &lt;8%</span>
        </div>
        <span className="font-mono">total {totalMs.toFixed(1)} ms · {hotspots.length} ops</span>
      </div>
    </Card>
  );
}

// ─── Operator Hotspot Table ───────────────────────────────────────────────────
// Detailed table showing exact layer, op type, kernel, shapes for each hotspot.

function OperatorHotspotTable({ run }: { run: Run }) {
  const params = run.params ?? run.parameters ?? [];
  const indices = new Set<string>();
  for (const p of params) {
    const m = p.key.match(/^operator_hotspot\.(\d+)\./);
    if (m) indices.add(m[1]);
  }
  if (indices.size === 0) return null;

  type HotspotRow = {
    rank: number;
    operator: string;
    layer: string;
    graphIndex: number | null;
    opType: string;
    kernel: string;
    inputShape: string;
    outputShape: string;
    quantized: boolean;
    time_ms: number;
    percentage: number;
  };

  const rows: HotspotRow[] = [];
  for (const idx of [...indices].sort((a, b) => Number(a) - Number(b))) {
    const get = (suffix: string) => params.find((p) => p.key === `operator_hotspot.${idx}.${suffix}`)?.value;
    const pct = Number(get("percentage") ?? 0);
    if (pct <= 0) continue;
    rows.push({
      rank: 0,
      operator: String(get("operator") ?? `op_${idx}`),
      layer: String(get("layer") ?? "—"),
      graphIndex: get("graph_index") != null ? Number(get("graph_index")) : null,
      opType: String(get("op_type") ?? "—"),
      kernel: String(get("kernel") ?? "—"),
      inputShape: String(get("input_shape") ?? "—"),
      outputShape: String(get("output_shape") ?? "—"),
      quantized: get("quantized") === true || get("quantized") === "true",
      time_ms: Number(get("time_ms") ?? 0),
      percentage: pct,
    });
  }
  if (rows.length === 0) return null;

  rows.sort((a, b) => b.percentage - a.percentage);
  rows.forEach((r, i) => { r.rank = i + 1; });
  const totalMs = rows.reduce((s, r) => s + r.time_ms, 0);

  const thCls = "px-3 py-2 text-left text-[9px] font-semibold uppercase tracking-[0.06em] text-[rgba(15,52,85,0.38)] whitespace-nowrap";

  return (
    <Card>
      <SectionTitle
        title="Operator Hotspots"
        help="The same hotspot data as the chart, but as an engineer's table: layer path, operator name, op type, kernel / weight layout, input and output tensor shapes, time and %. The Q column is INT vs FP — i.e. whether that op ran quantized on this backend. All rows come from log_operator_hotspot(); use it when you need exact shapes and dtypes to match vendor docs or reproduce a regression."
      />
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] border-collapse">
          <thead>
            <tr className="border-b border-[rgba(15,52,85,0.08)] bg-[rgba(15,52,85,0.018)]">
              <th className={thCls} style={{ width: 28 }}>#</th>
              <th className={thCls}>Layer</th>
              <th className={thCls}>Operator</th>
              <th className={thCls}>Type</th>
              <th className={thCls}>Kernel</th>
              <th className={thCls}>Input</th>
              <th className={thCls}>Output</th>
              <th className={`${thCls} text-center`}>Q</th>
              <th className={`${thCls} text-right`}>Time</th>
              <th className={`${thCls} text-right`} style={{ width: 50 }}>%</th>
              <th className={thCls} style={{ width: "15%" }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const barColor = r.percentage >= 25 ? "#D82A2D" : r.percentage >= 15 ? "#F59E0B" : r.percentage >= 8 ? "#0F3455" : "rgba(15,52,85,0.20)";
              return (
                <tr key={`${r.layer}-${r.rank}`} className="border-b border-[rgba(15,52,85,0.04)] last:border-0 hover:bg-[rgba(15,52,85,0.01)] transition-colors">
                  <td className="px-3 py-2 font-mono text-[10px] text-[rgba(15,52,85,0.28)]">{r.rank}</td>
                  <td className="px-3 py-2 font-mono text-[10px] text-[#0F3455] font-medium" title={r.layer}>
                    {r.layer}
                    {r.graphIndex != null && <span className="text-[rgba(15,52,85,0.25)] ml-1">#{r.graphIndex}</span>}
                  </td>
                  <td className="px-3 py-2 font-mono text-[10px] font-semibold text-[#0F3455]">{r.operator}</td>
                  <td className="px-3 py-2">
                    <code className="rounded bg-[rgba(15,52,85,0.05)] px-1 py-0.5 font-mono text-[9px] text-[rgba(15,52,85,0.50)]">{r.opType}</code>
                  </td>
                  <td className="px-3 py-2 font-mono text-[10px] text-[rgba(15,52,85,0.48)]">{r.kernel}</td>
                  <td className="px-3 py-2 font-mono text-[9px] text-[rgba(15,52,85,0.38)]" title={r.inputShape}>{r.inputShape}</td>
                  <td className="px-3 py-2 font-mono text-[9px] text-[rgba(15,52,85,0.38)]" title={r.outputShape}>{r.outputShape}</td>
                  <td className="px-3 py-2 text-center">
                    {r.quantized ? (
                      <span className="inline-block rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-700">INT</span>
                    ) : (
                      <span className="text-[9px] text-[rgba(15,52,85,0.20)]">FP</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-[10px] text-[rgba(15,52,85,0.55)]">{r.time_ms.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right font-mono text-[10px] font-semibold" style={{ color: barColor }}>{r.percentage.toFixed(1)}</td>
                  <td className="px-3 py-2">
                    <div className="h-2 rounded-full bg-[rgba(15,52,85,0.04)] overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${r.percentage}%`, background: barColor }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 border-t border-[rgba(15,52,85,0.06)] flex items-center justify-between text-[10px] text-[rgba(15,52,85,0.35)] font-mono">
        <span>{rows.length} operators · {rows.filter((r) => r.quantized).length} quantized</span>
        <span>{totalMs.toFixed(1)} ms total</span>
      </div>
    </Card>
  );
}

function OverviewTab({ run }: { run: Run }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <OperatorHotspotTable run={run} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <ParamsTable run={run} />
          <ArtifactsList run={run} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <MetricsRadar run={run} />
          <OperatorHotspotProfile run={run} />
          <EQCDivergenceHeatmap run={run} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIG TAB
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Metrics Radar + Stats ────────────────────────────────────────────────────
// Radar chart for the core numeric metrics, with a compact overflow strip below.

const RADAR_KEYS = [
  { key: "accuracy",       aliases: ["val_accuracy", "top1_accuracy"], label: "Accuracy",    unit: "%",  scale: 100, invert: false },
  { key: "latency_ms",     aliases: ["latency_p50_ms"],                label: "Latency",     unit: "ms", scale: 1,   invert: true },
  { key: "model_size_mb",  aliases: ["size_mb", "model_size_kb"],      label: "Size",        unit: "MB", scale: 1,   invert: true },
  { key: "compression_ratio", aliases: [],                             label: "Compression", unit: "×",  scale: 1,   invert: false },
  { key: "throughput_ips",  aliases: ["throughput"],                    label: "Throughput",  unit: "/s", scale: 1,   invert: false },
  { key: "f1",             aliases: ["val_f1"],                        label: "F1",          unit: "%",  scale: 100, invert: false },
  { key: "peak_memory_mb", aliases: ["memory_mb"],                     label: "Memory",      unit: "MB", scale: 1,   invert: true },
];

function MetricsRadar({ run }: { run: Run }) {
  const summary = (run.summary_metrics ?? {}) as Record<string, unknown>;

  // Some runs (especially live / partial / monitoring runs) may not have summary_metrics yet.
  // Fall back to the latest metric event value per name so the radar still renders.
  const events = getMetricEventArray(run);
  const latestByName = new Map<string, { value: number; step: number; t: number }>();
  for (const e of events) {
    const name = typeof e?.name === "string" ? e.name : "";
    if (!name) continue;
    const value = asFiniteNumber(e.value);
    if (value == null) continue;

    const step = typeof e.step === "number" && Number.isFinite(e.step) ? e.step : -1;
    const t =
      typeof e.timestamp_ms === "number" && Number.isFinite(e.timestamp_ms)
        ? e.timestamp_ms
        : typeof e.timestamp === "number" && Number.isFinite(e.timestamp)
          ? e.timestamp
          : typeof e.timestamp === "string"
            ? Date.parse(e.timestamp) || 0
            : 0;

    const prev = latestByName.get(name);
    // Prefer higher step; if step missing, prefer later timestamp.
    if (!prev || step > prev.step || (step === prev.step && t > prev.t)) {
      latestByName.set(name, { value, step, t });
    }
  }

  const merged: Record<string, unknown> = { ...summary };
  // Only fill missing keys from events to avoid overriding explicit summaries.
  for (const [name, info] of latestByName.entries()) {
    if (merged[name] == null) merged[name] = info.value;
  }

  const entries = Object.entries(merged).filter(([, v]) => asFiniteNumber(v) != null);
  if (entries.length === 0) return null;


  const radarData: Array<{ metric: string; value: number; rawValue: number; unit: string }> = [];
  const usedKeys = new Set<string>();

  for (const spec of RADAR_KEYS) {
    const raw = resolve(merged, spec.key, ...spec.aliases);
    if (raw == null) continue;
    const display = spec.key === "model_size_kb" ? raw / 1024 : raw * spec.scale;
    const normalized = spec.invert ? Math.max(0, 100 - display) : Math.min(display, 100);
    radarData.push({ metric: spec.label, value: Math.max(0, Math.min(100, normalized)), rawValue: raw, unit: spec.unit });
    usedKeys.add(spec.key);
    spec.aliases.forEach((a) => usedKeys.add(a));
  }

  const overflow = entries.filter(([k]) => !usedKeys.has(k));

  if (radarData.length < 3) return null;

  return (
    <Card>
      <SectionTitle
        title="Metrics Profile"
        help="A single radar snapshot of headline quality and speed numbers (each axis scaled to 0–100 for the plot). Push the blob outward on 'more is better' metrics (accuracy, F1, compression, throughput); for 'less is better' things (latency, model size, memory) we invert them so inward still reads as better. Extra numeric keys in summary_metrics that aren't on the radar appear in the grid below."
      />

      <div className="flex justify-center pt-2 pb-1">
        <RadarChart data={radarData} width={300} height={220} outerRadius="75%">
          <PolarGrid stroke="rgba(15,52,85,0.08)" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fontSize: 10, fill: "rgba(15,52,85,0.45)" }}
          />
          <PolarRadiusAxis
            tick={false}
            axisLine={false}
            domain={[0, 100]}
          />
          <Radar
            dataKey="value"
            stroke="#0F3455"
            fill="#0F3455"
            fillOpacity={0.12}
            strokeWidth={1.5}
            dot={{ r: 3, fill: "#0F3455" }}
          />
          <Tooltip
            content={({ payload }) => {
              if (!payload?.[0]) return null;
              const d = payload[0].payload;
              return (
                <div
                  className="rounded-lg px-3 py-2 text-[11px]"
                  style={{
                    backgroundColor: "var(--cemi-hovercard-bg, #0F3455)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    boxShadow: "0 10px 28px rgba(15,52,85,0.22)",
                    color: "var(--cemi-hovercard-fg, #F9F5EA)",
                  }}
                >
                  <span className="font-semibold">{d.metric}</span>
                  <span className="ml-2 font-mono" style={{ opacity: 0.92 }}>
                    {typeof d.rawValue === "number" ? fmt(d.rawValue) : "—"}{d.unit}
                  </span>
                </div>
              );
            }}
          />
        </RadarChart>
      </div>

      {/* Overflow metrics strip */}
      {overflow.length > 0 && (
        <div className="border-t border-[rgba(15,52,85,0.06)]">
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-[rgba(15,52,85,0.05)]">
            {overflow.map(([key, value]) => (
              <div key={key} className="px-4 py-2.5">
            <FieldLabel>{key.replace(/_/g, " ")}</FieldLabel>
                <div className="font-mono text-xs font-semibold text-[#0F3455] mt-0.5">
              {typeof value === "number" ? fmt(value) : String(value ?? "—")}
            </div>
          </div>
        ))}
      </div>
        </div>
      )}
    </Card>
  );
}

function ParamsTable({ run }: { run: Run }) {
  const allParams = run.params ?? run.parameters ?? [];
  const params = allParams.filter((p) => !p.key.startsWith("operator_hotspot."));
  if (params.length === 0) return null;

  const compression = params.filter((p) => p.key.startsWith("compression."));
  const other = params.filter((p) => !p.key.startsWith("compression."));

  return (
    <Card>
      <SectionTitle
        title="Parameters"
        help="Everything you logged as a key/value run config via log_parameter() including: training hyperparameters, calibration choices, target bit-widths, etc. For deployment qualification, pay special attention to compression.* entries: together they define the deployment profile ρ (what got quantized and how), which drives equivalence class (EQC) divergence and gate results."
      />
      {[compression, other].filter((g) => g.length > 0).map((group, gi) => (
        <div key={gi} className={gi > 0 ? "border-t border-[rgba(15,52,85,0.06)]" : ""}>
          {gi === 0 && compression.length > 0 && (
            <div className="px-5 py-2 bg-[rgba(15,52,85,0.015)]">
              <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[rgba(15,52,85,0.38)]">Compression</span>
            </div>
          )}
          {group.map((p, pi) => (
            <div key={p.key} className={`flex items-center justify-between px-5 py-2.5 ${pi < group.length - 1 ? "border-b border-[rgba(15,52,85,0.04)]" : ""}`}>
              <span className="text-xs text-[rgba(15,52,85,0.48)] truncate max-w-[200px]">{p.key.replace("compression.", "")}</span>
              <Chip>{String(p.value ?? "—")}</Chip>
            </div>
          ))}
        </div>
      ))}
    </Card>
  );
}

function ArtifactsList({ run }: { run: Run }) {
  const artifacts = run.artifacts ?? [];
  if (artifacts.length === 0) return null;

  return (
    <Card>
      <SectionTitle
        title="Artifacts"
        help="Binary and text outputs tied to this run — checkpoints, exported graphs, verification reports, manifests. Each row is registered with log_artifact() (name, type, optional URI, size) so you can trace exactly which bits were produced and reviewed alongside the metrics."
      />
      {artifacts.map((a: RunArtifact, i) => (
        <div key={i} className={`flex items-center justify-between px-5 py-3 ${i < artifacts.length - 1 ? "border-b border-[rgba(15,52,85,0.04)]" : ""}`}>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#0F3455] truncate">{a.name}</span>
              <span className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium bg-[rgba(15,52,85,0.05)] text-[rgba(15,52,85,0.52)]">{a.type}</span>
              {(a.url || a.uri) && (
                <a href={a.url ?? a.uri} target="_blank" rel="noreferrer" className="text-[rgba(15,52,85,0.25)] hover:text-[#0F3455] transition-colors">
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            {a.path && <div className="font-mono text-[10px] text-[rgba(15,52,85,0.30)] mt-0.5">{a.path}</div>}
          </div>
          <span className="font-mono text-xs text-[rgba(15,52,85,0.42)] shrink-0 ml-4">
            {a.size_bytes != null ? fmtBytes(a.size_bytes) : "—"}
          </span>
        </div>
      ))}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOG TAB — Run-scoped cemi.console
// ═══════════════════════════════════════════════════════════════════════════════

function fmtConsoleTs(ms: number | null): string {
  if (ms === null) return "--:--:--";
  return new Date(ms).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

function consoleLevelColor(level?: string): string {
  if (level === "error") return "#EF4444";
  if (level === "warn" || level === "warning") return "#F59E0B";
  if (level === "success") return "#22C55E";
  return "#A3A3A3";
}

function LogTab({ run }: { run: Run }) {
  const viewportRef = useRef(null as any);
  const actionEvents: RunActionEvent[] = run.action_events ?? [];

  const deviceLabel =
    run.context?.device?.board ??
    run.target_profile?.name ??
    run.platform_fingerprint?.hardware_backend ??
    "n/a";

  const entries = actionEvents.map((e, i) => {
    const ts =
      (typeof e.timestamp_ms === "number" ? e.timestamp_ms : null) ??
      (typeof e.timestamp === "number" ? e.timestamp : null) ??
      (typeof e.timestamp === "string" ? Date.parse(e.timestamp) : null);
    return {
      id: e.id ?? `${run.id}-${i}`,
      action: e.action ?? "cemi_event",
      level: e.level ?? "info",
      device: e.device ?? deviceLabel,
      summary: e.summary ?? e.run_name ?? run.name ?? run.id.slice(0, 8),
      output: e.output ?? "",
      ts,
      isDrift: e.action === "drift_state_transition",
    };
  }).sort((a, b) => {
    if (a.ts !== null && b.ts !== null) return a.ts - b.ts;
    if (a.ts !== null) return -1;
    if (b.ts !== null) return 1;
    return 0;
  });

  const ms = run.monitor_state;

  useEffect(() => {
    const node = viewportRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [entries.length]);

  if (entries.length === 0) {
    return <Card><EmptyBlock>No action events recorded for this run.</EmptyBlock></Card>;
  }

  const mono = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

  return (
    <div className="space-y-4">
      {/* Dark terminal — run-scoped cemi.console */}
      <div
        style={{
          minHeight: 400,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderRadius: 12,
          border: "1px solid #343434",
          backgroundColor: "#1C1C1C",
          color: "#F5F5F5",
        }}
      >
        {/* Header bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderBottom: "1px solid #2C2C2C",
            backgroundColor: "#1C1C1C",
            padding: "10px 16px",
          }}
        >
          <Terminal style={{ width: 14, height: 14, color: "#E5E5E5" }} />
          <span style={{ fontFamily: mono, fontSize: 13, color: "#FAFAFA", fontWeight: 500 }}>
            cemi.console
          </span>
          <span style={{ fontFamily: mono, fontSize: 11, color: "#666", marginLeft: 4 }}>
            — {run.name ?? run.id}
          </span>
          <span style={{ marginLeft: "auto", fontFamily: mono, fontSize: 11, color: "#555" }}>
            {entries.length} event{entries.length !== 1 ? "s" : ""}
          </span>
                  </div>

        {/* Monitor state banner */}
        {ms && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              padding: "6px 16px",
              fontFamily: mono,
              fontSize: 12,
              borderBottom: "1px solid #2C2C2C",
              backgroundColor:
                ms.state === "REQUALIFY" ? "#2B0A0A" :
                ms.state === "WARN" ? "#2B1D06" : "#0D2B1A",
              borderLeft: `3px solid ${
                ms.state === "REQUALIFY" ? "#EF4444" :
                ms.state === "WARN" ? "#F59E0B" : "#22C55E"
              }`,
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                  backgroundColor:
                    ms.state === "REQUALIFY" ? "#EF4444" :
                    ms.state === "WARN" ? "#F59E0B" : "#22C55E",
                  boxShadow: ms.state !== "NOMINAL"
                    ? `0 0 6px ${ms.state === "REQUALIFY" ? "#EF4444" : "#F59E0B"}`
                    : "none",
                }}
              />
              <span style={{ color: ms.state === "REQUALIFY" ? "#EF4444" : ms.state === "WARN" ? "#F59E0B" : "#22C55E", fontWeight: 600 }}>
                {ms.state}
              </span>
            </span>
            <span style={{ color: "#A3A3A3" }}>
              cusum <span style={{ color: "#E5E5E5" }}>{ms.cusum_statistic.toFixed(4)}</span>
            </span>
            <span style={{ color: "#A3A3A3" }}>
              adwin_mean <span style={{ color: "#E5E5E5" }}>{ms.adwin_window_mean != null ? ms.adwin_window_mean.toFixed(6) : "—"}</span>
            </span>
            <span style={{ color: "#A3A3A3" }}>
              n <span style={{ color: "#E5E5E5" }}>{ms.n_samples}</span>
            </span>
                </div>
        )}

        {/* Scrollable event feed */}
        <div
          ref={viewportRef}
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            backgroundColor: "#232323",
            padding: 16,
            fontFamily: mono,
            fontSize: 13,
            lineHeight: 1.75,
          }}
        >
          {entries.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {entries.map((e) => {
                const driftAccent =
                  e.level === "error" ? "#EF4444" :
                  e.level === "warn" ? "#F59E0B" : "#22C55E";
                return (
                  <div
                    key={e.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      minWidth: "max-content",
                      whiteSpace: "nowrap",
                      color: "#F5F5F5",
                      ...(e.isDrift ? {
                        borderLeft: `3px solid ${driftAccent}`,
                        paddingLeft: 8,
                        backgroundColor:
                          e.level === "error" ? "rgba(239,68,68,0.07)" :
                          e.level === "warn" ? "rgba(245,158,11,0.07)" :
                          "rgba(34,197,94,0.07)",
                        borderRadius: 2,
                      } : {}),
                    }}
                  >
                    <span style={{ flexShrink: 0, color: "#E5E5E5" }}>$</span>
                    <span style={{ width: 80, flexShrink: 0, color: "#A3A3A3", overflow: "hidden", textOverflow: "ellipsis" }}>
                      [{fmtConsoleTs(e.ts)}]
                    </span>
                    <span style={{ width: 140, flexShrink: 0, color: "#B3B3B3", overflow: "hidden", textOverflow: "ellipsis" }}>
                      [{e.device}]
                    </span>
                    <span
                      style={{
                        width: 180, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis",
                        color: consoleLevelColor(e.level),
                        fontWeight: e.isDrift ? 600 : undefined,
                      }}
                    >
                      [{e.action}]
                    </span>
                    <span style={{ width: 200, flexShrink: 0, color: "#F5F5F5", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {e.summary}
                    </span>
                    {e.output && (
                      <span style={{ minWidth: 300, color: "#FFFFFF", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {e.output}
                      </span>
                    )}
              </div>
                );
              })}
          </div>
          ) : (
            <div style={{ color: "#666" }}>$ no events recorded for this run</div>
      )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════════

const runDetailTabs = [
  { value: "overview", label: "Overview", Icon: Eye },
  { value: "log",      label: "Console",  Icon: Terminal },
] as const;

function RunDetailTabs({ run }: { run: Run }) {
  const [active, setActive] = useState("overview");

  return (
    <div className="mt-5">
      <div
        style={{
          display: "flex",
          gap: 32,
          borderBottom: "1px solid rgba(15,52,85,0.08)",
          marginBottom: 16,
        }}
      >
        {runDetailTabs.map(({ value, label, Icon }) => {
          const isActive = active === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setActive(value)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 4px",
                fontSize: 14,
                fontWeight: 500,
                whiteSpace: "nowrap",
                color: isActive ? "#D82A2D" : "rgba(15,52,85,0.56)",
                background: "transparent",
                cursor: "pointer",
                transition: "color 0.15s, border-color 0.15s",
                border: "none",
                borderBottomStyle: "solid",
                borderBottomWidth: 2,
                borderBottomColor: isActive ? "#D82A2D" : "transparent",
                marginBottom: -1,
              }}
            >
              <Icon style={{ width: 16, height: 16, color: isActive ? "#D82A2D" : undefined }} />
              {label}
            </button>
          );
        })}
      </div>

      {active === "overview" && <OverviewTab run={run} />}
      {active === "log" && <LogTab run={run} />}
    </div>
  );
}

interface RunDetailPageProps {
  run: Run;
  allRuns?: Run[];
  onBack: () => void;
}

export function RunDetailPage({ run, onBack }: RunDetailPageProps) {
  return (
    <div className="mx-auto w-full max-w-[1180px]">
      {/* Back nav */}
      <button
        type="button" onClick={onBack}
        className="mb-3 inline-flex items-center gap-1.5 text-xs text-[rgba(15,52,85,0.42)] hover:text-[#0F3455] transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Runs
      </button>

      {/* Header + Runtime Monitor — side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 16, alignItems: "stretch" }}>
        <HeaderCard run={run} />
        <CUSUMChart run={run} />
      </div>

      {/* Tabbed content */}
      <RunDetailTabs run={run} />
    </div>
  );
}
