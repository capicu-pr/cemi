<img width="1200" height="480" alt="cemi-oss GitHub repo banner" src="https://github.com/user-attachments/assets/3a2a1965-2350-4e7c-aa06-00a82a153693"/>

<div align="center">
   <p align="center">
      <img alt="Tests" src="https://img.shields.io/badge/Tests-Passing-green?logo=github">
      <img alt="Python" src="https://img.shields.io/badge/Python-3.9%2B-blue?logo=python">
      <img alt="Platform" src="https://img.shields.io/badge/PyPI%20Package-v0.0.1-green?logo=pypi">
      <img alt="Stars" src="https://img.shields.io/github/stars/capicu-pr/cemi">
      <img alt="Forks" src="https://img.shields.io/github/forks/capicu-pr/cemi">
   </p>
</div>

# Capicú Edge ML Inference

Capicú Edge ML Inference (CEMI) is an Edge AI/TinyML experiment workspace managing and analyzing runs, comparisons, and explicit action-event streams across local and extensible testing of model compression and evaluation workflows.

`cemi-cli` is the packaged command-line distribution for Capicu Edge ML Inference (CEMI).

It provides the local-first workflow for:

- serving the CEMI workspace locally
- opening saved runs in the browser
- launching instrumented commands with CEMI environment wiring
- reading and serving run data from a shared local save directory

## What This Package Includes

| Component | Description |
| --- | --- |
| `cemi` CLI | Starts the local gateway, opens the workspace, and launches monitored commands |
| `cemi.writer` | Python APIs for logging runs, metrics, parameters, summaries, artifacts, and action events |
| Gateway | Reads run snapshots and artifacts from disk and serves the workspace UI |
| workspace | Bundled frontend served by the local gateway |

## Install

### From PyPI

```bash
pip install cemi-cli
```

### From source

From the repository root:

```bash
pip install -e ./cli
```

For local development and tests:

```bash
pip install -e "./cli[dev]"
pytest cli/tests/ -q
```

## Quickstart
### Minimal example

```python
from cemi.writer import create_writer

writer = create_writer(project="demo", log_dir=".cemi")
writer.start_run(name="baseline")
writer.log_parameter(key="learning_rate", value=0.001)
writer.log_metric(name="loss", value=0.42, step=1)
writer.log_summary_metrics({"final_accuracy": 0.95})
writer.emit_run_record()
writer.end_run(status="succeeded")
writer.emit_run_record()
```

Start the local gateway:

```bash
cemi gateway
```

Open the workspace:

```bash
cemi view
```

Or visit:

```text
http://127.0.0.1:3141/workspace
```

## Command Summary

| Command | Description |
| --- | --- |
| `cemi help` | Show the command list and general usage |
| `cemi config` | Display local CLI configuration |
| `cemi config set <key> <value>` | Persist supported local config values |
| `cemi gateway` | Start the local gateway and serve the embedded workspace |
| `cemi view` | Open the workspace without creating a run |
| `cemi start -- <cmd>` | Start the gateway if needed, open the workspace, and run a command with CEMI env vars injected |
| `cemi stop` | Stop background local services started by dev flows |

## Documentation

Visit https://docs.capicu.ai for more information.
