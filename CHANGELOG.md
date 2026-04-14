# Changelog

All notable changes to CEMI are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Releases follow [Semantic Versioning](https://semver.org/).
Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/).

---

## [Unreleased]

### Added
- `writer.log_contract_result(result)`: attaches a contract verification result to the
  active run; included in the next `emit_run_record()` call under `payload.contract_result`.
  Resets automatically when `start_run()` is called for a new run.
- `cemi verify` command: evaluates a recorded run against a contract JSON file and
  reports pass/fail for each gate using the existing `evaluate_contract()` engine.
  - Accepts `--contract FILE`, `--run RUN_ID_OR_PATH`, `--save-dir DIR`.
  - Exits `0` (all pass), `1` (any gate fails), `2` (input/parse error) — suitable for CI.
  - `--output json` emits a machine-readable result; `--output-file FILE` writes it to disk.
- `load_run_for_evaluation(path)` public function in `cemi.contract`: loads the latest
  `run_record` from a JSONL file with normalization for both v1 and v2 payload schemas.

### Fixed
- `cemi help` now lists the `verify` command.

---

## [0.1.2] — 2026-03-30

### Added
- Initial PyPI release of `cemi-cli`.
- Python Writer API (`create_writer`, `start_run`, `log_metric`, `log_summary_metrics`,
  `log_scalar`, `add_local_file_artifact`, `emit_run_record`, `end_run`).
- Local gateway (`cemi gateway`) serving workspace UI from JSONL run files.
- CLI commands: `gateway`, `view`, `start`, `stop`, `config`.
- Workspace UI (React/Vite): Runs table, Compare view, Console action-event stream.
- Contract evaluation engine (`contract.py`, `decision_layer.py`) with gate types:
  absolute min/max, relative degradation, p-quantile aggregation, cost derivation.
- Data contract v2: JSONL `run_record` with `metrics.events`, `metrics.summary`,
  `artifacts`, `parameters`, `tags`, `context`.
