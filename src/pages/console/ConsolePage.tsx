import React, { useEffect, useMemo, useRef } from "react";
import { Terminal } from "lucide-react";
import { Page } from "../../components/cemi/layout/Page";
import type { MonitorState, RunActionEvent, RunRecord } from "../../types/domain";

type ConsoleLevel = "info" | "success" | "warn" | "error";

interface ConsolePageProps {
  projectName?: string;
  runs: RunRecord[];
  selectedRunId?: string | null;
  onSelectRun?: (runId: string) => void;
}

interface ConsoleEntry {
  id: string;
  action: string;
  level: ConsoleLevel;
  deviceLabel: string;
  summary: string;
  output: string;
  occurredAt: number | null;
  order: number;
}

interface ConsoleFeed {
  entries: ConsoleEntry[];
}

function getTimestamp(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

function formatConsoleTimestamp(entry: ConsoleEntry): string {
  if (entry.occurredAt === null) return "--:--:--";
  return new Date(entry.occurredAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function getTagValue(run: RunRecord, key: string): string | null {
  const tags = (run as any).tags;
  // Writer emits tags as a plain dict; mocks use [{key, value}] array — handle both.
  if (tags && typeof tags === "object" && !Array.isArray(tags)) {
    const v = (tags as Record<string, unknown>)[key];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number" || typeof v === "boolean") return String(v);
    return null;
  }
  if (Array.isArray(tags)) {
    const tagValue = tags.find((tag: any) => tag.key === key)?.value;
    if (typeof tagValue === "string" && tagValue.trim()) return tagValue.trim();
  }
  return null;
}

function getParamValue(run: RunRecord, key: string): string | null {
  const paramValue = run.params?.find((param) => param.key === key)?.value;
  if (typeof paramValue === "string" && paramValue.trim()) return paramValue.trim();
  if (typeof paramValue === "number" || typeof paramValue === "boolean") return String(paramValue);
  return null;
}

function getDeviceLabel(run: RunRecord): string {
  return (
    run.context?.device?.board ||
    run.target_profile?.name ||
    run.context?.device?.runtime?.toString() ||
    getParamValue(run, "device") ||
    getParamValue(run, "runtime") ||
    getTagValue(run, "device") ||
    getTagValue(run, "runtime") ||
    "n/a"
  );
}

function normalizeConsoleLevel(value: unknown, fallback: ConsoleLevel = "info"): ConsoleLevel {
  if (typeof value !== "string") return fallback;
  const normalized = value.toLowerCase();
  if (normalized === "success") return "success";
  if (normalized === "warn" || normalized === "warning") return "warn";
  if (normalized === "error" || normalized === "failed" || normalized === "fatal") return "error";
  return "info";
}

function normalizeText(value: unknown, fallback: string): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
}

function buildConsoleFeed(runs: RunRecord[]): ConsoleFeed {
  const entries = runs.flatMap((run, runIndex) => {
    const fallbackDeviceLabel = getDeviceLabel(run);
    const actionEvents = Array.isArray(run.action_events) ? run.action_events : [];

    return actionEvents.map((event: RunActionEvent, eventIndex: number) => ({
      id: event.id || `${run.id}-action-${eventIndex + 1}`,
      action: normalizeText(event.action, "cemi_event"),
      level: normalizeConsoleLevel(event.level),
      deviceLabel: normalizeText(event.device, fallbackDeviceLabel),
      summary: normalizeText(event.summary, event.run_name || run.name || run.id.slice(0, 8)),
      output: normalizeText(event.output, ""),
      occurredAt: getTimestamp(event.timestamp_ms) ?? getTimestamp(event.timestamp),
      order: runIndex * 10000 + eventIndex,
    }));
  });

  return {
    entries: [...entries].sort((left, right) => {
      if (left.occurredAt !== null && right.occurredAt !== null && left.occurredAt !== right.occurredAt) {
        return left.occurredAt - right.occurredAt;
      }
      if (left.occurredAt !== null && right.occurredAt === null) return -1;
      if (left.occurredAt === null && right.occurredAt !== null) return 1;
      return left.order - right.order;
    }),
  };
}

function getLevelColor(level: ConsoleLevel): string {
  if (level === "error") return "#EF4444";
  if (level === "warn") return "#F59E0B";
  if (level === "success") return "#22C55E";
  return "#A3A3A3";
}

function isDriftEvent(action: string): boolean {
  return action === "drift_state_transition";
}

function getMonitorStateFromRuns(runs: RunRecord[]): MonitorState | null {
  for (let i = runs.length - 1; i >= 0; i--) {
    const ms = runs[i].monitor_state;
    if (ms && typeof ms.state === "string") return ms;
  }
  return null;
}

function MonitorStateBanner({ ms }: { ms: MonitorState }) {
  const colors: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    NOMINAL:    { bg: "#0D2B1A", border: "#166534", text: "#22C55E", dot: "#22C55E" },
    WARN:       { bg: "#2B1D06", border: "#92400E", text: "#F59E0B", dot: "#F59E0B" },
    REQUALIFY:  { bg: "#2B0A0A", border: "#991B1B", text: "#EF4444", dot: "#EF4444" },
  };
  const c = colors[ms.state] ?? colors.NOMINAL;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1.5rem",
        padding: "0.5rem 1rem",
        marginBottom: "0.75rem",
        borderRadius: "4px",
        border: `1px solid ${c.border}`,
        backgroundColor: c.bg,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        fontSize: "12px",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span
          style={{
            width: "8px", height: "8px", borderRadius: "50%",
            backgroundColor: c.dot, flexShrink: 0,
            boxShadow: ms.state !== "NOMINAL" ? `0 0 6px ${c.dot}` : "none",
          }}
        />
        <span style={{ color: c.text, fontWeight: 600 }}>{ms.state}</span>
      </span>
      <span style={{ color: "#A3A3A3" }}>
        cusum <span style={{ color: "#E5E5E5" }}>{ms.cusum_statistic.toFixed(4)}</span>
      </span>
      <span style={{ color: "#A3A3A3" }}>
        adwin_mean{" "}
        <span style={{ color: "#E5E5E5" }}>
          {ms.adwin_window_mean != null ? ms.adwin_window_mean.toFixed(6) : "—"}
        </span>
      </span>
      <span style={{ color: "#A3A3A3" }}>
        n <span style={{ color: "#E5E5E5" }}>{ms.n_samples}</span>
      </span>
    </div>
  );
}

export function ConsolePage({ runs, selectedRunId }: ConsolePageProps) {
  const sortedRuns = useMemo(
    () =>
      [...runs].sort((left, right) => {
        const leftUpdated = getTimestamp(left.updated_at) ?? getTimestamp(left.created_at) ?? 0;
        const rightUpdated = getTimestamp(right.updated_at) ?? getTimestamp(right.created_at) ?? 0;
        return rightUpdated - leftUpdated;
      }),
    [runs]
  );
  const consoleFeed = useMemo(() => buildConsoleFeed(sortedRuns), [sortedRuns]);
  const monitorState = useMemo(() => getMonitorStateFromRuns(sortedRuns), [sortedRuns]);
  const consoleViewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = consoleViewportRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [consoleFeed.entries.length]);

  const consolePanelBackground = "#1C1C1C";
  const consoleViewportBackground = "#232323";
  const consoleBorderColor = "#343434";
  const consoleHeaderBorderColor = "#2C2C2C";

  const panelStyle: React.CSSProperties = {
    minHeight: "620px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    borderRadius: "0.5rem",
    border: `1px solid ${consoleBorderColor}`,
    backgroundColor: consolePanelBackground,
    color: "#F5F5F5",
    boxShadow: "none",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    borderBottom: `1px solid ${consoleHeaderBorderColor}`,
    backgroundColor: consolePanelBackground,
    color: "#FAFAFA",
    padding: "0.75rem 1rem",
  };

  const viewportStyle: React.CSSProperties = {
    minHeight: 0,
    flex: 1,
    overflow: "auto",
    backgroundColor: consoleViewportBackground,
    color: "#FFFFFF",
    padding: "1rem",
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: "13px",
    lineHeight: 1.75,
  };

  const rowStyle: React.CSSProperties = {
    display: "flex",
    minWidth: "max-content",
    alignItems: "center",
    gap: "0.75rem",
    whiteSpace: "nowrap",
    color: "#F5F5F5",
  };

  const promptStyle: React.CSSProperties = {
    flexShrink: 0,
    color: "#E5E5E5",
  };

  const timestampStyle: React.CSSProperties = {
    display: "inline-block",
    width: "100px",
    flexShrink: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    color: "#A3A3A3",
  };

  const deviceStyle: React.CSSProperties = {
    display: "inline-block",
    width: "180px",
    flexShrink: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    color: "#B3B3B3",
  };

  const actionBaseStyle: React.CSSProperties = {
    display: "inline-block",
    width: "160px",
    flexShrink: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const summaryStyle: React.CSSProperties = {
    display: "inline-block",
    width: "220px",
    flexShrink: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    color: "#F5F5F5",
  };

  const outputStyle: React.CSSProperties = {
    display: "inline-block",
    minWidth: "420px",
    flexShrink: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    color: "#FFFFFF",
  };

  return (
    <Page title="" subtitle="" fullWidth>
      <div className="flex min-h-0">
        <div style={panelStyle} data-tour="console-panel">
          <div style={headerStyle}>
            <Terminal className="h-4 w-4" style={{ color: "#E5E5E5" }} />
            <span
              className="font-mono text-sm"
              style={{
                color: "#FAFAFA",
                fontFamily:
                  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              }}
            >
              cemi.console
            </span>
          </div>

          <div ref={consoleViewportRef} style={viewportStyle} data-tour="console-feed">
            {monitorState && <MonitorStateBanner ms={monitorState} />}
            {consoleFeed.entries.length > 0 ? (
              <div className="space-y-1">
                {consoleFeed.entries.map((entry) => {
                  const isDrift = isDriftEvent(entry.action);
                  const driftAccentColor =
                    entry.level === "error" ? "#EF4444"
                    : entry.level === "warn" ? "#F59E0B"
                    : "#22C55E";
                  return (
                    <div
                      key={entry.id}
                      style={{
                        ...rowStyle,
                        ...(isDrift ? {
                          borderLeft: `3px solid ${driftAccentColor}`,
                          paddingLeft: "0.5rem",
                          backgroundColor: entry.level === "error"
                            ? "rgba(239,68,68,0.07)"
                            : entry.level === "warn"
                            ? "rgba(245,158,11,0.07)"
                            : "rgba(34,197,94,0.07)",
                          borderRadius: "2px",
                        } : {}),
                      }}
                    >
                      <span style={promptStyle}>$</span>
                      <span style={timestampStyle} title={formatConsoleTimestamp(entry)}>
                        [{formatConsoleTimestamp(entry)}]
                      </span>
                      <span style={deviceStyle} title={entry.deviceLabel}>
                        [{entry.deviceLabel}]
                      </span>
                      <span
                        style={{
                          ...actionBaseStyle,
                          color: getLevelColor(entry.level),
                          fontWeight: isDrift ? 600 : undefined,
                        }}
                        title={entry.action}
                      >
                        [{entry.action}]
                      </span>
                      <span style={summaryStyle} title={entry.summary}>
                        {entry.summary}
                      </span>
                      <span style={outputStyle} title={entry.output}>
                        {entry.output}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ color: "#B3B3B3" }}>$ waiting for cemi output...</div>
            )}
          </div>
        </div>
      </div>
    </Page>
  );
}
