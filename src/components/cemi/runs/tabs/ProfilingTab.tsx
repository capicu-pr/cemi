// src/components/cemi/runs/tabs/ProfilingTab.tsx

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../ui/table";
import { ChartContainer } from "../../../ui/chart-container";
import type { RunRecord } from "../../../../types/domain";

function getRunField(run: RunRecord, fieldPath: string): string | number | boolean | null | undefined {
  const param = run.params?.find((p) => p.key === fieldPath);
  if (param) return param.value;
  const tag = run.tags?.find((t) => t.key === fieldPath);
  if (tag) return tag.value;
  return null;
}
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

interface ProfilingTabProps {
  run: RunRecord;
}

export function ProfilingTab({ run }: ProfilingTabProps) {
  const warmupCount = (getRunField(run, "warmup_count") as number) || 10;
  const iterations = (getRunField(run, "iterations") as number) || 100;
  const threads = (getRunField(run, "threads") as number) || 4;
  const batchSize = (getRunField(run, "inference_batch_size") as number) || 1;

  const sm = (run.summary_metrics || {}) as Record<string, unknown>;
  const num = (k: string) =>
    typeof sm[k] === "number" && Number.isFinite(sm[k] as number) ? (sm[k] as number) : null;

  // Latency percentiles from summary_metrics when available
  const latencyPercentiles = [
    ...(num("latency_p50_ms") != null ? [{ percentile: "p50", latency_ms: num("latency_p50_ms")! }] : []),
    ...(num("latency_p90_ms") != null ? [{ percentile: "p90", latency_ms: num("latency_p90_ms")! }] : []),
    ...(num("latency_p95_ms") != null ? [{ percentile: "p95", latency_ms: num("latency_p95_ms")! }] : []),
    ...(num("latency_p99_ms") != null ? [{ percentile: "p99", latency_ms: num("latency_p99_ms")! }] : []),
  ];

  // Operator hotspots would come from profiling trace - no mock data
  const operatorHotspots: { operator: string; time_ms: number; percentage: number }[] = [];

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      {/* Benchmark Protocol */}
      <Card>
        <CardHeader>
          <CardTitle>Benchmark Protocol</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
            <div>
              <div style={{ fontSize: "0.875rem", color: "rgba(15, 52, 85, 0.7)", marginBottom: "0.25rem" }}>
                Warmup Iterations
              </div>
              <div style={{ fontSize: "1rem", fontWeight: 500 }}>{warmupCount}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.875rem", color: "rgba(15, 52, 85, 0.7)", marginBottom: "0.25rem" }}>
                Benchmark Iterations
              </div>
              <div style={{ fontSize: "1rem", fontWeight: 500 }}>{iterations}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.875rem", color: "rgba(15, 52, 85, 0.7)", marginBottom: "0.25rem" }}>
                Threads
              </div>
              <div style={{ fontSize: "1rem", fontWeight: 500 }}>{threads}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.875rem", color: "rgba(15, 52, 85, 0.7)", marginBottom: "0.25rem" }}>
                Batch Size
              </div>
              <div style={{ fontSize: "1rem", fontWeight: 500 }}>{batchSize}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Latency percentiles - only when summary_metrics has latency data */}
      {latencyPercentiles.length > 0 ? (
        <ChartContainer title="Latency percentiles (p50/p90/p95/p99)">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={latencyPercentiles}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="percentile" />
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
                dataKey="latency_ms"
                stroke="#0F3455"
                strokeWidth={2}
                dot
                name="Latency (ms)"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      ) : (
        <Card>
          <CardContent style={{ padding: "2rem", textAlign: "center", color: "rgba(15, 52, 85, 0.7)" }}>
            No latency data. Log summary_metrics with latency_p50_ms / latency_p90_ms / latency_p95_ms / latency_p99_ms.
          </CardContent>
        </Card>
      )}

      {/* Operator Hotspots */}
      {operatorHotspots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Operator Hotspots</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Operator</TableHead>
                  <TableHead>Time (ms)</TableHead>
                  <TableHead>Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operatorHotspots.map((hotspot, idx) => (
                  <TableRow key={idx}>
                    <TableCell style={{ fontFamily: "monospace" }}>{hotspot.operator}</TableCell>
                    <TableCell>{hotspot.time_ms.toFixed(2)}</TableCell>
                    <TableCell>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div
                          style={{
                            width: "100px",
                            height: "8px",
                            backgroundColor: "rgba(15, 52, 85, 0.1)",
                            borderRadius: "4px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${hotspot.percentage}%`,
                              height: "100%",
                              backgroundColor: "#0F3455",
                            }}
                          />
                        </div>
                        <span style={{ fontSize: "0.875rem" }}>{hotspot.percentage}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
