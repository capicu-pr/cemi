// src/components/cemi/runs/QualificationPanel.tsx

import { motion } from "framer-motion";
import { animationPresets } from "../../ui/animated-interactive";
import type {
  AccuracyGate,
  EQCAssignment,
  PlatformFingerprint,
} from "../../../types/domain";

interface QualificationPanelProps {
  fingerprint?: PlatformFingerprint | null;
  eqc?: EQCAssignment | null;
  gate?: AccuracyGate | null;
}

function fmt(v: number | null | undefined, precision = 6): string {
  if (v === null || v === undefined) return "—";
  return Number.isInteger(v) ? String(v) : v.toPrecision(precision).replace(/\.?0+$/, "");
}

function PassBadge({ pass }: { pass: boolean }) {
  return pass ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-50 text-green-800 border border-green-200">
      <span>✓</span> PASS
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-800 border border-red-200">
      <span>✗</span> FAIL
    </span>
  );
}

function OverallBadge({ qualified }: { qualified: boolean }) {
  return qualified ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
      ✓ QUALIFIED
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
      ✗ NOT QUALIFIED
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-1.5 bg-[rgba(15,52,85,0.03)] border-b border-[rgba(15,52,85,0.06)]">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-[rgba(15,52,85,0.45)]">
        {children}
      </span>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <tr className="border-b border-[rgba(15,52,85,0.05)] last:border-0">
      <td className="py-2 px-4 text-xs text-[rgba(15,52,85,0.55)] w-[160px] whitespace-nowrap">
        {label}
      </td>
      <td className="py-2 px-4 text-sm text-[#0F3455]">{value}</td>
    </tr>
  );
}

export function QualificationPanel({
  fingerprint,
  eqc,
  gate,
}: QualificationPanelProps) {
  const checks: boolean[] = [];
  if (eqc) checks.push(eqc.delta_within_tolerance);
  if (gate) checks.push(gate.pass);
  const qualified = checks.length > 0 && checks.every(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={animationPresets.spring}
      className="mt-3 rounded-lg border border-[rgba(15,52,85,0.1)] bg-white shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[rgba(15,52,85,0.08)] bg-[rgba(15,52,85,0.02)]">
        <span className="text-sm font-semibold text-[#0F3455]">
          Static Qualification
        </span>
        <OverallBadge qualified={qualified} />
      </div>

      {/* Platform Fingerprint */}
      {fingerprint && (
        <>
          <SectionLabel>Platform</SectionLabel>
          <table className="w-full border-collapse">
            <tbody>
              <Row label="Runtime" value={<code className="font-mono text-xs">{fingerprint.runtime}</code>} />
              <Row label="Hardware backend" value={<code className="font-mono text-xs">{fingerprint.hardware_backend}</code>} />
              <Row
                label="SIMD flags"
                value={
                  fingerprint.simd_flags?.length
                    ? fingerprint.simd_flags.map((f) => (
                        <code key={f} className="font-mono text-xs mr-1.5">{f}</code>
                      ))
                    : <span className="text-[rgba(15,52,85,0.4)] text-xs">—</span>
                }
              />
              <Row
                label="Framework version"
                value={
                  fingerprint.framework_version
                    ? <code className="font-mono text-xs">{fingerprint.framework_version}</code>
                    : <span className="text-[rgba(15,52,85,0.4)] text-xs">—</span>
                }
              />
            </tbody>
          </table>
        </>
      )}

      {/* EQC Assignment */}
      {eqc && (
        <>
          <SectionLabel>Behavioral Equivalence</SectionLabel>
          <table className="w-full border-collapse">
            <tbody>
              <Row label="EQC id" value={<code className="font-mono text-xs">{eqc.eqc_id}</code>} />
              <Row label="Reference runtime" value={<code className="font-mono text-xs">{eqc.reference_runtime}</code>} />
              <Row label="Reference hardware" value={<code className="font-mono text-xs">{eqc.reference_hardware}</code>} />
              <Row
                label="Output δ norm"
                value={
                  <span className="font-mono text-xs">
                    {fmt(eqc.output_delta_norm)}
                    {eqc.tolerance != null && (
                      <span className="text-[rgba(15,52,85,0.45)] ml-1.5">
                        / tol {fmt(eqc.tolerance)}
                      </span>
                    )}
                  </span>
                }
              />
              <Row label="Within tolerance" value={<PassBadge pass={eqc.delta_within_tolerance} />} />
            </tbody>
          </table>
        </>
      )}

      {/* Accuracy Gate */}
      {gate && (
        <>
          <SectionLabel>Accuracy Gate</SectionLabel>
          <table className="w-full border-collapse">
            <tbody>
              <Row label="Metric" value={<code className="font-mono text-xs">{gate.metric_name}</code>} />
              <Row
                label="Value"
                value={
                  <span className="font-mono text-xs">
                    {fmt(gate.metric_value)}
                    <span className="text-[rgba(15,52,85,0.45)] ml-1.5">
                      {gate.direction === "higher_is_better" ? "≥" : "≤"} {fmt(gate.threshold)}
                    </span>
                  </span>
                }
              />
              <Row label="Result" value={<PassBadge pass={gate.pass} />} />
            </tbody>
          </table>
        </>
      )}

      {/* Footer */}
      <div className="px-4 py-2 border-t border-[rgba(15,52,85,0.06)] bg-[rgba(15,52,85,0.01)]">
        <span className="text-[10px] text-[rgba(15,52,85,0.4)]">
          StaticQualify (Algorithm 1) ·{" "}
          <code className="font-mono">cemi qualify</code> ·{" "}
          <code className="font-mono">run.platform_fingerprint / eqc_assignment / accuracy_gate</code>
        </span>
      </div>
    </motion.div>
  );
}
