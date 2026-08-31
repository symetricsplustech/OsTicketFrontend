import React, { useState } from 'react';
import { RecordTable, StatusBadge } from '@shared/components/RecordTable';
import { RecordDrawer } from '@shared/components/RecordDrawer';

// Generic entity page — pass entity key + column config, get full CRUD + drawer detail
export function EntityPage({ entity, columns, extraFilters, title }: {
  entity: string;
  title: string;
  columns: Array<{ key: string; label: string; render?: (v: any, row: any) => React.ReactNode }>;
  extraFilters?: Record<string, string>;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <RecordTable
        entity={entity}
        columns={columns}
        extraFilters={extraFilters}
        onRowClick={row => setSelectedId(row._id)}
      />
      {selectedId && (
        <RecordDrawer entity={entity} id={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}

export { StatusBadge };
