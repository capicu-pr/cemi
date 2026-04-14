// src/components/cemi/runs/tabs/DistributionsTab.tsx

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { ChartContainer } from "../../../ui/chart-container";
import type { RunRecord } from "../../../../types/domain";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DistributionsTabProps {
  run: RunRecord;
}

export function DistributionsTab({ run }: DistributionsTabProps) {
  // Real distribution data would come from run.artifacts or run.summary_metrics
  // No mock data - show empty state until real distribution API exists
  const hasDistributionData = false;

  if (!hasDistributionData) {
    return (
      <Card>
        <CardContent style={{ padding: "2rem", textAlign: "center", color: "rgba(15, 52, 85, 0.7)" }}>
          No distribution data available for this run.
          <br />
          Distribution data is logged during quantization-aware training or profiling.
        </CardContent>
      </Card>
    );
  }

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <ChartContainer title="Weight Histogram">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={[]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="bin" />
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
            <Bar dataKey="count" fill="#0F3455" name="Count" />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
