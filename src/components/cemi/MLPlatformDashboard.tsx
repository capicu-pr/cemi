import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { MLPlatformLayout } from "./layout/MLPlatformLayout";
import { RunsPage } from "./runs/RunsPage";
import { RunDetailPage } from "./runs/RunDetailPage";
import { WorkspacePage } from "../../pages/workspace/WorkspacePage";
import { ComparePage } from "../../pages/compare/ComparePage";
import { ConsolePage } from "../../pages/console/ConsolePage";
import { apiClient } from "../../api/client";
import { mockApiClient } from "../../mockData";
import type { RunRecord } from "../../types/domain";
import {
  buildCemiRunsUrl,
  buildCemiCompareUrl,
  buildCemiConsoleUrl,
  parseCemiConsoleSearch,
  parseCemiCompareSearch,
} from "../../utils/cemiRoutes";
import { isLocalHostUrl } from "../../api/health";
import { getExperimentName, getExperimentOptions } from "../../utils/experiments";
import {
  DEFAULT_DUMMY_PROJECT_ID,
  getDevProjects,
  getDevRuns,
  mergeProjectsWithDevDefaults,
} from "../../mocks/defaultWorkspace";
import { createCemiTourController } from "../../tour/driverTour";
import { WorkspaceThemeProvider } from "../../contexts/WorkspaceThemeContext";
import { getWorkspaceThemeCssVars } from "../../utils/workspaceThemeCssVars";
import { resolveRunRecordId } from "../../utils/runHelpers";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:3141";
const IS_LOCAL_API = !API_BASE.trim() || isLocalHostUrl(API_BASE);
const ALL_EXPERIMENTS = "__all__";
const IS_DEV = import.meta.env.DEV;

type WorkspacePath =
  | "/workspace"
  | "/workspace/runs"
  | "/workspace/charts"
  | "/workspace/compare"
  | "/workspace/console";
type ToolThemeMode = "default" | "light";

interface WorkspaceRouteState {
  path: WorkspacePath;
  compareRunIds: string[];
  consoleRunId: string | null;
}

interface MLPlatformDashboardProps {
  onNavigate?: (path: string) => void;
}

export function MLPlatformDashboard({ onNavigate }: MLPlatformDashboardProps) {
  const [toolThemeMode, setToolThemeMode] = useState<ToolThemeMode>(() => {
    if (typeof window === "undefined") return "default";
    const storedTheme = window.localStorage.getItem("cemi-tool-theme");
    return storedTheme === "light" ? "light" : "default";
  });
  const [routeState, setRouteState] = useState<WorkspaceRouteState>({
    path: "/workspace",
    compareRunIds: [],
    consoleRunId: null,
  });
  const [currentProject, setCurrentProject] = useState<string | undefined>();
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<string>(ALL_EXPERIMENTS);
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [runsLoading, setRunsLoading] = useState(false);
  const [usingDevData, setUsingDevData] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const runDetailReturnPathRef = useRef<string>("/workspace/runs");
  const projectsRef = useRef(projects);
  const runsRef = useRef(runs);
  const tourControllerRef = useRef<ReturnType<typeof createCemiTourController> | null>(null);

  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  useEffect(() => {
    runsRef.current = runs;
  }, [runs]);

  useEffect(() => {
    loadProjects();
    updateRouteFromUrl(window.location.pathname + window.location.search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentProject) {
      loadRuns(currentProject);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject]);

  useEffect(() => {
    if (!IS_LOCAL_API || !currentProject || usingDevData) return;
    const id = window.setInterval(() => {
      loadRuns(currentProject, { silent: true });
    }, 3000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject, usingDevData]);

  useEffect(() => {
    if (!currentProject && routeState.path !== "/workspace" && projects.length > 0) {
      setCurrentProject(projects[0].id);
    }
  }, [currentProject, projects, routeState.path]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("cemi-tool-theme", toolThemeMode);
  }, [toolThemeMode]);

  // Portals and third-party layers read from :root; keep tokens in sync (no remove on theme
  // change — only clear when leaving the workspace shell).
  useLayoutEffect(() => {
    const root = document.documentElement;
    const { cssVars } = getWorkspaceThemeCssVars(toolThemeMode);
    for (const [key, value] of Object.entries(cssVars)) {
      root.style.setProperty(key, value);
    }
  }, [toolThemeMode]);

  useLayoutEffect(() => {
    return () => {
      document.documentElement.style.removeProperty("--cemi-surface-bg");
      document.documentElement.style.removeProperty("--cemi-dock-bg");
    };
  }, []);

  useEffect(() => {
    const experimentIds = new Set(getExperimentOptions(runs).map((experiment) => experiment.id));
    if (selectedExperiment !== ALL_EXPERIMENTS && !experimentIds.has(selectedExperiment)) {
      setSelectedExperiment(ALL_EXPERIMENTS);
    }
  }, [runs, selectedExperiment]);

  const loadRuns = async (projectId: string, { silent = false } = {}) => {
    if (!projectId) {
      console.warn("loadRuns called without projectId");
      setRuns([]);
      return;
    }

    if (IS_DEV && projectId === DEFAULT_DUMMY_PROJECT_ID) {
      setUsingDevData(true);
      setRuns(getDevRuns(projectId));
      if (!silent) setRunsLoading(false);
      return;
    }

    if (!silent) setRunsLoading(true);
    try {
      const data = await apiClient.getRuns(projectId);

      const transformedRuns: RunRecord[] = (data || []).map((run: any) => ({
        ...run,
        id: run.id ?? run.run_id,
        tags: Array.isArray(run.tags)
          ? run.tags
          : run.tags && typeof run.tags === "object"
            ? Object.entries(run.tags as Record<string, string>).map(([key, value]) => ({ key, value }))
            : [],
        params: Array.isArray(run.params) ? run.params : [],
        artifacts: Array.isArray(run.artifacts) ? run.artifacts : [],
        summary_metrics: run.summary_metrics || {},
        owner: run.owner || null,
        baseline_run_id: run.baseline_run_id || null,
        parent_run_id: run.parent_run_id || null,
      }));

      setUsingDevData(false);
      setRuns(transformedRuns);
    } catch (error) {
      console.error("Failed to load runs:", error);
      if (IS_DEV) {
        setUsingDevData(true);
        // Prefer mock data for the requested project before falling back to dummy data.
        const mockRuns = await mockApiClient.getRuns(projectId).catch(() => null);
        if (mockRuns && mockRuns.length > 0) {
          setRuns(mockRuns as RunRecord[]);
        } else {
          setRuns(getDevRuns(DEFAULT_DUMMY_PROJECT_ID));
        }
      } else if (!silent) {
        setRuns([]);
      }
    } finally {
      if (!silent) setRunsLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const data = await apiClient.getProjects();
      setProjects(IS_DEV ? mergeProjectsWithDevDefaults(data) : data);
    } catch (error) {
      console.error("Failed to load projects:", error);
      if (IS_DEV) {
        const mockProjects = await mockApiClient.getProjects().catch(() => null);
        setProjects(mergeProjectsWithDevDefaults(mockProjects ?? []));
      }
    }
  };

  const updateRouteFromUrl = (urlOrPath: string) => {
    const url = new URL(urlOrPath, window.location.origin);
    const normalizedPath =
      url.pathname.endsWith("/") && url.pathname !== "/" ? url.pathname.slice(0, -1) : url.pathname;

    if (normalizedPath === "/workspace/runs" || normalizedPath.startsWith("/workspace/runs/")) {
      const runId = url.searchParams.get("runId");
      setSelectedRunId(runId);
      if (normalizedPath.startsWith("/workspace/runs/")) {
        window.history.replaceState({}, "", runId ? `/workspace/runs?runId=${runId}` : "/workspace/runs");
      }
      setRouteState((prev) => ({
        ...prev,
        path: "/workspace/runs",
        consoleRunId: null,
      }));
      return;
    }

    if (normalizedPath === "/workspace/compare") {
      const { runIds } = parseCemiCompareSearch(url.search);
      setRouteState({
        path: "/workspace/compare",
        compareRunIds: runIds,
        consoleRunId: null,
      });
      return;
    }

    if (normalizedPath === "/workspace/console") {
      const { runId } = parseCemiConsoleSearch(url.search);
      setRouteState((prev) => ({
        ...prev,
        path: "/workspace/console",
        consoleRunId: runId,
      }));
      return;
    }

    if (normalizedPath === "/workspace/charts") {
      setRouteState((prev) => ({
        ...prev,
        path: "/workspace/charts",
        consoleRunId: null,
      }));
      return;
    }

    if (normalizedPath === "/workspace" || normalizedPath === "/workspace/") {
      setRouteState({
        path: "/workspace",
        compareRunIds: [],
        consoleRunId: null,
      });
    } else {
      setRouteState({
        path: "/workspace",
        compareRunIds: [],
        consoleRunId: null,
      });
    }
  };

  const handleNavigate = (path: string) => {
    let fullPath = path.startsWith("/") ? path : `/${path}`;
    if (fullPath === "/workspace/compare" && routeState.compareRunIds.length > 0) {
      fullPath = buildCemiCompareUrl(routeState.compareRunIds);
    }
    if (fullPath === "/workspace/console" && routeState.consoleRunId) {
      fullPath = buildCemiConsoleUrl(routeState.consoleRunId);
    }
    const url = new URL(fullPath, window.location.origin);
    const href = `${url.pathname}${url.search}${url.hash}`;
    window.history.pushState({}, "", href);
    updateRouteFromUrl(href);
  };

  const openProject = (projectId: string) => {
    setCurrentProject(projectId);
    setSelectedExperiment(ALL_EXPERIMENTS);
    setRouteState((prev) => ({ ...prev, compareRunIds: [], consoleRunId: null }));
    handleNavigate("/workspace/runs");
  };

  const toggleCompareRun = (runId: string) => {
    setRouteState((prev) => {
      const next = new Set(prev.compareRunIds);
      if (next.has(runId)) {
        next.delete(runId);
      } else {
        next.add(runId);
      }

      const nextCompareRunIds = Array.from(next);

      if (prev.path === "/workspace/compare") {
        const href = buildCemiCompareUrl(nextCompareRunIds);
        window.history.replaceState({}, "", href);
      }

      return {
        ...prev,
        compareRunIds: nextCompareRunIds,
      };
    });
  };

  const openCompareView = (runIds: Iterable<string>) => {
    handleNavigate(buildCemiCompareUrl(Array.from(runIds)));
  };

  const selectConsoleRun = (runId: string) => {
    setRouteState((prev) => ({
      ...prev,
      consoleRunId: runId,
    }));
    if (routeState.path === "/workspace/console") {
      const href = buildCemiConsoleUrl(runId);
      window.history.replaceState({}, "", href);
      updateRouteFromUrl(href);
    }
  };

  const openRunDetail = (run: RunRecord) => {
    const id = resolveRunRecordId(run);
    if (!id) {
      console.warn("openRunDetail: run has no id/run_id", run);
      return;
    }
    const label = (run.name && String(run.name).trim()) || id.slice(0, 8);
    runDetailReturnPathRef.current = routeState.path;
    setSelectedRunId(id);
    handleNavigate(buildCemiRunsUrl({ runId: id, runIdKey: label }));
  };

  const closeRunDetail = () => {
    const returnPath = runDetailReturnPathRef.current;
    runDetailReturnPathRef.current = "/workspace/runs";
    setSelectedRunId(null);
    const target = returnPath === "/workspace/charts" ? "/workspace/charts" : "/workspace/runs";
    window.history.replaceState({}, "", target);
    updateRouteFromUrl(target);
  };

  useEffect(() => {
    if (tourControllerRef.current) return;

    tourControllerRef.current = createCemiTourController({
      navigate: handleNavigate,
      openProject,
      getProjects: () => projectsRef.current,
      getRuns: () => runsRef.current,
    });

    return () => {
      tourControllerRef.current?.destroy();
      tourControllerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    tourControllerRef.current?.refresh();
  }, [routeState.path, projects.length, runs.length]);

  const startTour = () => {
    if (routeState.path !== "/workspace") {
      handleNavigate("/workspace");
      window.setTimeout(() => {
        tourControllerRef.current?.start();
      }, 0);
      return;
    }

    tourControllerRef.current?.start();
  };

  useEffect(() => {
    const handlePopState = () => {
      updateRouteFromUrl(window.location.pathname + window.location.search);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const experimentOptions = useMemo(() => getExperimentOptions(runs), [runs]);
  const currentProjectName =
    projects.find((project) => project.id === currentProject)?.name || currentProject || "Project";
  const filteredRuns = useMemo(() => {
    if (selectedExperiment === ALL_EXPERIMENTS) return runs;
    return runs.filter((run) => getExperimentName(run) === selectedExperiment);
  }, [runs, selectedExperiment]);
  const compareRunIds = useMemo(() => new Set(routeState.compareRunIds), [routeState.compareRunIds]);
  const compareRuns = useMemo(
    () =>
      runs.filter((run) => {
        const id = resolveRunRecordId(run);
        return id ? compareRunIds.has(id) : false;
      }),
    [compareRunIds, runs]
  );
  const runningCount = useMemo(
    () => runs.filter((run) => String(run.status).toLowerCase() === "running").length,
    [runs]
  );

  const renderPage = () => {
    try {
      switch (routeState.path) {
        case "/workspace":
          return <WorkspacePage onNavigate={handleNavigate} onProjectSelect={openProject} onStartTour={startTour} />;
        case "/workspace/runs": {
          const selectedRun = selectedRunId
            ? (runs.find((r) => resolveRunRecordId(r) === selectedRunId) ?? null)
            : null;
          if (selectedRunId && selectedRun) {
            return <RunDetailPage run={selectedRun} allRuns={runs} onBack={closeRunDetail} />;
          }
          return (
            <RunsPage
              projectId={currentProject || ""}
              projectName={currentProjectName}
              runs={filteredRuns}
              allRunsCount={runs.length}
              selectedExperiment={selectedExperiment}
              compareRunIds={compareRunIds}
              onToggleCompare={toggleCompareRun}
              onOpenCompare={openCompareView}
              onRunClick={openRunDetail}
              isLoading={runsLoading}
              view="runs"
            />
          );
        }
        case "/workspace/charts":
          return (
            <RunsPage
              projectId={currentProject || ""}
              projectName={currentProjectName}
              runs={filteredRuns}
              allRunsCount={runs.length}
              selectedExperiment={selectedExperiment}
              compareRunIds={compareRunIds}
              onToggleCompare={toggleCompareRun}
              onOpenCompare={openCompareView}
              onRunClick={openRunDetail}
              isLoading={runsLoading}
              view="charts"
              onRefresh={() => currentProject && loadRuns(currentProject)}
            />
          );
        case "/workspace/compare":
          return (
            <ComparePage
              projectId={currentProject}
              projectName={currentProjectName}
              runs={compareRuns}
              compareRunIds={routeState.compareRunIds}
              onRunClick={openRunDetail}
              onNavigate={handleNavigate}
              onToggleCompare={toggleCompareRun}
            />
          );
        case "/workspace/console":
          return (
            <ConsolePage
              projectName={currentProjectName}
              runs={filteredRuns}
              selectedRunId={routeState.consoleRunId}
              onSelectRun={selectConsoleRun}
            />
          );
        default:
          return <WorkspacePage onNavigate={handleNavigate} onProjectSelect={openProject} onStartTour={startTour} />;
      }
    } catch (error) {
      console.error("Error rendering page:", error);
      return (
        <div style={{ padding: "2rem", textAlign: "center", color: "#D82A2D" }}>
          <h2>Error loading page</h2>
          <p>{error instanceof Error ? error.message : String(error)}</p>
        </div>
      );
    }
  };

  return (
    <WorkspaceThemeProvider toolThemeMode={toolThemeMode}>
      <MLPlatformLayout
        currentPath={routeState.path}
        toolThemeMode={toolThemeMode}
        currentProject={currentProject}
        currentProjectName={currentProjectName}
        projects={projects}
        currentExperiment={selectedExperiment}
        experiments={experimentOptions}
        runSummary={{
          totalRuns: runs.length,
          runningRuns: runningCount,
          compareRuns: routeState.compareRunIds.length,
        }}
        onToolThemeModeChange={setToolThemeMode}
        onNavigate={handleNavigate}
        onProjectChange={openProject}
        onExperimentChange={setSelectedExperiment}
        children={renderPage()}
      />
    </WorkspaceThemeProvider>
  );
}
