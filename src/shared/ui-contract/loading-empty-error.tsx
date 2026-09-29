import React from "react";
import { cn } from "@shared/lib/cn";
import { Spinner, PageLoader, EmptyState } from "@shared/components/ui";

interface LoadingEmptyErrorProps {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  skeleton?: boolean;
  label?: string;
}

export function LoadingEmptyError({
  loading,
  error,
  empty,
  emptyTitle = "No items",
  emptyDescription,
  skeleton,
  label = "Loading…"
}: LoadingEmptyErrorProps) {
  if (loading || skeleton) {
    return (
      <PageLoader label={label} />
    );
  }
  
  if (empty) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }
  
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }
  
  return null;
}