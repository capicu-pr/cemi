// src/contexts/WorkspaceThemeContext.tsx

import React, { createContext, useContext, useMemo } from "react";
import { theme } from "../theme";
import {
  getWorkspaceThemeCssVars,
  type WorkspaceToolThemeMode,
} from "../utils/workspaceThemeCssVars";

export type WorkspaceThemeContextValue = {
  toolThemeMode: WorkspaceToolThemeMode;
  surfaceBg: string;
  dockBg: string;
};

const defaultValue: WorkspaceThemeContextValue = {
  toolThemeMode: "default",
  surfaceBg: theme.colors.beige.lightest,
  dockBg: "rgba(249, 245, 234, 0.88)",
};

const WorkspaceThemeContext = createContext<WorkspaceThemeContextValue>(defaultValue);

export function WorkspaceThemeProvider({
  toolThemeMode,
  children,
}: {
  toolThemeMode: WorkspaceToolThemeMode;
  children: React.ReactNode;
}) {
  const value = useMemo(() => {
    const { workspaceSurfaceColor, cssVars } = getWorkspaceThemeCssVars(toolThemeMode);
    return {
      toolThemeMode,
      surfaceBg: workspaceSurfaceColor,
      dockBg: cssVars["--cemi-dock-bg"],
    };
  }, [toolThemeMode]);

  return <WorkspaceThemeContext.Provider value={value}>{children}</WorkspaceThemeContext.Provider>;
}

export function useWorkspaceTheme() {
  return useContext(WorkspaceThemeContext);
}
