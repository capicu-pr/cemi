import type { RunRecord } from "../types/domain";

export interface ExperimentOption {
  id: string;
  label: string;
  runCount: number;
}

export function getExperimentName(run: RunRecord): string {
  const rawTags = run.tags;
  let experimentValue: string | undefined;
  if (rawTags && typeof rawTags === "object" && !Array.isArray(rawTags)) {
    const v = (rawTags as Record<string, unknown>)["experiment"];
    if (typeof v === "string" && v.trim()) experimentValue = v.trim();
  } else if (Array.isArray(rawTags)) {
    experimentValue = rawTags.find((tag: any) => tag.key === "experiment")?.value?.trim();
  }
  if (experimentValue) return experimentValue;

  const nameParts = run.name?.split("/");
  if (nameParts && nameParts.length > 1 && nameParts[0]?.trim()) {
    return nameParts[0].trim();
  }

  return "Default";
}

export function getExperimentOptions(runs: RunRecord[]): ExperimentOption[] {
  const counts = new Map<string, number>();

  for (const run of runs) {
    const experiment = getExperimentName(run);
    counts.set(experiment, (counts.get(experiment) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([id, runCount]) => ({
      id,
      label: id,
      runCount,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
