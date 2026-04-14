"""cemi.monitor — Runtime Qualification Loop (Algorithm 2, RuntimeQualify).

Provides sequential drift detection and a three-way controller for continuous
monitoring of deployed compressed models. No external dependencies; pure Python
standard library only, suitable for Cortex-M class edge devices.

Usage::

    from cemi.monitor import RuntimeMonitor

    monitor = RuntimeMonitor(
        target_mean=0.05,    # nominal loss mean
        slack=0.01,          # CUSUM allowable slack (k)
        warn_threshold=3.0,  # CUSUM statistic threshold for WARN state
        requalify_threshold=5.0,  # CUSUM statistic threshold for REQUALIFY state
    )
    monitor.register_requalify_hook(lambda ctx: dispatch_ota_update(ctx))

    # In your inference loop:
    for batch in dataloader:
        loss = model.infer(batch)
        prev_state, new_state = monitor.update(loss)
        if new_state != prev_state:
            print(f"State transition: {prev_state} → {new_state}")

See also: ``Writer.attach_monitor()``, ``Writer.log_inference_event()``
"""

from __future__ import annotations

import math
from collections import deque
from typing import Any, Callable, Dict, List, Literal, Optional, Tuple


ControllerState = Literal["NOMINAL", "WARN", "REQUALIFY"]

_WARN = "WARN"
_NOMINAL = "NOMINAL"
_REQUALIFY = "REQUALIFY"


class CUSUMDetector:
    """Page's Cumulative Sum (CUSUM) sequential change detector.

    Detects abrupt shifts in the mean of a stream of scalar values using
    two one-sided test statistics:

    .. code-block:: text

        C+_t = max(0, C+_{t-1} + (x_t − μ₀ − k))   # upper: mean increase
        C-_t = max(0, C-_{t-1} − (x_t − μ₀ + k))   # lower: mean decrease

    Alert fires when ``max(C+, C-) > h``.

    Memory footprint: O(1) — five floats, one int.

    Args:
        target_mean: Nominal (in-control) mean ``μ₀`` of the signal.
        slack: Allowable slack ``k``.  Smaller values increase sensitivity
            to small shifts at the cost of more false positives.
        threshold: Decision threshold ``h``.  Alert fires when the test
            statistic exceeds this value.
    """

    def __init__(self, target_mean: float, slack: float, threshold: float) -> None:
        if slack <= 0:
            raise ValueError("slack must be positive")
        if threshold <= 0:
            raise ValueError("threshold must be positive")
        self.target_mean = float(target_mean)
        self.slack = float(slack)
        self.threshold = float(threshold)
        self._c_plus: float = 0.0
        self._c_minus: float = 0.0
        self._n: int = 0

    def update(self, value: float) -> bool:
        """Feed one observation and return True if the alert threshold is crossed.

        Args:
            value: The new scalar observation (e.g. inference loss).

        Returns:
            True if ``max(C+, C-) > threshold`` after this update.
        """
        self._n += 1
        self._c_plus = max(0.0, self._c_plus + (value - self.target_mean - self.slack))
        self._c_minus = max(0.0, self._c_minus - (value - self.target_mean + self.slack))
        return self._c_plus > self.threshold or self._c_minus > self.threshold

    def reset(self) -> None:
        """Reset both test statistics to zero (call after a REQUALIFY event)."""
        self._c_plus = 0.0
        self._c_minus = 0.0

    @property
    def statistic(self) -> float:
        """Current test statistic: ``max(C+, C-)``."""
        return max(self._c_plus, self._c_minus)

    @property
    def c_plus(self) -> float:
        """Current upper test statistic C+."""
        return self._c_plus

    @property
    def c_minus(self) -> float:
        """Current lower test statistic C-."""
        return self._c_minus

    @property
    def n(self) -> int:
        """Number of observations processed since creation (not reset on reset())."""
        return self._n

    def state_dict(self) -> Dict[str, Any]:
        """Return a serializable snapshot of the detector state."""
        return {
            "c_plus": round(self._c_plus, 8),
            "c_minus": round(self._c_minus, 8),
            "statistic": round(self.statistic, 8),
            "target_mean": self.target_mean,
            "slack": self.slack,
            "threshold": self.threshold,
            "n": self._n,
        }


class ADWINDetector:
    """Adaptive Windowing (ADWIN) drift detector.

    Maintains a sliding window of recent observations of at most
    ``max_window`` elements.  At each update, tests all possible binary
    splits of the window for a statistically significant difference using
    the Hoeffding bound:

    .. code-block:: text

        ε_cut = sqrt( (1/(2m) + 1/(2n)) × ln(4·|W|/δ) )

    where ``m`` and ``n`` are the sizes of the two sub-windows, ``|W|``
    is the total window length, and ``δ`` is the confidence parameter.
    Drift is detected if any split satisfies ``|mean(W₀) − mean(W₁)| ≥ ε_cut``.

    Memory footprint: O(W) where W = ``max_window``.

    Args:
        delta: Confidence parameter ``δ`` for the Hoeffding bound.  Lower
            values reduce false positives but require larger differences to
            trigger detection.  Typical range: 0.001–0.1.
        max_window: Maximum number of recent observations to retain.  Lower
            values reduce memory and react faster to drift; higher values
            improve sensitivity to subtle shifts.
    """

    def __init__(self, delta: float = 0.002, max_window: int = 200) -> None:
        if delta <= 0 or delta >= 1:
            raise ValueError("delta must be in (0, 1)")
        if max_window < 4:
            raise ValueError("max_window must be at least 4")
        self.delta = float(delta)
        self.max_window = int(max_window)
        self._window: deque[float] = deque(maxlen=max_window)
        self._drift_detected: bool = False

    def update(self, value: float) -> bool:
        """Feed one observation and return True if drift is detected.

        Args:
            value: The new scalar observation.

        Returns:
            True if the Hoeffding bound is exceeded for any window split.
        """
        self._window.append(value)
        self._drift_detected = self._check_drift()
        return self._drift_detected

    def _check_drift(self) -> bool:
        n = len(self._window)
        if n < 4:
            return False
        window_list = list(self._window)
        total = sum(window_list)
        log_term = math.log(4.0 * n / self.delta)
        running_sum = 0.0
        for m in range(2, n - 1):  # m = size of left sub-window
            running_sum += window_list[m - 1]
            right_n = n - m
            mean_left = running_sum / m
            mean_right = (total - running_sum) / right_n
            eps_cut = math.sqrt((1.0 / (2.0 * m) + 1.0 / (2.0 * right_n)) * log_term)
            if abs(mean_left - mean_right) >= eps_cut:
                return True
        return False

    def reset(self) -> None:
        """Clear the window and reset drift state."""
        self._window.clear()
        self._drift_detected = False

    @property
    def window_mean(self) -> Optional[float]:
        """Mean of the current window, or None if the window is empty."""
        if not self._window:
            return None
        return sum(self._window) / len(self._window)

    @property
    def window_size(self) -> int:
        """Current number of observations in the window."""
        return len(self._window)

    @property
    def drift_detected(self) -> bool:
        """True if the most recent update detected drift."""
        return self._drift_detected

    def state_dict(self) -> Dict[str, Any]:
        """Return a serializable snapshot of the detector state."""
        wm = self.window_mean
        return {
            "window_mean": round(wm, 8) if wm is not None else None,
            "window_size": self.window_size,
            "drift_detected": self._drift_detected,
            "delta": self.delta,
            "max_window": self.max_window,
        }


class RuntimeMonitor:
    """Three-way controller implementing Algorithm 2 (RuntimeQualify).

    Wraps :class:`CUSUMDetector` and :class:`ADWINDetector` and maintains
    a ``NOMINAL / WARN / REQUALIFY`` state machine:

    +---------------------------------------------------+--------------+
    | Condition                                         | Next State   |
    +===================================================+==============+
    | ``cusum.statistic > requalify_threshold``         | REQUALIFY    |
    +---------------------------------------------------+--------------+
    | ``cusum.statistic > warn_threshold``              | WARN         |
    | OR ADWIN drift detected                           |              |
    +---------------------------------------------------+--------------+
    | Otherwise                                         | NOMINAL      |
    +---------------------------------------------------+--------------+

    On ``REQUALIFY``: registered requalify hooks are fired and CUSUM is reset
    (ADWIN continues to accumulate — its window must flush naturally before the
    distribution can be declared nominal again).

    On ``WARN``: registered warn hooks are fired.

    Args:
        target_mean: Nominal mean of the inference loss signal.
        slack: CUSUM allowable slack ``k``.
        warn_threshold: CUSUM statistic threshold for the WARN state.
            Must be less than ``requalify_threshold``.
        requalify_threshold: CUSUM statistic threshold for the REQUALIFY
            state.
        adwin_delta: Confidence parameter for ADWIN.  Default: 0.002.
        adwin_window: Maximum ADWIN window size.  Default: 200.
    """

    def __init__(
        self,
        target_mean: float,
        slack: float,
        warn_threshold: float,
        requalify_threshold: float,
        adwin_delta: float = 0.002,
        adwin_window: int = 200,
    ) -> None:
        if warn_threshold >= requalify_threshold:
            raise ValueError("warn_threshold must be less than requalify_threshold")
        self.cusum = CUSUMDetector(
            target_mean=target_mean,
            slack=slack,
            threshold=requalify_threshold,
        )
        self.adwin = ADWINDetector(delta=adwin_delta, max_window=adwin_window)
        self._warn_threshold = float(warn_threshold)
        self._state: ControllerState = _NOMINAL
        self._n: int = 0
        self._warn_hooks: List[Callable[[Dict[str, Any]], None]] = []
        self._requalify_hooks: List[Callable[[Dict[str, Any]], None]] = []

    def update(self, loss_value: float) -> Tuple[ControllerState, ControllerState]:
        """Feed one inference loss value and update the controller state.

        Args:
            loss_value: The inference loss (or any scalar proxy for model
                quality) for this observation.

        Returns:
            A ``(previous_state, new_state)`` tuple.  Both values are one
            of ``"NOMINAL"``, ``"WARN"``, or ``"REQUALIFY"``.  When
            they are equal no transition occurred.
        """
        prev_state = self._state
        self._n += 1

        cusum_alerted = self.cusum.update(loss_value)
        self.adwin.update(loss_value)

        if cusum_alerted:
            new_state: ControllerState = _REQUALIFY
        elif self.cusum.statistic > self._warn_threshold or self.adwin.drift_detected:
            new_state = _WARN
        else:
            new_state = _NOMINAL

        self._state = new_state

        if prev_state != new_state:
            ctx = self.context_dict()
            if new_state == _REQUALIFY:
                for hook in self._requalify_hooks:
                    hook(ctx)
                self.cusum.reset()
            elif new_state == _WARN:
                for hook in self._warn_hooks:
                    hook(ctx)

        return prev_state, new_state

    def register_requalify_hook(
        self, callback: Callable[[Dict[str, Any]], None]
    ) -> None:
        """Register a callback fired on every ``→ REQUALIFY`` state transition.

        The callback receives a context dict (see :meth:`context_dict`).
        Hooks fire synchronously inside :meth:`update` — keep them fast and
        non-blocking.

        Args:
            callback: Callable that accepts a single dict argument.
        """
        self._requalify_hooks.append(callback)

    def register_warn_hook(
        self, callback: Callable[[Dict[str, Any]], None]
    ) -> None:
        """Register a callback fired on every ``→ WARN`` state transition.

        Args:
            callback: Callable that accepts a single dict argument.
        """
        self._warn_hooks.append(callback)

    @property
    def state(self) -> ControllerState:
        """Current controller state: ``"NOMINAL"``, ``"WARN"``, or ``"REQUALIFY"``."""
        return self._state

    @property
    def n(self) -> int:
        """Total number of observations processed by this monitor."""
        return self._n

    def context_dict(self) -> Dict[str, Any]:
        """Return a serializable snapshot of the current monitor context.

        Suitable for passing to hook callbacks and for inclusion in CEMI
        run records (``payload.monitor_state``).

        Returns:
            Dict with keys: ``state``, ``cusum_statistic``,
            ``adwin_window_mean``, ``adwin_window_size``, ``n_samples``.
        """
        wm = self.adwin.window_mean
        return {
            "state": self._state,
            "cusum_statistic": round(self.cusum.statistic, 8),
            "adwin_window_mean": round(wm, 8) if wm is not None else None,
            "adwin_window_size": self.adwin.window_size,
            "n_samples": self._n,
        }
