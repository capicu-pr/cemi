// src/components/ui/widget/renderers/ScatterRenderer.tsx

import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { ScatterWidgetConfig, WidgetContext } from "../types";

export interface ScatterDataPoint {
  x: number;
  y: number;
  runId: string;
  name?: string;
  category?: string;
}

export interface ScatterRendererProps {
  data: ScatterDataPoint[];
  config: ScatterWidgetConfig;
  context: WidgetContext;
  height?: number | string;
  showLegend?: boolean;
}

function formatMetricValue(metricName: string, value: number): string {
  const normalized = metricName.toLowerCase();
  if (
    normalized.includes("accuracy") ||
    normalized.includes("f1") ||
    normalized.includes("precision") ||
    normalized.includes("recall")
  ) {
    return `${(value * 100).toFixed(1)}%`;
  }
  if (normalized.includes("latency")) {
    return `${value.toFixed(2)} ms`;
  }
  return Number.isInteger(value) ? String(value) : value.toFixed(3);
}

export function ScatterRenderer({
  data,
  config,
  context: _context,
  height = 300,
  showLegend = true,
}: ScatterRendererProps) {
  if (!data || data.length === 0) {
    return null;
  }

  const colors = [
    "#0F3455",
    "#D82A2D",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
  ];

  const groupedData =
    config.colorBy === "category"
      ? data.reduce(
          (acc, point) => {
            const key = point.category || "default";
            if (!acc[key]) acc[key] = [];
            acc[key].push(point);
            return acc;
          },
          {} as Record<string, ScatterDataPoint[]>
        )
      : data.reduce(
          (acc, point) => {
            if (!acc[point.runId]) acc[point.runId] = [];
            acc[point.runId].push(point);
            return acc;
          },
          {} as Record<string, ScatterDataPoint[]>
        );

  const renderTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload?: ScatterDataPoint }>;
  }) => {
    const point = payload?.[0]?.payload;
    if (!active || !point) return null;

    return (
      <div
        style={{
          backgroundColor: "var(--cemi-hovercard-bg, #0F3455)",
          border: "none",
          borderRadius: "8px",
          padding: "10px 12px",
          boxShadow: "0 10px 24px rgba(15, 52, 85, 0.18)",
        }}
      >
        <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--cemi-hovercard-fg, #F9F5EA)" }}>
          {point.name || point.runId}
        </div>
        <div style={{ marginTop: "0.35rem", fontSize: "0.76rem", color: "var(--cemi-hovercard-fg, #F9F5EA)", opacity: 0.92 }}>
          {config.xMetric}: {formatMetricValue(config.xMetric, point.x)}
        </div>
        <div style={{ fontSize: "0.76rem", color: "var(--cemi-hovercard-fg, #F9F5EA)", opacity: 0.92 }}>
          {config.yMetric}: {formatMetricValue(config.yMetric, point.y)}
        </div>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(15, 52, 85, 0.1)" />
        <XAxis
          type="number"
          dataKey="x"
          name={config.xMetric}
          stroke="rgba(15, 52, 85, 0.7)"
          style={{ fontSize: "12px" }}
          tickFormatter={(value) => formatMetricValue(config.xMetric, Number(value))}
        />
        <YAxis
          type="number"
          dataKey="y"
          name={config.yMetric}
          stroke="rgba(15, 52, 85, 0.7)"
          style={{ fontSize: "12px" }}
          tickFormatter={(value) => formatMetricValue(config.yMetric, Number(value))}
        />
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          content={renderTooltip}
        />
        {showLegend ? <Legend /> : null}
        {Object.entries(groupedData).map(([key, points], idx) => {
          const color = colors[idx % colors.length];
          const seriesName = points[0]?.name || key;
          return (
            <Scatter
              key={key}
              name={seriesName}
              data={points}
              fill={color}
            >
              {points.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={color} />
              ))}
            </Scatter>
          );
        })}
      </ScatterChart>
    </ResponsiveContainer>
  );
}
