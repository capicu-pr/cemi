import React from "react";
import { ScrollArea, ScrollBar } from "../../components/ui/scroll-area";
import type { RunRecord, EQCAssignment, PlatformFingerprint } from "../../types/domain";

interface PlatformMatrixProps {
  runs: RunRecord[];
}

interface MatrixRow {
  run: RunRecord;
  runtime: string;
  hardware: string;
  eqcId: string;
  deltaNorm: number | null;
  tolerance: number | null;
  withinTolerance: boolean | null;
  qualified: boolean | null;
}

const CELL_PADDING = "0.5rem 1rem";
const HEADER_PADDING = "0.6rem 1rem";
const FIRST_COL_MIN_WIDTH = "220px";
const COL_MIN_WIDTH = "140px";
const TABLE_BG = "var(--cemi-surface-bg, #F9F5EA)";
const HEADER_BG = "rgba(15, 52, 85, 0.05)";

function resolveFingerprint(run: RunRecord): PlatformFingerprint | null {
  return (run as any).platform_fingerprint ?? null;
}

function resolveEQC(run: RunRecord): EQCAssignment | null {
  return (run as any).eqc_assignment ?? null;
}

function resolveAccuracyGatePass(run: RunRecord): boolean | null {
  const gate = (run as any).accuracy_gate;
  if (!gate || typeof gate.pass !== "boolean") return null;
  return gate.pass;
}

function resolveContractPass(run: RunRecord): boolean | null {
  const cr = (run as any).contract_result;
  if (!cr || typeof cr.pass !== "boolean") return null;
  return cr.pass;
}

function buildRows(runs: RunRecord[]): MatrixRow[] {
  return runs.map((run) => {
    const fp = resolveFingerprint(run);
    const eqc = resolveEQC(run);
    const accuracyPass = resolveAccuracyGatePass(run);
    const contractPass = resolveContractPass(run);

    const deltaOk = eqc?.delta_within_tolerance ?? null;
    const allGatesPass =
      deltaOk === null && accuracyPass === null && contractPass === null
        ? null
        : [deltaOk, accuracyPass, contractPass]
            .filter((v): v is boolean => v !== null)
            .every(Boolean);

    return {
      run,
      runtime: fp?.runtime ?? eqc?.reference_runtime ?? (run as any).context?.device?.runtime ?? "—",
      hardware:
        fp?.hardware_backend ??
        eqc?.reference_hardware ??
        (run as any).context?.device?.board ??
        "—",
      eqcId: eqc?.eqc_id ?? "—",
      deltaNorm: typeof eqc?.output_delta_norm === "number" ? eqc.output_delta_norm : null,
      tolerance: typeof eqc?.tolerance === "number" ? eqc.tolerance : null,
      withinTolerance: deltaOk,
      qualified: allGatesPass,
    };
  });
}

function QualifiedBadge({ value }: { value: boolean | null }) {
  if (value === null) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          borderRadius: "9999px",
          padding: "0.2rem 0.65rem",
          fontSize: "0.72rem",
          fontWeight: 600,
          backgroundColor: "rgba(15,52,85,0.07)",
          color: "rgba(15,52,85,0.54)",
        }}
      >
        —
      </span>
    );
  }
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.3rem",
        borderRadius: "9999px",
        padding: "0.2rem 0.65rem",
        fontSize: "0.72rem",
        fontWeight: 600,
        backgroundColor: value ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.10)",
        color: value ? "#166534" : "#991B1B",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: value ? "#22C55E" : "#EF4444",
          flexShrink: 0,
        }}
      />
      {value ? "QUALIFIED" : "NOT QUALIFIED"}
    </span>
  );
}

function ToleranceBadge({ withinTolerance }: { withinTolerance: boolean | null }) {
  if (withinTolerance === null) return <span style={{ color: "rgba(15,52,85,0.38)" }}>—</span>;
  return (
    <span
      style={{
        display: "inline-flex",
        borderRadius: "9999px",
        padding: "0.15rem 0.55rem",
        fontSize: "0.7rem",
        fontWeight: 600,
        backgroundColor: withinTolerance ? "rgba(34,197,94,0.10)" : "rgba(239,68,68,0.09)",
        color: withinTolerance ? "#166534" : "#991B1B",
      }}
    >
      {withinTolerance ? "within" : "exceed"}
    </span>
  );
}

export function PlatformMatrix({ runs }: PlatformMatrixProps) {
  const rows = buildRows(runs);

  if (rows.length === 0) {
    return (
      <div>
        <div className="px-2 pb-2 pt-1">
          <div className="text-md font-semibold text-[#0F3455]">Platform Matrix</div>
          <div className="mt-0.5 text-sm text-[rgba(15,52,85,0.62)]">
            Runtime × hardware qualification status for each run
          </div>
        </div>
        <div
          className="flex items-center justify-center rounded-lg py-8 text-sm"
          style={{ color: "rgba(15,52,85,0.44)", border: "1px dashed rgba(15,52,85,0.16)" }}
        >
          Select runs to compare their platform qualification status.
        </div>
      </div>
    );
  }

  const qualifiedCount = rows.filter((r) => r.qualified === true).length;
  const totalWithData = rows.filter((r) => r.qualified !== null).length;

  const thStyle: React.CSSProperties = {
    padding: HEADER_PADDING,
    textAlign: "left",
    fontSize: "0.78rem",
    fontWeight: 600,
    color: "rgba(15,52,85,0.72)",
    whiteSpace: "nowrap",
    minWidth: COL_MIN_WIDTH,
  };

  const tdStyle: React.CSSProperties = {
    padding: CELL_PADDING,
    fontSize: "0.8rem",
    color: "#0F3455",
    whiteSpace: "nowrap",
    borderBottom: "1px solid rgba(15,52,85,0.07)",
  };

  return (
    <div>
      <div className="flex items-center justify-between px-2 pb-2 pt-1">
        <div>
          <div className="text-md font-semibold text-[#0F3455]">Platform Matrix</div>
          <div className="mt-0.5 text-sm text-[rgba(15,52,85,0.62)]">
            Runtime × hardware qualification status for each run
          </div>
        </div>
        {totalWithData > 0 && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              borderRadius: "9999px",
              padding: "0.25rem 0.8rem",
              fontSize: "0.75rem",
              fontWeight: 700,
              backgroundColor:
                qualifiedCount === totalWithData
                  ? "rgba(34,197,94,0.13)"
                  : qualifiedCount === 0
                  ? "rgba(239,68,68,0.10)"
                  : "rgba(245,158,11,0.12)",
              color:
                qualifiedCount === totalWithData
                  ? "#166534"
                  : qualifiedCount === 0
                  ? "#991B1B"
                  : "#78350F",
            }}
          >
            {qualifiedCount} / {totalWithData} qualified
          </span>
        )}
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
                  ...thStyle,
                  position: "sticky",
                  left: 0,
                  zIndex: 3,
                  backgroundColor: TABLE_BG,
                  minWidth: FIRST_COL_MIN_WIDTH,
                  boxShadow: "1px 0 0 rgba(15,52,85,0.08)",
                  borderTopLeftRadius: "0.5rem",
                }}
              >
                Run
              </th>
              <th style={thStyle}>Runtime</th>
              <th style={thStyle}>Hardware</th>
              <th style={thStyle}>EQC</th>
              <th style={thStyle}>δ norm</th>
              <th style={thStyle}>Tolerance</th>
              <th style={thStyle}>EQC Status</th>
              <th style={{ ...thStyle, borderTopRightRadius: "0.5rem" }}>Qualification</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.run.id}
                style={{
                  backgroundColor: index % 2 === 0 ? "transparent" : "rgba(15,52,85,0.018)",
                }}
              >
                <td
                  style={{
                    ...tdStyle,
                    position: "sticky",
                    left: 0,
                    zIndex: 2,
                    backgroundColor: index % 2 === 0 ? TABLE_BG : "rgba(248,246,241,1)",
                    minWidth: FIRST_COL_MIN_WIDTH,
                    boxShadow: "1px 0 0 rgba(15,52,85,0.08)",
                    fontWeight: 600,
                  }}
                >
                  <div style={{ fontSize: "0.82rem", color: "#0F3455" }}>
                    {row.run.name || row.run.id.slice(0, 8)}
                  </div>
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "rgba(15,52,85,0.44)",
                      marginTop: "0.1rem",
                    }}
                  >
                    {row.run.id}
                  </div>
                </td>
                <td style={tdStyle}>{row.runtime}</td>
                <td style={tdStyle}>{row.hardware}</td>
                <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: "0.78rem" }}>
                  {row.eqcId}
                </td>
                <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: "0.78rem" }}>
                  {row.deltaNorm !== null ? row.deltaNorm.toFixed(4) : "—"}
                  {row.tolerance !== null ? (
                    <span style={{ color: "rgba(15,52,85,0.42)", marginLeft: "0.4rem" }}>
                      / {row.tolerance.toFixed(4)}
                    </span>
                  ) : null}
                </td>
                <td style={tdStyle}>
                  {row.tolerance !== null ? (
                    <span style={{ fontFamily: "monospace", fontSize: "0.78rem" }}>
                      ≤ {row.tolerance.toFixed(4)}
                    </span>
                  ) : (
                    <span style={{ color: "rgba(15,52,85,0.38)" }}>—</span>
                  )}
                </td>
                <td style={tdStyle}>
                  <ToleranceBadge withinTolerance={row.withinTolerance} />
                </td>
                <td style={tdStyle}>
                  <QualifiedBadge value={row.qualified} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
