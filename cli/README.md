# CEMI CLI

## Install

### From PyPI

The recommended public distribution is the published package from PyPI:

```bash
pip install cemi-cli
```

This is the preferred install path because it:

- avoids a source checkout
- avoids requiring Node/Vite on tester machines
- installs the exact published CLI package

### From source (developer install only)

Install locally (from repo root):

```bash
pip install -e ./cli
```

## Local-only quick start (canonical flow)

1. **Install**: install from PyPI with `pip install cemi-cli`, or use `pip install -e ./cli` for development.
2. **In your script**: `create_writer(project="...", log_dir="...")` — runs go to `log_dir/runs/`, artifacts to `log_dir/artifacts/`. Default `log_dir` is `.cemi`.
3. **Start the gateway** (same path as `log_dir`): `cemi gateway` or `cemi gateway --save-dir /path/to/log_dir`.
4. **Open the workspace**: `cemi view` or open `http://127.0.0.1:3141/workspace`. No login; runs and metrics appear in the UI.

**Contract**: Writer and gateway must use the same directory: Writer writes `log_dir/runs/<run_id>.jsonl` and `log_dir/artifacts/<run_id>/...`; gateway reads that directory via `--save-dir` (default `.cemi`).

**Defaults (local):** Default directory is `.cemi` (current working directory). Default gateway port is `3141`. Default project is `default`. To use another directory, pass the same path to `create_writer(log_dir=...)` and `cemi gateway --save-dir <path>`.

**Custom port:** If you run `cemi gateway -p 3142`, set `CEMI_LOCAL_SERVER_URL=http://127.0.0.1:3142` so the Writer's artifact URLs (from `add_local_file_artifact`) point to the same server. Otherwise the UI may 404 when loading artifacts.

**Verify install:** From repo root: `pip install -e ./cli && pip install -e './cli[dev]' && pytest cli/tests/ -q` to run tests.

**Troubleshooting:** For common issues (no runs, artifact 404, custom port), see the root README **Troubleshooting** section.

---

## Monitoring another repo (e.g. compression-engine)

If you have a separate training or compression repo (e.g. **compression-engine** with MNIST benchmarks, PTQ, QAT), you can monitor its experiments in CEMI by adding only **Writer calls** to your existing code—no new training recipes.

**Compression-engine (actual repo):** Entry point is `python -m engine.main --config <config.yaml>` with optional `--log-dir .cemi`. The YAML config sets `benchmark.models` (e.g. resnet18, mobilenetv2, vit-tiny) and `benchmark.compression.method` (ptq or qat). One run creates one CEMI run per model. Example configs: `benchmark_config_cemi_test.yaml`, `benchmark_config_PTQ.yaml`, `benchmark_config_QAT.yaml`.

### What to add in the training repo (only Writer calls)

1. **Create a writer** — Either:
   - `create_writer(project="...", log_dir=...)` with `log_dir` from your script’s CLI arg (e.g. `--log-dir`, default `.cemi`), or
   - When run under `cemi start`, use `create_writer_from_env()` so the script uses `CEMI_SAVE_DIR` and `CEMI_RUN_ID` set by the CLI.
2. **Per run** — In your existing training/inference loop:
   - `start_run(name=..., tags=...)` (e.g. tags: `method=ptq`, `method=qat`, `model=resnet18`).
   - `log_parameter` and `log_metric` in the same places you already compute them.
   - `add_local_file_artifact(path=..., kind="model")` for ONNX or checkpoints so the UI can serve them.
   - `log_summary_metrics(...)`, `end_run(status="succeeded"|"failed")`, `emit_run_record()`.

Do not wire a new training recipe; only instrument existing loops.

### How to run (pip user, minimal env)

Run from your **compression-engine repo** directory (where your training/benchmark script lives). No CEMI repo script to run—your code does the training; CEMI only records it.

- **Option A — Gateway and view first, then run your script:**  
  Terminal 1: `cemi gateway --save-dir .cemi` (or `cemi view --save-dir .cemi` to start gateway and open UI).  
  Terminal 2: `python -m engine.main --config benchmark_config_cemi_test.yaml --log-dir .cemi`

- **Option B — One command (gateway + UI + your script):**  
  `cemi start --save-dir .cemi --project compression-engine -- python -m engine.main --config benchmark_config_cemi_test.yaml`  
  Your script uses `create_writer_from_env()` so it picks up `CEMI_SAVE_DIR` and `CEMI_RUN_ID`; no need to pass `--log-dir` when run via `cemi start`.

### Success criteria

Run **your** training/benchmark script from the compression-engine repo (the code that runs is in that repo, not in CEMI). Three runs (e.g. 3 models on MNIST, one PTQ, one QAT) should appear in the CEMI workspace with metrics and artifacts. Use the same `log_dir` / `--save-dir` for the Writer and the gateway.

**Where to run:** From the **compression-engine repo** directory: `cemi start --save-dir .cemi --project compression-engine -- python -m engine.main --config benchmark_config_cemi_test.yaml`. Config sets models and compression method (ptq/qat); one CEMI run per model. CEMI does not provide a separate “demo run” script—you run your existing code with writer calls added.

---

## Package behavior

This package is intentionally local-only by default.

| Command | Auth required? | Data destination |
|---------|----------------|------------------|
| `cemi start -- python train.py` | No | Local files under `save_dir` plus the local gateway |
| `cemi view` | No | Opens the local workspace UI pointing at the local gateway |
| `cemi gateway` | No | Serves the local workspace and reads local run/artifact files |
| `cemi stop` | No | Stops local background services started by the CLI |

---

## Local-first flow (no account)

1. Install the CLI and add the Writer to your training script (see **Writer usage** below).
2. Start a run with your script:
   - `cemi start -- python train.py` — Ensures a local gateway is available, sets a local run id, wires env vars, and opens the workspace UI.

In local mode, the workspace UI is served directly by the gateway at:

- `http://127.0.0.1:3141/workspace`

When the workspace UI calls `GET /api/health` on the configured `VITE_API_BASE_URL`, the local gateway responds with:

```json
{ "status": "ok", "mode": "local" }
```

This tells the UI to **skip any login flow** and go straight to the `/workspace` area to visualize your local runs.

No login required; everything stays on your machine.

---

## Retroactive local viewing (job already running)

If your training/validation job is **already running** and writing to a directory, use the same path for the gateway:

- Your code uses `create_writer(project="...", log_dir="/path/to/dir")` so events are in `log_dir/runs/<run_id>.jsonl` and `log_dir/artifacts/<run_id>/...`.
- Later (in another terminal, or a machine that can read that directory), start the gateway with the same path: `cemi gateway --save-dir /path/to/dir`, then `cemi view` or open `http://127.0.0.1:3141/workspace`.

Example:

```python
from cemi.writer import create_writer

writer = create_writer(project="demo", log_dir="/tmp/cemi-demo")
writer.start_run(name="retroactive-demo")
writer.log_metric(name="loss", value=0.5, step=1)
writer.emit_run_record()
```

Then later:

```bash
cemi gateway --save-dir /tmp/cemi-demo
cemi view
```

---

## Environment variables

**For local-only use:** none required. Prefer passing `log_dir` to `create_writer(project, log_dir)` so your script and the gateway share the same directory. Optional env vars (used by `create_writer_from_env()` and `cemi start`):

- **CEMI_SAVE_DIR** — Base directory for runs and artifacts; same as `log_dir` in `create_writer`. Gateway `--save-dir` should match.
- **CEMI_LOCAL_DIR** — Override for run JSONL directory (default: `<log_dir>/runs`).
- **CEMI_ARTIFACTS_DIR** — Override for artifacts (default: `<log_dir>/artifacts`).
- **CEMI_LOCAL_SERVER_URL** — URL of the local gateway if you want the Writer to stream live to `cemi gateway`.
- **CEMI_SINK** — Local sink selection such as `local` or `local+local_server`.

---

## Usage

```bash
cemi                    # welcome banner + usage
cemi help               # help and usage
cemi config             # show local config
cemi start -- python train.py
                        # local run: ensure gateway, open workspace UI, run your command
cemi view               # open local workspace UI (no run created)
cemi gateway            # start local gateway server (read .cemi/runs, accept POST /api/events)
cemi gateway --save-dir /path/to/save_dir
                        # retroactive local: read /path/to/save_dir/runs and serve /path/to/save_dir/artifacts
cemi view --save-dir /path/to/save_dir
                        # open workspace UI for that directory (gateway must use same path)
cemi view --dev-ui       # use Vite dev server for workspace (only when running from repo; after pip install use embedded workspace)
cemi --help              # full CLI help
```

---

## Writer usage

**Local-only (recommended):** use `create_writer(project, log_dir)` so runs and artifacts go to `log_dir/runs/` and `log_dir/artifacts/`. Use the same path with `cemi gateway --save-dir <log_dir>` so the workspace can read them.

```python
from cemi.writer import create_writer

writer = create_writer(project="my-project", log_dir=".cemi")  # default log_dir is .cemi
writer.start_run(name="My run")
writer.log_parameter(key="learning_rate", value=0.001)
writer.log_metric(name="loss", value=0.5, step=1)
writer.log_summary_metrics({"final_accuracy": 0.95})
writer.emit_run_record()
writer.end_run(status="succeeded")
writer.emit_run_record()
```

**With CLI:** when you run `cemi start -- python train.py`, the CLI sets `CEMI_RUN_ID`, `CEMI_PROJECT_ID`, `CEMI_SAVE_DIR`, and `CEMI_LOCAL_SERVER_URL`. Use `create_writer_from_env()` so the Writer uses those env vars and the same local directory as the gateway.

---

## Local data and operations

### What gets written to disk

- Run snapshots are appended as JSONL under `save_dir/runs/<run_id>.jsonl`.
- Copied artifacts are stored under `save_dir/artifacts/<run_id>/`.
- Local CLI config is stored under `~/.cemi/config.json`.
- PID files used by `cemi stop` are stored under `~/.cemi/pids/`.

### Where files live by default

- If you do not pass `log_dir` or `--save-dir`, the default save directory is `.cemi` in the current working directory.
- The default layout is:

```text
.cemi/
  runs/
  artifacts/
```

- Per-user local state lives under `~/.cemi/`.

### Artifact sensitivity

Artifacts may include model binaries, checkpoints, reports, or copied local files.
Treat `add_local_file_artifact()` as publishing that file to anyone who can access
your local gateway on your machine. Do not attach secrets, credentials, private
datasets, or files you would not want copied into the artifact store.

### Gateway bind address

The gateway should stay bound to `127.0.0.1` only. It is
intended for local use on the same machine and should not be exposed on a LAN
or public interface.

### Browser behavior

- `cemi view` opens the browser automatically after the local gateway starts.
- `cemi start` opens the browser automatically before it launches your command.
- `cemi gateway` does not open the browser by itself.

### Stop background processes

Use:

```bash
cemi stop
```

This stops background gateway/frontend processes started by `cemi start --dev-ui`
or `cemi view --dev-ui`.

### Clear old state

To clear old local run data for the current project directory:

```bash
rm -rf .cemi
```

To clear per-user CLI state:

```bash
rm -rf ~/.cemi
```

Only do this if you are sure you no longer need the saved runs, artifacts, config,
or PID files.

### Reset a broken local setup

1. Run `cemi stop`.
2. Remove stale project state with `rm -rf .cemi` if needed.
3. Remove per-user state with `rm -rf ~/.cemi` if config or PID files are stale.
4. Reinstall the published package from PyPI.

### Uninstall

```bash
pip uninstall cemi-cli
```

If you also want to remove local state, delete `.cemi` in your project directory
and `~/.cemi` in your home directory.

---

## Model PTQ (ONNXRuntime) quickstart (local)

This is a quick local path for **baseline vs INT8 PTQ** monitoring.

### 0) Install the CLI (one-time)

From repo root:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e ./cli
```

### 1) Start the local gateway

Terminal A:

```bash
export CEMI_LOCAL_DIR=".cemi/runs"
export CEMI_ARTIFACTS_DIR=".cemi/artifacts"
cemi gateway
```

### 2) Open the embedded workspace UI

In a browser, open:

- `http://127.0.0.1:3141/workspace`

Or run:

```bash
cemi view
```

### 3) Log two runs (baseline + int8 PTQ) with ONNX artifacts

Terminal C (repo root, venv active):

```bash
# Baseline
python3 scripts/model_ptq_onnxrt_demo.py \
  --variant baseline \
  --model-onnx /path/to/baseline.onnx \
  --summary-metric accuracy=0.765 \
  --summary-metric loss=0.42 \
  --summary-metric energy_j=12.5

# INT8 PTQ
python3 scripts/model_ptq_onnxrt_demo.py \
  --variant int8_ptq \
  --model-onnx /path/to/int8_ptq.onnx \
  --summary-metric accuracy=0.753 \
  --summary-metric loss=0.45 \
  --summary-metric energy_j=10.9
```

What you get:
- Runs appear in the workspace Runs table immediately (local-only).
- You can open a run and the **Graph** tab will load the `.onnx` artifact in the Netron viewer (fetched from the local gateway).
- Latency samples / throughput will be logged automatically if `onnxruntime` + `numpy` are installed; otherwise you can log your own metrics from your training loop using the Writer.

