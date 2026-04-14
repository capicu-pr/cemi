"""Tests for `cemi verify` command.

Covers: all-pass, single-fail, missing metric, bad contract file, bad run file,
JSON output format, and direct .jsonl path resolution.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest
from click.testing import CliRunner

from cemi.cli import app
from cemi.writer import Writer


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


class _CollectSink:
    def __init__(self) -> None:
        self.records: list[dict] = []

    def write(self, record: dict) -> None:
        self.records.append(record)


def _write_run_jsonl(path: Path, summary_metrics: dict) -> None:
    """Write a minimal run_record JSONL file using the Writer."""
    sink = _CollectSink()
    w = Writer(sink=sink, project="test", save_dir=path.parent.parent)
    w.start_run(name="test-run", run_id=path.stem)
    w.log_summary_metrics(summary_metrics)
    record = w.emit_run_record()
    w.end_run(status="succeeded")
    w.emit_run_record()
    # Replay sink records to the file
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        for rec in sink.records:
            f.write(json.dumps(rec) + "\n")


def _write_contract(path: Path, gates: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    contract = {
        "contract_id": "test-contract",
        "name": "Test Contract",
        "version": "0",
        "gates": gates,
    }
    path.write_text(json.dumps(contract), encoding="utf-8")


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


def test_verify_all_pass(tmp_path: Path) -> None:
    run_id = "run-pass-001"
    run_file = tmp_path / "runs" / f"{run_id}.jsonl"
    _write_run_jsonl(run_file, {"final_accuracy": 0.95, "latency_ms": 80.0})

    contract_file = tmp_path / "contract.json"
    _write_contract(
        contract_file,
        gates=[
            {
                "id": "accuracy_gate",
                "role": "quality",
                "metric": {"name": "final_accuracy", "source": "summary_metrics"},
                "direction": "higher_is_better",
                "absolute": {"min": 0.90},
            },
            {
                "id": "latency_gate",
                "role": "performance",
                "metric": {"name": "latency_ms", "source": "summary_metrics"},
                "direction": "lower_is_better",
                "absolute": {"max": 100.0},
            },
        ],
    )

    runner = CliRunner()
    result = runner.invoke(
        app,
        ["verify", "--contract", str(contract_file), "--run", run_id, "--save-dir", str(tmp_path)],
    )
    assert result.exit_code == 0, result.output
    assert "PASS" in result.output


def test_verify_one_fail(tmp_path: Path) -> None:
    run_id = "run-fail-001"
    run_file = tmp_path / "runs" / f"{run_id}.jsonl"
    _write_run_jsonl(run_file, {"final_accuracy": 0.85, "latency_ms": 80.0})

    contract_file = tmp_path / "contract.json"
    _write_contract(
        contract_file,
        gates=[
            {
                "id": "accuracy_gate",
                "role": "quality",
                "metric": {"name": "final_accuracy", "source": "summary_metrics"},
                "direction": "higher_is_better",
                "absolute": {"min": 0.90},
            },
        ],
    )

    runner = CliRunner()
    result = runner.invoke(
        app,
        ["verify", "--contract", str(contract_file), "--run", run_id, "--save-dir", str(tmp_path)],
    )
    assert result.exit_code == 1
    assert "FAIL" in result.output


def test_verify_missing_metric_fails_gate(tmp_path: Path) -> None:
    """A gate whose metric is absent in the run should fail with missing_metric_value."""
    run_id = "run-no-metric"
    run_file = tmp_path / "runs" / f"{run_id}.jsonl"
    _write_run_jsonl(run_file, {"other_metric": 1.0})  # accuracy not logged

    contract_file = tmp_path / "contract.json"
    _write_contract(
        contract_file,
        gates=[
            {
                "id": "accuracy_gate",
                "role": "quality",
                "metric": {"name": "final_accuracy", "source": "summary_metrics"},
                "direction": "higher_is_better",
                "absolute": {"min": 0.90},
            },
        ],
    )

    runner = CliRunner()
    result = runner.invoke(
        app,
        ["verify", "--contract", str(contract_file), "--run", run_id, "--save-dir", str(tmp_path)],
    )
    assert result.exit_code == 1
    # Rich may truncate cell content; check the stable prefix that survives column-width truncation.
    assert "missing_met" in result.output


def test_verify_run_not_found_exits_2(tmp_path: Path) -> None:
    contract_file = tmp_path / "contract.json"
    _write_contract(contract_file, gates=[])

    runner = CliRunner()
    result = runner.invoke(
        app,
        ["verify", "--contract", str(contract_file), "--run", "nonexistent-run", "--save-dir", str(tmp_path)],
    )
    assert result.exit_code == 2


def test_verify_direct_jsonl_path(tmp_path: Path) -> None:
    run_id = "run-direct-path"
    run_file = tmp_path / "custom_dir" / f"{run_id}.jsonl"
    _write_run_jsonl(run_file, {"final_accuracy": 0.99})

    contract_file = tmp_path / "contract.json"
    _write_contract(
        contract_file,
        gates=[
            {
                "id": "accuracy_gate",
                "role": "quality",
                "metric": {"name": "final_accuracy", "source": "summary_metrics"},
                "direction": "higher_is_better",
                "absolute": {"min": 0.95},
            },
        ],
    )

    runner = CliRunner()
    result = runner.invoke(
        app,
        ["verify", "--contract", str(contract_file), "--run", str(run_file)],
    )
    assert result.exit_code == 0, result.output


def test_verify_json_output_schema(tmp_path: Path) -> None:
    run_id = "run-json-out"
    run_file = tmp_path / "runs" / f"{run_id}.jsonl"
    _write_run_jsonl(run_file, {"final_accuracy": 0.95})

    contract_file = tmp_path / "contract.json"
    _write_contract(
        contract_file,
        gates=[
            {
                "id": "accuracy_gate",
                "role": "quality",
                "metric": {"name": "final_accuracy", "source": "summary_metrics"},
                "direction": "higher_is_better",
                "absolute": {"min": 0.90},
            },
        ],
    )

    runner = CliRunner()
    result = runner.invoke(
        app,
        [
            "verify",
            "--contract", str(contract_file),
            "--run", run_id,
            "--save-dir", str(tmp_path),
            "--output", "json",
        ],
    )
    assert result.exit_code == 0, result.output
    data = json.loads(result.output)
    assert data["verdict"] == "pass"
    assert "gates" in data
    assert data["gates"][0]["id"] == "accuracy_gate"
    assert data["gates"][0]["verdict"] == "pass"


def test_verify_json_output_to_file(tmp_path: Path) -> None:
    run_id = "run-json-file"
    run_file = tmp_path / "runs" / f"{run_id}.jsonl"
    _write_run_jsonl(run_file, {"final_accuracy": 0.80})

    contract_file = tmp_path / "contract.json"
    _write_contract(
        contract_file,
        gates=[
            {
                "id": "accuracy_gate",
                "role": "quality",
                "metric": {"name": "final_accuracy", "source": "summary_metrics"},
                "direction": "higher_is_better",
                "absolute": {"min": 0.90},
            },
        ],
    )

    out_file = tmp_path / "result.json"
    runner = CliRunner()
    result = runner.invoke(
        app,
        [
            "verify",
            "--contract", str(contract_file),
            "--run", run_id,
            "--save-dir", str(tmp_path),
            "--output", "json",
            "--output-file", str(out_file),
        ],
    )
    assert result.exit_code == 1  # accuracy 0.80 < 0.90 threshold
    assert out_file.is_file()
    data = json.loads(out_file.read_text())
    assert data["verdict"] == "fail"
