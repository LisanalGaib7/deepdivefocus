import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  right?: ReactNode;
  align?: "center" | "left";
}

/**
 * Unified page header for all top-level tabs (Focus/Priority/History/Collection/Auth).
 * Never re-implement page h1 styling in individual pages.
 */
const PageHeader = ({ title, subtitle, right, align = "center" }: PageHeaderProps) => {
  const alignCls = align === "center" ? "text-center items-center" : "text-left items-start";
  return (
    <header className={`flex flex-col gap-0 ${alignCls}`}>
      <div className="flex items-center justify-between w-full gap-3">
        <h1 className="page-header flex-1">{title}</h1>
        {right && <div className="shrink-0">{right}</div>}
      </div>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
    </header>
  );
};

export default PageHeader;
