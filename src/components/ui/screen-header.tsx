import React from "react";
import { cn } from "@utils/cn";
import { PageHeader } from "@components/common/ui";
import { useTranslation } from "react-i18next";

interface ScreenHeaderProps {
  contract: {
    screenId: string;
    canonicalRoute: string;
    owningModule: string;
    owningSubmodule?: string;
    parentRoute?: string;
    breadcrumb?: string;
    persona?: string[];
    pageTitle: string;
    pageContext?: string;
    primaryAction?: {
      label: string;
      onClick: () => void;
      disabled?: boolean;
    };
    secondaryActions?: {
      label: string;
      onClick: () => void;
      disabled?: boolean;
      variant?: "ghost" | "secondary";
    }[];
    loading?: boolean;
    skeleton?: boolean;
  };
}

export function ScreenHeader({ contract }: ScreenHeaderProps) {
  const { i18n } = useTranslation();
  const locale = i18n.language || "en";
  
  const defaultTitle = contract.pageTitle;
  const title = contract.pageTitle || "ITS Service Management";
  const description = contract.pageContext 
    ? `${contract.pageContext} - ${contract.owningModule}`
    : `${contract.owningModule}`;
  
  const breadcrumbs = contract.breadcrumb 
    ? <div className="mb-2 text-xs text-slate-500">{contract.breadcrumb}</div>
    : undefined;
  
  const personaTags = contract.persona 
    ? contract.persona.map(
      (p: string) => <span key={p} className="inline-flex items-center text-xs text-slate-500 rounded bg-slate-100 px-2 py-0.5 mr-1">
        {p}
      </span>
    )
    : undefined;
  
  return (
    <PageHeader
      title={title}
      description={description}
      breadcrumbs={breadcrumbs}
      actions={contract.secondaryActions && contract.secondaryActions.length > 0 ? (
        <div className="flex items-center gap-2">
          {contract.secondaryActions.map((action, index) => (
            <button
              key={index}
              className={cn(
                "px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors",
                action.variant === "ghost" ? "hover:bg-transparent" : "",
                action.disabled ? "opacity-50 cursor-not-allowed" : ""
              )}
              disabled={action.disabled}
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : undefined}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {personaTags}
          <span className="text-sm font-medium text-slate-700">{contract.owningModule}</span>
        </div>
        <span className="text-xs text-slate-500">{contract.screenId}</span>
      </div>
      {contract.primaryAction && (
        <div className="mt-2">
          <button
            className={cn(
              "px-4 py-2 font-medium text-brand-600 bg-brand-50 rounded hover:bg-brand-100 transition-colors",
              contract.primaryAction.disabled ? "opacity-50 cursor-not-allowed" : ""
            )}
            disabled={contract.primaryAction.disabled}
            onClick={contract.primaryAction.onClick}
          >
            {contract.primaryAction.label}
          </button>
        </div>
      )}
    </PageHeader>
  );
}