import React, { useMemo, useState } from "react";
import { Page } from "../layout/Page";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Circle, Eye, EyeOff, Info, Search } from "lucide-react";
import type { RunRecord } from "../../../types/domain";
import { AnimatedInput, animationPresets, shadowPresets } from "../../ui/animated-interactive";
import { ScrollArea, ScrollBar } from "../../ui/scroll-area";
import { MetricWidget, WIDGET_RUN_COLORS } from "./widgets/MetricWidget";
import { discoverMetricNames, runsToMetricWidgetData } from "./widgets/runMetricsToWidgetData";
import { ContractBadge } from "./ContractBadge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../ui/dialog";

const TABLE_HEADER_BACKGROUND = "rgba(15, 52, 85, 0.05)";
const RUN_COLORS = ["#D82A2D", "#0F3455", "#A67C52", "#2D6A4F", "#6B4EFF", "#C65D2E"];
const RUNS_TABLE_FIRST_COLUMN_MIN_WIDTH = "240px";
const RUNS_TABLE_COLUMN_MIN_WIDTH = "124px";
const RUNS_TABLE_HEADER_PADDING = "0.7rem 1rem";
const RUNS_TABLE_CELL_PADDING = "0.5rem 1rem";
const RUNS_TABLE_FIRST_CELL_PADDING = "0rem 0.9rem";
const TOOL_SURFACE_BACKGROUND = "var(--cemi-surface-bg, #F9F5EA)";

interface DisplayMetric {
  key: string;
  value: number;
  source: "summary" | "event";
}

interface RunsPageProps {
  projectId?: string;
  projectName?: string;
  runs?: RunRecord[];
  allRunsCount?: number;
  selectedExperiment?: string;
  compareRunIds?: Set<string>;
  onToggleCompare?: (runId: string) => void;
  onOpenCompare?: (runIds: Iterable<string>) => void;
  onRunClick?: (run: RunRecord) => void;
  isLoading?: boolean;
  view?: "runs" | "charts";
  onRefresh?: () => void;
}

function asRunShape(run: RunRecord): any {
  return run as any;
}

function getTagValue(run: RunRecord, key: string): string | null {
  const resolvedRun = asRunShape(run);
  const tags = Array.isArray(resolvedRun.tags) ? resolvedRun.tags : [];
  const params = Array.isArray(resolvedRun.params) ? resolvedRun.params : [];

  const tagValue = tags.find((tag: any) => tag.key === key)?.value?.trim();
  if (tagValue) return tagValue;

  const paramValue = params.find((param: any) => param.key === key)?.value;
  if (typeof paramValue === "string" && paramValue.trim()) return paramValue.trim();

  return null;
}

function formatDateTime(value?: string | null): string {
  if (!value) return "—";
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

function formatTimeAgo(value?: string | null): string {
  if (!value) return "—";
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
    if (!existing) {
      latestEventMetrics.set(key, { value, sortValue, firstSeen: index });
      return;
    }

    if (sortValue >= existing.sortValue) {
      latestEventMetrics.set(key, {
        value,
        sortValue,
        firstSeen: existing.firstSeen,
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

export function RunsPage({
  projectId: _projectId,
  projectName = "Project",
  runs = [],
  allRunsCount: _allRunsCount,
  selectedExperiment: _selectedExperiment,
  compareRunIds = new Set<string>(),
  onToggleCompare,
  onOpenCompare,
  onRunClick,
  isLoading = false,
  view = "runs",
  onRefresh: _onRefresh,
}: RunsPageProps) {
  const [hiddenChartRunIds, setHiddenChartRunIds] = useState<Set<string>>(new Set());
  const [chartRunQuery, setChartRunQuery] = useState("");
  const [verifiedInfoOpen, setVerifiedInfoOpen] = useState(false);
  const displayMetricsByRun = runs.map((run) => getDisplayMetrics(run));
  const scalarMetricColumns = getScalarMetricColumns(displayMetricsByRun);
  const chartWidgets = useMemo(
    () =>
      discoverMetricNames(runs)
        .map((metricName) => ({
          title: formatMetricLabel(metricName),
          metricKey: metricName,
          runs: runsToMetricWidgetData(runs, metricName),
        }))
        .filter((config) => config.runs.length > 0),
    [runs]
  );
  const visibleChartRunIds = useMemo(
    () =>
      new Set(
        runs
          .map((run, index) => {
            const resolvedRun = asRunShape(run);
            return resolvedRun.id || resolvedRun.run_id || `run-${index}`;
          })
          .filter((runId) => !hiddenChartRunIds.has(runId))
      ),
    [runs, hiddenChartRunIds]
  );
  const chartRunRows = useMemo(
    () =>
      runs.map((run, index) => {
        const resolvedRun = asRunShape(run);
        const runId = resolvedRun.id || resolvedRun.run_id || `run-${index}`;
        return {
          id: runId,
          name: resolvedRun.name || `Run ${String(runId).slice(0, 8)}`,
          color: WIDGET_RUN_COLORS[index % WIDGET_RUN_COLORS.length],
          isVisible: !hiddenChartRunIds.has(runId),
        };
      }),
    [runs, hiddenChartRunIds]
  );
  const filteredChartRunRows = useMemo(() => {
    const query = chartRunQuery.trim().toLowerCase();
    if (!query) return chartRunRows;
    return chartRunRows.filter(
      (runRow) =>
        runRow.name.toLowerCase().includes(query) ||
        runRow.id.toLowerCase().includes(query)
    );
  }, [chartRunQuery, chartRunRows]);
  return (
    <Page title="" subtitle="" fullWidth>
      <div className="min-h-0 min-w-0" data-tour="runs-table">
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-12 text-center text-[rgba(15,52,85,0.7)]"
          >
            Loading runs...
          </motion.div>
        ) : runs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-12 text-center text-[rgba(15,52,85,0.7)]"
          >
            {view === "charts"
              ? "No chart metrics logged yet. Logged time-series metrics will appear here."
              : "No runs found yet. Logged runs emitted from the writer will appear here."}
          </motion.div>
        ) : view === "charts" ? (
          chartWidgets.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex min-h-[220px] items-center justify-center rounded-lg border border-[rgba(15,52,85,0.08)] bg-[#F9F5EA] text-sm text-[rgba(15,52,85,0.58)]"
              style={{ boxShadow: shadowPresets.sm, backgroundColor: TOOL_SURFACE_BACKGROUND }}
            >
              No chart metrics logged yet.
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex w-full min-w-0 items-start gap-4"
            >
              <div
                className="w-[224px] shrink-0 self-start overflow-hidden rounded-lg border border-[rgba(15,52,85,0.14)] bg-[#F9F5EA]"
                style={{ boxShadow: shadowPresets.sm, backgroundColor: TOOL_SURFACE_BACKGROUND }}
              >
                <div className="border-b border-[rgba(15,52,85,0.12)] p-2">
                  <AnimatedInput
                    icon={<Search className="w-5 h-5" />}
                    type="text"
                    placeholder="Search runs..."
                    value={chartRunQuery}
                    onChange={(event) => setChartRunQuery(event.target.value)}
                    aria-label="Search chart runs"
                    style={{
                      width: "100%",
                      backgroundColor: TOOL_SURFACE_BACKGROUND,
                    }}
                  />
                </div>
                <table className="w-full border-collapse">
                  <thead>
                    <tr style={{ backgroundColor: TABLE_HEADER_BACKGROUND, borderBottom: "1px solid rgba(15, 52, 85, 0.12)" }}>
                      <th style={{ width: "40px", padding: "0.75rem 0.95rem", textAlign: "center", fontSize: "0.78rem", fontWeight: 600, color: "#0F3455" }}>
                        
                      </th>
                      <th style={{ padding: "0.75rem 0.95rem", textAlign: "left", fontSize: "0.78rem", fontWeight: 600, color: "#0F3455" }}>
                        Name
                      </th>
                      <th style={{ padding: "0.75rem 0.95rem", textAlign: "left", fontSize: "0.78rem", fontWeight: 600, color: "#0F3455" }}>
                        ID
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredChartRunRows.map((runRow, index) => (
                      <tr
                        key={runRow.id}
                        style={{
                          borderTop: index === 0 ? "none" : "1px solid rgba(15, 52, 85, 0.08)",
                        }}
                      >
                        <td style={{ padding: "0.5rem 0.1rem", textAlign: "center" }}>
                          <button
                            type="button"
                            onClick={() =>
                              setHiddenChartRunIds((current) => {
                                const next = new Set(current);
                                if (next.has(runRow.id)) {
                                  next.delete(runRow.id);
                                } else {
                                  next.add(runRow.id);
                                }
                                return next;
                              })
                            }
                            className="inline-flex items-center justify-center rounded-md p-1 transition-colors hover:bg-[rgba(15,52,85,0.06)]"
                            aria-label={`${runRow.isVisible ? "Hide" : "Show"} ${runRow.name}`}
                          >
                            {runRow.isVisible ? (
                              <Eye className="h-4 w-4" style={{ color: runRow.color }} />
                            ) : (
                              <EyeOff className="h-4 w-4" style={{ color: runRow.color, opacity: 0.55 }} />
                            )}
                          </button>
                        </td>
                        <td style={{ padding: "0.5rem 0.1rem", minWidth: 0 }}>
                          <span
                            className="block whitespace-normal break-words"
                            style={{
                              fontSize: "0.82rem",
                              lineHeight: 1.2,
                              fontWeight: 500,
                              color: runRow.isVisible ? "#0F3455" : "rgba(15, 52, 85, 0.55)",
                            }}
                            title={runRow.name}
                          >
                            {runRow.name}
                          </span>
                        </td>
                        <td style={{ padding: "0.5rem 0.1rem", minWidth: 0 }}>
                          <span
                            className="block whitespace-normal break-all font-mono"
                            style={{
                              fontSize: "0.76rem",
                              lineHeight: 1.2,
                              color: runRow.isVisible ? "rgba(15, 52, 85, 0.74)" : "rgba(15, 52, 85, 0.45)",
                            }}
                            title={runRow.id}
                          >
                            {runRow.id}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredChartRunRows.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          style={{
                            padding: "0.8rem 0.35rem",
                            textAlign: "center",
                            fontSize: "0.76rem",
                            color: "rgba(15, 52, 85, 0.52)",
                          }}
                        >
                          No matching runs.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="grid min-w-0 flex-1 grid-cols-3 gap-3">
                {chartWidgets.map((config) => (
                  <div key={config.metricKey} className="w-full min-w-0 aspect-[4/3]">
                    <MetricWidget
                      title={config.title}
                      metricKey={config.metricKey}
                      runs={config.runs}
                      visibleRunIds={visibleChartRunIds}
                      yAxisLabel=""
                      showSmoothing
                      showLegend={false}
                      defaultSmoothing={0.2}
                      fillParent
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )
        ) : (
          <div className="min-w-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
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
                      <th style={{ padding: RUNS_TABLE_HEADER_PADDING, textAlign: "left", fontSize: "0.875rem", fontWeight: 600, color: "#0F3455", minWidth: RUNS_TABLE_COLUMN_MIN_WIDTH }}>
                        Status
                      </th>
                      <th style={{ padding: RUNS_TABLE_HEADER_PADDING, textAlign: "left", fontSize: "0.875rem", fontWeight: 600, color: "#0F3455", minWidth: RUNS_TABLE_COLUMN_MIN_WIDTH }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          Verified
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setVerifiedInfoOpen(true); }}
                            className="inline-flex items-center justify-center rounded-full p-0.5 text-[rgba(15,52,85,0.45)] transition-colors hover:bg-[rgba(15,52,85,0.08)] hover:text-[#0F3455]"
                            aria-label="What does Verified mean?"
                          >
                            <Info className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </th>
                      <th style={{ padding: RUNS_TABLE_HEADER_PADDING, textAlign: "left", fontSize: "0.875rem", fontWeight: 600, color: "#0F3455", minWidth: RUNS_TABLE_COLUMN_MIN_WIDTH }}>
                        Last edited
                      </th>
                      {scalarMetricColumns.map((column) => (
                        <th
                          key={column}
                          style={{ padding: RUNS_TABLE_HEADER_PADDING, textAlign: "left", fontSize: "0.875rem", fontWeight: 600, color: "#0F3455", minWidth: RUNS_TABLE_COLUMN_MIN_WIDTH }}
                        >
                          {formatMetricLabel(column)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {runs.map((run, index) => {
                        return (
                          <RunRow
                            key={asRunShape(run).id ?? index}
                            run={run}
                            displayMetrics={displayMetricsByRun[index] || []}
                            index={index}
                            tourCompareToggle={
                              index === 0 ? "run-compare-toggle-first" : index === 1 ? "run-compare-toggle-second" : undefined
                            }
                            totalRuns={runs.length}
                            isCompareSelected={compareRunIds.has(asRunShape(run).id ?? "")}
                            onToggleCompare={onToggleCompare}
                            onRunClick={onRunClick}
                            scalarMetricColumns={scalarMetricColumns}
                          />
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </motion.div>
          </div>
        )}
      </div>

      <Dialog open={verifiedInfoOpen} onOpenChange={setVerifiedInfoOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-[#0F3455]">What does "Verified" mean?</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3 text-sm text-[rgba(15,52,85,0.75)]">
                <p>
                  A run is <strong className="text-[#0F3455]">Verified</strong> when it has been checked against a
                  contract — a set of minimum requirements your model must meet before it is
                  considered ready to deploy.
                </p>
                <p>
                  Each requirement is called a <strong className="text-[#0F3455]">gate</strong>. A gate might say:
                  "accuracy must be at least 90%" or "inference latency must stay under 20 ms."
                  The run's recorded values are compared against every gate.
                </p>
                <ul className="space-y-1 pl-4 list-disc">
                  <li><span className="text-green-700 font-semibold">✓ PASS</span> — every gate was satisfied.</li>
                  <li><span className="text-red-700 font-semibold">✗ FAIL</span> — at least one gate was not met.</li>
                  <li><span className="text-[rgba(15,52,85,0.5)]">—</span> — the run has not been verified yet.</li>
                </ul>
                <p>
                  Verification is run with <code className="font-mono bg-[rgba(15,52,85,0.06)] px-1 py-0.5 rounded text-xs">cemi verify</code> and
                  the full gate-by-gate breakdown is visible in the run's Results tab.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </Page>
  );
}

interface RunRowProps {
  key?: React.Key;
  run: RunRecord;
  displayMetrics: DisplayMetric[];
  index: number;
  tourCompareToggle?: string;
  totalRuns: number;
  isCompareSelected?: boolean;
  onToggleCompare?: (runId: string) => void;
  onRunClick?: (run: RunRecord) => void;
  scalarMetricColumns: string[];
}

function RunRow({
  run,
  displayMetrics,
  index,
  tourCompareToggle,
  totalRuns,
  isCompareSelected = false,
  onToggleCompare,
  onRunClick,
  scalarMetricColumns,
}: RunRowProps) {
  const resolvedRun = asRunShape(run);
  const [isHovered, setIsHovered] = useState(false);
  const isInteractive = Boolean(onRunClick);
  const stickyCellBackground = TOOL_SURFACE_BACKGROUND;
  const isLastRow = index === totalRuns - 1;
  const metricValueByKey = new Map(displayMetrics.map((metric) => [metric.key, metric.value]));
  const runColor = getRunColor(index);
  const runId = resolvedRun.id || resolvedRun.run_id || `run-${index}`;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isInteractive || !onRunClick) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onRunClick(run);
    }
  };

  return (
    <motion.tr
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : -1}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.03, ...animationPresets.spring }}
      onClick={isInteractive && onRunClick ? () => onRunClick(run) : undefined}
      onKeyDown={handleKeyDown}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={
        isInteractive
          ? {
              backgroundColor: "rgba(15, 52, 85, 0.05)",
              boxShadow: "inset 0 0 0 1px rgba(15, 52, 85, 0.1)",
            }
          : undefined
      }
      whileTap={isInteractive ? { scale: 0.995 } : undefined}
      className={isInteractive ? "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F3455] focus-visible:ring-inset" : undefined}
      style={{
        borderBottom: index < totalRuns - 1 ? "1px solid rgba(15, 52, 85, 0.1)" : "none",
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
        <motion.div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.55rem",
          }}
          animate={{ x: isHovered ? 4 : 0 }}
          transition={animationPresets.spring}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare?.(runId);
            }}
            data-tour={tourCompareToggle}
            data-selected={isCompareSelected ? "true" : "false"}
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
          <motion.div
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={animationPresets.spring}
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
          </motion.div>
          <div className="min-w-0">
            <span style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "rgba(15, 52, 85, 0.78)" }}>
              {resolvedRun.name || resolvedRun.id?.slice(0, 8) || "—"}
            </span>
            <span style={{ display: "block", fontSize: "0.75rem", color: "rgba(15, 52, 85, 0.58)" }}>
              {formatDateTime(resolvedRun.created_at)}
            </span>
            <span style={{ display: "block", fontSize: "0.7rem", color: "rgba(15, 52, 85, 0.48)" }}>
              {resolvedRun.id || resolvedRun.run_id || "—"}
            </span>
          </div>
        </motion.div>
      </td>
      <td style={{ padding: RUNS_TABLE_CELL_PADDING, textAlign: "left" }}>
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusTone(resolvedRun.status)}`}
        >
          {resolvedRun.status || "—"}
        </span>
      </td>
      <td style={{ padding: RUNS_TABLE_CELL_PADDING, textAlign: "left" }}>
        <ContractBadge result={resolvedRun.contract_result} size="sm" />
      </td>
      <td style={{ padding: RUNS_TABLE_CELL_PADDING, textAlign: "left" }}>
        <span style={{ display: "block", fontSize: "0.875rem", color: "rgba(15, 52, 85, 0.7)" }}>
          {formatTimeAgo(resolvedRun.updated_at)}
        </span>
      </td>
      {scalarMetricColumns.map((column) => {
        return (
          <td
            key={`${resolvedRun.id ?? resolvedRun.name ?? index}-${column}`}
            style={{ padding: RUNS_TABLE_CELL_PADDING, textAlign: "left", fontSize: "0.875rem", color: "rgba(15, 52, 85, 0.78)" }}
          >
            {formatMetricValue(column, metricValueByKey.get(column))}
          </td>
        );
      })}
    </motion.tr>
  );
}
