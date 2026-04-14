import React from "react";
import { ScrollArea, ScrollBar } from "../../components/ui/scroll-area";
import type { RunRecord } from "../../types/domain";

interface QualGateDiffProps {
  runs: RunRecord[];
}

interface GateRow {
  id: string;
  label: string;
  section: "eqc" | "accuracy" | "contract";
  cells: GateCell[];
}

interface GateCell {
  runId: string;
  pass: boolean | null;
  displayValue: string;
  explain?: string;
}

const CELL_PADDING = "0.5rem 1rem";
const HEADER_PADDING = "0.6rem 1rem";
const FIRST_COL_MIN_WIDTH = "220px";
const COL_MIN_WIDTH = "152px";
const TABLE_BG = "var(--cemi-surface-bg, #F9F5EA)";
const HEADER_BG = "rgba(15, 52, 85, 0.05)";

function formatNumericValue(value: number | null | undefined, digits = 4): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return value.toFixed(digits);
}

function buildGateRows(runs: RunRecord[]): GateRow[] {
  const rows: GateRow[] = [];

  // EQC assignment row
  const hasEQC = runs.some((run) => (run as any).eqc_assignment != null);
  if (hasEQC) {
    rows.push({
      id: "eqc_assignment",
      label: "EQC — δ norm",
      section: "eqc",
      cells: runs.map((run) => {
        const eqc = (run as any).eqc_assignment;
        if (!eqc) return { runId: run.id, pass: null, displayValue: "—" };
        const delta = typeof eqc.output_delta_norm === "number" ? eqc.output_delta_norm : null;
        const tol = typeof eqc.tolerance === "number" ? eqc.tolerance : null;
        const displayValue =
          delta !== null
            ? `${delta.toFixed(4)}${tol !== null ? ` / ${tol.toFixed(4)}` : ""}`
            : "—";
        return {
          runId: run.id,
          pass: typeof eqc.delta_within_tolerance === "boolean" ? eqc.delta_within_tolerance : null,
          displayValue,
          explain: eqc.eqc_id ? `EQC: ${eqc.eqc_id}` : undefined,
        };
      }),
    });
  }

  // Accuracy gate row
  const hasAccuracy = runs.some((run) => (run as any).accuracy_gate != null);
  if (hasAccuracy) {
    const labels = new Set<string>();
    runs.forEach((run) => {
      const gate = (run as any).accuracy_gate;
      if (gate?.metric_name) labels.add(gate.metric_name);
    });
    const label = labels.size === 1 ? Array.from(labels)[0] : "accuracy";

    rows.push({
      id: "accuracy_gate",
      label: `Accuracy — ${label}`,
      section: "accuracy",
      cells: runs.map((run) => {
        const gate = (run as any).accuracy_gate;
        if (!gate) return { runId: run.id, pass: null, displayValue: "—" };
        const val = typeof gate.metric_value === "number" ? gate.metric_value : null;
        const thr = typeof gate.threshold === "number" ? gate.threshold : null;
        const dir =
          gate.direction === "lower_is_better" ? "≤" : "≥";
        const displayValue =
          val !== null
            ? `${val.toFixed(4)} ${thr !== null ? `${dir} ${thr.toFixed(4)}` : ""}`
            : "—";
        return {
          runId: run.id,
          pass: typeof gate.pass === "boolean" ? gate.pass : null,
          displayValue,
        };
      }),
    });
  }

  // Contract gate rows — one row per unique gate role across all runs
  const allGateIds = new Map<string, string>(); // id → label
  runs.forEach((run) => {
    const cr = (run as any).contract_result;
    if (!Array.isArray(cr?.gate_results)) return;
    cr.gate_results.forEach((g: any) => {
      if (g?.id && !allGateIds.has(g.id)) {
        allGateIds.set(g.id, g.role || g.id);
      }
    });
  });

  allGateIds.forEach((label, gateId) => {
    rows.push({
      id: `contract_${gateId}`,
      label: `Contract — ${label}`,
      section: "contract",
      cells: runs.map((run) => {
        const cr = (run as any).contract_result;
        const gate = Array.isArray(cr?.gate_results)
          ? cr.gate_results.find((g: any) => g?.id === gateId)
          : null;

        if (!gate) return { runId: run.id, pass: null, displayValue: "—" };

        const runVal =
          typeof gate.run_value === "number" ? formatNumericValue(gate.run_value) : "—";
        const baseVal =
          typeof gate.baseline_value === "number"
            ? ` / ${formatNumericValue(gate.baseline_value)}`
            : "";
        const dir = gate.direction === "lower_is_better" ? "↓" : gate.direction === "higher_is_better" ? "↑" : "";
        const displayValue = `${runVal}${baseVal}${dir ? ` ${dir}` : ""}`;

        return {
          runId: run.id,
          pass: typeof gate.pass === "boolean" ? gate.pass : null,
          displayValue,
          explain: gate.explain || undefined,
        };
      }),
    });
  });

  return rows;
}

function PassCell({ cell }: { cell: GateCell }) {
  const { pass, displayValue, explain } = cell;

  const baseCellStyle: React.CSSProperties = {
    padding: CELL_PADDING,
    fontSize: "0.78rem",
    fontFamily: "monospace",
    whiteSpace: "nowrap",
    borderBottom: "1px solid rgba(15,52,85,0.07)",
    verticalAlign: "top",
  };

  if (pass === null) {
    return (
      <td style={{ ...baseCellStyle, color: "rgba(15,52,85,0.34)" }}>—</td>
    );
  }

  return (
    <td
      style={{
        ...baseCellStyle,
        backgroundColor: pass
          ? "rgba(34,197,94,0.06)"
          : "rgba(239,68,68,0.06)",
      }}
      title={explain}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.4rem" }}>
        <span
          style={{
            marginTop: "0.15rem",
            flexShrink: 0,
            fontSize: "0.9rem",
            lineHeight: 1,
            color: pass ? "#22C55E" : "#EF4444",
          }}
        >
          {pass ? "✓" : "✗"}
        </span>
        <span style={{ color: pass ? "#166534" : "#991B1B" }}>{displayValue}</span>
      </div>
      {explain && (
        <div
          style={{
            marginTop: "0.25rem",
            fontSize: "0.68rem",
            color: "rgba(15,52,85,0.48)",
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
            whiteSpace: "normal",
            maxWidth: "180px",
          }}
        >
          {explain}
        </div>
      )}
    </td>
  );
}

const SECTION_LABEL: Record<GateRow["section"], string> = {
  eqc: "Behavioral Equivalence",
  accuracy: "Accuracy Gate",
  contract: "Contract Gates",
};

export function QualGateDiff({ runs }: QualGateDiffProps) {
  const rows = buildGateRows(runs);

  if (runs.length === 0 || rows.length === 0) {
    return (
      <div>
        <div className="px-2 pb-2 pt-1">
          <div className="text-md font-semibold text-[#0F3455]">Qualification Gate Diff</div>
          <div className="mt-0.5 text-sm text-[rgba(15,52,85,0.62)]">
            Gate results across selected runs — each column is one run
          </div>
        </div>
        <div
          className="flex items-center justify-center rounded-lg py-8 text-sm"
          style={{ color: "rgba(15,52,85,0.44)", border: "1px dashed rgba(15,52,85,0.16)" }}
        >
          {runs.length === 0
            ? "Select runs to compare qualification gate results."
            : "No qualification gates logged for the selected runs."}
        </div>
      </div>
    );
  }

  const thStyle: React.CSSProperties = {
    padding: HEADER_PADDING,
    textAlign: "left",
    fontSize: "0.78rem",
    fontWeight: 600,
    color: "rgba(15,52,85,0.72)",
    whiteSpace: "nowrap",
    minWidth: COL_MIN_WIDTH,
  };

  const sectionThStyle: React.CSSProperties = {
    padding: HEADER_PADDING,
    textAlign: "left",
    fontSize: "0.78rem",
    fontWeight: 600,
    color: "#0F3455",
    whiteSpace: "nowrap",
    minWidth: FIRST_COL_MIN_WIDTH,
    position: "sticky",
    left: 0,
    backgroundColor: TABLE_BG,
    zIndex: 2,
    boxShadow: "1px 0 0 rgba(15,52,85,0.08)",
  };

  let lastSection: string | null = null;

  return (
    <div>
      <div className="px-2 pb-2 pt-1">
        <div className="text-md font-semibold text-[#0F3455]">Qualification Gate Diff</div>
        <div className="mt-0.5 text-sm text-[rgba(15,52,85,0.62)]">
          Gate results across selected runs — each column is one run
        </div>
      </div>

      <ScrollArea className="w-full whitespace-nowrap">
        <table
          style={{
            width: "max-content",
            minWidth: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: HEADER_BG,
                borderBottom: "1px solid rgba(15,52,85,0.14)",
              }}
            >
              <th
                style={{
                  ...sectionThStyle,
                  fontWeight: 600,
                  borderTopLeftRadius: "0.5rem",
                }}
              >
                Gate
              </th>
              {runs.map((run, i) => (
                <th
                  key={run.id}
                  style={{
                    ...thStyle,
                    ...(i === runs.length - 1 ? { borderTopRightRadius: "0.5rem" } : {}),
                  }}
                >
                  <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#0F3455" }}>
                    {run.name || run.id.slice(0, 8)}
                  </div>
                  <div
                    style={{
                      fontSize: "0.68rem",
                      color: "rgba(15,52,85,0.42)",
                      marginTop: "0.1rem",
                      fontFamily: "monospace",
                    }}
                  >
                    {run.id.slice(0, 12)}…
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const sectionChanged = row.section !== lastSection;
              lastSection = row.section;

              return (
                <React.Fragment key={row.id}>
                  {sectionChanged && (
                    <tr>
                      <td
                        colSpan={1 + runs.length}
                        style={{
                          padding: "0.35rem 1rem",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "rgba(15,52,85,0.46)",
                          backgroundColor: "rgba(15,52,85,0.025)",
                          borderBottom: "1px solid rgba(15,52,85,0.07)",
                        }}
                      >
                        {SECTION_LABEL[row.section]}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td
                      style={{
                        padding: CELL_PADDING,
                        fontSize: "0.8rem",
                        color: "#0F3455",
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                        borderBottom: "1px solid rgba(15,52,85,0.07)",
                        position: "sticky",
                        left: 0,
                        backgroundColor: TABLE_BG,
                        zIndex: 1,
                        boxShadow: "1px 0 0 rgba(15,52,85,0.08)",
                        minWidth: FIRST_COL_MIN_WIDTH,
                      }}
                    >
                      {row.label}
                    </td>
                    {row.cells.map((cell) => (
                      <PassCell key={cell.runId} cell={cell} />
                    ))}
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
