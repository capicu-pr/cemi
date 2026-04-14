// src/components/cemi/runs/ContractBadge.tsx

import { Badge } from "../../ui/badge";
import type { ContractResult } from "../../../types/domain";

interface ContractBadgeProps {
  result: ContractResult | undefined | null;
  /** sm = table row (default), md = panel header */
  size?: "sm" | "md";
}

export function ContractBadge({ result, size = "sm" }: ContractBadgeProps) {
  if (!result) return null;

  const passed = result.pass === true;
  const sizeClass = size === "md" ? "text-xs px-2 py-0.5 h-6" : "text-xs px-1.5 py-0 h-5";

  return passed ? (
    <Badge
      variant="outline"
      className={`${sizeClass} bg-green-100 text-green-800 border-green-200 font-medium`}
    >
      ✓ PASS
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className={`${sizeClass} bg-red-100 text-red-800 border-red-200 font-medium`}
    >
      ✗ FAIL
    </Badge>
  );
}
