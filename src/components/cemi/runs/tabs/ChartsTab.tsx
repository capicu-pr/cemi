// src/components/cemi/runs/tabs/ChartsTab.tsx

import React, { useState, useMemo } from "react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Badge } from "../../../ui/badge";
import { SegmentedToggle } from "../../../ui/segmented-toggle";
import { CollapsibleSection } from "./CollapsibleSection";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../ui/dropdown-menu";
import {
  Search,
  LayoutGrid,
  Rows,
  Maximize2,
  MoreVertical,
  Download,
  Copy,
  Settings,
  X,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { RunRecord } from "../../../../types/domain";
import { isEpochAxisMetric } from "../../../../utils/runHelpers";

interface ChartsTabProps {
  run: RunRecord;
  baselineRun?: RunRecord | null;
}

interface MetricData {
  id: string;
  name: string;
  category: string;
  data: { step: number; value: number }[];
}

function inferCategory(name: string): string {
  if (name.includes("loss")) return "Loss Metrics";
  if (name.includes("accuracy") || name.includes("f1")) return "Accuracy Metrics";
  if (name.includes("lr") || name.includes("learning")) return "Learning Rate";
  if (name.includes("latency")) return "Inference Metrics";
  if (name.includes("gpu") || name.includes("memory") || name.includes("throughput") || name.includes("cpu")) return "System Metrics";
  if (name.includes("quant") || name.includes("sparsity") || name.includes("model_size")) return "Compression Metrics";
  return "Other";
}

/** Build MetricData[] from real run.metrics */
function runMetricsToChartsData(run: RunRecord): MetricData[] {
  const raw = (run as { metrics?: Array<{ name?: string; step?: number; value: number }> }).metrics;
  const arr = Array.isArray(raw) ? raw : [];
  const byName = new Map<string, { step: number; value: number }[]>();
  for (const p of arr) {
    const name = p.name || "value";
    if (!byName.has(name)) byName.set(name, []);
    byName.get(name)!.push({ step: p.step ?? 0, value: p.value });
  }
  return Array.from(byName.entries()).map(([name, data]) => ({
    id: `${run.id}-${name}`,
    name,
    category: inferCategory(name),
    data: data.sort((a, b) => a.step - b.step),
  }));
}

// Chart widget card component
function ChartWidget({
  metric,
  layout,
  onFullscreen,
}: {
  metric: MetricData;
  layout: "mosaic" | "row";
  onFullscreen: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`
        border border-[rgba(15,52,85,0.1)] rounded-lg overflow-hidden
        ${layout === "row" ? "col-span-full" : ""}
      `}
      style={{ backgroundColor: "var(--cemi-surface-bg, #F9F5EA)" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[rgba(15,52,85,0.08)]">
        <span className="text-sm font-medium text-[#0F3455] truncate">
          {metric.name}
        </span>

        <div
          className={`flex items-center gap-1 transition-opacity ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onFullscreen}
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="h-4 w-4 mr-2" />
                Copy Data
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <X className="h-4 w-4 mr-2" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Card body - chart */}
      <div className={layout === "row" ? "h-[300px]" : "h-[180px]"}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={metric.data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,52,85,0.1)" />
            <XAxis
              dataKey="step"
              tick={{ fontSize: 10, fill: "rgba(15,52,85,0.5)" }}
              axisLine={{ stroke: "rgba(15,52,85,0.2)" }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "rgba(15,52,85,0.5)" }}
              axisLine={{ stroke: "rgba(15,52,85,0.2)" }}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--cemi-hovercard-bg, #0F3455)",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: "8px",
                fontSize: "12px",
                boxShadow: "0 10px 28px rgba(15,52,85,0.22)",
              }}
              labelStyle={{ color: "var(--cemi-hovercard-fg, #F9F5EA)", fontWeight: 600 }}
              itemStyle={{ color: "var(--cemi-hovercard-fg, #F9F5EA)" }}
            />
            <Line
              type="linear"
              dataKey="value"
              stroke="#0F3455"
              strokeWidth={1.5}
              dot={metric.data.length < 2}
              activeDot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ChartsTab({ run, baselineRun }: ChartsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [layout, setLayout] = useState<"mosaic" | "row">("mosaic");
  const [fullscreenMetric, setFullscreenMetric] = useState<MetricData | null>(null);

  const metrics = useMemo(() => runMetricsToChartsData(run), [run]);

  // Filter metrics by search
  const filteredMetrics = useMemo(() => {
    if (!searchQuery.trim()) return metrics;

    const query = searchQuery.toLowerCase();
    // Support regex-like search
    try {
      const regex = new RegExp(query, "i");
      return metrics.filter((m) => regex.test(m.name) || regex.test(m.category));
    } catch {
      return metrics.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.category.toLowerCase().includes(query)
      );
    }
  }, [metrics, searchQuery]);

  // Group metrics by category
  const metricsByCategory = useMemo(() => {
    return filteredMetrics.reduce((acc, metric) => {
      if (!acc[metric.category]) {
        acc[metric.category] = [];
      }
      acc[metric.category].push(metric);
      return acc;
    }, {} as Record<string, MetricData[]>);
  }, [filteredMetrics]);

  const categoryOrder = [
    "Loss Metrics",
    "Accuracy Metrics",
    "Learning Rate",
    "System Metrics",
    "Compression Metrics",
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between py-3 px-2 border-b border-[rgba(15,52,85,0.1)]">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgba(15,52,85,0.5)]" />
            <Input
              placeholder="Filter charts (regex supported)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 w-[250px] text-sm"
            />
          </div>

          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="h-7 text-xs text-[rgba(15,52,85,0.6)]"
            >
              Clear
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Layout toggle */}
          <SegmentedToggle
            value={layout}
            onChange={setLayout}
            options={[
              { value: "mosaic", label: "Mosaic", icon: <LayoutGrid className="h-3 w-3" /> },
              { value: "row", label: "Row", icon: <Rows className="h-3 w-3" /> },
            ]}
            size="sm"
          />
        </div>
      </div>

      {/* Charts count */}
      <div className="py-2 px-2 text-sm text-[rgba(15,52,85,0.6)]">
        {metrics.length === 0
          ? "No metrics logged for this run. Log metrics during training to see charts."
          : `Showing ${filteredMetrics.length} of ${metrics.length} charts`}
      </div>

      {/* Charts content */}
      <div className="flex-1 overflow-auto px-2 pb-4">
        {filteredMetrics.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[rgba(15,52,85,0.6)]">
            <p className="text-base mb-1">
              {metrics.length === 0 ? "No metrics logged" : "No charts match your search"}
            </p>
            <p className="text-sm">
              {metrics.length === 0
                ? "Use writer.log_metric() during training to populate charts."
                : "Try adjusting your search query."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {categoryOrder.map((category) => {
              const categoryMetrics = metricsByCategory[category];
              if (!categoryMetrics || categoryMetrics.length === 0) return null;

              return (
                <CollapsibleSection
                  key={category}
                  title={category}
                  count={categoryMetrics.length}
                  defaultExpanded
                >
                  <div
                    className={
                      layout === "mosaic"
                        ? "grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3"
                        : "flex flex-col gap-3"
                    }
                  >
                    {categoryMetrics.map((metric) => (
                      <ChartWidget
                        key={metric.id}
                        metric={metric}
                        layout={layout}
                        onFullscreen={() => setFullscreenMetric(metric)}
                      />
                    ))}
                  </div>
                </CollapsibleSection>
              );
            })}
          </div>
        )}
      </div>

      {/* Fullscreen overlay */}
      {fullscreenMetric && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-8"
          onClick={() => setFullscreenMetric(null)}
        >
          <div
            className="rounded-lg shadow-xl w-full max-w-4xl"
            style={{ backgroundColor: "var(--cemi-surface-bg, #F9F5EA)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-medium text-[#0F3455]">
                {fullscreenMetric.name}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setFullscreenMetric(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Modal body */}
            <div className="h-[500px] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={fullscreenMetric.data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,52,85,0.1)" />
                  <XAxis
                    dataKey="step"
                    tick={{ fontSize: 12, fill: "rgba(15,52,85,0.7)" }}
                    label={{
                      value: fullscreenMetric ? (isEpochAxisMetric(fullscreenMetric.name) ? "Epoch" : "Step") : "Step",
                      position: "insideBottom",
                      offset: -10,
                      fontSize: 12,
                    }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "rgba(15,52,85,0.7)" }}
                    label={{
                      value: "Value",
                      angle: -90,
                      position: "insideLeft",
                      fontSize: 12,
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--cemi-hovercard-bg, #0F3455)",
                      border: "1px solid rgba(255,255,255,0.14)",
                      borderRadius: "8px",
                      boxShadow: "0 10px 28px rgba(15,52,85,0.22)",
                    }}
                    labelStyle={{ color: "var(--cemi-hovercard-fg, #F9F5EA)", fontWeight: 600 }}
                    itemStyle={{ color: "var(--cemi-hovercard-fg, #F9F5EA)" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name={fullscreenMetric.name}
                    stroke="#0F3455"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
