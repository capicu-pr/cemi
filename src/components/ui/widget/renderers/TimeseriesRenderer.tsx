// src/components/ui/widget/renderers/TimeseriesRenderer.tsx

import React from "react";
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
import type { TimeseriesWidgetConfig, WidgetContext } from "../types";

export interface TimeseriesDataPoint {
  step: number;
  timestamp?: string;
  [runId: string]: number | string | undefined;
}

export interface TimeseriesRendererProps {
  data: TimeseriesDataPoint[];
  config: TimeseriesWidgetConfig;
  context: WidgetContext;
}

export function TimeseriesRenderer({
  data,
  config,
  context,
}: TimeseriesRendererProps) {
  if (!data || data.length === 0) {
    return null;
  }

  const showDots = data.length < 2;

  const colors = [
    "#0F3455",
    "#D82A2D",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(15, 52, 85, 0.1)" />
        <XAxis
          dataKey="step"
          stroke="rgba(15, 52, 85, 0.7)"
          style={{ fontSize: "12px" }}
        />
        <YAxis stroke="rgba(15, 52, 85, 0.7)" style={{ fontSize: "12px" }} />
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
        {context.selectedRunIds.map((runId, idx) => {
          const color = colors[idx % colors.length];
          return (
            <Line
              key={runId}
              type="linear"
              dataKey={runId}
              stroke={color}
              strokeWidth={2}
              dot={showDots}
              name={`Run ${runId.slice(0, 8)}`}
            />
          );
        })}
        {config.showBaseline && context.selectedRunIds.length > 0 && (
          <Line
            type="linear"
            dataKey="baseline"
            stroke="#9ca3af"
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={showDots}
            name="Baseline"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
