// src/components/cemi/runs/HelpBubble.tsx

import React, { useRef, useState } from "react";
import { HelpCircle } from "lucide-react";

/** Hover/focus tooltip (fixed position) — same pattern as section help on Run detail. */
export function HelpBubble({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (timeout.current) clearTimeout(timeout.current);
    setOpen(true);
  };
  const hide = () => {
    timeout.current = setTimeout(() => setOpen(false), 180);
  };

  return (
    <span
      style={{ position: "relative", display: "inline-flex", alignItems: "center", lineHeight: 1 }}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(15,52,85,0.22)",
          background: "none",
          border: "none",
          cursor: "help",
          padding: 0,
        }}
        aria-label="Help"
      >
        <HelpCircle className="h-3 w-3" />
      </button>
      {open && (
        <span
          role="tooltip"
          style={{
            position: "fixed",
            zIndex: 9999,
            display: "block",
            boxSizing: "border-box",
            width: "min(288px, calc(100vw - 16px))",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.14)",
            backgroundColor: "var(--cemi-hovercard-bg, #0F3455)",
            padding: "10px 14px",
            boxShadow: "0 10px 28px rgba(15,52,85,0.22)",
            fontSize: 12,
            fontWeight: 400,
            color: "var(--cemi-hovercard-fg, #F9F5EA)",
            lineHeight: 1.65,
            letterSpacing: "normal",
            textTransform: "none",
            whiteSpace: "normal",
            overflowWrap: "break-word",
            wordBreak: "break-word",
          }}
          ref={(el) => {
            if (!el) return;
            const btn = el.parentElement?.querySelector("button");
            if (!btn) return;
            const r = btn.getBoundingClientRect();
            el.style.top = `${r.bottom + 6}px`;
            el.style.left = `${Math.max(8, r.left - 40)}px`;
          }}
        >
          {text}
        </span>
      )}
    </span>
  );
}
