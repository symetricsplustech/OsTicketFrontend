import React, { useState, useEffect, useMemo } from 'react';
import { useGetRecordsQuery } from '@shared/store/crudApi';

// ---- RefSelect: dropdown populated from another entity ----
export function RefSelect({ entity, value, onChange, labelField = 'name', placeholder }: {
  entity: string; value: any; onChange: (v: any) => void;
  labelField?: string; placeholder?: string;
}) {
  const { data } = useGetRecordsQuery({ entity, limit: 100 });
  const options = data?.records || [];
  return (
    <select value={value ?? ''} onChange={e => onChange(e.target.value)} className="input-field">
      <option value="">{placeholder || `Select ${entity}…`}</option>
      {options.map((o: any) => (
        <option key={o._id} value={o._id}>{o[labelField] || o.name || o.title || o._id?.slice(-8)}</option>
      ))}
    </select>
  );
}

