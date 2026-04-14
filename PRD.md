# CEMI Product Requirements Document

**Version:** 0.1 (draft)
**Product:** Capicú Edge ML Inference (CEMI)
**Authors:** Sebastián A. Cruz Romero, Shenied E. Maldonado Guerra
**Organization:** Capicú Technologies
**Repository:** https://github.com/capicu-pr/cemi
**Current release:** v0.1.2
**Date:** 2026-04-09

---

## 1. Background

CEMI started as an experiment workspace for Edge AI and TinyML model compression workflows. The v0.1.x line established the core local-first triad: a Python **Writer** that instruments existing scripts, a local **gateway** that serves run data from disk, and a browser **workspace UI** that surfaces runs, comparisons, and action events.

Alongside this, the team submitted a TMLR paper titled *"Benchmarking Is Not Verification."* That title is the product thesis. A benchmark score answers "how did the model perform on this dataset, at this step, under these conditions?" Verification answers a structurally different question: "does the model satisfy a stated set of quality, performance, and resource gates that would make it deployable?" CEMI's contract system — `contract.json`, `contract.py`, `decision_layer.py` — was built to make that distinction explicit and machine-checkable. This PRD formalizes what ships next, organized around that distinction.

---

## 2. Problem Statement

Edge AI practitioners face a specific gap in tooling:

1. **Benchmarking tools abound; verification tools do not.** Run tracking platforms (MLflow, W&B) record metrics but do not encode pass/fail semantics against deployment criteria. Teams ship models that "look good in the dashboard" but fail on-device latency, memory, or quality regressions.

2. **Local-first experiment work is underserved.** Cloud MLOps platforms impose sign-up, upload pipelines, and round-trip latency that conflict with embedded and edge development loops where the "server" may be a laptop attached to a microcontroller.

3. **Experiment state and deployment evidence are kept in separate silos.** A benchmark run and a deployment sign-off live in different tools, different files, or different people's heads. There is no single artifact that links a run's metrics to a versioned claim that the model is verified for a specific deployment scenario.

---

## 3. Product Vision

CEMI is the experiment workspace for edge AI practitioners who need to know not just how a model performed, but whether it is ready to deploy.

It is local-first, progressively adoptable, and produces a verifiable artifact — a contract result — that distinguishes benchmark evidence from deployment readiness.

---

## 4. Personas

| Persona | Who | Core need |
|---|---|---|
| **Edge researcher** | ML engineer compressing or evaluating models for microcontrollers, mobile, or server inference | Instrument existing scripts with minimal overhead; inspect runs locally without a cloud account |
| **Compression engineer** | Practitioner running quantization/pruning loops, comparing model variants | Side-by-side accuracy/latency/size tradeoffs; clear pass/fail against a deployment contract |
| **Team lead / reviewer** | Tech lead or PI who signs off on a candidate model before handoff | A machine-checked verification result, not a screenshot of a dashboard |
| **CI automation** | A GitHub Actions or CI job that gates a PR on model quality | CLI exit code and machine-readable contract result that integrates into existing CI |

---

## 5. Current State (v0.1.2)

### What ships

| Component | Status | Notes |
|---|---|---|
| `cemi.writer` — Python Writer API | Shipped | `create_writer`, `create_writer_from_env`, `start_run`, `log_parameter`, `log_metric`, `log_scalar`, `log_summary_metrics`, `log_artifact`, `emit_run_record`, `end_run` |
| Local gateway (`cemi gateway`) | Shipped | Reads `*.jsonl` from `save_dir/runs/`, serves workspace UI and API at port 3141 |
| CLI commands | Shipped | `gateway`, `view`, `start`, `stop`, `config`, `help` |
| Workspace UI — Runs table | Shipped | Lists runs per project with status, metrics summary columns |
| Workspace UI — Compare view | Shipped | Side-by-side run comparison |
| Workspace UI — Console view | Shipped | Chronological action-event stream |
| Data contract v2 | Shipped | JSONL `run_record` with `metrics.events`, `metrics.summary`, `artifacts`, `parameters`, `tags`, `context` |
| Contract schema (`contract.py`) | Shipped | Gate types: quality (relative degradation), performance (absolute, p-quantile), resource, cost derivation |
| Decision layer (`decision_layer.py`) | Shipped | Evaluates gates against run summary metrics; returns pass/fail per gate |
| Backend FastAPI (cloud path) | Partial | Routes, ingestion, SSE metrics stream, auth skeleton exist; not publicly exposed |
| PyPI package (`cemi-cli`) | Shipped | `pip install cemi-cli` at v0.1.2 |

### Known gaps at v0.1.2

- Contract evaluation is in library code but not surfaced in the CLI or UI.
- Cloud path (backend) is not wired to any live deployment or public endpoint.
- Live metrics SSE stream exists server-side but no UI widget consumes it.
- No CI integration path (no `cemi verify` command with exit codes).
- No artifact diffing or side-by-side view beyond scalar metrics.
- Auth (MSAL) is wired in the cloud backend but gated behind a closed-beta message in the CLI.

---

## 6. Release Goals

### v0.2.0 — Contract Verification & Local Completeness

**Theme:** Make the verification claim first-class. A user can run a script, record a run, evaluate it against a contract, and get a machine-readable pass/fail result — all locally, all from the CLI.

**Requirements**

#### CLI: `cemi verify`

- `cemi verify --contract <path> --run <run_id_or_file> [--save-dir <dir>]`
  - Loads the contract JSON from `<path>`.
  - Loads the run snapshot from `save_dir/runs/<run_id>.jsonl` (last valid `run_record`).
  - Evaluates all gates using the existing `decision_layer`.
  - Prints a rich table: gate ID, role, metric, threshold, actual value, PASS/FAIL.
  - Exits `0` if all gates pass; exits `1` if any gate fails; exits `2` on schema/parse error.
- `cemi verify --contract <path> --run <run_id> --output json`
  - Writes machine-readable result to stdout (or `--output-file <path>`).
  - Schema: `{ "contract_id", "run_id", "verdict": "pass"|"fail"|"error", "gates": [{ "id", "verdict", "metric", "threshold", "actual" }] }`

#### Writer: `log_contract_result`

- `writer.log_contract_result(contract_path, result_dict)` appends the verification result to the run record so it is queryable from the workspace.
- Contract result is stored under `payload.contract_result` in the `run_record`.

#### Data contract extension (v2.1)

- Add optional `contract_result` field to the `run_record` payload schema:

```json
{
  "contract_result": {
    "contract_id": "string",
    "verdict": "pass | fail | error",
    "evaluated_at_ms": 1730000000000,
    "gates": [
      { "id": "string", "verdict": "pass | fail", "metric": "string", "threshold": 0.0, "actual": 0.0 }
    ]
  }
}
```

#### Workspace UI: Contract badge

- Runs table: add a **Verified** column that shows a PASS/FAIL badge when `contract_result` is present on a run.
- Run detail page: show the full gate table (gate ID, threshold, actual, verdict) when `contract_result` is present.
- No contract result → column cell is empty, not an error.

#### Contract schema hardening

- Validate contract JSON against a JSON Schema at load time; return structured errors with field paths.
- Support `scenario`-scoped performance gates (already partially implemented in `decision_layer` via `tags.scenario`).
- Add `version: "1"` field to contract JSON; default to `"0"` for backward compat.

#### Test coverage

- Unit tests for all gate types: quality relative degradation, absolute max/min, p-quantile, cost derivation.
- Integration test: `cemi verify` CLI end-to-end with a fixture run file and fixture contract.
- Contract schema validation tests for malformed inputs.

---

### v0.3.0 — Live Streaming, Multi-run Workflows & CI Integration

**Theme:** CEMI is usable in automated pipelines. CI jobs can gate on contract results. Live metric streaming is visible in the UI during long compression or training runs.

**Requirements**

#### CLI: CI integration

- `cemi verify` exits with correct codes documented and stable; suitable for use as a CI step.
- `cemi run-and-verify --contract <path> --save-dir <dir> -- <command>`:
  - Wraps `cemi start` + waits for run completion + runs `cemi verify`.
  - Single command for CI: script runs, is recorded, is verified, CI gets exit code.
- Structured JSON output for all CLI commands (`--output json` flag, consistent across `verify`, `config`, `gateway status`).

#### UI: Live metrics

- Console view and Run detail page consume the existing SSE endpoint (`/stream/runs/<run_id>/metrics`) when the local gateway is running and the run is active.
- Live chart updates for metric events without page reload.
- "Live" indicator badge on an active run.

#### Writer: batch and streaming modes

- `emit_run_record(flush=True)` — flush all buffered metric events immediately (for CI / short scripts).
- Configurable emit interval for long-running loops: `create_writer(..., emit_interval_steps=10)`.

#### Workspace UI: artifact diff view

- Compare view: when two runs have artifacts of the same name/kind (e.g. `model.onnx`), show a side-by-side artifact summary (size, hash, metadata) rather than only scalar metrics.

#### Multi-scenario contracts

- Contract can define multiple scenario blocks, each with independent quality/performance/resource gates.
- `cemi verify` reports per-scenario verdict.
- Example: same contract covering `{ "scenario": "interactive" }` (p99 ≤ 120 ms) and `{ "scenario": "batch" }` (throughput ≥ 500 outputs/s).

#### Workspace UI: contract result history

- Compare view: when both runs have `contract_result`, show a diff of gate verdicts (which gates flipped pass→fail or fail→pass between runs).

---

### v1.0.0 — Cloud Path, Multi-user & Public API Stability

**Theme:** Teams can share a CEMI backend, the local and cloud paths are production-quality, and the public API surface is stable enough for external integrations.

**Requirements**

#### Cloud backend

- The FastAPI backend (`backend/`) is deployable and documented.
- Auth via MSAL is fully wired; users authenticate once and all CLI/Writer calls carry the token.
- `cemi start --mode cloud` routes Writer events to the cloud backend ingestion API.
- Projects and runs are persisted in a real store (not in-memory); the schema in `backend/schema.sql` is the target.
- Multi-user: project access is scoped to an organization; runs are visible to team members.

#### Cloud Writer sink

- `create_writer(mode="cloud", endpoint=..., token=...)` routes `emit_run_record` to `/runs/<run_id>/events` via HTTP.
- `create_writer_from_env()` detects `CEMI_MODE=cloud` and uses `CEMI_SERVER_URL` + `CEMI_RUN_TOKEN`.

#### Public API stability

- `/api/projects`, `/api/projects/:id/runs`, `/api/runs/:id`, `/api/runs/:id/metrics` are versioned under `/api/v1/`.
- Backward compat policy: v1 endpoints are stable across minor releases.
- OpenAPI spec is generated and published.

#### CLI: workspace management

- `cemi projects list` — list projects visible to the authenticated user.
- `cemi runs list --project <id>` — list runs for a project.
- `cemi runs get <run_id>` — print run summary.
- These work against both local gateway (no auth) and cloud backend (auth required).

#### Packaging and distribution

- `cemi-cli` PyPI package is the official install path.
- Docker image for the backend is published to a registry.
- GitHub Actions workflow template for `run-and-verify` CI pattern is published as a repository example.

#### Observability

- Gateway health endpoint (`/health`) returns version, uptime, run count.
- Backend emits structured logs (JSON) for all ingestion and auth events.

---

## 7. Non-Goals (all versions)

- **Training orchestration.** CEMI instruments existing training scripts; it does not manage training clusters, hyperparameter search, or distributed jobs.
- **Model registry.** CEMI tracks artifacts within a run; it is not a dedicated model versioning store (no promotion workflows, lineage DAG, or model serving).
- **Dataset versioning.** Out of scope. Users may log a dataset tag/hash as a parameter.
- **On-device deployment.** CEMI records and verifies inference metrics; it does not flash firmware, manage device fleets, or handle OTA updates.
- **Hosted SaaS for the public.** The cloud path is for team/org use, not a multi-tenant public service.

---

## 8. Data Model

### Run record (v2, current + v2.1 extension)

```
run_record
├── type: "run_record"
├── schema_version: "2.0"
└── payload
    ├── run_id: string
    ├── project: string
    ├── name: string
    ├── stage: string
    ├── status: string                 # "running" | "succeeded" | "failed" | "cancelled"
    ├── created_at_ms: int
    ├── context: object                # arbitrary key-value (scenario, device, etc.)
    ├── parameters: [{ key, value }]
    ├── tags: object
    ├── metrics
    │   ├── events: [MetricEvent]      # time-series points for chart widgets
    │   └── summary: [MetricEvent]    # scalar summaries for table columns
    ├── summary_metrics: object        # legacy flat dict; deprecated in favor of metrics.summary
    ├── artifacts: [ArtifactRecord]
    └── contract_result (v2.1, optional)
        ├── contract_id: string
        ├── verdict: "pass" | "fail" | "error"
        ├── evaluated_at_ms: int
        └── gates: [GateResult]
```

### Contract schema (v1)

```
contract.json
├── contract_id: string
├── version: "1"
├── project: string
├── name: string
├── baseline: { run_id: string }     # optional; for relative gates
├── gates: [Gate]
│   ├── id: string
│   ├── role: "quality" | "performance" | "resource" | "cost"
│   ├── metric: MetricSelector
│   ├── direction: "lower_is_better" | "higher_is_better"
│   └── threshold: AbsoluteThreshold | RelativeThreshold
├── quality: QualityGate (shorthand)
├── performance: [PerformanceGate]
├── resources: [ResourceGate]
└── cost: CostConfig
```

### Storage layout (unchanged)

```
save_dir/
├── runs/
│   └── <run_id>.jsonl          # one run_record JSON per line; last line is current snapshot
└── artifacts/
    └── <run_id>/
        └── <filename>
```

---

## 9. API Surface

### Local gateway (no auth)

| Method | Path | Description |
|---|---|---|
| GET | `/api/projects` | List projects derived from run files |
| GET | `/api/projects/:id/runs` | List runs for a project |
| GET | `/api/runs/:id` | Get run snapshot |
| GET | `/api/runs/:id/metrics` | Get metric points array |
| GET | `/api/runs/:id/artifacts/:filename` | Serve artifact file |
| GET | `/health` | Gateway health + version |

### CLI commands (stable target at v1.0)

```
cemi gateway [--save-dir DIR] [--port PORT]
cemi view [--save-dir DIR]
cemi start [--save-dir DIR] [--project ID] -- COMMAND
cemi stop
cemi verify --contract FILE --run RUN_ID [--save-dir DIR] [--output json] [--output-file FILE]
cemi run-and-verify --contract FILE [--save-dir DIR] [--project ID] -- COMMAND
cemi config [KEY VALUE]
cemi projects list
cemi runs list --project ID
cemi runs get RUN_ID
```

---

## 10. Success Criteria

### v0.2.0

- A user can evaluate a run against a contract with a single `cemi verify` command and get a structured pass/fail result.
- The Runs table in the workspace shows a verified badge for any run that has a `contract_result`.
- `cemi verify` exits `1` when at least one gate fails, making it usable in CI scripts.
- All existing Writer contract tests pass; new gate types have ≥90% unit test coverage.

### v0.3.0

- A CI job can run `cemi run-and-verify` in a single step and block a PR on a failing contract gate.
- Live metric charts update in the workspace UI while a run is active, without page reload.
- A Compare view shows which contract gates changed between two runs.

### v1.0.0

- Teams using the cloud backend can share projects and runs without sharing a filesystem.
- `cemi-cli` PyPI package installs cleanly on Python 3.9–3.12 on macOS, Linux, and Windows.
- Public API is documented via OpenAPI and stable across minor releases.
- CEMI is cited or used in ≥1 published benchmark or paper beyond the TMLR submission.

---

## 11. Open Questions

1. **Contract authoring UX.** Should the workspace UI include a contract builder, or is contract authoring always file-based? A UI builder lowers the barrier for non-CLI users but adds significant scope.

2. **Baseline pinning.** Relative gates (e.g. "accuracy must not drop more than 1% from baseline") require a pinned baseline run. What happens when the baseline run is deleted or archived? Should the contract embed a snapshot of baseline values or reference a live run?

3. **Multi-device scenarios.** An edge deployment target may be a family of devices (MCU + mobile + server). Should a contract define per-device gate groups, or is the current `scenario`-tag approach sufficient?

4. **Artifact verification.** Should contract gates be expressible over artifact properties (e.g. `model.onnx size_bytes ≤ 4MB`) or only over logged scalar metrics?

5. **Cloud deployment target.** Where does the CEMI cloud backend run for team use — self-hosted only, or is Capicú operating a hosted instance? This determines auth provider requirements and SLA obligations.

---

## 12. Dependencies

| Dependency | Type | Notes |
|---|---|---|
| Python ≥ 3.9 | Runtime | Writer and CLI |
| `click ≥ 8.0` | Runtime | CLI framework |
| `rich ≥ 13.0` | Runtime | Terminal output |
| `requests ≥ 2.31` | Runtime | HTTP calls from CLI |
| `msal ≥ 1.0` | Runtime (cloud) | Azure AD auth; only exercised in cloud mode |
| `fastapi` | Backend | Cloud path API |
| `uvicorn` | Backend | ASGI server |
| React / Vite / TypeScript | Frontend | Workspace UI |
| `poppler` | Dev tooling | Needed to render PDFs in local dev (install with `brew install poppler`) |

---

## Appendix A: Relation to TMLR Submission

The TMLR paper *"Benchmarking Is Not Verification"* establishes the conceptual distinction that drives CEMI's contract system:

- **Benchmarking** produces a measured value (WER, latency p99, model size) under a specific experimental setup.
- **Verification** asserts that a measured value satisfies a stated criterion sufficient for a deployment decision.

CEMI operationalizes this by separating the data-recording layer (Writer + gateway + workspace) from the claim-evaluation layer (contract + decision layer + `cemi verify`). The paper argues that conflating the two leads to models that pass leaderboards but fail in production. CEMI's tooling makes the distinction auditable: a run either has a `contract_result` attesting to a verification decision, or it does not.

Product features in v0.2.0 (contract badge, `cemi verify` CLI) and v0.3.0 (CI integration, gate diff in Compare view) directly expose this distinction to practitioners.
