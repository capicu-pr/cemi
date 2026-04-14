import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { Page } from "../../components/cemi/layout/Page";
import { Button } from "../../components/ui/button";
import { animationPresets, shadowPresets } from "../../components/ui/animated-interactive";
import {
  ScatterRenderer,
  type ScatterDataPoint,
} from "../../components/ui/widget/renderers/ScatterRenderer";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { ScrollArea, ScrollBar } from "../../components/ui/scroll-area";
import type { RunRecord } from "../../types/domain";
import {
  getMetricSpecByDimension,
  getResolvedComparePolicySpec,
  normalizeDecisionPolicy,
  type DecisionPolicy,
  type LoggedPolicyMetadata,
  type CompareMetricSpec,
} from "./comparePolicy";
import { PlatformMatrix } from "./PlatformMatrix";
import { QualGateDiff } from "./QualGateDiff";

interface CaseMetadata {
  suite: string;
  task: string;
  scenario: string;
  dataset: string;
}

interface TargetDeviceMetadata {
  board: string;
  runtime: string;
  flashBudget: string;
  ramBudget: string;
}

const DEFAULT_CASE_METADATA: CaseMetadata = {
  suite: "-",
  task: "-",
  scenario: "-",
  dataset: "-",
};

const DEFAULT_TARGET_DEVICE_METADATA: TargetDeviceMetadata = {
  board: "-",
  runtime: "-",
  flashBudget: "-",
  ramBudget: "",
};

const DECISION_POLICY_OPTIONS: DecisionPolicy[] = [
  "Balanced",
  "Quality",
  "Latency",
  "Memory",
  "Energy",
];

const TABLE_HEADER_BACKGROUND = "rgba(15, 52, 85, 0.05)";
const RUN_COLORS = ["#D82A2D", "#0F3455", "#A67C52", "#2D6A4F", "#6B4EFF", "#C65D2E"];
const RUNS_TABLE_FIRST_COLUMN_MIN_WIDTH = "240px";
const RUNS_TABLE_COLUMN_MIN_WIDTH = "124px";
const RUNS_TABLE_HEADER_PADDING = "0.7rem 1rem";
const RUNS_TABLE_CELL_PADDING = "0.5rem 1rem";
const RUNS_TABLE_FIRST_CELL_PADDING = "0rem 0.9rem";
const MODAL_INPUT_STYLE: React.CSSProperties = {
  backgroundColor: TABLE_HEADER_BACKGROUND,
  borderColor: "rgba(15, 52, 85, 0.12)",
  paddingLeft: "0.75rem",
};
const TOOL_SURFACE_BACKGROUND = "var(--cemi-surface-bg, #F9F5EA)";

const COMPARE_CARD_STYLE: React.CSSProperties = {
  borderRadius: "0.5rem",
  boxShadow: shadowPresets.sm,
};

interface DisplayMetric {
  key: string;
  value: number;
  source: "summary" | "event";
}

type FieldConflictMap<T extends string> = Partial<Record<T, string[]>>;

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function getRunContextSection(run: RunRecord, section: string): Record<string, unknown> | null {
  const resolvedRun = asRunShape(run);
  const context = asRecord(resolvedRun.context);
  return asRecord(context?.[section]);
}

function getRunParameterValue(run: RunRecord, key: string): unknown {
  const resolvedRun = asRunShape(run);
  const parameters = Array.isArray(resolvedRun.parameters)
    ? resolvedRun.parameters
    : Array.isArray(resolvedRun.params)
      ? resolvedRun.params
      : [];
  const match = parameters.find((entry: any) => entry?.key === key);
  return match?.value;
}

function getNonEmptyString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function formatBudgetValue(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

function getDistinctValues(values: Array<string | null | undefined>): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value && value.trim()))));
}

function getCaseFieldValue(run: RunRecord, field: keyof CaseMetadata): string | null {
  const section = getRunContextSection(run, "case");
  if (field === "suite") {
    return getNonEmptyString(section?.suite, getRunParameterValue(run, "case.suite"));
  }
  if (field === "task") {
    return getNonEmptyString(section?.task, getRunParameterValue(run, "case.task"));
  }
  if (field === "scenario") {
    return getNonEmptyString(
      section?.scenario,
      getRunParameterValue(run, "case.scenario"),
      getRunParameterValue(run, "benchmark_scenario")
    );
  }
  return getNonEmptyString(
    section?.dataset,
    getRunParameterValue(run, "case.dataset"),
    getRunParameterValue(run, "dataset_name"),
    asRunShape(run).dataset_name
  );
}

function getTargetDeviceFieldValue(run: RunRecord, field: keyof TargetDeviceMetadata): string | null {
  const section = getRunContextSection(run, "device");
  const targetProfile = asRecord(asRunShape(run).target_profile);
  const memoryBudgetCandidate = getNonEmptyString(
    formatBudgetValue(section?.memory_budget),
    formatBudgetValue(getRunParameterValue(run, "device.memory_budget"))
  );

  if (field === "board") {
    return getNonEmptyString(section?.board, getRunParameterValue(run, "device.board"), targetProfile?.name);
  }
  if (field === "runtime") {
    return getNonEmptyString(
      section?.runtime,
      getRunParameterValue(run, "device.runtime"),
      getRunParameterValue(run, "runtime"),
      targetProfile?.runtime
    );
  }
  if (field === "flashBudget") {
    return getNonEmptyString(
      formatBudgetValue(section?.flash_budget),
      formatBudgetValue(getRunParameterValue(run, "device.flash_budget")),
      memoryBudgetCandidate
    );
  }
  return getNonEmptyString(
    formatBudgetValue(section?.ram_budget),
    formatBudgetValue(getRunParameterValue(run, "device.ram_budget")),
    memoryBudgetCandidate
  );
}

function getPolicyValue(run: RunRecord): DecisionPolicy | null {
  const section = getRunContextSection(run, "policy");
  return (
    normalizeDecisionPolicy(section?.name) ||
    normalizeDecisionPolicy(getRunParameterValue(run, "policy.name")) ||
    normalizeDecisionPolicy(getRunParameterValue(run, "decision_policy.name"))
  );
}

function resolveCaseMetadataFromRuns(runs: RunRecord[]): CaseMetadata {
  const resolved = { ...DEFAULT_CASE_METADATA };
  for (const run of runs) {
    resolved.suite = getNonEmptyString(getCaseFieldValue(run, "suite"), resolved.suite) || resolved.suite;
    resolved.task = getNonEmptyString(getCaseFieldValue(run, "task"), resolved.task) || resolved.task;
    resolved.scenario = getNonEmptyString(getCaseFieldValue(run, "scenario"), resolved.scenario) || resolved.scenario;
    resolved.dataset = getNonEmptyString(getCaseFieldValue(run, "dataset"), resolved.dataset) || resolved.dataset;
  }
  return resolved;
}

function resolveTargetDeviceMetadataFromRuns(runs: RunRecord[]): TargetDeviceMetadata {
  const resolved = { ...DEFAULT_TARGET_DEVICE_METADATA };
  for (const run of runs) {
    resolved.board = getNonEmptyString(getTargetDeviceFieldValue(run, "board"), resolved.board) || resolved.board;
    resolved.runtime =
      getNonEmptyString(getTargetDeviceFieldValue(run, "runtime"), resolved.runtime) || resolved.runtime;
    resolved.flashBudget =
      getNonEmptyString(getTargetDeviceFieldValue(run, "flashBudget"), resolved.flashBudget) || resolved.flashBudget;
    resolved.ramBudget =
      getNonEmptyString(getTargetDeviceFieldValue(run, "ramBudget"), resolved.ramBudget) || resolved.ramBudget;
  }
  return resolved;
}

function resolveDecisionPolicyFromRuns(runs: RunRecord[]): DecisionPolicy {
  for (const run of runs) {
    const resolved = getPolicyValue(run);
    if (resolved) return resolved;
  }
  return "Balanced";
}

function resolveLoggedPolicyMetadataFromRuns(runs: RunRecord[]): LoggedPolicyMetadata | null {
  const names = getDistinctValues(
    runs.map((run) => {
      const section = getRunContextSection(run, "policy");
      const name =
        normalizeDecisionPolicy(section?.name) ||
        normalizeDecisionPolicy(getRunParameterValue(run, "policy.name")) ||
        normalizeDecisionPolicy(getRunParameterValue(run, "decision_policy.name"));
      return name || null;
    })
  );
  const objectiveMetrics = getDistinctValues(
    runs.map((run) => {
      const section = getRunContextSection(run, "policy");
      return getNonEmptyString(
        section?.objective_metric,
        getRunParameterValue(run, "policy.objective_metric"),
        getRunParameterValue(run, "decision_policy.objective_metric")
      );
    })
  );
  const directions = getDistinctValues(
    runs.map((run) => {
      const section = getRunContextSection(run, "policy");
      return getNonEmptyString(
        section?.objective_direction,
        getRunParameterValue(run, "policy.objective_direction"),
        getRunParameterValue(run, "decision_policy.objective_direction")
      );
    })
  );

  if (names.length === 0 && objectiveMetrics.length === 0 && directions.length === 0) return null;

  return {
    name: names.length === 1 ? normalizeDecisionPolicy(names[0]) : null,
    objectiveMetric: objectiveMetrics.length === 1 ? objectiveMetrics[0] : null,
    objectiveDirection:
      directions.length === 1 &&
      (directions[0] === "higher_is_better" || directions[0] === "lower_is_better" || directions[0] === "none")
        ? directions[0]
        : null,
  };
}

function resolveCaseConflictsFromRuns(runs: RunRecord[]): FieldConflictMap<keyof CaseMetadata> {
  const conflicts: FieldConflictMap<keyof CaseMetadata> = {};
  (["suite", "task", "scenario", "dataset"] as Array<keyof CaseMetadata>).forEach((field) => {
    const values = getDistinctValues(runs.map((run) => getCaseFieldValue(run, field)));
    if (values.length > 1) conflicts[field] = values;
  });
  return conflicts;
}

function resolveTargetDeviceConflictsFromRuns(
  runs: RunRecord[]
): FieldConflictMap<keyof TargetDeviceMetadata> {
  const conflicts: FieldConflictMap<keyof TargetDeviceMetadata> = {};
  (["board", "runtime", "flashBudget", "ramBudget"] as Array<keyof TargetDeviceMetadata>).forEach((field) => {
    const values = getDistinctValues(runs.map((run) => getTargetDeviceFieldValue(run, field)));
    if (values.length > 1) conflicts[field] = values;
  });
  return conflicts;
}

function resolveDecisionPolicyConflictsFromRuns(runs: RunRecord[]): string[] {
  return getDistinctValues(runs.map((run) => getPolicyValue(run)));
}

function renderConflictValues(values?: string[]) {
  if (!values || values.length < 2) return null;
  return `Values in selection: ${values.join(" | ")}`;
}

function asRunShape(run: RunRecord): any {
  return run as any;
}

function formatDateTime(value?: string | number | null): string {
  if (value === undefined || value === null) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatTimeAgo(value?: string | number | null): string {
  if (value === undefined || value === null) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
  if (diffHours > 0) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  if (diffMinutes > 0) return `${diffMinutes} ${diffMinutes === 1 ? "minute" : "minutes"} ago`;
  return "just now";
}

function formatMetricValue(key: string, raw: unknown): string {
  if (typeof raw !== "number" || !Number.isFinite(raw)) return "—";

  const lowerKey = key.toLowerCase();
  if (
    lowerKey.includes("acc") ||
    lowerKey.includes("accuracy") ||
    lowerKey.includes("f1") ||
    lowerKey.includes("sensitivity") ||
    lowerKey.includes("specificity")
  ) {
    return `${(raw * 100).toFixed(1)}%`;
  }

  return Number.isInteger(raw) ? String(raw) : raw.toFixed(4);
}

function formatMetricLabel(key: string): string {
  const withoutUnits = key
    .replace(/(?:^|[_\s-])(mb|gb|kb|b|mw|w|kw|ms|us|ns|sec|secs|seconds)$/i, "")
    .trim();

  return withoutUnits
    .replace(/[_-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => {
      const normalized = part.toLowerCase();
      if (/^[a-z]\d+$/i.test(part)) {
        return part.charAt(0).toUpperCase() + part.slice(1);
      }
      return normalized.charAt(0).toUpperCase() + normalized.slice(1);
    })
    .join(" ");
}

function getDisplayMetrics(run: RunRecord): DisplayMetric[] {
  const resolvedRun = asRunShape(run);
  const metrics = new Map<string, DisplayMetric>();
  const summary = (resolvedRun.summary_metrics || {}) as Record<string, unknown>;

  for (const [key, value] of Object.entries(summary)) {
    if (typeof value !== "number" || !Number.isFinite(value)) continue;
    metrics.set(key, { key, value, source: "summary" });
  }

  const rawMetrics = Array.isArray(resolvedRun.metrics) ? resolvedRun.metrics : [];
  const latestEventMetrics = new Map<string, { value: number; sortValue: number; firstSeen: number }>();

  rawMetrics.forEach((metric: any, index: number) => {
    const key = typeof metric?.name === "string" ? metric.name.trim() : "";
    const value = metric?.value;
    if (!key || typeof value !== "number" || !Number.isFinite(value)) return;

    const sortValue =
      typeof metric?.timestamp_ms === "number" && Number.isFinite(metric.timestamp_ms)
        ? metric.timestamp_ms
        : typeof metric?.step === "number" && Number.isFinite(metric.step)
          ? metric.step
          : index;

    const existing = latestEventMetrics.get(key);
    if (!existing || sortValue >= existing.sortValue) {
      latestEventMetrics.set(key, {
        value,
        sortValue,
        firstSeen: existing?.firstSeen ?? index,
      });
    }
  });

  Array.from(latestEventMetrics.entries())
    .sort((a, b) => a[1].firstSeen - b[1].firstSeen)
    .forEach(([key, metric]) => {
      if (!metrics.has(key)) {
        metrics.set(key, { key, value: metric.value, source: "event" });
      }
    });

  return Array.from(metrics.values());
}

function getScalarMetricColumns(metricCollections: DisplayMetric[][]): string[] {
  const counts = new Map<string, number>();
  const firstSeenOrder = new Map<string, number>();
  let order = 0;

  for (const metrics of metricCollections) {
    for (const metric of metrics) {
      if (!firstSeenOrder.has(metric.key)) firstSeenOrder.set(metric.key, order++);
      counts.set(metric.key, (counts.get(metric.key) || 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return (firstSeenOrder.get(a[0]) || 0) - (firstSeenOrder.get(b[0]) || 0);
    })
    .slice(0, 4)
    .map(([key]) => key);
}

function getStatusTone(status?: string | null): string {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "running") return "bg-[#FFF5DA] text-[#8A5A00]";
  if (normalized === "succeeded" || normalized === "completed") return "bg-[#E7F5EC] text-[#136C3E]";
  if (normalized === "failed") return "bg-[#FDEBEC] text-[#B42318]";
  return "bg-[#E8EEF6] text-[#0F3455]";
}

function getRunColor(index: number): string {
  return RUN_COLORS[index % RUN_COLORS.length];
}

function asMetricEvents(run: RunRecord): Array<{ name?: string; value: number; step?: number; timestamp_ms?: number }> {
  const metrics = (run as any).metrics;
  if (Array.isArray(metrics)) return metrics;
  if (metrics && typeof metrics === "object" && Array.isArray(metrics.events)) {
    return metrics.events;
  }
  return [];
}

function getMetricPriority(metricName: string, candidates: string[]): number {
  const normalizedName = metricName.trim().toLowerCase();
  if (!normalizedName) return -1;

  const exactIndex = candidates.findIndex((candidate) => normalizedName === candidate);
  if (exactIndex >= 0) return 100 - exactIndex;

  const includeIndex = candidates.findIndex((candidate) => normalizedName.includes(candidate));
  if (includeIndex >= 0) return 60 - includeIndex;

  return -1;
}

function resolveRunMetricValue(run: RunRecord, candidates: string[]): number | null {
  const summaryMetrics = (run.summary_metrics || {}) as Record<string, unknown>;
  let bestSummaryMatch: { priority: number; value: number } | null = null;

  for (const [key, rawValue] of Object.entries(summaryMetrics)) {
    if (typeof rawValue !== "number" || !Number.isFinite(rawValue)) continue;
    const priority = getMetricPriority(key, candidates);
    if (priority < 0) continue;
    if (!bestSummaryMatch || priority > bestSummaryMatch.priority) {
      bestSummaryMatch = { priority, value: rawValue };
    }
  }

  if (bestSummaryMatch) return bestSummaryMatch.value;

  let bestEventMatch: { priority: number; order: number; value: number } | null = null;
  const metricEvents = asMetricEvents(run);
  for (let index = 0; index < metricEvents.length; index += 1) {
    const metric = metricEvents[index];
    if (typeof metric.value !== "number" || !Number.isFinite(metric.value)) continue;
    const priority = getMetricPriority(metric.name || "", candidates);
    if (priority < 0) continue;
    const order =
      typeof metric.timestamp_ms === "number" && Number.isFinite(metric.timestamp_ms)
        ? metric.timestamp_ms
        : typeof metric.step === "number" && Number.isFinite(metric.step)
          ? metric.step
          : index;

    if (
      !bestEventMatch ||
      priority > bestEventMatch.priority ||
      (priority === bestEventMatch.priority && order >= bestEventMatch.order)
    ) {
      bestEventMatch = {
        priority,
        order,
        value: metric.value,
      };
    }
  }

  return bestEventMatch?.value ?? null;
}

interface ComparePageProps {
  projectId?: string;
  projectName?: string;
  runs: RunRecord[];
  compareRunIds: string[];
  onRunClick: (run: RunRecord) => void;
  onNavigate: (path: string) => void;
  onToggleCompare: (runId: string) => void;
}

interface CandidateComparisonRowProps {
  key?: React.Key;
  run: RunRecord;
  displayMetrics: DisplayMetric[];
  index: number;
  totalRuns: number;
  isCompareSelected: boolean;
  onToggleCompare: (runId: string) => void;
  onRunClick: (run: RunRecord) => void;
  scalarMetricColumns: string[];
}

interface ConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children?: React.ReactNode;
  footer: React.ReactNode;
}

function ConfigModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: ConfigModalProps) {
  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9998 }}>
      <div
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(15, 52, 85, 0.24)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 9999,
          width: "min(26rem, calc(100vw - 2rem))",
          maxHeight: "min(34rem, calc(100vh - 2rem))",
          overflow: "hidden",
          borderRadius: "0.5rem",
          border: "1px solid rgba(15, 52, 85, 0.12)",
          backgroundColor: TOOL_SURFACE_BACKGROUND,
          boxShadow: "0 24px 80px rgba(15, 52, 85, 0.18)",
        }}
      >
        <div className="border-b border-[rgba(15,52,85,0.08)] px-4 py-3.5">
          <div className="text-base font-semibold text-[#0F3455]">{title}</div>
          <div className="mt-1 text-sm leading-5 text-[rgba(15,52,85,0.62)]">{description}</div>
        </div>
        <div
          className="overflow-y-auto px-4 py-3.5"
          style={{ maxHeight: "calc(min(34rem, calc(100vh - 2rem)) - 8.5rem)" }}
        >
          {children}
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-[rgba(15,52,85,0.08)] px-4 py-3.5 sm:flex-row sm:justify-end">
          {footer}
        </div>
      </div>
    </div>
  );
}

export function ComparePage({
  projectId: _projectId,
  projectName: _projectName = "Project",
  runs,
  compareRunIds,
  onRunClick,
  onNavigate,
  onToggleCompare,
}: ComparePageProps) {
  const qualityMetricSpec = getMetricSpecByDimension("quality");
  const latencyMetricSpec = getMetricSpecByDimension("latency");
  const memoryMetricSpec = getMetricSpecByDimension("memory");
  const energyMetricSpec = getMetricSpecByDimension("energy");
  const seededCaseMetadata = useMemo(() => resolveCaseMetadataFromRuns(runs), [runs]);
  const seededTargetDeviceMetadata = useMemo(() => resolveTargetDeviceMetadataFromRuns(runs), [runs]);
  const seededDecisionPolicy = useMemo(() => resolveDecisionPolicyFromRuns(runs), [runs]);
  const loggedPolicyMetadata = useMemo(() => resolveLoggedPolicyMetadataFromRuns(runs), [runs]);
  const caseConflicts = useMemo(() => resolveCaseConflictsFromRuns(runs), [runs]);
  const targetDeviceConflicts = useMemo(() => resolveTargetDeviceConflictsFromRuns(runs), [runs]);
  const decisionPolicyConflicts = useMemo(() => resolveDecisionPolicyConflictsFromRuns(runs), [runs]);
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [caseMetadata, setCaseMetadata] = useState(seededCaseMetadata);
  const [draftCaseMetadata, setDraftCaseMetadata] = useState(seededCaseMetadata);
  const [isTargetDeviceModalOpen, setIsTargetDeviceModalOpen] = useState(false);
  const [targetDeviceMetadata, setTargetDeviceMetadata] = useState(seededTargetDeviceMetadata);
  const [draftTargetDeviceMetadata, setDraftTargetDeviceMetadata] = useState(seededTargetDeviceMetadata);
  const [decisionPolicy, setDecisionPolicy] = useState<DecisionPolicy>(seededDecisionPolicy);
  const [selectedCandidateRunIds, setSelectedCandidateRunIds] = useState<Set<string>>(new Set());
  const resolvedPolicySpec = useMemo(
    () => getResolvedComparePolicySpec(decisionPolicy, loggedPolicyMetadata),
    [decisionPolicy, loggedPolicyMetadata]
  );
  const paretoViewSpec = resolvedPolicySpec.paretoView;
  const compareScatterData = useMemo<ScatterDataPoint[]>(
    () => {
      const points: ScatterDataPoint[] = [];
      runs.forEach((run) => {
        const xMetricValue = resolveRunMetricValue(run, paretoViewSpec.xMetric.candidates);
        const yMetricValue = resolveRunMetricValue(run, paretoViewSpec.yMetric.candidates);

        if (xMetricValue === null || yMetricValue === null) return;

        points.push({
          x: xMetricValue,
          y: yMetricValue,
          runId: run.id,
          name: run.name || run.id.slice(0, 8),
        });
      });
      return points;
    },
    [runs, paretoViewSpec]
  );
  const candidateComparisonRuns = useMemo(() => {
    const getMetricDirection = (metricSpec: CompareMetricSpec) =>
      metricSpec.direction === "lower_is_better" ? "asc" : "desc";

    const getMetricValue = (run: RunRecord, metricSpec: CompareMetricSpec) =>
      resolveRunMetricValue(run, metricSpec.candidates);

    const rows = runs.map((run) => {
      const accuracy = resolveRunMetricValue(run, qualityMetricSpec.candidates);
      const latency = resolveRunMetricValue(run, latencyMetricSpec.candidates);
      const memory = resolveRunMetricValue(run, memoryMetricSpec.candidates);
      const energy = resolveRunMetricValue(run, energyMetricSpec.candidates);
      const primaryMetricValue = getMetricValue(run, resolvedPolicySpec.ranking.primaryMetric);
      const secondaryMetricValue = getMetricValue(run, resolvedPolicySpec.ranking.secondaryMetric);
      return {
        run,
        accuracy,
        latency,
        memory,
        energy,
        primaryMetricValue,
        secondaryMetricValue,
      };
    });

    const normalize = (value: number | null, values: Array<number | null>, invert = false) => {
      if (value === null) return 0;
      const numericValues = values.filter((entry): entry is number => entry !== null && Number.isFinite(entry));
      if (numericValues.length === 0) return 0;
      const min = Math.min(...numericValues);
      const max = Math.max(...numericValues);
      if (max === min) return 1;
      const normalized = (value - min) / (max - min);
      return invert ? 1 - normalized : normalized;
    };

    const accuracies = rows.map((row) => row.accuracy);
    const latencies = rows.map((row) => row.latency);
    const memories = rows.map((row) => row.memory);
    const primaryValues = rows.map((row) => row.primaryMetricValue);
    const secondaryValues = rows.map((row) => row.secondaryMetricValue);

    const compareNullable = (a: number | null, b: number | null, direction: "asc" | "desc") => {
      if (a === null && b === null) return 0;
      if (a === null) return 1;
      if (b === null) return -1;
      return direction === "asc" ? a - b : b - a;
    };

    return rows
      .sort((left, right) => {
        if (resolvedPolicySpec.ranking.strategy === "objective_first") {
          return (
            compareNullable(
              left.primaryMetricValue,
              right.primaryMetricValue,
              getMetricDirection(resolvedPolicySpec.ranking.primaryMetric)
            ) ||
            compareNullable(
              left.secondaryMetricValue,
              right.secondaryMetricValue,
              getMetricDirection(resolvedPolicySpec.ranking.secondaryMetric)
            ) ||
            compareNullable(left.accuracy, right.accuracy, "desc") ||
            compareNullable(left.latency, right.latency, "asc") ||
            compareNullable(left.memory, right.memory, "asc") ||
            compareNullable(left.energy, right.energy, "asc") ||
            left.run.name?.localeCompare(right.run.name || "") ||
            left.run.id.localeCompare(right.run.id)
          );
        }

        const leftBalanced =
          normalize(
            left.primaryMetricValue,
            primaryValues,
            resolvedPolicySpec.ranking.primaryMetric.direction === "lower_is_better"
          ) +
          normalize(
            left.secondaryMetricValue,
            secondaryValues,
            resolvedPolicySpec.ranking.secondaryMetric.direction === "lower_is_better"
          );
        const rightBalanced =
          normalize(
            right.primaryMetricValue,
            primaryValues,
            resolvedPolicySpec.ranking.primaryMetric.direction === "lower_is_better"
          ) +
          normalize(
            right.secondaryMetricValue,
            secondaryValues,
            resolvedPolicySpec.ranking.secondaryMetric.direction === "lower_is_better"
          );

        return (
          rightBalanced - leftBalanced ||
          compareNullable(
            left.primaryMetricValue,
            right.primaryMetricValue,
            getMetricDirection(resolvedPolicySpec.ranking.primaryMetric)
          ) ||
          compareNullable(
            left.secondaryMetricValue,
            right.secondaryMetricValue,
            getMetricDirection(resolvedPolicySpec.ranking.secondaryMetric)
          ) ||
          compareNullable(left.accuracy, right.accuracy, "desc") ||
          compareNullable(left.latency, right.latency, "asc") ||
          compareNullable(left.memory, right.memory, "asc") ||
          compareNullable(left.energy, right.energy, "asc") ||
          left.run.name?.localeCompare(right.run.name || "") ||
          left.run.id.localeCompare(right.run.id)
        );
      })
      .map((row) => row.run);
  }, [
    energyMetricSpec.candidates,
    latencyMetricSpec.candidates,
    memoryMetricSpec.candidates,
    qualityMetricSpec.candidates,
    resolvedPolicySpec,
    runs,
  ]);
  const candidateDisplayMetricsByRun = useMemo(
    () => candidateComparisonRuns.map((run) => getDisplayMetrics(run)),
    [candidateComparisonRuns]
  );
  const candidateScalarMetricColumns = useMemo(
    () => getScalarMetricColumns(candidateDisplayMetricsByRun),
    [candidateDisplayMetricsByRun]
  );

  const openCaseModal = () => {
    setDraftCaseMetadata(caseMetadata);
    setIsCaseModalOpen(true);
  };

  const saveCaseMetadata = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCaseMetadata(draftCaseMetadata);
    setIsCaseModalOpen(false);
  };

  const openTargetDeviceModal = () => {
    setDraftTargetDeviceMetadata(targetDeviceMetadata);
    setIsTargetDeviceModalOpen(true);
  };

  const saveTargetDeviceMetadata = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTargetDeviceMetadata(draftTargetDeviceMetadata);
    setIsTargetDeviceModalOpen(false);
  };

  useEffect(() => {
    setCaseMetadata(seededCaseMetadata);
    setDraftCaseMetadata(seededCaseMetadata);
  }, [seededCaseMetadata]);

  useEffect(() => {
    setTargetDeviceMetadata(seededTargetDeviceMetadata);
    setDraftTargetDeviceMetadata(seededTargetDeviceMetadata);
  }, [seededTargetDeviceMetadata]);

  useEffect(() => {
    setDecisionPolicy(seededDecisionPolicy);
  }, [seededDecisionPolicy]);

  useEffect(() => {
    const availableRunIds = new Set(runs.map((run) => run.id));
    setSelectedCandidateRunIds((current) => {
      const next = new Set<string>();
      current.forEach((runId) => {
        if (availableRunIds.has(runId)) {
          next.add(runId);
        }
      });
      return next.size === current.size ? current : next;
    });
  }, [runs]);

  const toggleCandidateRunSelection = (runId: string) => {
    setSelectedCandidateRunIds((current) => {
      const next = new Set(current);
      if (next.has(runId)) {
        next.delete(runId);
      } else {
        next.add(runId);
      }
      return next;
    });
  };

  const removeSelectedCandidates = () => {
    selectedCandidateRunIds.forEach((runId) => onToggleCompare(runId));
    setSelectedCandidateRunIds(new Set());
  };

  const hasCaseConflict = Object.keys(caseConflicts).length > 0;
  const hasTargetDeviceConflict = Object.keys(targetDeviceConflicts).length > 0;
  const hasDecisionPolicyConflict = decisionPolicyConflicts.length > 1;

  return (
    <Page title="" subtitle="" fullWidth>
      <div className="flex min-h-0 flex-1 flex-col">
        <div
          className="grid min-h-0 flex-1 gap-4"
          style={{ gridTemplateColumns: "minmax(120px, 0.40fr) minmax(0, 1.88fr)" }}
        >
          <section
            className="min-h-[320px] min-w-0 overflow-x-auto overflow-y-auto p-4 shadow-sm lg:min-h-0"
            aria-label="Compare main panel"
            data-tour="compare-main-panel"
          >
            <div className="text-m font-semibold mb-4 uppercase tracking-[0.14em] text-[rgba(15,52,85,0.56)]">
              Setup
            </div>
            <div className="flex min-h-full min-w-[320px] flex-col gap-3">
              <div
                className="overflow-hidden border border-[rgba(15,52,85,0.14)] bg-[#F9F5EA] px-4 py-3"
                style={{ ...COMPARE_CARD_STYLE, backgroundColor: TOOL_SURFACE_BACKGROUND }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-md font-semibold text-[#0F3455]">Case</div>
                  {hasCaseConflict ? (
                    <span className="inline-flex rounded-full bg-[#FFF5DA] px-2.5 py-1 text-[0.7rem] font-medium text-[#8A5A00]">
                      Mixed across runs
                    </span>
                  ) : null}
                </div>
                <dl className="mt-3 space-y-3 text-sm text-[#0F3455]">
                  <div>
                    <dt className="font-semibold">Suite:</dt>
                    <dd className="mt-1 text-[rgba(15,52,85,0.74)]">{caseMetadata.suite}</dd>
                    {caseConflicts.suite ? (
                      <div className="mt-1 text-xs text-[#8A5A00]">{renderConflictValues(caseConflicts.suite)}</div>
                    ) : null}
                  </div>
                  <div>
                    <dt className="font-semibold">Task:</dt>
                    <dd className="mt-1 text-[rgba(15,52,85,0.74)]">{caseMetadata.task}</dd>
                    {caseConflicts.task ? (
                      <div className="mt-1 text-xs text-[#8A5A00]">{renderConflictValues(caseConflicts.task)}</div>
                    ) : null}
                  </div>
                  <div>
                    <dt className="font-semibold">Scenario:</dt>
                    <dd className="mt-1 text-[rgba(15,52,85,0.74)]">{caseMetadata.scenario}</dd>
                    {caseConflicts.scenario ? (
                      <div className="mt-1 text-xs text-[#8A5A00]">{renderConflictValues(caseConflicts.scenario)}</div>
                    ) : null}
                  </div>
                  <div>
                    <dt className="font-semibold">Dataset:</dt>
                    <dd className="mt-1 text-[rgba(15,52,85,0.74)]">{caseMetadata.dataset}</dd>
                    {caseConflicts.dataset ? (
                      <div className="mt-1 text-xs text-[#8A5A00]">{renderConflictValues(caseConflicts.dataset)}</div>
                    ) : null}
                  </div>
                </dl>
                <Button
                  type="button"
                  className="mt-6 w-full rounded-lg text-xs"
                  variant="outline"
                  onClick={openCaseModal}
                >
                  Change case
                </Button>
              </div>

              <div
                className="overflow-hidden border border-[rgba(15,52,85,0.14)] bg-[#F9F5EA] px-4 py-3"
                style={{ ...COMPARE_CARD_STYLE, backgroundColor: TOOL_SURFACE_BACKGROUND }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-md font-semibold text-[#0F3455]">Target Device</div>
                  {hasTargetDeviceConflict ? (
                    <span className="inline-flex rounded-full bg-[#FFF5DA] px-2.5 py-1 text-[0.7rem] font-medium text-[#8A5A00]">
                      Mixed across runs
                    </span>
                  ) : null}
                </div>
                <dl className="mt-3 space-y-3 text-sm text-[#0F3455]">
                  <div>
                    <dt className="font-semibold">Board:</dt>
                    <dd className="mt-1 text-[rgba(15,52,85,0.74)]">{targetDeviceMetadata.board}</dd>
                    {targetDeviceConflicts.board ? (
                      <div className="mt-1 text-xs text-[#8A5A00]">
                        {renderConflictValues(targetDeviceConflicts.board)}
                      </div>
                    ) : null}
                  </div>
                  <div>
                    <dt className="font-semibold">Runtime:</dt>
                    <dd className="mt-1 text-[rgba(15,52,85,0.74)]">{targetDeviceMetadata.runtime}</dd>
                    {targetDeviceConflicts.runtime ? (
                      <div className="mt-1 text-xs text-[#8A5A00]">
                        {renderConflictValues(targetDeviceConflicts.runtime)}
                      </div>
                    ) : null}
                  </div>
                  <div>
                    <dt className="font-semibold">Memory Budget:</dt>
                    <dd className="mt-1 whitespace-pre-line text-[rgba(15,52,85,0.74)]">
                      {`${targetDeviceMetadata.flashBudget}\n${targetDeviceMetadata.ramBudget}`}
                    </dd>
                    {targetDeviceConflicts.flashBudget || targetDeviceConflicts.ramBudget ? (
                      <div className="mt-1 text-xs text-[#8A5A00]">
                        {renderConflictValues([
                          ...(targetDeviceConflicts.flashBudget || []),
                          ...(targetDeviceConflicts.ramBudget || []),
                        ])}
                      </div>
                    ) : null}
                  </div>
                </dl>
                <Button
                  type="button"
                  className="mt-6 w-full rounded-lg text-xs"
                  variant="outline"
                  onClick={openTargetDeviceModal}
                >
                  Change target device
                </Button>
              </div>

              <div
                className="overflow-hidden border border-[rgba(15,52,85,0.14)] bg-[#F9F5EA] px-4 py-3"
                style={{ ...COMPARE_CARD_STYLE, backgroundColor: TOOL_SURFACE_BACKGROUND }}
              >
                <div className="text-md font-semibold text-[#0F3455]">Qualification</div>
                {runs.length === 0 ? (
                  <div className="mt-3 text-sm text-[rgba(15,52,85,0.54)]">No runs selected.</div>
                ) : (() => {
                  const withQual = runs.filter((r) => (r as any).eqc_assignment || (r as any).accuracy_gate || (r as any).contract_result);
                  const qualifiedRuns = withQual.filter((r) => {
                    const eqcOk = (r as any).eqc_assignment?.delta_within_tolerance;
                    const gateOk = (r as any).accuracy_gate?.pass;
                    const contractOk = (r as any).contract_result?.pass;
                    const checks = [eqcOk, gateOk, contractOk].filter((v) => v !== undefined && v !== null);
                    return checks.length > 0 && checks.every(Boolean);
                  });
                  const eqcGroups = Array.from(new Set(
                    runs.map((r) => (r as any).eqc_assignment?.eqc_id).filter(Boolean)
                  ));
                  return (
                    <dl className="mt-3 space-y-3 text-sm text-[#0F3455]">
                      <div>
                        <dt className="font-semibold">Status</dt>
                        <dd className="mt-1">
                          {withQual.length === 0 ? (
                            <span className="text-[rgba(15,52,85,0.54)]">No qualification data</span>
                          ) : (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.3rem",
                                borderRadius: "9999px",
                                padding: "0.2rem 0.7rem",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                backgroundColor:
                                  qualifiedRuns.length === withQual.length
                                    ? "rgba(34,197,94,0.13)"
                                    : qualifiedRuns.length === 0
                                    ? "rgba(239,68,68,0.10)"
                                    : "rgba(245,158,11,0.12)",
                                color:
                                  qualifiedRuns.length === withQual.length
                                    ? "#166534"
                                    : qualifiedRuns.length === 0
                                    ? "#991B1B"
                                    : "#78350F",
                              }}
                            >
                              {qualifiedRuns.length} / {withQual.length} qualified
                            </span>
                          )}
                        </dd>
                      </div>
                      {eqcGroups.length > 0 && (
                        <div>
                          <dt className="font-semibold">EQC Groups</dt>
                          <dd className="mt-1 flex flex-wrap gap-1">
                            {eqcGroups.map((g) => (
                              <span
                                key={g}
                                style={{
                                  display: "inline-block",
                                  borderRadius: "4px",
                                  padding: "0.1rem 0.5rem",
                                  fontSize: "0.72rem",
                                  fontFamily: "monospace",
                                  fontWeight: 600,
                                  backgroundColor: "rgba(15,52,85,0.08)",
                                  color: "#0F3455",
                                }}
                              >
                                {g}
                              </span>
                            ))}
                          </dd>
                        </div>
                      )}
                    </dl>
                  );
                })()}
              </div>

              <div
                className="overflow-hidden border border-[rgba(15,52,85,0.14)] bg-[#F9F5EA] px-4 py-3"
                style={{ ...COMPARE_CARD_STYLE, backgroundColor: TOOL_SURFACE_BACKGROUND }}
              >
                <div className="text-md font-semibold text-[#0F3455]">Candidate Selection</div>
                <div className="mt-3 flex flex-col gap-2">
                  {runs.length > 0 ? (
                    runs.map((run) => {
                      const isSelected = selectedCandidateRunIds.has(run.id);
                      return (
                        <button
                          key={run.id}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => toggleCandidateRunSelection(run.id)}
                          className="flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-[rgba(15,52,85,0.05)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F3455]/20"
                        >
                          <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center">
                            {isSelected ? (
                              <CheckCircle2 className="h-4.5 w-4.5 text-[#0F3455]" />
                            ) : (
                              <Circle className="h-4.5 w-4.5 text-[rgba(15,52,85,0.38)]" />
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className="block font-medium text-[#0F3455]">
                              {run.name || run.id.slice(0, 8)}
                            </span>
                            <span className="block text-xs text-[rgba(15,52,85,0.62)]">
                              {run.id}
                            </span>
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-3 py-2 text-xs text-[rgba(15,52,85,0.62)]">
                      No runs selected for comparison yet.
                    </div>
                  )}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button
                    className="w-full rounded-lg text-xs"
                    variant="outline"
                    onClick={() => onNavigate("/workspace/runs")}
                  >
                    Add
                  </Button>
                  <Button
                    className="w-full rounded-lg text-xs"
                    variant="outline"
                    onClick={removeSelectedCandidates}
                    disabled={selectedCandidateRunIds.size === 0}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <aside
            className="min-h-[240px] min-w-0 overflow-x-auto overflow-y-auto rounded-lg p-4 shadow-sm lg:min-h-0"
            aria-label="Compare sidebar panel"
            data-tour="compare-sidebar-panel"
          >
            <div className="flex min-h-full min-w-[720px] flex-col gap-4">
              <div className="text-md font-semibold uppercase tracking-[0.14em] text-[rgba(15,52,85,0.56)]">
                Qualification
              </div>

              <div
                className="overflow-hidden border border-[rgba(15,52,85,0.14)] p-3"
                style={{ ...COMPARE_CARD_STYLE, backgroundColor: TOOL_SURFACE_BACKGROUND }}
              >
                <PlatformMatrix runs={runs} />
              </div>

              <div
                className="overflow-hidden border border-[rgba(15,52,85,0.14)] p-3"
                style={{ ...COMPARE_CARD_STYLE, backgroundColor: TOOL_SURFACE_BACKGROUND }}
              >
                <QualGateDiff runs={runs} />
              </div>

              <div className="text-md font-semibold uppercase tracking-[0.14em] text-[rgba(15,52,85,0.56)]">
                Metrics
              </div>

              <div
                className="overflow-hidden border border-[rgba(15,52,85,0.14)] bg-[#F9F5EA] p-3"
                style={{ ...COMPARE_CARD_STYLE, backgroundColor: TOOL_SURFACE_BACKGROUND }}
              >
                {compareScatterData.length > 0 ? (
                  <div className="min-w-[720px]">
                    <div className="px-2 pb-3 pt-1">
                      <div className="text-md font-semibold text-[#0F3455]">{paretoViewSpec.title}</div>
                      <div className="mt-1 text-sm text-[rgba(15,52,85,0.62)]">
                        Decision policy: {decisionPolicy}
                        {loggedPolicyMetadata?.objectiveMetric ? (
                          <>. Logged objective metric: {loggedPolicyMetadata.objectiveMetric}.</>
                        ) : (
                          "."
                        )}
                      </div>
                    </div>
                    <ScatterRenderer
                      data={compareScatterData}
                      config={{
                        type: "scatter",
                        id: paretoViewSpec.id,
                        title: paretoViewSpec.title,
                        xMetric: paretoViewSpec.xMetric.label,
                        yMetric: paretoViewSpec.yMetric.label,
                        colorBy: "run",
                      }}
                      context={{
                        selectedRunIds: compareRunIds,
                        filters: {
                          decisionPolicy,
                        },
                        targetProfile: targetDeviceMetadata.board,
                      }}
                      height={440}
                      showLegend={false}
                    />
                  </div>
                ) : (
                  <div className="flex min-h-[320px] items-center justify-center rounded-lg text-sm text-[rgba(15,52,85,0.62)]">
                    No data points are available for the currently selected runs.
                  </div>
                )}
              </div>

              <div
                className="overflow-hidden bg-[#F9F5EA] p-3"
                style={{ borderRadius: "0.5rem", backgroundColor: TOOL_SURFACE_BACKGROUND }}
              >
                <div className="px-2 pb-3 pt-1">
                  <div className="text-md font-semibold text-[#0F3455]">Candidate Comparison</div>
                </div>

                {/* Params diff — only shows params that differ across runs */}
                {candidateComparisonRuns.length > 1 && (() => {
                  type ParamEntry = { key: string; values: Map<string, string> };
                  const paramMap = new Map<string, Map<string, string>>();
                  candidateComparisonRuns.forEach((run) => {
                    const params = Array.isArray((run as any).params) ? (run as any).params : [];
                    params.forEach((p: any) => {
                      if (!p?.key) return;
                      if (!paramMap.has(p.key)) paramMap.set(p.key, new Map());
                      paramMap.get(p.key)!.set(run.id, String(p.value ?? "—"));
                    });
                  });
                  const diffParams: ParamEntry[] = [];
                  paramMap.forEach((valuesByRun, key) => {
                    const distinctValues = new Set(valuesByRun.values());
                    if (distinctValues.size > 1) diffParams.push({ key, values: valuesByRun });
                  });
                  if (diffParams.length === 0) return null;
                  return (
                    <div className="mb-4 px-2">
                      <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(15,52,85,0.46)", marginBottom: "0.5rem" }}>
                        Differing Parameters
                      </div>
                      <ScrollArea className="w-full whitespace-nowrap">
                        <table style={{ minWidth: "100%", width: "max-content", borderCollapse: "collapse" }}>
                          <thead>
                            <tr style={{ backgroundColor: TABLE_HEADER_BACKGROUND, borderBottom: "1px solid rgba(15,52,85,0.14)" }}>
                              <th style={{ padding: "0.4rem 0.75rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "rgba(15,52,85,0.7)", minWidth: "140px", position: "sticky", left: 0, backgroundColor: TOOL_SURFACE_BACKGROUND, zIndex: 2 }}>
                                Parameter
                              </th>
                              {candidateComparisonRuns.map((run, i) => (
                                <th key={run.id} style={{ padding: "0.4rem 0.75rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: getRunColor(i), minWidth: "110px", whiteSpace: "nowrap" }}>
                                  {run.name || run.id.slice(0, 8)}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {diffParams.map(({ key, values }) => (
                              <tr key={key} style={{ borderBottom: "1px solid rgba(15,52,85,0.07)" }}>
                                <td style={{ padding: "0.35rem 0.75rem", fontSize: "0.78rem", fontWeight: 500, color: "#0F3455", position: "sticky", left: 0, backgroundColor: TOOL_SURFACE_BACKGROUND, zIndex: 1 }}>
                                  {key}
                                </td>
                                {candidateComparisonRuns.map((run) => {
                                  const val = values.get(run.id) ?? "—";
                                  return (
                                    <td key={run.id} style={{ padding: "0.35rem 0.75rem", fontSize: "0.78rem", fontFamily: "monospace", color: val === "—" ? "rgba(15,52,85,0.38)" : "#0F3455" }}>
                                      {val}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <ScrollBar orientation="horizontal" />
                      </ScrollArea>
                    </div>
                  );
                })()}
                <div className="min-w-0">
                  <div
                    className="w-full min-w-0 max-w-full rounded-lg bg-[#F9F5EA]"
                    style={{ boxShadow: shadowPresets.sm, backgroundColor: TOOL_SURFACE_BACKGROUND }}
                  >
                    <ScrollArea className="w-full whitespace-nowrap">
                      <table
                        style={{
                          minWidth: "100%",
                          width: "max-content",
                          borderCollapse: "collapse",
                        }}
                      >
                        <thead>
                          <tr
                            style={{
                              backgroundColor: TABLE_HEADER_BACKGROUND,
                              borderBottom: "1px solid rgba(15, 52, 85, 0.2)",
                            }}
                          >
                            <th
                              style={{
                                position: "sticky",
                                left: 0,
                                zIndex: 3,
                                backgroundColor: TOOL_SURFACE_BACKGROUND,
                                padding: RUNS_TABLE_HEADER_PADDING,
                                textAlign: "left",
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                color: "#0F3455",
                                minWidth: RUNS_TABLE_FIRST_COLUMN_MIN_WIDTH,
                                boxShadow: "1px 0 0 rgba(15, 52, 85, 0.08)",
                                borderTopLeftRadius: "0.5rem",
                              }}
                            >
                              Run
                            </th>
                            <th
                              style={{
                                padding: RUNS_TABLE_HEADER_PADDING,
                                textAlign: "left",
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                color: "#0F3455",
                                minWidth: RUNS_TABLE_COLUMN_MIN_WIDTH,
                              }}
                            >
                              Status
                            </th>
                            <th
                              style={{
                                padding: RUNS_TABLE_HEADER_PADDING,
                                textAlign: "left",
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                color: "#0F3455",
                                minWidth: RUNS_TABLE_COLUMN_MIN_WIDTH,
                              }}
                            >
                              Last edited
                            </th>
                            {candidateScalarMetricColumns.map((column) => (
                              <th
                                key={column}
                                style={{
                                  padding: RUNS_TABLE_HEADER_PADDING,
                                  textAlign: "left",
                                  fontSize: "0.875rem",
                                  fontWeight: 600,
                                  color: "#0F3455",
                                  minWidth: RUNS_TABLE_COLUMN_MIN_WIDTH,
                                }}
                              >
                                {formatMetricLabel(column)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {candidateComparisonRuns.length > 0 ? (
                            candidateComparisonRuns.map((run, index) => (
                              <CandidateComparisonRow
                                key={run.id}
                                run={run}
                                displayMetrics={candidateDisplayMetricsByRun[index] || []}
                                index={index}
                                totalRuns={candidateComparisonRuns.length}
                                isCompareSelected
                                onToggleCompare={onToggleCompare}
                                onRunClick={onRunClick}
                                scalarMetricColumns={candidateScalarMetricColumns}
                              />
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={3 + candidateScalarMetricColumns.length}
                                style={{
                                  padding: "2rem 1rem",
                                  textAlign: "center",
                                  fontSize: "0.875rem",
                                  color: "rgba(15, 52, 85, 0.6)",
                                }}
                              >
                                No candidate runs selected yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <ConfigModal
        open={isCaseModalOpen}
        onOpenChange={setIsCaseModalOpen}
        title="Change case"
        description="Update the case metadata used to define the evaluation setup for this comparison."
        footer={
          <div className="flex w-full justify-center gap-2">
            <Button
              type="button"
              variant="ghost"
              className="border-0 shadow-none"
              onClick={() => setIsCaseModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" form="case-config-form" className="border-0 shadow-none">
              Save case
            </Button>
          </div>
        }
      >
        <form id="case-config-form" onSubmit={saveCaseMetadata} className="space-y-4 pb-3">
          <div className="space-y-2">
            <Label htmlFor="case-suite">Suite</Label>
            <Input
              id="case-suite"
              style={MODAL_INPUT_STYLE}
              value={draftCaseMetadata.suite}
              onChange={(event) =>
                setDraftCaseMetadata((current) => ({ ...current, suite: event.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="case-task">Task</Label>
            <Input
              id="case-task"
              style={MODAL_INPUT_STYLE}
              value={draftCaseMetadata.task}
              onChange={(event) =>
                setDraftCaseMetadata((current) => ({ ...current, task: event.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="case-scenario">Scenario</Label>
            <Input
              id="case-scenario"
              style={MODAL_INPUT_STYLE}
              value={draftCaseMetadata.scenario}
              onChange={(event) =>
                setDraftCaseMetadata((current) => ({ ...current, scenario: event.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="case-dataset">Dataset</Label>
            <Input
              id="case-dataset"
              style={MODAL_INPUT_STYLE}
              value={draftCaseMetadata.dataset}
              onChange={(event) =>
                setDraftCaseMetadata((current) => ({ ...current, dataset: event.target.value }))
              }
            />
          </div>
        </form>
      </ConfigModal>

      <ConfigModal
        open={isTargetDeviceModalOpen}
        onOpenChange={setIsTargetDeviceModalOpen}
        title="Change target device"
        description="Update the board, runtime, and memory constraints for this comparison."
        footer={
          <div className="flex w-full justify-center gap-2">
            <Button
              type="button"
              variant="ghost"
              className="border-0 shadow-none"
              onClick={() => setIsTargetDeviceModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="target-device-config-form"
              className="border-0 shadow-none"
            >
              Save target device
            </Button>
          </div>
        }
      >
        <form
          id="target-device-config-form"
          onSubmit={saveTargetDeviceMetadata}
          className="space-y-4 pb-3"
        >
          <div className="space-y-2">
            <Label htmlFor="target-device-board">Board</Label>
            <Input
              id="target-device-board"
              style={MODAL_INPUT_STYLE}
              value={draftTargetDeviceMetadata.board}
              onChange={(event) =>
                setDraftTargetDeviceMetadata((current) => ({
                  ...current,
                  board: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-device-runtime">Runtime</Label>
            <Input
              id="target-device-runtime"
              style={MODAL_INPUT_STYLE}
              value={draftTargetDeviceMetadata.runtime}
              onChange={(event) =>
                setDraftTargetDeviceMetadata((current) => ({
                  ...current,
                  runtime: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-device-flash-budget">Flash budget</Label>
            <Input
              id="target-device-flash-budget"
              style={MODAL_INPUT_STYLE}
              value={draftTargetDeviceMetadata.flashBudget}
              onChange={(event) =>
                setDraftTargetDeviceMetadata((current) => ({
                  ...current,
                  flashBudget: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-device-ram-budget">RAM budget</Label>
            <Input
              id="target-device-ram-budget"
              style={MODAL_INPUT_STYLE}
              value={draftTargetDeviceMetadata.ramBudget}
              onChange={(event) =>
                setDraftTargetDeviceMetadata((current) => ({
                  ...current,
                  ramBudget: event.target.value,
                }))
              }
            />
          </div>
        </form>
      </ConfigModal>
    </Page>
  );
}

function CandidateComparisonRow({
  run,
  displayMetrics,
  index,
  totalRuns,
  isCompareSelected,
  onToggleCompare,
  onRunClick,
  scalarMetricColumns,
}: CandidateComparisonRowProps) {
  const resolvedRun = asRunShape(run);
  const [isHovered, setIsHovered] = useState(false);
  const stickyCellBackground = TOOL_SURFACE_BACKGROUND;
  const isLastRow = index === totalRuns - 1;
  const metricValueByKey = new Map(displayMetrics.map((metric) => [metric.key, metric.value]));
  const runColor = getRunColor(index);
  const runId = resolvedRun.id || resolvedRun.run_id || `run-${index}`;

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onRunClick(run);
    }
  };

  return (
    <tr
      role="button"
      tabIndex={0}
      onClick={() => onRunClick(run)}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F3455] focus-visible:ring-inset"
      style={{
        borderBottom: index < totalRuns - 1 ? "1px solid rgba(15, 52, 85, 0.1)" : "none",
        backgroundColor: isHovered ? "rgba(15, 52, 85, 0.05)" : undefined,
        boxShadow: isHovered ? "inset 0 0 0 1px rgba(15, 52, 85, 0.1)" : undefined,
      }}
    >
      <td
        style={{
          position: "sticky",
          left: 0,
          zIndex: 2,
          backgroundColor: stickyCellBackground,
          boxShadow: "1px 0 0 rgba(15, 52, 85, 0.08)",
          padding: RUNS_TABLE_FIRST_CELL_PADDING,
          textAlign: "left",
          borderBottomLeftRadius: isLastRow ? "0.5rem" : undefined,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.55rem",
            transform: isHovered ? "translateX(4px)" : "translateX(0px)",
            transition: "transform 0.2s ease",
          }}
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggleCompare(runId);
            }}
            className="inline-flex h-5 w-5 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F3455]/70"
            style={{ flexShrink: 0 }}
            aria-label={`${isCompareSelected ? "Remove" : "Add"} ${resolvedRun.name || runId} ${isCompareSelected ? "from" : "to"} compare`}
            title={isCompareSelected ? "Selected for compare" : "Select for compare"}
          >
            {isCompareSelected ? (
              <CheckCircle2 className="h-4.5 w-4.5 text-[#0F3455]" />
            ) : (
              <Circle className="h-4.5 w-4.5 text-[rgba(15,52,85,0.38)]" />
            )}
          </button>
          <div
            style={{
              transform: isHovered ? "scale(1.1)" : "scale(1)",
              transition: "transform 0.2s ease",
            }}
          >
            <span
              style={{
                display: "block",
                width: "0.85rem",
                height: "0.85rem",
                borderRadius: "9999px",
                backgroundColor: runColor,
                boxShadow: `0 0 0 2px ${stickyCellBackground}, 0 0 0 3px ${runColor}22`,
                flexShrink: 0,
              }}
            />
          </div>
          <div className="min-w-0">
            <span
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "rgba(15, 52, 85, 0.78)",
              }}
            >
              {resolvedRun.name || resolvedRun.id?.slice(0, 8) || "—"}
            </span>
            <span style={{ display: "block", fontSize: "0.75rem", color: "rgba(15, 52, 85, 0.58)" }}>
              {formatDateTime(resolvedRun.created_at)}
            </span>
            <span style={{ display: "block", fontSize: "0.7rem", color: "rgba(15, 52, 85, 0.48)" }}>
              {resolvedRun.id || resolvedRun.run_id || "—"}
            </span>
          </div>
        </div>
      </td>
      <td style={{ padding: RUNS_TABLE_CELL_PADDING, textAlign: "left" }}>
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusTone(resolvedRun.status)}`}
        >
          {resolvedRun.status || "—"}
        </span>
      </td>
      <td style={{ padding: RUNS_TABLE_CELL_PADDING, textAlign: "left" }}>
        <span style={{ display: "block", fontSize: "0.875rem", color: "rgba(15, 52, 85, 0.7)" }}>
          {formatTimeAgo(resolvedRun.updated_at)}
        </span>
      </td>
      {scalarMetricColumns.map((column) => (
        <td
          key={`${resolvedRun.id ?? resolvedRun.name ?? index}-${column}`}
          style={{
            padding: RUNS_TABLE_CELL_PADDING,
            textAlign: "left",
            fontSize: "0.875rem",
            color: "rgba(15, 52, 85, 0.78)",
          }}
        >
          {formatMetricValue(column, metricValueByKey.get(column))}
        </td>
      ))}
    </tr>
  );
}

