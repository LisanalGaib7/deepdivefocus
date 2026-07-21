import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  /** Small uppercase label above the title. Oceanic-glass hierarchy anchor. */
  eyebrow?: ReactNode;
  right?: ReactNode;
  align?: "center" | "left";
}

/**
 * Unified page header for all top-level tabs (Focus/Priority/History/Collection/Auth).
 * Oceanic glass hierarchy: eyebrow (tiny caps) → title (display) → subtitle (mono caps).
 * Never re-implement page h1 styling in individual pages.
 */
const PageHeader = ({ title, subtitle, eyebrow, right, align = "left" }: PageHeaderProps) => {
  const alignCls = align === "center" ? "text-center items-center" : "text-left items-start";
  return (
    <header className={`flex flex-col gap-0 ${alignCls}`}>
      <div className="flex items-start justify-between w-full gap-3">
        <div className="flex-1 min-w-0">
          {eyebrow && <div className="eyebrow mb-1">{eyebrow}</div>}
          <h1 className="page-header">{title}</h1>
        </div>
        {right && <div className="shrink-0 pt-1">{right}</div>}
      </div>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
    </header>
  );
};

export default PageHeader;
