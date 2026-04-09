# Contract Verification UI Surface

**Feature:** Contract result badge in Runs table + gate breakdown panel in Run detail
**Status:** Implemented
**Related:** ADR-0001, `cemi verify`, `writer.log_contract_result()`

---

## Why

`cemi verify` produces a pass/fail verdict per gate. `writer.log_contract_result()` stamps
that verdict into the run record (`payload.contract_result`). Without a UI surface, the
result is invisible to anyone browsing the workspace — practitioners must re-run `cemi verify`
or parse JSONL manually to know whether a run was verified.

The workspace should answer "is this run deployment-ready?" at a glance, without leaving
the browser.

---

## What

Two surfaces, one data source (`run.contract_result`):

1. **Verified badge** in the Runs table — a compact PASS/FAIL indicator next to Status.
   Absent when no contract has been evaluated (unknown ≠ fail).

2. **Contract Result Panel** in the Run detail Results tab — a gate-by-gate breakdown
   showing metric name, actual value, and individual verdict. Only rendered when the run
   carries a contract result.

---

## Wireframes

### Runs Table — Verified column (after Status)

```
┌──────┬──────────────────────┬───────────┬──────────┬──────────────┬──────────┬──────────────┐
│      │ Name                 │ Status    │ Verified │ Created      │ Duration │ accuracy …   │
├──────┼──────────────────────┼───────────┼──────────┼──────────────┼──────────┼──────────────┤
│  👁  │ resnet18-int8-ptq    │ succeeded │ ✓ PASS   │ Apr 9, 14:02 │ 2m 14s   │ 0.9500       │
│  👁  │ mobilenet-v2-int8    │ succeeded │ ✗ FAIL   │ Apr 9, 13:45 │ 1m 52s   │ 0.8200       │
│  👁  │ vgg16-fp32-baseline  │ succeeded │   —      │ Apr 8, 11:30 │ 3m 01s   │ 0.9100       │
│  👁  │ efficientnet-running │ running   │   —      │ Apr 9, 14:10 │  —       │   —          │
└──────┴──────────────────────┴───────────┴──────────┴──────────────┴──────────┴──────────────┘

  ✓ PASS  →  green badge  (bg-green-100 / text-green-800)
  ✗ FAIL  →  red badge    (bg-red-100 / text-red-800)
  —       →  no badge rendered (contract not evaluated)
```

### Run Detail — Results tab (below runs table, above action bar)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Contract Verification                                          ✓ PASS       │
├──────────────────────┬─────────────┬──────────────────┬──────────┬──────────┤
│ Gate                 │ Role        │ Metric           │ Value    │          │
├──────────────────────┼─────────────┼──────────────────┼──────────┼──────────┤
│ accuracy_gate        │ quality     │ final_accuracy   │ 0.9500   │ ✓        │
│ p99_latency_120ms    │ performance │ latency_ms (p99) │ 80.30    │ ✓        │
├──────────────────────┴─────────────┴──────────────────┴──────────┴──────────┤
│ Evaluated by cemi verify · run.contract_result                               │
└─────────────────────────────────────────────────────────────────────────────┘

  Failing gate row:
├──────────────────────┼─────────────┼──────────────────┼──────────┼──────────┤
│ accuracy_gate        │ quality     │ final_accuracy   │ 0.8200   │ ✗  value 0.82 < min 0.90 │
```

---

## Data Flow

```
writer.log_contract_result(result)
  └─→ payload.contract_result (in JSONL run record)
        └─→ local gateway passes through as run.contract_result
              └─→ RunsTable: renders ContractBadge(run.contract_result)
              └─→ RunDetailPage Results tab: renders ContractResultPanel(run.contract_result)
```

The gateway already passes all payload fields through to the UI — no backend change needed.

---

## Component Inventory

| Component | File | Purpose |
|---|---|---|
| `ContractBadge` | `runs/ContractBadge.tsx` | Compact PASS/FAIL/absent badge; used in table row and panel header |
| `ContractResultPanel` | `runs/ContractResultPanel.tsx` | Gate breakdown table; shown in Run detail Results tab |

### `ContractBadge` props

```ts
interface ContractBadgeProps {
  result: ContractResult | undefined | null;
  size?: "sm" | "md";           // sm = table row, md = panel header
}
```

### `ContractResultPanel` props

```ts
interface ContractResultPanelProps {
  result: ContractResult;
}
```

---

## Type additions (`domain.ts`)

```ts
export interface ContractGateResult {
  id: string;
  role: string;
  metric?: { name: string; source?: string; aggregation?: string };
  run_value?: number | null;
  pass: boolean;
  explain?: string;
}

export interface ContractResult {
  pass: boolean;
  gate_results?: ContractGateResult[];
  run_id?: string;
}
```

`Run` gains an optional field: `contract_result?: ContractResult`.

---

## Design Constraints

- **No new dependencies.** Uses existing `Badge` from `../../ui/badge` and Tailwind classes
  already present in the codebase.
- **Absent = neutral.** A missing `contract_result` shows nothing, not a warning.
  Not having run `cemi verify` is not the same as failing it.
- **Consistent palette.** Green `bg-green-100/text-green-800`, red `bg-red-100/text-red-800`
  match the existing `getStatusBadge` patterns in `RunsTable`.
- **Column count stays correct.** `columnCount` in `RunsTable` is incremented by 1
  (the new Verified column is always present as a fixed column).
