import { EntityPage, StatusBadge } from '@shared/components/EntityPage';

export default function OppCrud() {
  return (
    <EntityPage
      entity="opportunity"
      title="Opportunities"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'stage', label: 'Stage', render: (v) => <StatusBadge status={v} /> },
        { key: 'value', label: 'Value', render: (v) => `$${v?.toLocaleString() || '0'}` },
        { key: 'probability', label: 'Probability', render: (v) => `${v ?? 0}%` },
        { key: 'closeDate', label: 'Close Date' },
      ]}
    />
  );
}
