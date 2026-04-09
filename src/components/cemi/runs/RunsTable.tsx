// src/components/cemi/runs/RunsTable.tsx

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Badge } from "../../ui/badge";
import {
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Eye,
  EyeOff,
} from "lucide-react";
import type { RunRecord } from "../../../types/domain";
import { getDuration, formatDuration } from "../../../utils/runHelpers";
import { animationPresets } from "../../ui/animated-interactive";
import { ButtonUtility } from "../../base/buttons/button-utility";
import { ContractBadge } from "./ContractBadge";

interface RunsTableProps {
  runs: RunRecord[];
  visibleRunIds: Set<string>;
  onToggleVisible: (runId: string) => void;
  onRunClick: (run: RunRecord) => void;
  sortField?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (field: string) => void;
}

const MAX_VISIBLE_METRICS = 6;

export function RunsTable({
  runs,
  visibleRunIds,
  onToggleVisible,
  onRunClick,
  sortField,
  sortDirection,
  onSort,
}: RunsTableProps) {
  const getSummaryValue = (run: RunRecord, key: string): unknown => {
    const sm = ((run as any).summary_metrics || {}) as Record<string, unknown>;
    return sm[key];
  };

  const dynamicMetricKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const r of runs) {
      const sm = (r as any)?.summary_metrics;
      if (sm && typeof sm === "object" && !Array.isArray(sm)) {
        for (const k of Object.keys(sm as Record<string, unknown>)) {
          if (typeof k === "string" && k.trim()) keys.add(k.trim());
        }
      }
    }
    return Array.from(keys).sort((a, b) => a.localeCompare(b));
  }, [runs]);

  const visibleMetricKeys = useMemo(
    () => dynamicMetricKeys.slice(0, MAX_VISIBLE_METRICS),
    [dynamicMetricKeys]
  );
  const hiddenMetricCount = dynamicMetricKeys.length - visibleMetricKeys.length;

  const handleSort = (field: string) => {
    onSort?.(field);
  };

  const sortedRuns = useMemo(() => {
    if (!sortField || !sortDirection) return runs;

    return [...runs].sort((a, b) => {
      if (sortField.startsWith("metric:")) {
        const key = sortField.slice("metric:".length);
        const av = getSummaryValue(a, key);
        const bv = getSummaryValue(b, key);
        const aNum = typeof av === "number" && Number.isFinite(av) ? av : null;
        const bNum = typeof bv === "number" && Number.isFinite(bv) ? bv : null;
        const aVal = aNum ?? Number.NEGATIVE_INFINITY;
        const bVal = bNum ?? Number.NEGATIVE_INFINITY;
        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      }

      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "name":
          aValue = a.name || "";
          bValue = b.name || "";
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "created_at":
          aValue = a.created_at ? new Date(a.created_at).getTime() : 0;
          bValue = b.created_at ? new Date(b.created_at).getTime() : 0;
          break;
        case "duration":
          aValue = getDuration(a) || 0;
          bValue = getDuration(b) || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [runs, sortField, sortDirection]);

  const ColumnHeader = ({
    field,
    children,
    align = "left",
    width,
  }: {
    field: string;
    children: React.ReactNode;
    align?: "left" | "right" | "center";
    width?: string;
  }) => {
    const isSorted = sortField === field;
    return (
      <TableHead
        style={{
          backgroundColor: "var(--cemi-surface-bg, #F9F5EA)",
          whiteSpace: "nowrap",
          width,
          textAlign: align,
        }}
      >
        <button
          type="button"
          className="group flex items-center gap-1 hover:text-[#0F3455] transition-colors w-full"
          style={{ justifyContent: align === "right" ? "flex-end" : "flex-start", width: "100%" }}
          onClick={() => handleSort(field)}
        >
          <span className="text-xs font-medium uppercase tracking-wide text-[rgba(15,52,85,0.7)]">
            {children}
          </span>
          {isSorted ? (
            sortDirection === "asc" ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )
          ) : (
            <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-50" />
          )}
        </button>
      </TableHead>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      succeeded: "bg-green-100 text-green-800 border-green-200",
      running: "bg-blue-100 text-blue-800 border-blue-200",
      failed: "bg-red-100 text-red-800 border-red-200",
    };
    return (
      <Badge
        variant="outline"
        className={`text-xs px-1.5 py-0 h-5 ${styles[status] || "bg-gray-100 text-gray-600 border-gray-200"}`}
      >
        {status}
      </Badge>
    );
  };

  const formatMetricCell = (v: unknown): string | null => {
    if (v === undefined || v === null) return null;
    if (typeof v === "number" && Number.isFinite(v)) {
      return Number.isInteger(v) ? String(v) : v.toFixed(4);
    }
    if (typeof v === "string" && v.trim()) return v;
    if (typeof v === "boolean") return v ? "true" : "false";
    return null;
  };

  const columnCount =
    1 + // interaction
    5 + // fixed columns (name, status, verified, created, duration)
    visibleMetricKeys.length +
    (hiddenMetricCount > 0 ? 1 : 0); // optional overflow indicator

  const renderRunRow = (run: RunRecord, index: number) => {
    const isVisible = visibleRunIds.has(run.id);
    const duration = getDuration(run);

    return (
      <motion.tr
        key={run.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ ...animationPresets.spring, delay: index * 0.02 }}
        onClick={() => onRunClick(run)}
        whileHover={{
          backgroundColor: "rgba(15, 52, 85, 0.05)",
          boxShadow: "inset 0 0 0 1px rgba(15, 52, 85, 0.08)",
        }}
        whileTap={{ scale: 0.998 }}
        className="h-10 cursor-pointer"
      >
        <TableCell
          className="w-[80px] border-r border-[rgba(15,52,85,0.05)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1">
            <ButtonUtility
              icon={isVisible ? Eye : EyeOff}
              tooltip={isVisible ? "Remove from compare" : "Add to compare"}
              size="xs"
              color={isVisible ? "primary" : "tertiary"}
              onClick={() => onToggleVisible(run.id)}
            />
          </div>
        </TableCell>

        {/* Name */}
        <TableCell className="font-medium text-[#0F3455]">
          <motion.span
            className="truncate max-w-[200px] block hover:underline"
            whileHover={{ x: 2 }}
            transition={{ duration: 0.15 }}
          >
            {run.name || run.id.slice(0, 8)}
          </motion.span>
        </TableCell>

        {/* Status */}
        <TableCell>
          <motion.div whileHover={{ scale: 1.05 }} transition={animationPresets.spring}>
            {getStatusBadge(run.status)}
          </motion.div>
        </TableCell>

        {/* Verified */}
        <TableCell>
          <ContractBadge result={(run as any).contract_result} size="sm" />
        </TableCell>

        {/* Created */}
        <TableCell className="text-sm text-[rgba(15,52,85,0.7)]">
          {run.created_at
            ? new Date(run.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "—"}
        </TableCell>

        {/* Duration */}
        <TableCell className="text-sm text-[rgba(15,52,85,0.7)]">
          {formatDuration(duration)}
        </TableCell>

        {/* Dynamic summary_metrics columns (visible subset) */}
        {visibleMetricKeys.map((k) => {
          const val = getSummaryValue(run, k);
          const label = formatMetricCell(val);
          return (
            <TableCell key={k} className="text-sm text-right font-mono">
              {label !== null ? (
                <span className="text-[#0F3455]">{label}</span>
              ) : (
                <span className="text-[rgba(15,52,85,0.4)]">—</span>
              )}
            </TableCell>
          );
        })}
        {hiddenMetricCount > 0 && (
          <TableCell className="text-xs text-right text-[rgba(15,52,85,0.5)] font-mono">
            …
          </TableCell>
        )}
      </motion.tr>
    );
  };

  return (
    <Table
      className="border-separate border-spacing-0"
      style={{ backgroundColor: "var(--cemi-surface-bg, #F9F5EA)" }}
    >
      <TableHeader
        className="sticky top-0 z-20"
        style={{ backgroundColor: "var(--cemi-surface-bg, #F9F5EA)" }}
      >
        <TableRow className="h-9">
          <TableHead
            className="w-[80px]"
            style={{ backgroundColor: "var(--cemi-surface-bg, #F9F5EA)" }}
          />
          <ColumnHeader field="name">Name</ColumnHeader>
          <ColumnHeader field="status">Status</ColumnHeader>
          <TableHead style={{ backgroundColor: "var(--cemi-surface-bg, #F9F5EA)", whiteSpace: "nowrap" }}>
            <span className="text-xs font-medium uppercase tracking-wide text-[rgba(15,52,85,0.7)]">Verified</span>
          </TableHead>
          <ColumnHeader field="created_at">Created</ColumnHeader>
          <ColumnHeader field="duration">Duration</ColumnHeader>
          {visibleMetricKeys.map((k) => (
            <ColumnHeader key={k} field={`metric:${k}`} align="right">
              {k}
            </ColumnHeader>
          ))}
          {hiddenMetricCount > 0 && (
            <TableHead
              style={{
                backgroundColor: "var(--cemi-surface-bg, #F9F5EA)",
                whiteSpace: "nowrap",
                textAlign: "right",
              }}
            >
              <span className="text-[10px] font-medium uppercase tracking-wide text-[rgba(15,52,85,0.55)]">
                +{hiddenMetricCount} more
              </span>
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedRuns.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={columnCount}
              className="h-32 text-center text-[rgba(15,52,85,0.6)]"
            >
              No runs found
            </TableCell>
          </TableRow>
        ) : (
          <AnimatePresence>
            {sortedRuns.map((run, index) => renderRunRow(run, index))}
          </AnimatePresence>
        )}
      </TableBody>
    </Table>
  );
}
