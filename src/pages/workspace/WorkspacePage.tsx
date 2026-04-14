import React, { useEffect, useState, useMemo } from "react";
import { apiClient } from "../../api/client";
import { Search, Folder, Calendar, User, HelpCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  AnimatedInput,
  animationPresets,
  shadowPresets,
} from "../../components/ui/animated-interactive";
import { Button } from "../../components/ui/button";
import { mergeProjectsWithDevDefaults } from "../../mocks/defaultWorkspace";
import { mockApiClient } from "../../mockData";

interface WorkspacePageProps {
  onNavigate: (path: string) => void;
  onProjectSelect: (projectId: string) => void;
  onStartTour?: () => void;
}

interface Project {
  id: string;
  name: string;
  org_id?: string;
  created_at: string;
  updated_at?: string;
  owner?: string;
}

const IS_DEV = import.meta.env.DEV;
const TOOL_SURFACE_BACKGROUND = "var(--cemi-surface-bg, #F9F5EA)";

export function WorkspacePage({ onNavigate, onProjectSelect, onStartTour }: WorkspacePageProps) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOwner, setFilterOwner] = useState<string>("");
  const [filterDateFrom, setFilterDateFrom] = useState<string>("");
  const [filterDateTo, setFilterDateTo] = useState<string>("");
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const data = await apiClient.getProjects();
      const projectsWithOwner = (IS_DEV ? mergeProjectsWithDevDefaults(data) : data).map((p: any) => ({
        ...p,
        owner: user?.name || user?.username || p.owner || "local",
        updated_at: p.updated_at || p.created_at,
      }));
      setProjects(projectsWithOwner);
    } catch (error) {
      console.error("Failed to load projects:", error);
      if (IS_DEV) {
        const mockData = await mockApiClient.getProjects().catch(() => []);
        const fallbackProjects = mergeProjectsWithDevDefaults(mockData).map((p: any) => ({
          ...p,
          owner: user?.name || user?.username || p.owner || "local",
          updated_at: p.updated_at || p.created_at,
        }));
        setProjects(fallbackProjects);
      } else {
        setLoadError(error instanceof Error ? error.message : "Failed to load projects.");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        searchQuery === "" ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesOwner =
        filterOwner === "" ||
        (project.owner || "").toLowerCase().includes(filterOwner.toLowerCase());

      let matchesDate = true;
      if (filterDateFrom || filterDateTo) {
        if (!project.created_at) {
          matchesDate = false;
        } else {
          const projectDate = new Date(project.created_at);
          if (Number.isNaN(projectDate.getTime())) {
            matchesDate = false;
          } else {
            if (filterDateFrom) {
              const fromDate = new Date(filterDateFrom);
              matchesDate = matchesDate && projectDate >= fromDate;
            }
            if (filterDateTo) {
              const toDate = new Date(filterDateTo);
              toDate.setHours(23, 59, 59, 999);
              matchesDate = matchesDate && projectDate <= toDate;
            }
          }
        }
      }

      return matchesSearch && matchesOwner && matchesDate;
    });
  }, [projects, searchQuery, filterOwner, filterDateFrom, filterDateTo]);

  const handleProjectClick = (projectId: string) => {
    onProjectSelect(projectId);
    onNavigate("/workspace/runs");
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString || typeof dateString !== "string") return "—";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).replace(/,/g, "");
  };

  const formatTimeAgo = (dateString: string) => {
    if (!dateString || typeof dateString !== "string") return "—";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "—";
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInYears > 0) {
      return `${diffInYears} ${diffInYears === 1 ? "year" : "years"} ago`;
    } else if (diffInMonths > 0) {
      return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"} ago`;
    } else if (diffInDays > 0) {
      return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`;
    } else {
      return "just now";
    }
  };

  return (
    <div className="relative flex flex-col h-full">
      {/* Page Header - Fixed at top */}
      <div className="flex-shrink-0 border-b border-[rgba(15,52,85,0.1)] px-4 pt-4 pb-3 sm:px-6">
        <h2 className="m-0 text-2xl font-semibold leading-tight text-[#0F3455] sm:text-3xl">
          Workspace
        </h2>
      </div>

      {/* Search and Filter Bar - Fixed below header */}
      <div
        className="flex-shrink-0 border-b border-[rgba(15,52,85,0.05)] bg-[#F9F5EA] px-4 py-4 sm:px-6"
        style={{ backgroundColor: TOOL_SURFACE_BACKGROUND }}
      >
        <div className="flex flex-wrap items-center gap-3 lg:flex-nowrap lg:gap-4">
          {/* Search Bar - Maximized */}
          <div className="flex min-w-0 flex-1 items-center gap-2 lg:flex-[1.35]" data-tour="workspace-search">
            <AnimatedInput
              icon={<Search className="w-5 h-5" />}
              type="text"
              placeholder="Search projects by name or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                backgroundColor: TOOL_SURFACE_BACKGROUND,
              }}
            />
          </div>

          {/* Owner Filter */}
          <div className="flex w-full items-center gap-2 sm:w-auto sm:flex-shrink-0">
            <AnimatedInput
              icon={<User className="w-4 h-4" />}
              type="text"
              placeholder="Filter by owner"
              value={filterOwner}
              onChange={(e) => setFilterOwner(e.target.value)}
              style={{
                width: "100%",
                minWidth: "12rem",
                backgroundColor: TOOL_SURFACE_BACKGROUND,
              }}
            />
          </div>

          {/* Date Range Filters */}
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap sm:flex-shrink-0">
            <Calendar className="w-4 h-4 text-[rgba(15,52,85,0.7)]" />
            <motion.input
              type="date"
              placeholder="From"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              whileFocus={{ boxShadow: "0 0 0 2px rgba(15, 52, 85, 0.15)" }}
              className="w-full rounded-lg border border-[rgba(15,52,85,0.2)] bg-[#F9F5EA] px-3 py-2 text-sm text-[#0F3455] outline-none sm:w-[140px]"
              style={{ backgroundColor: TOOL_SURFACE_BACKGROUND }}
            />
            <span className="text-[rgba(15,52,85,0.7)] text-sm whitespace-nowrap">to</span>
            <motion.input
              type="date"
              placeholder="To"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              whileFocus={{ boxShadow: "0 0 0 2px rgba(15, 52, 85, 0.15)" }}
              className="w-full rounded-lg border border-[rgba(15,52,85,0.2)] bg-[#F9F5EA] px-3 py-2 text-sm text-[#0F3455] outline-none sm:w-[140px]"
              style={{ backgroundColor: TOOL_SURFACE_BACKGROUND }}
            />
          </div>
        </div>
      </div>

      {/* Projects Table - Scrollable content area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6" data-tour="workspace-project-table">
        {loadError ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-12 text-center"
          >
            {/failed to fetch|networkerror|network request failed/i.test(loadError) ? (
              <>
                <p className="text-[#D82A2D] mb-2 font-medium">Gateway not reachable</p>
                <p className="text-sm text-[rgba(15,52,85,0.7)] mb-3">
                  The local gateway isn't running. Start it in your terminal:
                </p>
                <code className="inline-block mb-5 px-4 py-2 rounded-lg bg-[rgba(15,52,85,0.07)] text-[#0F3455] text-sm font-mono border border-[rgba(15,52,85,0.12)]">
                  cemi gateway
                </code>
                <p className="text-xs text-[rgba(15,52,85,0.5)] mb-5">
                  Then click Retry or refresh the page.
                </p>
              </>
            ) : (
              <>
                <p className="text-[#D82A2D] mb-2 font-medium">Failed to load projects.</p>
                <p className="text-sm text-[rgba(15,52,85,0.7)] mb-5">{loadError}</p>
              </>
            )}
            <button
              type="button"
              onClick={() => loadProjects()}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-[rgba(15,52,85,0.2)] bg-[#F9F5EA] text-[#0F3455] hover:bg-[rgba(15,52,85,0.06)] focus:outline-none focus:ring-2 focus:ring-[rgba(15,52,85,0.2)]"
              style={{ backgroundColor: TOOL_SURFACE_BACKGROUND }}
            >
              Retry
            </button>
          </motion.div>
        ) : loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-12 text-center text-[rgba(15,52,85,0.7)]"
          >
            Loading projects...
          </motion.div>
        ) : filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-12 text-center text-[rgba(15,52,85,0.7)]"
          >
            {searchQuery || filterOwner || filterDateFrom || filterDateTo
              ? "No projects match your filters."
              : "No projects found. Create your first project to get started."}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#F9F5EA] overflow-hidden rounded-lg"
            style={{ boxShadow: shadowPresets.sm, backgroundColor: TOOL_SURFACE_BACKGROUND }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(15, 52, 85, 0.05)', borderBottom: '1px solid rgba(15, 52, 85, 0.2)' }}>
                  <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#0F3455', width: '40%' }}>
                    Project Name
                  </th>
                  <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#0F3455', width: '25%' }}>
                    Last edited
                  </th>
                  <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#0F3455', width: '25%' }}>
                    Created
                  </th>
                  <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#0F3455', width: '10%' }}>
                    Owner
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredProjects.map((project, index) => (
                    <ProjectRow
                      key={project.id}
                      project={project}
                      index={index}
                      isFirstRow={index === 0}
                      totalProjects={filteredProjects.length}
                      onProjectClick={handleProjectClick}
                      formatTimeAgo={formatTimeAgo}
                      formatDateTime={formatDateTime}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </motion.div>
        )}
      </div>

      <button
        type="button"
        aria-label="Open walkthrough help"
        onClick={() => setIsHelpOpen(true)}
        className="absolute top-4 right-4 z-30 inline-flex h-12 w-12 items-center justify-center rounded-full text-[#0F3455] shadow-[0_12px_28px_rgba(15,52,85,0.16)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F3455]/20"
        data-tour="workspace-help-trigger"
      >
        <HelpCircle className="h-5 w-5" />
      </button>

      {isHelpOpen ? (
        <div style={{ position: "fixed", inset: 0, zIndex: 9998 }}>
          <div
            onClick={() => setIsHelpOpen(false)}
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(15, 52, 85, 0.24)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="CEMI walkthrough prompt"
            onClick={(event) => event.stopPropagation()}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 9999,
              width: "min(28rem, calc(100vw - 2rem))",
              overflow: "hidden",
              borderRadius: "0.5rem",
              border: "1px solid rgba(15, 52, 85, 0.12)",
              backgroundColor: "var(--cemi-surface-bg, #F9F5EA)",
              boxShadow: "0 24px 80px rgba(15, 52, 85, 0.18)",
            }}
          >
            <div className="px-5 py-5">
              <div className="text-base font-semibold text-[#0F3455] text-center">Looking for a walkthrough of CEMI?</div>
            </div>

            <div className="flex items-center justify-center gap-2 px-5 py-4">
              <Button type="button" variant="outline" className="border-0 shadow-none" onClick={() => setIsHelpOpen(false)}>
                No
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setIsHelpOpen(false);
                  window.setTimeout(() => onStartTour?.(), 0);
                }}
              >
                Yes
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

interface ProjectRowProps {
  project: Project;
  index: number;
  totalProjects: number;
  onProjectClick: (projectId: string) => void;
  formatTimeAgo: (dateString: string) => string;
  formatDateTime: (dateString: string) => string;
  isFirstRow?: boolean;
  key?: string;
}

function ProjectRow({
  project,
  index,
  totalProjects,
  onProjectClick,
  formatTimeAgo,
  formatDateTime,
  isFirstRow = false,
}: ProjectRowProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const owner = project.owner || "local";

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onProjectClick(project.id);
    }
  };

  return (
    <motion.tr
      role="button"
      tabIndex={0}
      data-tour={isFirstRow ? "workspace-project-row-first" : undefined}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.03, ...animationPresets.spring }}
      onClick={() => onProjectClick(project.id)}
      onKeyDown={handleKeyDown}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{
        backgroundColor: "rgba(15, 52, 85, 0.05)",
        boxShadow: "inset 0 0 0 1px rgba(15, 52, 85, 0.1)",
      }}
      whileTap={{ scale: 0.995 }}
      className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F3455] focus-visible:ring-inset"
      style={{
        borderBottom: index < totalProjects - 1 ? "1px solid rgba(15, 52, 85, 0.1)" : "none",
      }}
    >
      <td style={{ padding: '0.75rem 1.5rem', textAlign: 'left' }}>
        <motion.div
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          animate={{ x: isHovered ? 4 : 0 }}
          transition={animationPresets.spring}
        >
          <motion.div
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={animationPresets.spring}
          >
            <Folder style={{ width: '1.25rem', height: '1.25rem', color: '#0F3455', flexShrink: 0 }} />
          </motion.div>
          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0F3455' }}>
            {project.name}
          </span>
        </motion.div>
      </td>
      <td style={{ padding: '0.75rem 1.5rem', textAlign: 'left' }}>
        <span style={{ fontSize: '0.875rem', color: 'rgba(15, 52, 85, 0.7)' }}>
          {formatTimeAgo(project.updated_at || project.created_at)}
        </span>
      </td>
      <td style={{ padding: '0.75rem 1.5rem', textAlign: 'left' }}>
        <span style={{ fontSize: '0.875rem', color: 'rgba(15, 52, 85, 0.7)' }}>
          {formatDateTime(project.created_at)}
        </span>
      </td>
      <td style={{ padding: '0.75rem 1.5rem', textAlign: 'left' }}>
        <motion.div
          style={{
            width: '2rem',
            height: '2rem',
            borderRadius: '50%',
            backgroundColor: '#0F3455',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#F9F5EA',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            position: 'relative',
          }}
          whileHover={{ scale: 1.15, boxShadow: shadowPresets.md }}
          whileTap={{ scale: 0.95 }}
          transition={animationPresets.spring}
          onHoverStart={() => setShowTooltip(true)}
          onHoverEnd={() => setShowTooltip(false)}
        >
          {owner.charAt(0).toUpperCase()}
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.15 }}
                style={{ 
                  position: 'absolute',
                //   left: '50%',
                  transform: 'translateX(-50%)',
                  bottom: 'calc(100% + 12px)',
                  backgroundColor: '#0F3455',
                  padding: '0.375rem 0.75rem',
                  color: '#F9F5EA',
                  fontSize: '0.75rem',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                  zIndex: 50,
                  pointerEvents: 'none',
                  textAlign: 'center',
                  boxShadow: shadowPresets.md,
                }}
              >
                {owner}
                <div 
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                    borderTop: '5px solid #0F3455',
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </td>
    </motion.tr>
  );
}
