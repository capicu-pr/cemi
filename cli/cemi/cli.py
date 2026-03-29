"""CEMI CLI entrypoint and commands."""

from __future__ import annotations

import os
import subprocess
import sys
import threading
import time
import webbrowser
from pathlib import Path
import signal

import click
import requests
from rich.console import Console
from rich.table import Table
from rich.text import Text

# Rich consoles: stdout for normal output, stderr for errors (matches view startup style)
_console = Console()
_console_err = Console(stderr=True)

from .local_server import run_local_server

BANNER = r"""
   █████████  ██████████ ██████   ██████ █████
  ███▒▒▒▒▒███▒▒███▒▒▒▒▒█▒▒██████ ██████ ▒▒███ 
 ███     ▒▒▒  ▒███  █ ▒  ▒███▒█████▒███  ▒███ 
▒███          ▒██████    ▒███▒▒███ ▒███  ▒███ 
▒███          ▒███▒▒█    ▒███ ▒▒▒  ▒███  ▒███ 
▒▒███     ███ ▒███ ▒   █ ▒███      ▒███  ▒███ 
 ▒▒█████████  ██████████ █████     █████ █████
  ▒▒▒▒▒▒▒▒▒  ▒▒▒▒▒▒▒▒▒▒ ▒▒▒▒▒     ▒▒▒▒▒ ▒▒▒▒▒ 
                                              
                                              
                                              
"""


# Optional public docs/product URL shown in CLI help when configured.
CEMI_PRODUCT_URL = os.environ.get("CEMI_PRODUCT_URL", "").strip()
CLOSED_BETA_CLOUD_MESSAGE = (
    "Cloud actions are disabled in this build. "
    "Use the local gateway and workspace only."
)


def _print_banner() -> None:
    """Print CEMI ASCII banner (rich, bold cyan)."""
    _console.print(Text(BANNER.rstrip(), style="bold cyan"))


def _print_product_url() -> None:
    if CEMI_PRODUCT_URL:
        _console.print(
            Text(CEMI_PRODUCT_URL, style="cyan underline link " + CEMI_PRODUCT_URL)
        )


def _print_main_help() -> None:
    """Rich main help when no subcommand: banner, title, link, usage, hint."""
    _console.print(Text(BANNER.rstrip(), style="bold cyan"))
    _console.print()
    _console.print(Text("Capicú Edge ML Inference", style="bold cyan"))
    _print_product_url()
    _console.print()
    _console.print(Text("Usage: cemi [OPTIONS] COMMAND [ARGS]...", style="white"))
    _console.print(
        Text("Run ", style="dim")
        + Text("cemi --help", style="cyan")
        + Text(" for full help.", style="dim")
    )
    _console.print()


def _print_help_commands() -> None:
    """Rich help command: banner, title, link, commands table, hint."""
    _console.print(Text(BANNER.rstrip(), style="bold cyan"))
    _console.print()
    _console.print(Text("Capicú Edge ML Inference", style="bold cyan"))
    _print_product_url()
    _console.print()
    table = Table.grid(padding=(0, 2))
    table.expand = False
    table.add_column(style="white")
    commands = [
        ("config", "View or update CLI configuration (owner, logdir)"),
        ("start", "Start a local run, open workspace, run a command"),
        ("view", "Open the local workspace without starting a run"),
        ("gateway", "Start local gateway (read runs from .cemi/runs)"),
        ("stop", "Stop background local gateway and workspace frontend"),
    ]
    for cmd, desc in commands:
        table.add_row(Text("cemi " + cmd, style="cyan"), Text(desc, style="white"))
    _console.print(table)
    _console.print()
    _console.print(Text("Local-first note: cloud features are hidden in this build.", style="yellow"))
    _console.print()
    _console.print(
        Text("Run cemi <command> --help for command-specific help.", style="cyan")
    )
    _console.print()


def _pid_dir() -> Path:
    """Directory for tracking background process PIDs (gateway, frontend). Uses ~/.cemi/pids so cemi stop works from any cwd."""
    return Path.home() / ".cemi" / "pids"


def _write_user_only_text(path: Path, contents: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    try:
        os.chmod(path.parent, 0o700)
    except OSError:
        pass
    path.write_text(contents, encoding="utf-8")
    try:
        os.chmod(path, 0o600)
    except OSError:
        pass


def _write_pid(name: str, pid: int) -> None:
    try:
        _write_user_only_text(_pid_dir() / f"{name}.pid", str(pid))
    except Exception:
        # PID tracking is best-effort; never fail CLI because of it.
        pass


def _kill_from_pidfile(name: str) -> bool:
    """
    Attempt to terminate a background process recorded under name.

    Returns True if a kill was attempted, False if no PID file was found.
    """
    pid_file = _pid_dir() / f"{name}.pid"
    if not pid_file.is_file():
        return False
    try:
        raw = pid_file.read_text(encoding="utf-8").strip()
        pid = int(raw)
    except Exception:
        try:
            pid_file.unlink()
        except Exception:
            pass
        return False

    try:
        os.kill(pid, signal.SIGTERM)
    except ProcessLookupError:
        # Process already exited; treat as success.
        pass
    except Exception:
        # Ignore other kill errors; user can clean up manually if needed.
        pass

    try:
        pid_file.unlink()
    except Exception:
        pass
    return True


from .defaults import DEFAULT_GATEWAY_PORT, DEFAULT_SAVE_DIR, default_gateway_base_url


def _run_gateway_foreground(port: int, logdir: str | None, open_browser_after_sec: float = 0) -> None:
    """Run the local gateway in the current process. Optionally open browser after delay."""
    base = Path(logdir or DEFAULT_SAVE_DIR).expanduser().resolve()
    runs_path = base / "runs"
    artifacts_path = base / "artifacts"
    runs_path.mkdir(parents=True, exist_ok=True)
    artifacts_path.mkdir(parents=True, exist_ok=True)
    api_url = f"http://127.0.0.1:{port}"
    workspace_url = _workspace_url(port)
    _print_startup(
        api_url=api_url,
        workspace_url=workspace_url,
        log_dir=base,
        status="ready",
        mode="local",
    )
    if open_browser_after_sec > 0:
        def _open() -> None:
            time.sleep(open_browser_after_sec)
            webbrowser.open(_workspace_url(port))
        threading.Thread(target=_open, daemon=True).start()
    run_local_server(port=port, runs_dir=runs_path, artifacts_dir=artifacts_path)


def _get_local_gateway_url() -> str:
    return os.environ.get(
        "CEMI_LOCAL_SERVER_URL",
        default_gateway_base_url(),
    ).rstrip("/")


def _get_workspace_url_default_local() -> str:
    # Frontend dev server or built workspace; user can override via CEMI_WORKSPACE_URL.
    return os.environ.get("CEMI_WORKSPACE_URL", "http://localhost:5173/workspace")

def _get_workspace_url_embedded(gateway_url: str) -> str:
    return f"{gateway_url.rstrip('/')}/workspace"


def _ensure_workspace_frontend_background() -> None:
    """Best-effort: make sure the workspace frontend is running (npm run dev). Only works when running from repo, not from pip install."""
    url = _get_workspace_url_default_local()
    try:
        resp = requests.get(url, timeout=0.5)
        if resp.ok:
            return
    except Exception:
        pass

    try:
        # When installed from pip, __file__ is in site-packages; parents[2] is not the repo.
        repo_root = Path(__file__).resolve().parents[2]
        package_json = repo_root / "package.json"
        if not package_json.is_file():
            _console_err.print(
                Text(
                    "--dev-ui: No package.json found (run from repo root for dev UI). Using embedded workspace.",
                    style="yellow",
                )
            )
            return
        node_modules = repo_root / "node_modules"
        if not node_modules.is_dir():
            _console.print(
                Text(f"Installing workspace frontend dependencies (npm install) in {repo_root} ...", style="dim")
            )
            try:
                subprocess.check_call(
                    ["npm", "install"],
                    cwd=str(repo_root),
                )
            except Exception as e:
                _console_err.print(Text(f"Warning: npm install failed: {e}", style="yellow"))
                return
        _console.print(
            Text(f"Starting workspace frontend (npm run dev) in {repo_root} ...", style="dim")
        )
        frontend_env = os.environ.copy()
        frontend_env["VITE_API_BASE_URL"] = _get_local_gateway_url()
        frontend_env["VITE_USE_MOCK_DATA"] = "false"
        proc = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=str(repo_root),
            env=frontend_env,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        _write_pid("frontend", proc.pid)
    except Exception as e:
        click.echo(f"Warning: failed to auto-start workspace frontend: {e}", err=True)


def _ensure_local_gateway_background(*, logdir: str | None = None) -> str:
    """Best-effort: make sure a local gateway is running for the requested directory."""
    url = _get_local_gateway_url()
    health_url = f"{url}/api/health"
    want_dir = str(Path(logdir or DEFAULT_SAVE_DIR).expanduser().resolve())
    use_existing = True
    try:
        resp = requests.get(health_url, timeout=0.5)
        if resp.ok:
            try:
                data = resp.json()
                gateway_save_dir = data.get("save_dir")
                # Only reuse if we know the gateway is serving our directory; missing save_dir = old gateway, don't trust
                if gateway_save_dir and str(Path(gateway_save_dir).resolve()) == want_dir:
                    return url
                if gateway_save_dir:
                    click.echo(
                        f"Gateway is serving a different directory ({gateway_save_dir}) than requested ({want_dir}).",
                        err=True,
                    )
                else:
                    click.echo("Gateway on port 3141 did not report save_dir (old version?). Restarting for correct directory.", err=True)
                if _kill_from_pidfile("gateway"):
                    click.echo("Stopped the previous gateway. Waiting for port to be free ...", err=True)
                    for _ in range(15):
                        time.sleep(0.4)
                        try:
                            if not requests.get(health_url, timeout=0.3).ok:
                                break
                        except Exception:
                            break
                    click.echo("Starting a new gateway for your directory ...", err=True)
                    use_existing = False
                else:
                    click.echo(
                        "Stop the gateway using the port (e.g. run 'cemi stop', or find and kill the process on port 3141), then run your command again.",
                        err=True,
                    )
                    raise SystemExit(1)
            except SystemExit:
                raise
            except (ValueError, KeyError, TypeError):
                pass
            if use_existing:
                return url
    except SystemExit:
        raise
    except Exception:
        pass

    click.echo(f"Starting local gateway at {url} ...")
    try:
        cmd = ["cemi", "gateway"]
        if logdir:
            cmd += ["--logdir", logdir]
        # Use current cwd so .cemi resolves to the directory where the user ran cemi start
        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            cwd=os.getcwd(),
        )
        _write_pid("gateway", proc.pid)
    except Exception as e:
        click.echo(f"Warning: failed to auto-start local gateway: {e}", err=True)
        return url

    for _ in range(25):  # 25 * 0.2s = 5s max
        time.sleep(0.2)
        try:
            resp = requests.get(health_url, timeout=0.5)
            if resp.ok:
                try:
                    data = resp.json()
                    got_dir = data.get("save_dir")
                    if got_dir and str(Path(got_dir).resolve()) == want_dir:
                        click.echo(f"Gateway is serving: {want_dir}")
                        return url
                except (ValueError, KeyError, TypeError):
                    pass
        except Exception:
            pass
    click.echo("Warning: local gateway may not be ready or port 3141 is in use by another process. Run 'cemi stop', then try again.", err=True)
    return url


@click.group(
    invoke_without_command=True,
    context_settings=dict(help_option_names=["-h", "--help"]),
)
@click.pass_context
def app(ctx: click.Context) -> None:
    """CEMI — authenticate, create runs, and stream metrics."""
    if ctx.invoked_subcommand is None:
        _print_main_help()
        raise SystemExit(0)


@app.command("help")
def help_cmd() -> None:
    """Show help and usage (rich, same style as cemi view)."""
    _print_help_commands()


def _print_config_display(cfg: dict[str, str]) -> None:
    """Print config as rich table (same style as view startup)."""
    _console.print(Text("CEMI configuration", style="bold cyan"))
    _console.print(Text("~/.cemi/config.json", style="dim"))
    _console.print()
    table = Table.grid(padding=(0, 2))
    table.expand = False
    table.add_column(style="dim", width=10)
    table.add_column(style="white")
    table.add_row(
        Text("owner", style="dim"),
        Text(str(cfg.get("owner", "(not set)")), style="white"),
    )
    table.add_row(
        Text("logdir", style="dim"),
        Text(str(cfg.get("logdir", DEFAULT_SAVE_DIR)), style="white"),
    )
    _console.print(table)
    _console.print()


@app.group(invoke_without_command=True)
@click.pass_context
def config(ctx: click.Context) -> None:
    """View or update CEMI CLI configuration."""
    if ctx.invoked_subcommand is None:
        import json
        config_path = Path("~/.cemi/config.json").expanduser()
        cfg = {}
        if config_path.is_file():
            try:
                cfg = json.loads(config_path.read_text(encoding="utf-8"))
            except Exception:
                pass
        _print_config_display(cfg)


@config.command("set")
@click.argument("key", type=click.Choice(["owner", "logdir"]))
@click.argument("value")
def config_set(key: str, value: str) -> None:
    """Set a configuration value. Example: cemi config set owner 'John Doe'"""
    import json
    config_path = Path("~/.cemi/config.json").expanduser()
    cfg = {}
    if config_path.is_file():
        try:
            cfg = json.loads(config_path.read_text(encoding="utf-8"))
        except Exception:
            pass
    cfg[key] = value
    _write_user_only_text(config_path, json.dumps(cfg, indent=2) + "\n")
    _console.print(Text("Set ", style="dim") + Text(f"{key} = {value}", style="green bold"))


def _workspace_url(port: int) -> str:
    return f"http://127.0.0.1:{port}/workspace"


def _status_value(status: str) -> Text:
    """Return colored status badge for rich table."""
    if status.lower() == "ready":
        return Text.assemble(("● ", "green"), (status, "bold green"))
    if status.lower() in {"starting", "initializing"}:
        return Text.assemble(("● ", "yellow"), (status, "bold yellow"))
    if status.lower() in {"error", "failed"}:
        return Text.assemble(("● ", "red"), (status, "bold red"))
    return Text.assemble(("● ", "cyan"), (status, "bold cyan"))


def _field_row(label: str, value: str | Text) -> tuple[Text, Text]:
    """Return (label, value) pair for rich table; value can be str or Text."""
    return (
        Text(label, style="dim"),
        value if isinstance(value, Text) else Text(str(value), style="white"),
    )


def _print_startup(
    api_url: str,
    workspace_url: str,
    log_dir: Path,
    status: str = "ready",
    mode: str = "foreground",
) -> None:
    """Print rich startup block: banner, product name, link, and status table."""
    _console.print(Text(BANNER.rstrip(), style="bold cyan"))
    _console.print()
    _console.print(Text("Capicú Edge ML Inference", style="bold cyan"))
    _print_product_url()
    _console.print()

    table = Table.grid(padding=(0, 2))
    table.expand = False
    table.add_column(style="dim", width=10)
    table.add_column(style="white")

    rows = [
        _field_row("Status", _status_value(status)),
        _field_row("Mode", Text(mode, style="white")),
        _field_row("API", api_url),
        _field_row("Workspace", workspace_url),
        _field_row("Log dir", str(log_dir)),
    ]
    for label, value in rows:
        table.add_row(label, value)

    _console.print(table)
    _console.print()
    _console.print(Text("Press Ctrl+C (or Cmd+C on Mac) to stop.", style="yellow"))


def _run_gateway(port: int, logdir: str | None) -> None:
    """Run the local gateway in the foreground (no browser open)."""
    _run_gateway_foreground(port=port, logdir=logdir, open_browser_after_sec=0)


# Keep a hidden placeholder so older internal notes/scripts fail with a clear beta-only message.
def _exit_cloud_disabled() -> None:
    _console_err.print(Text(CLOSED_BETA_CLOUD_MESSAGE, style="yellow"))
    raise SystemExit(1)


@app.command()
@click.option("--port", "-p", default=DEFAULT_GATEWAY_PORT, help="Port for the local gateway server.")
@click.option("--save-dir", "--logdir", type=click.Path(exists=False, path_type=str), default=None, help="Base directory for runs/ and artifacts/ (default: .cemi). Same path as log_dir in create_writer().")
def gateway(port: int, save_dir: str | None) -> None:
    """Start local gateway. Reads runs from save_dir/runs/ and serves the workspace at /workspace.

    No auth required. Run 'cemi view' to open the workspace, or open http://127.0.0.1:PORT/workspace.
    """
    _run_gateway(port=port, logdir=save_dir)


@app.command(hidden=True)
def auth() -> None:
    """Hidden placeholder for disabled cloud auth in the local-first package."""
    _exit_cloud_disabled()


@app.command()
def stop() -> None:
    """
    Stop background local services started by 'cemi start' or 'cemi view'.

    - Kills the background local gateway process (if any).
    - Kills the background workspace frontend dev server (if any).

    This is only about local processes used by the local-first package.
    """
    stopped_any = False

    if _kill_from_pidfile("gateway"):
        _console.print(Text("Stopped local gateway.", style="green"))
        stopped_any = True

    if _kill_from_pidfile("frontend"):
        _console.print(Text("Stopped workspace frontend dev server.", style="green"))
        stopped_any = True

    if not stopped_any:
        _console.print(
            Text("No background CEMI processes found (gateway/frontend).", style="dim")
        )


@app.command()
@click.option("--save-dir", "--logdir", type=click.Path(exists=False, path_type=str), default=None, help="Base directory for runs/ and artifacts/ (default: .cemi). Must match gateway and Writer log_dir.")
@click.option("--dev-ui", is_flag=True, help="Use the workspace dev server (requires Node/Vite).")
def view(save_dir: str | None = None, dev_ui: bool = False) -> None:
    """Open the CEMI workspace without creating a run.

    Runs the gateway in the foreground (like Jupyter), shows the workspace
    URL and log directory, opens the browser, and blocks until you press Ctrl+C to stop.
    With --dev-ui, starts the gateway in the background and opens the dev server instead.
    """
    if dev_ui:
        gateway_url = _ensure_local_gateway_background(logdir=save_dir)
        workspace_url = _get_workspace_url_default_local()
        table = Table.grid(padding=(0, 2))
        table.add_column(style="dim", width=16)
        table.add_column(style="white")
        table.add_row(Text("Local gateway", style="dim"), Text(gateway_url, style="white"))
        table.add_row(Text("Workspace (local)", style="dim"), Text(workspace_url, style="cyan"))
        _console.print(table)
        _ensure_workspace_frontend_background()
        webbrowser.open(workspace_url)
        return

    # Run gateway in foreground (Jupyter-style): show info, open browser, block until Ctrl+C
    _run_gateway_foreground(
        port=DEFAULT_GATEWAY_PORT,
        logdir=save_dir,
        open_browser_after_sec=1.5,
    )


@app.command()
@click.option("--project", "-p", help="Project name.")
@click.option("--name", "-n", help="Run name.")
@click.option("--save-dir", "--logdir", type=click.Path(exists=False, path_type=str), default=None, help="Base directory for runs/ and artifacts/ (default: .cemi). Set CEMI_SAVE_DIR for the child process.")
@click.option("--dev-ui", is_flag=True, help="Use the workspace dev server (requires Node/Vite).")
@click.argument("cmd", nargs=-1)
def start(
    project: str | None = None,
    name: str | None = None,
    save_dir: str | None = None,
    dev_ui: bool = False,
    cmd: tuple[str, ...] = (),
) -> None:
    """Create a run, open workspace, then run a command with env injected.

    Closed beta note: this build is local-only. Writer logs to local files and
    the local gateway, and the CLI opens the local workspace.

    Example: cemi start -- python train.py
    """
    import uuid as _uuid

    # Require a command so we don't open the browser and then fail
    cmd_list = list(cmd)
    if cmd_list and cmd_list[0] == "--":
        cmd_list = cmd_list[1:]
    if not cmd_list:
        _console_err.print(
            Text("No command given. Example: cemi start -- python train.py", style="red")
        )
        raise SystemExit(1)

    gateway_url = _ensure_local_gateway_background(logdir=save_dir)
    run_id = f"local-{_uuid.uuid4().hex[:12]}"
    workspace_url = _get_workspace_url_default_local() if dev_ui else _get_workspace_url_embedded(gateway_url)
    _console.print(Text("Local gateway: ", style="dim") + Text(gateway_url, style="white"))

    _console.print(Text("Workspace: ", style="dim") + Text(workspace_url, style="cyan"))
    _console.print(
        Text("CEMI is monitoring this run. Metrics will appear in the workspace. ", style="dim")
        + Text("Run ID: ", style="dim")
        + Text(run_id, style="cyan bold")
    )
    if dev_ui:
        _ensure_workspace_frontend_background()
    webbrowser.open(workspace_url)

    env = os.environ.copy()
    env["CEMI_PROJECT_ID"] = project or "default"
    env["CEMI_RUN_ID"] = run_id
    if save_dir:
        env["CEMI_SAVE_DIR"] = save_dir
    env["CEMI_LOCAL_SERVER_URL"] = gateway_url
    raise SystemExit(subprocess.call(cmd_list, env=env))


def main_entry() -> None:
    """Entry point for the 'cemi' console script."""
    app()


def main() -> None:
    main_entry()


if __name__ == "__main__":
    main_entry()
