// src/utils/workspaceThemeCssVars.ts

import { theme } from "../theme";

export type WorkspaceToolThemeMode = "default" | "light";

/** Surface + dock colors and CSS custom properties used across the workspace shell (and portaled UI). */
export function getWorkspaceThemeCssVars(mode: WorkspaceToolThemeMode) {
  const workspaceSurfaceColor = mode === "light" ? "#FFFFFF" : theme.colors.beige.lightest;
  const dockSurfaceColor =
    mode === "light" ? "rgba(255, 255, 255, 0.92)" : "rgba(249, 245, 234, 0.88)";
  const hovercardBg = "#0F3455";
  return {
    workspaceSurfaceColor,
    cssVars: {
      "--cemi-surface-bg": workspaceSurfaceColor,
      "--cemi-dock-bg": dockSurfaceColor,
      // Hover cards / tooltips should be dark; text matches theme surface.
      "--cemi-hovercard-bg": hovercardBg,
      "--cemi-hovercard-fg": workspaceSurfaceColor,
    } as const,
  };
}
