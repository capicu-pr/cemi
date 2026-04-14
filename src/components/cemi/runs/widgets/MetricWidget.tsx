// src/components/cemi/runs/widgets/MetricWidget.tsx
// TensorBoard-style metric visualization widget

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Download, 
  Eye, 
  EyeOff,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { ButtonUtility } from "../../../base/buttons/button-utility";
import { animationPresets } from "../../../ui/animated-interactive";
import { cn } from "../../../ui/utils";
import { isEpochAxisMetric } from "../../../../utils/runHelpers";
import { isScalarMetricSeries } from "./runMetricsToWidgetData";
import { useMetricChartData } from "./useMetricChartData";

// Color palette for multiple runs (TensorBoard-inspired)
export const WIDGET_RUN_COLORS = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#96CEB4", // Green
  "#FFEAA7", // Yellow
  "#DDA0DD", // Plum
  "#98D8C8", // Mint
  "#F7DC6F", // Gold
  "#BB8FCE", // Purple
  "#85C1E9", // Light Blue
];

interface MetricDataPoint {
  step: number;
  value: number;
  wallTime?: number;
}

interface RunMetricData {
  runId: string;
  runName: string;
  data: MetricDataPoint[];
  color?: string;
  visible?: boolean;
}

interface RunStat {
  runId: string;
  runName: string;
  latestValue: number | undefined;
  trend: "up" | "down" | "flat";
  color: string;
}

interface MetricWidgetProps {
  title: string;
  metricKey: string;
  runs: RunMetricData[];
  visibleRunIds?: Set<string>;
  yAxisLabel?: string;
  xAxisLabel?: string;
  showSmoothing?: boolean;
  showChartControls?: boolean;
  /** Default smoothing factor (0–1). Use 0.2 for light smoothing. */
  defaultSmoothing?: number;
  /**
   * Fixed overall widget height (card height). Keeps all widgets equal height.
   * Legend becomes scrollable if it overflows.
   */
  frameHeight?: number;
  /**
   * If true, the widget will not set its own height and will instead fill its parent.
   * Useful when the parent enforces a square via `aspect-square`.
   */
  fillParent?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /**
   * Chart area height when not using fixed `frameHeight`.
   * (Kept for backward compatibility.)
   */
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  onExpand?: () => void;
  onDownload?: () => void;
}

// Calculate trend (up, down, flat)
function calculateTrend(data: MetricDataPoint[]): "up" | "down" | "flat" {
  if (data.length < 2) return "flat";
  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, p) => sum + p.value, 0) / firstHalf.length;
  const secondAvg =
    secondHalf.reduce((sum, p) => sum + p.value, 0) / secondHalf.length;

  if (firstAvg === 0) {
    return secondAvg > 0 ? "up" : secondAvg < 0 ? "down" : "flat";
  }
  const diff = (secondAvg - firstAvg) / firstAvg;
  if (diff > 0.05) return "up";
  if (diff < -0.05) return "down";
  return "flat";
}

function getRunColor(run: RunMetricData, index: number) {
  return run.color || WIDGET_RUN_COLORS[index % WIDGET_RUN_COLORS.length];
}

function formatRunId(runId: string): string {
  return runId.trim() || "—";
}

function RunVisibilityTable({
  runStats,
  visibleRuns,
  hoveredRun,
  setHoveredRun,
  toggleRunVisibility,
  compact = false,
}: {
  runStats: RunStat[];
  visibleRuns: Set<string>;
  hoveredRun: string | null;
  setHoveredRun: (runId: string | null) => void;
  toggleRunVisibility: (runId: string) => void;
  compact?: boolean;
}) {
  const containerClassName = compact
    ? "max-h-[124px]"
    : "max-h-[220px]";
  const headerPadding = compact ? "0.45rem 0.75rem" : "0.65rem 0.9rem";
  const cellPadding = compact ? "0.45rem 0.75rem" : "0.65rem 0.9rem";
  const textSize = compact ? "0.72rem" : "0.82rem";
  const idTextSize = compact ? "0.68rem" : "0.76rem";
  const iconSizeClassName = compact ? "h-3.5 w-3.5" : "h-4 w-4";

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isScrollable, setIsScrollable] = useState(false);

  const updateFakeScrollbar = () => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollH = el.scrollHeight;
    const clientH = el.clientHeight;
    const scrollTop = el.scrollTop;

    const scrollableNow = scrollH > clientH + 2;
    setIsScrollable(scrollableNow);
    if (!scrollableNow) {
      el.style.setProperty("--mw-scroll-thumb-top", "0px");
      el.style.setProperty("--mw-scroll-thumb-height", `${Math.max(18, clientH)}px`);
      return;
    }

    const railH = clientH;
    const thumbH = Math.max(18, Math.floor((clientH / scrollH) * railH));
    const maxTop = Math.max(0, railH - thumbH);
    const maxScroll = Math.max(1, scrollH - clientH);
    const thumbTop = Math.round((scrollTop / maxScroll) * maxTop);

    el.style.setProperty("--mw-scroll-thumb-top", `${thumbTop}px`);
    el.style.setProperty("--mw-scroll-thumb-height", `${thumbH}px`);
  };

  useEffect(() => {
    updateFakeScrollbar();
  }, [runStats.length, compact]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let raf = 0;

    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => updateFakeScrollbar());
    };

    el.addEventListener("scroll", onScroll, { passive: true });

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => updateFakeScrollbar());
      ro.observe(el);
    }

    return () => {
      el.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      ro?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={cn(
        "metric-widget-scroll-container overflow-y-auto rounded-lg border border-[rgba(15,52,85,0.08)] bg-[#F9F5EA]",
        containerClassName
      )}
      style={{ backgroundColor: "var(--cemi-surface-bg, #F9F5EA)" }}
      ref={scrollRef}
      data-scrollable={isScrollable ? "true" : "false"}
    >
      <table className="w-full border-collapse">
        <thead>
          <tr style={{ backgroundColor: "rgba(15, 52, 85, 0.05)" }}>
            <th
              style={{
                width: "56px",
                padding: headerPadding,
                textAlign: "center",
                fontSize: textSize,
                fontWeight: 600,
                color: "#0F3455",
              }}
            >
              Show
            </th>
            <th
              style={{
                padding: headerPadding,
                textAlign: "left",
                fontSize: textSize,
                fontWeight: 600,
                color: "#0F3455",
              }}
            >
              Name
            </th>
            <th
              style={{
                padding: headerPadding,
                textAlign: "left",
                fontSize: textSize,
                fontWeight: 600,
                color: "#0F3455",
              }}
            >
              ID
            </th>
          </tr>
        </thead>
        <tbody>
          {runStats.map((stat, index) => {
            const isVisible = visibleRuns.has(stat.runId);
            const isDimmed = !!hoveredRun && hoveredRun !== stat.runId;
            return (
              <tr
                key={stat.runId}
                onMouseEnter={() => setHoveredRun(stat.runId)}
                onMouseLeave={() => setHoveredRun(null)}
                style={{
                  borderTop: index === 0 ? "none" : "1px solid rgba(15, 52, 85, 0.08)",
                  backgroundColor: isDimmed ? "rgba(15, 52, 85, 0.02)" : "transparent",
                }}
              >
                <td style={{ padding: cellPadding, textAlign: "center" }}>
                  <button
                    type="button"
                    onClick={() => toggleRunVisibility(stat.runId)}
                    className="inline-flex items-center justify-center rounded-md p-1 transition-colors hover:bg-[rgba(15,52,85,0.06)]"
                    aria-label={`${isVisible ? "Hide" : "Show"} ${stat.runName}`}
                    title={`${isVisible ? "Hide" : "Show"} ${stat.runName}`}
                  >
                    {isVisible ? (
                      <Eye className={iconSizeClassName} style={{ color: stat.color }} />
                    ) : (
                      <EyeOff className={iconSizeClassName} style={{ color: stat.color, opacity: 0.55 }} />
                    )}
                  </button>
                </td>
                <td style={{ padding: cellPadding, minWidth: 0 }}>
                  <span
                    className="block truncate"
                    style={{
                      fontSize: textSize,
                      fontWeight: 500,
                      color: isVisible ? "#0F3455" : "rgba(15, 52, 85, 0.55)",
                    }}
                    title={stat.runName}
                  >
                    {stat.runName}
                  </span>
                </td>
                <td style={{ padding: cellPadding, minWidth: 0 }}>
                  <span
                    className="block truncate font-mono"
                    style={{
                      fontSize: idTextSize,
                      color: isVisible ? "rgba(15, 52, 85, 0.74)" : "rgba(15, 52, 85, 0.45)",
                    }}
                    title={stat.runId}
                  >
                    {formatRunId(stat.runId)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function MetricWidget({
  title,
  metricKey,
  runs,
  visibleRunIds,
  yAxisLabel,
  xAxisLabel,
  showSmoothing = true,
  showChartControls = true,
  defaultSmoothing = 0.2,
  frameHeight = 420,
  fillParent = false,
  height = 280,
  showLegend = true,
  showGrid = true,
  onExpand,
  onDownload,
  className,
  style,
}: MetricWidgetProps) {
  const effectiveXLabel = xAxisLabel ?? (isEpochAxisMetric(metricKey) ? "Epoch" : "Step");
  // Default 0.2 (light smoothing); ensure we never default to 0.6
  const initialSmoothing = defaultSmoothing ?? 0.2;
  const [smoothing, setSmoothing] = useState(initialSmoothing);
  const [xAxisMode, setXAxisMode] = useState<"step" | "wallTime">("step");
  const [yScale, setYScale] = useState<"linear" | "log">("linear");
  const [visibleRuns, setVisibleRuns] = useState<Set<string>>(
    new Set(runs.map((r) => r.runId))
  );
  const [hoveredRun, setHoveredRun] = useState<string | null>(null);
  const chartHostRef = useRef<HTMLDivElement | null>(null);
  const [chartHostWidth, setChartHostWidth] = useState<number>(400);
  const resolvedVisibleRuns = visibleRunIds ?? visibleRuns;

  const scalarMode = useMemo(() => isScalarMetricSeries(runs), [runs]);

  const barPlotData = useMemo(() => {
    if (!scalarMode) return [];
    return runs
      .filter((r) => resolvedVisibleRuns.has(r.runId))
      .map((run) => {
        const runIndex = runs.findIndex((r) => r.runId === run.runId);
        const idx = runIndex >= 0 ? runIndex : 0;
        const rawName = run.runName?.trim() || formatRunId(run.runId);
        const label =
          rawName.length > 16 ? `${rawName.slice(0, 14)}…` : rawName;
        return {
          runId: run.runId,
          label,
          fullName: rawName,
          value: run.data[0]!.value,
          fill: getRunColor(run, idx),
        };
      });
  }, [runs, scalarMode, resolvedVisibleRuns]);

  const barPlotDataScaled = useMemo(() => {
    if (!scalarMode) return [];
    if (yScale !== "log") return barPlotData;
    return barPlotData.map((d) => ({
      ...d,
      value:
        typeof d.value === "number" && Number.isFinite(d.value) && d.value > 0
          ? d.value
          : (null as unknown as number),
    }));
  }, [barPlotData, scalarMode, yScale]);

  const approxMaxPoints = Math.max(160, Math.floor(chartHostWidth * 1.8));
  const { chartData } = useMetricChartData(
    runs,
    smoothing,
    resolvedVisibleRuns,
    approxMaxPoints
  );
  const { chartData: rawChartData } = useMetricChartData(
    runs,
    0,
    resolvedVisibleRuns,
    approxMaxPoints
  );
  const chartDataWithWallTime = useMemo(
    () =>
      chartData.map((point) => {
        const base: Record<string, number | string | null> = { ...point };
        const timeCandidate = runs
          .flatMap((run) => run.data)
          .find((p) => p.step === point.step)?.wallTime;
        if (typeof timeCandidate === "number" && Number.isFinite(timeCandidate)) {
          base.wallTime = timeCandidate;
        }
        return base;
      }),
    [chartData, runs]
  );
  const dataHasWallTime = runs.some((run) =>
    run.data.some((p) => typeof p.wallTime === "number" && Number.isFinite(p.wallTime))
  );
  const chartPlotData = useMemo(() => {
    if (yScale !== "log") return chartDataWithWallTime;
    return chartDataWithWallTime.map((point) => {
      const next = { ...point } as Record<string, number | string | null>;
      runs.forEach((run) => {
        const val = next[run.runId];
        if (typeof val === "number" && val <= 0) {
          next[run.runId] = null;
        }
      });
      return next;
    });
  }, [chartDataWithWallTime, runs, yScale]);
  const rawChartDataWithWallTime = useMemo(
    () =>
      rawChartData.map((point) => {
        const base: Record<string, number | string | null> = { ...point };
        const timeCandidate = runs
          .flatMap((run) => run.data)
          .find((p) => p.step === point.step)?.wallTime;
        if (typeof timeCandidate === "number" && Number.isFinite(timeCandidate)) {
          base.wallTime = timeCandidate;
        }
        return base;
      }),
    [rawChartData, runs]
  );
  const rawPlotData = useMemo(() => {
    if (yScale !== "log") return rawChartDataWithWallTime;
    return rawChartDataWithWallTime.map((point) => {
      const next = { ...point } as Record<string, number | string | null>;
      runs.forEach((run) => {
        const val = next[run.runId];
        if (typeof val === "number" && val <= 0) {
          next[run.runId] = null;
        }
      });
      return next;
    });
  }, [rawChartDataWithWallTime, runs, yScale]);
  const showRawOverlay = smoothing > 0.001;

  // Get latest values and trends for each run
  const runStats = useMemo(() => {
    return runs.map((run, index) => {
      const latestPoint = run.data[run.data.length - 1];
      const trend = calculateTrend(run.data);
      return {
        runId: run.runId,
        runName: run.runName,
        latestValue: latestPoint?.value,
        trend,
        color: getRunColor(run, index),
      };
    });
  }, [runs]);

  const toggleRunVisibility = (runId: string) => {
    const newVisible = new Set(visibleRuns);
    if (newVisible.has(runId)) {
      newVisible.delete(runId);
    } else {
      newVisible.add(runId);
    }
    setVisibleRuns(newVisible);
  };

  const formatValue = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "—";
    if (Math.abs(value) < 0.01) return value.toExponential(2);
    if (Math.abs(value) > 10000) return value.toExponential(2);
    return value.toFixed(4);
  };

  const TrendIcon = ({ trend }: { trend: "up" | "down" | "flat" }) => {
    if (trend === "up") return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (trend === "down") return <TrendingDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-[rgba(15,52,85,0.4)]" />;
  };

  // When this widget is used in fixed-card mode (`fillParent`), make the in-card chart
  // react to real layout changes (e.g. widget width changing to match container).
  // We avoid ResponsiveContainer here because it can report 0px in nested flex/grid/overflow.
  useEffect(() => {
    if (!fillParent) return;
    const el = chartHostRef.current;
    if (!el) return;

    const update = () => {
      const w = Math.floor(el.getBoundingClientRect().width);
      if (Number.isFinite(w) && w > 0) setChartHostWidth(w);
    };

    update();

    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(() => update());
      ro.observe(el);
      return () => ro.disconnect();
    }

    // Fallback: update on window resize
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [fillParent]);

  // Allow wider widgets (while keeping overall widget/card height stable).
  // We cap extremely large widths just to avoid pathological layouts on ultrawide screens.
  const chartWidth = fillParent ? Math.max(260, Math.min(2000, chartHostWidth)) : undefined;
  const chartHeight = fillParent
    ? Math.max(240, Math.min(406, Math.round((chartWidth ?? 400) * 0.78)))
    : undefined;

  return (
    <motion.div
      className={cn(
        "bg-card text-card-foreground border border-border rounded-lg overflow-hidden flex flex-col",
        fillParent ? "h-full" : "",
        className
      )}
      style={{
        ...(fillParent ? {} : { height: frameHeight }),
        ...style,
      }}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={animationPresets.spring}
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(15,52,85,0.08)] flex-shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-[#0F3455]">{title}</h3>
          <span className="text-xs text-[rgba(15,52,85,0.5)] font-mono">{metricKey}</span>
        </div>
        
        <div className="flex items-center gap-1">
          {onDownload && (
            <ButtonUtility
              icon={Download}
              tooltip="Download CSV"
              size="xs"
              color="tertiary"
              onClick={onDownload}
            />
          )}
        </div>
      </div>

      {/* Chart Controls — smoothing and step/wall X only apply to time series */}
      {((showSmoothing && !scalarMode) || showChartControls) && (
        <div className="px-4 py-2 border-b border-border/10 flex items-center gap-3 flex-shrink-0">
          {showSmoothing && !scalarMode && (
            <>
              <span className="text-xs text-muted-foreground">Smoothing</span>
              <input
                type="range"
                min="0"
                max="0.99"
                step="0.01"
                value={smoothing}
                onChange={(e) => setSmoothing(parseFloat(e.target.value))}
                className="w-24 h-1 rounded-lg appearance-none cursor-pointer accent-primary bg-border/40"
              />
              <span className="text-xs font-mono text-muted-foreground w-8">
                {smoothing.toFixed(2)}
              </span>
            </>
          )}
          {showChartControls && (
            <>
              {!scalarMode ? (
                <>
                  <span className="ml-auto text-xs text-muted-foreground">x-axis</span>
                  <select
                    value={xAxisMode}
                    onChange={(e) => setXAxisMode(e.target.value as "step" | "wallTime")}
                    className={cn(
                      "h-7 min-w-[92px] rounded-md border px-2.5 text-xs font-medium",
                      "border-[rgba(15,52,85,0.18)] bg-white text-[#0F3455] shadow-sm",
                      "transition-colors duration-150",
                      "hover:border-[rgba(15,52,85,0.32)]",
                      "focus:outline-none focus:ring-2 focus:ring-[rgba(15,52,85,0.18)] focus:border-[rgba(15,52,85,0.38)]",
                      "disabled:cursor-not-allowed disabled:opacity-55 disabled:bg-[rgba(15,52,85,0.04)]"
                    )}
                    disabled={!dataHasWallTime}
                    title={dataHasWallTime ? "Choose x-axis mode" : "Wall time unavailable"}
                  >
                    <option value="step">Step</option>
                    <option value="wallTime">Wall time</option>
                  </select>
                </>
              ) : (
                <span className="ml-auto text-[11px] font-medium text-[rgba(15,52,85,0.42)]">
                
                </span>
              )}
              <span className="text-xs text-muted-foreground">y-axis</span>
              <select
                value={yScale}
                onChange={(e) => setYScale(e.target.value as "linear" | "log")}
                className={cn(
                  "h-7 min-w-[82px] rounded-md border px-2.5 text-xs font-medium",
                  "border-[rgba(15,52,85,0.18)] bg-white text-[#0F3455] shadow-sm",
                  "transition-colors duration-150",
                  "hover:border-[rgba(15,52,85,0.32)]",
                  "focus:outline-none focus:ring-2 focus:ring-[rgba(15,52,85,0.18)] focus:border-[rgba(15,52,85,0.38)]"
                )}
              >
                <option value="linear">Linear</option>
                <option value="log">Log</option>
              </select>
            </>
          )}
        </div>
      )}

      {/* Chart Area */}
      <div className="p-2 flex-1 min-h-0 flex items-center justify-start">
        {/* For the fixed-size cards we render the plot into a fixed viewport.
            This prevents ResponsiveContainer from ever receiving a 0px height and “disappearing”. */}
        <div
          ref={chartHostRef}
          className={cn("flex-none w-full", fillParent ? "" : "h-full")}
          style={fillParent ? { height: chartHeight } : undefined}
        >
          {(() => {
            const tooltipStyles = {
              contentStyle: {
                backgroundColor: "var(--cemi-hovercard-bg, #0F3455)",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: "10px",
                padding: "8px 12px",
                boxShadow: "0 10px 28px rgba(15,52,85,0.22)",
              },
              labelStyle: {
                color: "var(--cemi-hovercard-fg, #F9F5EA)",
                fontWeight: 500,
                marginBottom: "4px",
              },
              itemStyle: {
                color: "var(--cemi-hovercard-fg, #F9F5EA)",
                fontSize: "12px",
              },
            };

            if (scalarMode) {
              if (barPlotDataScaled.length === 0) {
                return (
                  <div
                    className="flex h-full min-h-[160px] w-full items-center justify-center px-4 text-center text-xs text-[rgba(15,52,85,0.45)]"
                    style={fillParent ? { height: chartHeight } : undefined}
                  >
                    No runs visible for this metric. Toggle runs in the sidebar to compare values.
                  </div>
                );
              }

              const barChartInner = (
                <>
                  {showGrid && (
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(15, 52, 85, 0.08)"
                      vertical={false}
                    />
                  )}
                  <XAxis
                    dataKey="label"
                    type="category"
                    interval={0}
                    tick={{
                      fontSize: 9,
                      fill: "rgba(15, 52, 85, 0.62)",
                      angle: -45,
                      textAnchor: "end",
                    }}
                    axisLine={{ stroke: "rgba(15, 52, 85, 0.1)" }}
                    tickLine={{ stroke: "rgba(15, 52, 85, 0.1)" }}
                    height={52}
                    label={{
                      value: "Run",
                      position: "bottom",
                      offset: 18,
                      fontSize: 10,
                      fill: "rgba(15, 52, 85, 0.5)",
                    }}
                  />
                  <YAxis
                    scale={yScale}
                    domain={yScale === "log" ? [0.0000001, "auto"] : ["auto", "auto"]}
                    allowDataOverflow={yScale === "log"}
                    tick={{ fontSize: 10, fill: "rgba(15, 52, 85, 0.6)" }}
                    axisLine={{ stroke: "rgba(15, 52, 85, 0.1)" }}
                    tickLine={{ stroke: "rgba(15, 52, 85, 0.1)" }}
                    tickFormatter={(value) => {
                      if (typeof value !== "number") return "";
                      if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1)}k`;
                      return value.toFixed(2);
                    }}
                    label={
                      yAxisLabel
                        ? {
                            value: yAxisLabel,
                            angle: -90,
                            position: "insideLeft",
                            fontSize: 10,
                            fill: "rgba(15, 52, 85, 0.5)",
                          }
                        : undefined
                    }
                  />
                  <Tooltip
                    {...tooltipStyles}
                    formatter={(value: number) => [formatValue(value), metricKey]}
                    labelFormatter={(_label, payload) => {
                      const row = payload?.[0]?.payload as { fullName?: string } | undefined;
                      return row?.fullName || "Run";
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={56} isAnimationActive={false}>
                    {barPlotDataScaled.map((entry) => (
                      <Cell
                        key={entry.runId}
                        fill={entry.fill}
                        opacity={hoveredRun && hoveredRun !== entry.runId ? 0.35 : 1}
                        style={{ cursor: "pointer" }}
                        onMouseEnter={() => setHoveredRun(entry.runId)}
                        onMouseLeave={() => setHoveredRun(null)}
                      />
                    ))}
                  </Bar>
                </>
              );

              const barMargins = { top: 8, right: 12, left: 4, bottom: 52 };
              if (fillParent) {
                return (
                  <BarChart
                    width={chartWidth ?? 400}
                    height={chartHeight ?? 320}
                    data={barPlotDataScaled}
                    margin={barMargins}
                  >
                    {barChartInner}
                  </BarChart>
                );
              }
              return (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barPlotDataScaled} margin={barMargins}>
                    {barChartInner}
                  </BarChart>
                </ResponsiveContainer>
              );
            }

            const lineChartInner = (
              <>
                {showGrid && (
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(15, 52, 85, 0.08)"
                    vertical={false}
                  />
                )}
                <XAxis
                  dataKey={xAxisMode === "wallTime" && dataHasWallTime ? "wallTime" : "step"}
                  type="number"
                  tick={{ fontSize: 10, fill: "rgba(15, 52, 85, 0.6)" }}
                  axisLine={{ stroke: "rgba(15, 52, 85, 0.1)" }}
                  tickLine={{ stroke: "rgba(15, 52, 85, 0.1)" }}
                  domain={["dataMin", "dataMax"]}
                  tickFormatter={(value) => {
                    if (
                      xAxisMode === "wallTime" &&
                      dataHasWallTime &&
                      typeof value === "number"
                    ) {
                      const date = new Date(value);
                      return date.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                    }
                    return String(value);
                  }}
                  label={
                    (xAxisLabel || (xAxisMode === "wallTime" && dataHasWallTime))
                      ? {
                          value:
                            xAxisMode === "wallTime" && dataHasWallTime
                              ? "Wall time"
                              : effectiveXLabel,
                          position: "bottom",
                          fontSize: 10,
                          fill: "rgba(15, 52, 85, 0.5)",
                        }
                      : undefined
                  }
                />
                <YAxis
                  scale={yScale}
                  domain={yScale === "log" ? [0.0000001, "auto"] : ["auto", "auto"]}
                  allowDataOverflow={yScale === "log"}
                  tick={{ fontSize: 10, fill: "rgba(15, 52, 85, 0.6)" }}
                  axisLine={{ stroke: "rgba(15, 52, 85, 0.1)" }}
                  tickLine={{ stroke: "rgba(15, 52, 85, 0.1)" }}
                  tickFormatter={(value) => {
                    if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1)}k`;
                    return value.toFixed(2);
                  }}
                  label={
                    yAxisLabel
                      ? {
                          value: yAxisLabel,
                          angle: -90,
                          position: "insideLeft",
                          fontSize: 10,
                          fill: "rgba(15, 52, 85, 0.5)",
                        }
                      : undefined
                  }
                />
                <Tooltip
                  {...tooltipStyles}
                  formatter={(value: number, name: string) => [
                    formatValue(value),
                    runs.find((r) => r.runId === name)?.runName || name,
                  ]}
                  labelFormatter={(axisValue) => {
                    if (
                      xAxisMode === "wallTime" &&
                      dataHasWallTime &&
                      typeof axisValue === "number"
                    ) {
                      return `Wall time ${new Date(axisValue).toLocaleString()}`;
                    }
                    return `${effectiveXLabel} ${axisValue}`;
                  }}
                />
                {runs.map((run, index) => (
                  <React.Fragment key={run.runId}>
                    {showRawOverlay && (
                      <Line
                        type="monotone"
                        data={rawPlotData}
                        dataKey={run.runId}
                        stroke={getRunColor(run, index)}
                        strokeWidth={1}
                        isAnimationActive={false}
                        dot={false}
                        activeDot={false}
                        opacity={hoveredRun && hoveredRun !== run.runId ? 0.08 : 0.2}
                        hide={!resolvedVisibleRuns.has(run.runId)}
                        legendType="none"
                        connectNulls
                      />
                    )}
                    <Line
                      type="monotone"
                      dataKey={run.runId}
                      name={run.runName}
                      stroke={getRunColor(run, index)}
                      strokeWidth={hoveredRun === run.runId ? 2.5 : 1.5}
                      isAnimationActive={false}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0 }}
                      opacity={hoveredRun && hoveredRun !== run.runId ? 0.3 : 1}
                      hide={!resolvedVisibleRuns.has(run.runId)}
                    />
                  </React.Fragment>
                ))}
              </>
            );

            if (fillParent) {
              return (
                <LineChart
                  width={chartWidth ?? 400}
                  height={chartHeight ?? 320}
                  data={chartPlotData}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  {lineChartInner}
                </LineChart>
              );
            }

            return (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartPlotData}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  {lineChartInner}
                </LineChart>
              </ResponsiveContainer>
            );
          })()}
        </div>
      </div>

      {/* Legend / Run List */}
      {showLegend && !visibleRunIds && runs.length > 0 && (
        <div className="px-4 py-2 border-t border-[rgba(15,52,85,0.08)] flex-shrink-0">
          <RunVisibilityTable
            runStats={runStats}
            visibleRuns={visibleRuns}
            hoveredRun={hoveredRun}
            setHoveredRun={setHoveredRun}
            toggleRunVisibility={toggleRunVisibility}
            compact
          />
        </div>
      )}
    </motion.div>
  );
}

