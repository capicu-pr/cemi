// src/components/cemi/runs/ContractResultPanel.tsx

import { motion } from "framer-motion";
import { ContractBadge } from "./ContractBadge";
import { animationPresets } from "../../ui/animated-interactive";
import type { ContractGateResult, ContractResult } from "../../../types/domain";

interface ContractResultPanelProps {
  result: ContractResult;
}

function formatValue(v: number | null | undefined): string {
  if (v === null || v === undefined) return "—";
  return Number.isInteger(v) ? String(v) : v.toFixed(4);
}

function GateRow({ gate }: { gate: ContractGateResult }) {
  const passed = gate.pass === true;
  return (
    <tr className="border-b border-[rgba(15,52,85,0.06)] last:border-0">
      <td className="py-2 px-3 text-sm font-mono text-[#0F3455]">{gate.id}</td>
      <td className="py-2 px-3 text-xs text-[rgba(15,52,85,0.65)]">{gate.role}</td>
      <td className="py-2 px-3 text-sm text-[rgba(15,52,85,0.8)]">
        {gate.metric?.name ?? "—"}
      </td>
      <td className="py-2 px-3 text-sm text-right font-mono text-[#0F3455]">
        {formatValue(gate.run_value)}
      </td>
      <td className="py-2 px-3 text-xs text-center w-[40px]">
        {passed ? (
          <span className="text-green-700 font-semibold">✓</span>
        ) : (
          <span className="text-red-700 font-semibold">✗</span>
        )}
      </td>
      <td className="py-2 px-3 text-xs text-[rgba(15,52,85,0.5)] max-w-[220px] truncate">
        {!passed && gate.explain ? gate.explain : ""}
      </td>
    </tr>
  );
}

export function ContractResultPanel({ result }: ContractResultPanelProps) {
  const gates = result.gate_results ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={animationPresets.spring}
      className="mt-3 rounded-lg border border-[rgba(15,52,85,0.1)] bg-white shadow-sm overflow-hidden"
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[rgba(15,52,85,0.08)] bg-[rgba(15,52,85,0.02)]">
        <span className="text-sm font-semibold text-[#0F3455]">
          Contract Verification
        </span>
        <ContractBadge result={result} size="md" />
      </div>

      {/* Gate table */}
      {gates.length === 0 ? (
        <div className="px-4 py-4 text-sm text-[rgba(15,52,85,0.5)]">
          No gate results recorded.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[rgba(15,52,85,0.08)]">
                {["Gate", "Role", "Metric", "Value", "", "Detail"].map((h) => (
                  <th
                    key={h}
                    className="py-2 px-3 text-[10px] font-semibold uppercase tracking-wide text-[rgba(15,52,85,0.5)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gates.map((g) => (
                <GateRow key={g.id} gate={g} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-2 border-t border-[rgba(15,52,85,0.06)] bg-[rgba(15,52,85,0.01)]">
        <span className="text-[10px] text-[rgba(15,52,85,0.4)]">
          Evaluated by{" "}
          <code className="font-mono">cemi verify</code> ·{" "}
          <code className="font-mono">run.contract_result</code>
        </span>
      </div>
    </motion.div>
  );
}
