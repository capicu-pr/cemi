# ADR-0001: `cemi verify` Command Design

**Date:** 2026-04-09
**Status:** Accepted
**Deciders:** Sebastián A. Cruz Romero, Shenied E. Maldonado Guerra

---

## Context

CEMI's contract evaluation engine (`evaluate_contract` in `contract.py`) was implemented
before any CLI surface exposed it. A run could be recorded and a contract could be
authored, but there was no supported way to evaluate one against the other outside of
Python code.

The TMLR paper *"Benchmarking Is Not Verification"* establishes that benchmark scores and
deployment verification are structurally different claims. CEMI needs to operationalize
this distinction in the CLI so that:

1. A practitioner can evaluate a run against a contract in a single command.
2. A CI job can gate a PR or pipeline on the contract result using an exit code.
3. The result is machine-readable so it can be embedded in reports or downstream tools.

---

## Decision

Add a `cemi verify` command that:

- Accepts `--contract FILE` (required) and `--run RUN_ID_OR_PATH` (required).
- Resolves the run by ID from `<save-dir>/runs/<run_id>.jsonl`, or accepts a direct `.jsonl`
  path so users can verify runs outside the default save directory.
- Calls the existing `evaluate_contract()` engine without modification.
- Renders a rich table to stdout for human use (`--output text`, default).
- Emits a structured JSON result for CI/automation (`--output json`).
- Exits `0` (all gates pass), `1` (any gate fails), `2` (input or parse error).

Add `load_run_for_evaluation(path)` as a public function in `contract.py` to:
- Parse the JSONL and return the latest `run_record` payload.
- Normalize v2 payloads (`run_id` → `id`, `metrics.summary` → `summary_metrics` dict,
  `metrics.events` → flat `metrics` list) so `evaluate_contract()` works correctly with
  both schema versions without modification.

---

## Alternatives Considered

**Import `_load_run_from_jsonl` from `local_server.py`.**
Rejected. That function is private, HTTP-server-specific (normalizes for the workspace UI),
and imports would create a dependency from the evaluation path into the HTTP layer. The
verify command needs a lighter normalization path that does not touch UI concerns.

**Add the loader directly inside the `verify` command.**
Rejected. Other callers (future `cemi run-and-verify`, Python API users) benefit from a
public function in the contract module. Keeping it there is consistent with where the
evaluation engine lives.

**Separate `cemi contract eval` subcommand structure.**
Deferred. A `cemi contract` subgroup may make sense at v1.0 when more contract management
commands exist. For now a flat `verify` command is simpler and matches the user's mental
model ("I want to verify this run").

---

## Consequences

- `cemi verify` is immediately usable in CI without any additional infrastructure.
- `load_run_for_evaluation` is a stable public API surface; it should be treated as such
  in future refactors of `contract.py`.
- The v1/v2 normalization in `load_run_for_evaluation` must be kept in sync with the
  data contract specification in `cli/cemi/contract.md`. If the contract schema evolves
  to v3, this function is the right place to add the new normalization branch.
- Exit code `1` on gate failure is a deliberate design: it makes `cemi verify` composable
  with `&&` chains and CI step failure conditions without wrapping scripts.
