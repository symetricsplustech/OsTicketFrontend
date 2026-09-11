import { classNames } from '@shared/lib/classNames';

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={classNames('flex h-64 items-center justify-center', className)} role="status" aria-label="Loading">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-600" />
    </div>
  );
}
