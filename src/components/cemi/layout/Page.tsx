import React, { ReactNode } from "react";

interface PageProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  fullWidth?: boolean;
  /** When set with fullWidth, page fills remaining flex height (charts split-pane). */
  expandBody?: boolean;
}

/**
 * Page wrapper component that provides consistent max-width, padding, and title/subtitle layout.
 * All pages must use this component.
 */
export function Page({ title, subtitle, children, fullWidth = false, expandBody = false }: PageProps) {
  const fullWidthLayout = expandBody
    ? "min-h-0 flex-1 w-full px-3 py-3 sm:px-4 sm:py-4 lg:px-6"
    : "min-h-full w-full px-3 py-3 sm:px-4 sm:py-4 lg:px-6";

  return (
    <div
      className={[
        "flex min-h-0 flex-col",
        fullWidth ? fullWidthLayout : "mx-auto max-w-[1120px] px-4 py-6 sm:px-6 lg:px-8",
      ].join(" ")}
    >
      {(title || subtitle) && (
        <div className="mb-6 sm:mb-8">
          <h1 className="mb-2 text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
