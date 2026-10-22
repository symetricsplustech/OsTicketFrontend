import type { ReactNode } from "react";
import { useState } from "react";
import { Card } from "@components/common/ui";
import { CardHeader } from "@components/common/ui";
import { CardBody } from "@components/common/ui";
import { Spinner } from "@components/common/ui";
import { EmptyState } from "@components/common/ui";
import { Pagination } from "@components/common/Pagination";
import { useAppSelector } from "@store/hooks";
import { selectPermissions } from "@services/auth/authSlice";
import { PERMISSIONS } from "@services/authorization/permissions";
import { cn } from "@utils/cn";

interface KPICount {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string | number;
}

interface DashboardWidget {
  id: string;
  title: string;
  description?: string;
}

interface DashboardPageProps {
  title: ReactNode;
  subtitle?: ReactNode;
  kpiCounts?: KPICount[];
  widgets?: DashboardWidget[];
  onFilterChange?: (value: string) => void;
  loading?: boolean;
}

export function DashboardPage({
  title,
  subtitle,
  kpiCounts,
  widgets,
  onFilterChange,
  loading,
}: DashboardPageProps) {
  const permissions = useAppSelector(selectPermissions);
  const canViewAll = permissions.includes("*");

  const [filterValue, setFilterValue] = useState("");

  const handleFilterChange = (value: string) => {
    setFilterValue(value);
    onFilterChange?.(value);
  };

  const kpiCards =
    kpiCounts?.map((kpi) => (
      <div
        key={kpi.label}
        className={cn(
          "flex-1",
          "py-3",
          "px-4",
          "border-r border-slate-200",
          kpi.trend === "up" && "bg-green-50",
          kpi.trend === "down" && "bg-red-50",
          kpi.trend === "neutral" && "bg-slate-50",
        )}
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-slate-500">{kpi.label}</p>
            <p className="text-2xl font-medium text-slate-900">{kpi.value}</p>
          </div>
          {kpi.trendValue && (
            <span
              className={cn(
                "ml-2",
                kpi.trend === "up" && "text-green-500",
                kpi.trend === "down" && "text-red-500",
                kpi.trend === "neutral" && "text-slate-500",
              )}
            >
              {kpi.trendValue}
            </span>
          )}
        </div>
      </div>
    )) || [];

  const dashboardWidgets =
    widgets?.map((widget) => (
      <Card key={widget.id} className="mb-4">
        <CardHeader title={widget.title} description={widget.description} />
        <CardBody>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-slate-500">
              <Spinner className="h-4 w-4" /> Loading…
            </div>
          ) : (
            <p className="text-slate-400">
              {widget.description || "No data available"}
            </p>
          )}
        </CardBody>
      </Card>
    )) || [];

  return (
    <div className="space-y-6">
      {kpiCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpiCards}
        </div>
      )}

      {dashboardWidgets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {dashboardWidgets}
        </div>
      )}

      {loading && !kpiCards.length && !dashboardWidgets.length && (
        <EmptyState
          title={title}
          description={subtitle || "Dashboard is loading…"}
        />
      )}
    </div>
  );
}
