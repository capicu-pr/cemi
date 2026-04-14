// src/components/cemi/runs/tabs/MetricsTab.tsx

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Checkbox } from "../../../ui/checkbox";
import { ChartContainer } from "../../../ui/chart-container";
import { Download } from "lucide-react";
import type { RunRecord } from "../../../../types/domain";
import { isEpochAxisMetric } from "../../../../utils/runHelpers";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useMetricsStream } from "../../../../hooks/useMetricsStream";

interface MetricsTabProps {
  run: RunRecord;
  baselineRun?: RunRecord | null;
}

// Run record may include metrics from API
const getRunMetrics = (r: RunRecord): { step: number; value: number; name?: string }[] => {
  const m = (r as { metrics?: Array<{ step?: number; value: number; name?: string }> }).metrics;
  return Array.isArray(m) ? m.map((p) => ({ step: p.step ?? 0, value: p.value, name: p.name })) : [];
};

export function MetricsTab({ run, baselineRun }: MetricsTabProps) {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [showBaseline, setShowBaseline] = useState(false);
  const initialMetrics = useMemo(() => getRunMetrics(run), [run]);
  const { points } = useMetricsStream(run.id, initialMetrics, { enabled: true });

  const chartDataByMetric = useMemo(() => {
    const currentByName: Record<string, { step: number; value: number }[]> = {};
    for (const p of points) {
      const name = p.name || "value";
      if (!currentByName[name]) currentByName[name] = [];
      currentByName[name].push({ step: p.step, value: p.value });
    }
    for (const k of Object.keys(currentByName)) {
      currentByName[k] = currentByName[k].sort((a, b) => a.step - b.step);
    }

    const baselineRaw = baselineRun ? getRunMetrics(baselineRun) : [];
    const baselineByName: Record<string, { step: number; value: number }[]> = {};
    for (const p of baselineRaw) {
      const name = p.name || "value";
      if (!baselineByName[name]) baselineByName[name] = [];
      baselineByName[name].push({ step: p.step, value: p.value });
    }
    for (const k of Object.keys(baselineByName)) {
      baselineByName[k] = baselineByName[k].sort((a, b) => a.step - b.step);
    }

    const buildSeries = (metric: string) => {
      const cur = currentByName[metric] || [];
      const base = baselineByName[metric] || [];
      const stepSet = new Set<number>();
      cur.forEach((p) => stepSet.add(p.step));
      base.forEach((p) => stepSet.add(p.step));
      const steps = Array.from(stepSet.values()).sort((a, b) => a - b);

      const curByStep = new Map(cur.map((p) => [p.step, p.value]));
      const baseByStep = new Map(base.map((p) => [p.step, p.value]));
      return steps.map((step) => ({
        step,
        [metric]: curByStep.get(step) ?? null,
        [`${metric}_baseline`]: baseByStep.get(step) ?? null,
      }));
    };

    return { currentByName, baselineByName, buildSeries };
  }, [points, baselineRun]);

  const availableMetrics = useMemo(() => {
    const names = new Set<string>();
    Object.keys(chartDataByMetric.currentByName).forEach((n) => names.add(n));
    Object.keys(chartDataByMetric.baselineByName).forEach((n) => names.add(n));
    return Array.from(names.values()).sort((a, b) => a.localeCompare(b));
  }, [chartDataByMetric]);

  // Choose defaults once metrics are available.
  React.useEffect(() => {
    if (selectedMetrics.length > 0) return;
    if (availableMetrics.length === 0) return;
    const lower = availableMetrics.map((m) => m.toLowerCase());
    const pick = (pred: (s: string) => boolean) => {
      const idx = lower.findIndex(pred);
      return idx >= 0 ? availableMetrics[idx] : null;
    };
    const first = pick((s) => s.includes("accuracy")) || pick((s) => s.includes("loss")) || availableMetrics[0];
    const second =
      availableMetrics.find((m) => m !== first && m.toLowerCase().includes("loss")) ||
      availableMetrics.find((m) => m !== first) ||
      null;
    setSelectedMetrics(second ? [first, second] : [first]);
  }, [availableMetrics, selectedMetrics.length]);

  const chartData = selectedMetrics.length > 0
    ? (() => {
        return chartDataByMetric.buildSeries(selectedMetrics[0]);
      })()
    : [];

  const handleExportCSV = () => {
    const headers = ["step", ...selectedMetrics];
    const rows = chartData.map((point) =>
      [point.step, ...selectedMetrics.map((m) => point[m] || "")].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `run-${run.id}-metrics.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Metric Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem", display: "block" }}>
                Select Metrics
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {availableMetrics.map((metric) => (
                  <div key={metric} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Checkbox
                      checked={selectedMetrics.includes(metric)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedMetrics([...selectedMetrics, metric]);
                        } else {
                          setSelectedMetrics(selectedMetrics.filter((m) => m !== metric));
                        }
                      }}
                    />
                    <span style={{ fontSize: "0.875rem" }}>{metric}</span>
                  </div>
                ))}
              </div>
            </div>
            {baselineRun && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Checkbox
                  checked={showBaseline}
                  onCheckedChange={(checked) => setShowBaseline(checked as boolean)}
                />
                <span style={{ fontSize: "0.875rem" }}>Show baseline overlay</span>
              </div>
            )}
            <div>
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      {selectedMetrics.length > 0 ? (
        selectedMetrics.map((metric) => (
          <ChartContainer key={metric} title={metric.charAt(0).toUpperCase() + metric.slice(1)}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartDataByMetric.buildSeries(metric)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="step" label={{ value: isEpochAxisMetric(metric) ? "Epoch" : "Step" }} />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--cemi-hovercard-bg, #0F3455)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    borderRadius: "10px",
                    boxShadow: "0 10px 28px rgba(15,52,85,0.22)",
                  }}
                  labelStyle={{ color: "var(--cemi-hovercard-fg, #F9F5EA)", fontWeight: 600 }}
                  itemStyle={{ color: "var(--cemi-hovercard-fg, #F9F5EA)" }}
                />
                <Legend />
                <Line
                  type="linear"
                  dataKey={metric}
                  stroke="#0F3455"
                  name={metric}
                  dot={chartDataByMetric.currentByName[metric]?.length < 2}
                />
                {showBaseline && baselineRun && (
                  <Line
                    type="linear"
                    dataKey={`${metric}_baseline`}
                    stroke="#D82A2D"
                    strokeDasharray="5 5"
                    name={`${metric} (baseline)`}
                    dot={chartDataByMetric.baselineByName[metric]?.length < 2}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        ))
      ) : (
        <Card>
          <CardContent style={{ padding: "2rem", textAlign: "center", color: "rgba(15, 52, 85, 0.7)" }}>
            Select at least one metric to display
          </CardContent>
        </Card>
      )}
    </div>
  );
}
