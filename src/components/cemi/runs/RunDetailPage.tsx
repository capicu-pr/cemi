// src/components/cemi/runs/RunDetailPage.tsx

import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Page } from "../layout/Page";
import { RunsTable } from "./RunsTable";
import { MetricWidget } from "./widgets/MetricWidget";
import { runsToMetricWidgetData } from "./widgets/runMetricsToWidgetData";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { animationPresets, shadowPresets } from "../../ui/animated-interactive";
import { ButtonUtility } from "../../base/buttons/button-utility";
import { Dropdown } from "../../base/dropdown/dropdown";
import { ModelNavigatorMVP } from "./graph/ModelNavigatorMVP";
import { NetronViewer, type NetronViewerHandle } from "./graph/netron/NetronViewer";
import {
  MoreVertical,
  Download,
  RefreshCw,
  Trash2,
  ChevronLeft,
  GitCompare,
} from "lucide-react";
import type { RunRecord } from "../../../types/domain";
import { ProfilingTab } from "./tabs/ProfilingTab";
import { ContractResultPanel } from "./ContractResultPanel";

interface RunDetailPageProps {
  projectName?: string;
  runs: RunRecord[];
  selectedRunId?: string | null;
  selectedRun?: RunRecord | null;
  selectedRunName?: string | null;
  onRunClick: (run: RunRecord) => void;
  onNavigate: (path: string) => void;
  compareRunIds: Set<string>;
  onToggleCompare: (runId: string) => void;
  onOpenCompare: (runIds: string[]) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const HEADER_TABS = [
  { id: "results", label: "Results" },
  { id: "metrics", label: "Metrics" },
  { id: "profiling", label: "Profiling" },
  { id: "graph", label: "Graph" },
] as const;

export function RunDetailPage({
  projectName = "Project",
  runs,
  selectedRunId = null,
  selectedRun = null,
  selectedRunName = null,
  onRunClick,
  onNavigate,
  compareRunIds,
  onToggleCompare,
  onOpenCompare,
  isLoading = false,
  onRefresh,
}: RunDetailPageProps) {
  const [activeTab, setActiveTab] = useState<(typeof HEADER_TABS)[number]["id"]>("results");
  const netronRef = useRef<NetronViewerHandle | null>(null);
  const [selectedNetronNodeId, setSelectedNetronNodeId] = useState<string | null>(null);
  const toolSurfaceBackground = "var(--cemi-surface-bg, #F9F5EA)";

  const displayRunName = useMemo(() => {
    if (selectedRunName?.trim()) return selectedRunName.trim();
    if (selectedRun?.name) return selectedRun.name;
    return selectedRunId ? `Run ${selectedRunId.slice(0, 8)}` : null;
  }, [selectedRun, selectedRunId, selectedRunName]);

  const getSummaryNumber = (run: RunRecord, key: string): number | null => {
    const sm = (run.summary_metrics || {}) as Record<string, unknown>;
    const v = sm[key];
    return typeof v === "number" && Number.isFinite(v) ? v : null;
  };

  // In the Run Detail view, the "Results/Config" table should show only the selected run.
  const detailRuns = useMemo(() => (selectedRun ? [selectedRun] : []), [selectedRun]);

  const configYaml = useMemo(() => {
    if (!selectedRun) return "";

    const normalize = (v: unknown) => String(v ?? "").trim();
    const normLower = (v: unknown) => normalize(v).toLowerCase();

    // Params/tags can contain the source-of-truth for user-supplied run config.
    const param = (key: string) => (selectedRun.params || []).find((p: any) => p?.key === key)?.value;
    const tag = (key: string) => (selectedRun.tags || []).find((t) => t.key === key)?.value;

    const methodRaw = tag("method") ?? tag("experiment") ?? "";
    const quantRaw = tag("quantization") ?? "";
    const method = normLower(methodRaw) || "ptq";
    const quant = normLower(quantRaw) || "int8";

    const epochs = Number(param("num_epochs") ?? param("epochs") ?? 25);
    const batchSize = Number(param("batch_size") ?? 32);
    const learningRate = Number(param("learning_rate") ?? 1e-4);
    const numClasses = Number(param("num_classes") ?? 10);

    const datasetName = normalize(param("dataset_name") ?? tag("dataset") ?? "MNIST");
    const modelArch = normalize(param("model_architecture") ?? tag("model") ?? selectedRun.name ?? "model");

    const device = normalize(param("device") ?? "cpu");
    const runtime = normalize(param("runtime") ?? "");

    const isQat = method === "qat";
    const minDelta = isQat ? 0.05 : 0.001;
    const resultsFile = isQat
      ? "results/6models_benchmark_QAT_001.json"
      : "results/all_models_benchmark_PTQ_001.json";

    const header = isQat
      ? ""
      : [
          "# Benchmark Configuration for All Models",
          "# This configuration runs FP32 and INT8 benchmarks for all available models",
          "",
        ].join("\n");

    const qatBlock = isQat
      ? [
          "",
          "    qat:",
          "      enabled: true",
          `      learning_rate: ${learningRate}`,
          '      backend: "x86"',
        ].join("\n")
      : "";

    return (
      header +
      [
        "benchmark:",
        "  # Training parameters",
        `  num_epochs: ${epochs}`,
        `  batch_size: ${batchSize}`,
        `  batch_size_test: ${batchSize}`,
        `  learning_rate: ${learningRate}`,
        `  num_classes: ${numClasses}`,
        "  ",
        "  # Early stopping configuration",
        "  early_stopping:",
        "    enabled: true",
        "    patience: 5",
        `    min_delta: ${minDelta}`,
        "  ",
        "  # Dataset configuration",
        "  dataset:",
        `    name: "${datasetName}"`,
        `    download_path: "${datasetName.toLowerCase()}"`,
        "    train: true",
        "    sample_rate: 0.05",
        "  ",
        "  # Models to benchmark",
        "  models:",
        `    - ${modelArch}`,
        "  ",
        "  # Paths",
        '  model_save_path: "benchmark_models"',
        '  results_path: "results"',
        `  results_file: "${resultsFile}"`,
        "  ",
        "  # Compression settings",
        "  compression:",
        `    quantization: "${quant}"`,
        `    method: "${method}"`,
        "    compare: true",
        qatBlock,
        "  ",
        "  # Device settings",
        `  device: "${device}"`,
        ...(runtime
          ? [
              "  ",
              "  # Runtime",
              `  runtime: "${runtime}"`,
            ]
          : []),
      ]
        .filter((l) => l !== "")
        .join("\n")
    );
  }, [selectedRun]);

  // Metrics tab: real data from selected run only
  const metricsTabWidgets = useMemo(() => {
    const detailRuns = selectedRun ? [selectedRun] : [];
    const run = selectedRun as any;
    const rawMetrics = Array.isArray(run?.metrics) ? (run.metrics as Array<{ name?: string }>) : [];
    const names = Array.from(
      new Set(
        rawMetrics
          .map((m) => (typeof m?.name === "string" && m.name.trim() ? m.name.trim() : null))
          .filter(Boolean) as string[]
      )
    );
    const score = (name: string) => {
      const n = name.toLowerCase();
      if (n.includes("accuracy")) return 0;
      if (n.includes("loss")) return 1;
      if (n.includes("latency")) return 2;
      if (n.includes("throughput")) return 3;
      if (n.includes("energy")) return 4;
      return 10;
    };
    names.sort((a, b) => score(a) - score(b) || a.localeCompare(b));

    return names
      .map((name) => ({
        title: name,
        metricKey: name,
        yAxisLabel: "",
        runs: runsToMetricWidgetData(detailRuns, name),
      }))
      .filter((c) => c.runs.length > 0);
  }, [selectedRun]);

  const modelUrl = useMemo(() => {
    const artifacts = selectedRun?.artifacts || [];

    const modelArtifacts = artifacts.filter((a) => a.type === "model");
    const onnx = modelArtifacts.find((a) => {
      const url = (a as any).url || (a as any).uri;
      return typeof url === "string" && url.toLowerCase().endsWith(".onnx");
    });

    const url = (onnx as any)?.url || (onnx as any)?.uri;
    return typeof url === "string" ? url : null;
  }, [selectedRun]);

  const [modelBlob, setModelBlob] = useState<Blob | null>(null);
  const [modelLoading, setModelLoading] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);

  useEffect(() => {
    if (!modelUrl) {
      setModelBlob(null);
      setModelLoading(false);
      setModelError(null);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    (async () => {
      try {
        setModelLoading(true);
        setModelError(null);
        setModelBlob(null);

        const resp = await fetch(modelUrl, { signal: controller.signal });
        if (!resp.ok) {
          throw new Error(`Failed to load model (${resp.status})`);
        }
        const blob = await resp.blob();
        if (!cancelled) setModelBlob(blob);
      } catch (e) {
        if (cancelled) return;
        if ((e as any)?.name === "AbortError") return;
        setModelError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setModelLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [modelUrl]);

  // Sorting
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const hasProfilingData = useMemo(() => {
    if (!selectedRun) return false;
    const sm = (selectedRun.summary_metrics || {}) as Record<string, unknown>;
    const keys = ["latency_p50_ms", "latency_p90_ms", "latency_p95_ms", "latency_p99_ms"];
    return keys.some((k) => typeof sm[k] === "number" && Number.isFinite(sm[k] as number));
  }, [selectedRun]);

  const enabledTabs = useMemo(
    () =>
      HEADER_TABS.filter((tab) => {
        if (!selectedRun) return false;
        switch (tab.id) {
          case "results":
            return true;
          case "metrics":
            return metricsTabWidgets.length > 0;
          case "profiling":
            return hasProfilingData;
          case "graph":
            return Boolean(modelUrl);
          default:
            return false;
        }
      }),
    [selectedRun, metricsTabWidgets.length, hasProfilingData, modelUrl]
  );

  useEffect(() => {
    if (enabledTabs.length === 0) return;
    const stillValid = enabledTabs.some((t) => t.id === activeTab);
    if (!stillValid) {
      setActiveTab(enabledTabs[0].id);
    }
  }, [enabledTabs, activeTab]);

  // Handlers
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const runNotFound = Boolean(selectedRunId && !selectedRun && !isLoading);

  return (
    <Page title="" subtitle="" fullWidth>
      <div className="flex h-full min-h-0 flex-col">
        {/* Row 1: Title Bar */}
        <motion.div
          className="flex flex-wrap items-start justify-between gap-3 py-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={animationPresets.spring}
        >
          <div className="flex min-w-0 items-start gap-3">
            <ButtonUtility
              icon={ChevronLeft}
              tooltip="Back to runs list"
              size="md"
              color="tertiary"
              onClick={() => onNavigate("/workspace/runs")}
            />
            <div className="min-w-0 max-w-4xl">
              <h1 className="break-words text-base font-semibold leading-tight text-[#0F3455] sm:text-lg">
                {projectName} / Runs{displayRunName ? ` / ${displayRunName}` : ""}
              </h1>
            </div>
          </div>

          <Dropdown.Root>
            <Dropdown.Trigger asChild>
              <div>
                <ButtonUtility icon={MoreVertical} tooltip="More actions" size="md" color="tertiary" />
              </div>
            </Dropdown.Trigger>
            <Dropdown.Popover align="end">
              <Dropdown.Menu>
                <Dropdown.Section>
                  <Dropdown.Item icon={RefreshCw} onClick={onRefresh}>
                    Refresh
                  </Dropdown.Item>
                  <Dropdown.Item icon={Download}>
                    Export All
                  </Dropdown.Item>
                </Dropdown.Section>
                <Dropdown.Separator />
                <Dropdown.Section>
                  <Dropdown.Item icon={Trash2} destructive>
                    Delete Selected
                  </Dropdown.Item>
                </Dropdown.Section>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown.Root>
        </motion.div>

        {/* Tabs (data-driven; hidden when no run is selected) */}
        {enabledTabs.length > 0 && (
          <div className="py-1 flex justify-start">
            <div
              role="tablist"
              aria-label="Run detail tabs"
              className="flex items-end justify-start gap-8 bg-[#F9F5EA] px-5"
              style={{ backgroundColor: toolSurfaceBackground }}
            >
              {enabledTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab.id)}
                    className={[
                      "cursor-pointer select-none",
                      "bg-transparent",
                      // No box/border chrome
                      "border-x-0 border-t-0",
                      // Use underline-only; keep layout stable with transparent underline when inactive
                      "border-b-4",
                      isActive ? "border-b-[#D82A2D] text-[#D82A2D] font-semibold" : "border-b-transparent text-[#0F3455]",
                      "px-1 pb-2 text-sm",
                    ].join(" ")}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Run not found: URL has runId but run is missing (e.g. deleted or wrong project) */}
        {runNotFound ? (
          <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center gap-4 p-8">
            <p className="text-base text-[rgba(15,52,85,0.8)] text-center">
              Run not found. It may have been deleted or is from another project.
            </p>
            <Button
              onClick={() => onNavigate("/workspace/runs")}
              className="bg-[#0F3455] text-[#F9F5EA] hover:bg-[#0F3455]/90"
            >
              Back to Runs
            </Button>
          </div>
        ) : (
        <>
        {/* Runs Table / Graph Navigator + right-side model viewer */}
        {activeTab === "graph" ? (
          <div
            className="flex-1 min-h-0 w-full"
            style={{
              display: "grid",
              gridTemplateColumns: "250px minmax(0, 1fr)",
              gap: "1rem",
            }}
          >
            {/* Left: graph navigator */}
            <div
              className="min-w-0 border border-[rgba(15,52,85,0.1)] rounded-lg bg-white overflow-hidden shadow-sm"
              style={{ height: "calc(100vh - 320px)" }}
            >
              <ModelNavigatorMVP
                viewerRef={netronRef}
                selectedNodeId={selectedNetronNodeId}
                onSelectNodeId={(id) => setSelectedNetronNodeId(id)}
              />
            </div>

            {/* Right: model viewer */}
            <div
              className="min-w-0 rounded-lg bg-[#F9F5EA] border border-[rgba(15,52,85,0.1)]"
              style={{ height: "calc(100vh - 320px)", backgroundColor: toolSurfaceBackground }}
            >
              {!modelUrl ? (
                <div className="h-full w-full flex items-center justify-center text-sm text-[rgba(15,52,85,0.55)]">
                  No ONNX model artifact found for this run.
                </div>
              ) : modelLoading ? (
                <div className="h-full w-full flex items-center justify-center text-sm text-[rgba(15,52,85,0.55)]">
                  Loading model…
                </div>
              ) : modelError ? (
                <div className="h-full w-full p-4 text-sm text-[#D82A2D]">
                  Failed to load model: {modelError}
                </div>
              ) : modelBlob ? (
                <div className="h-full w-full bg-white rounded-lg overflow-hidden">
                  <NetronViewer
                    ref={netronRef}
                    file={modelBlob}
                    onSelectionChange={(nodeId) => {
                      if (nodeId) setSelectedNetronNodeId(nodeId);
                    }}
                  />
                </div>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-sm text-[rgba(15,52,85,0.55)]">
                  Model not loaded.
                </div>
              )}
            </div>
          </div>
        ) : activeTab === "metrics" ? (
          <div className="flex-1 min-h-0 w-full overflow-y-auto">
            {!selectedRun && !selectedRunId ? (
              <div className="h-full w-full flex items-center justify-center text-sm text-[rgba(15,52,85,0.55)]">
                Select a run to view metrics.
              </div>
            ) : metricsTabWidgets.length === 0 ? (
              <div className="p-4 flex items-center justify-center min-h-[200px] text-sm text-[rgba(15,52,85,0.6)]">
                No metrics logged for this run. Use writer.log_metric() during training.
              </div>
            ) : (
              <div className="p-4">
                <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {metricsTabWidgets.map((config) => (
                    <div key={config.metricKey} className="w-full min-w-0 aspect-[4/3]">
                      <MetricWidget
                        title={config.title}
                        metricKey={config.metricKey}
                        runs={config.runs}
                        yAxisLabel={config.yAxisLabel}
                        showSmoothing
                        defaultSmoothing={0.2}
                        fillParent
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : activeTab === "profiling" ? (
          <div className="flex-1 min-h-0 w-full overflow-y-auto p-4">
            {!selectedRun ? (
              <div className="h-full w-full flex items-center justify-center text-sm text-[rgba(15,52,85,0.55)]">
                Select a run to view profiling.
              </div>
            ) : (
              <ProfilingTab run={selectedRun} />
            )}
          </div>
        ) : (
          <div className="flex-1 min-h-0 w-full">
            <div
              className="min-w-0 border border-[rgba(15,52,85,0.1)] rounded-lg bg-white overflow-hidden shadow-sm"
              // Let the table grow/shrink with its contents (e.g. single run -> small),
              // but cap it to the viewport so it doesn't overflow the page.
              style={{ maxHeight: "calc(100vh - 320px)" }}
            >
              <div
                className="w-full overflow-x-auto overflow-y-auto table-scroll-container"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center h-64 text-[rgba(15,52,85,0.7)]">
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Loading runs...
                  </div>
                ) : !selectedRun ? (
                  <div className="flex flex-col items-center justify-center h-64 text-[rgba(15,52,85,0.7)]">
                    <p className="text-base mb-1">No run selected</p>
                    <p className="text-sm">Pick a run from the list to view its details.</p>
                  </div>
                ) : (
                  <RunsTable
                    runs={detailRuns}
                    visibleRunIds={compareRunIds}
                    onToggleVisible={onToggleCompare}
                    onRunClick={onRunClick}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                )}
              </div>
            </div>
            {selectedRun?.contract_result && (
              <div className="px-0 pt-2">
                <ContractResultPanel result={selectedRun.contract_result} />
              </div>
            )}
          </div>
        ) }
        </>
        )}

        {/* Bottom Table Bar (hide on Graph tab) */}

        {selectedRun && activeTab === "results" && (
          <motion.div
            className="flex items-center justify-between gap-3 py-3 px-2 border-t border-[rgba(15,52,85,0.1)] bg-[rgba(15,52,85,0.02)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...animationPresets.spring, delay: 0.15 }}
          >
            <div className="text-sm text-[rgba(15,52,85,0.6)]">
              This run is the deep-inspection view for the current experiment context.
            </div>
            <div className="flex items-center gap-3">
              <AnimatePresence>
                {compareRunIds.size > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={animationPresets.spring}
                    whileHover={{ scale: 1.05, boxShadow: shadowPresets.md }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="sm"
                      className="h-7 gap-1.5"
                      onClick={() => onOpenCompare(Array.from(compareRunIds))}
                    >
                      <GitCompare className="h-3.5 w-3.5" />
                      <span>{compareRunIds.size}</span>
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
              {!compareRunIds.has(selectedRun.id) ? (
                <Button size="sm" variant="outline" onClick={() => onToggleCompare(selectedRun.id)}>
                  Add to compare
                </Button>
              ) : null}
            </div>
          </motion.div>
        )}
      </div>
    </Page>
  );
}


