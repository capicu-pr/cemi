// src/components/cemi/runs/VerifiedColumnHelp.tsx

import React from "react";
import { HelpBubble } from "./HelpBubble";

const VERIFIED_COLUMN_HELP_TEXT =
  "Each gate compares recorded metrics to thresholds (accuracy, latency, and so on). " +
  "✓ PASS means every gate passed; ✗ FAIL means at least one failed; a blank cell means no contract result was logged yet. " +
  "Open the run for full context — qualification verdict, parameters, and metrics.";

/** Same hover/focus tooltip behavior as section help on the individual run page. */
export function VerifiedColumnHelp() {
  return <HelpBubble text={VERIFIED_COLUMN_HELP_TEXT} />;
}
