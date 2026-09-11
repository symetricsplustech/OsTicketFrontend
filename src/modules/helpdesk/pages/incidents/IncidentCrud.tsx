import { EntityPage, StatusBadge } from '@shared/components/EntityPage';

export default function IncidentCrud() {
  return (
    <EntityPage
      entity="incident"
      title="Incidents"
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'severity', label: 'Severity', render: (v) => <StatusBadge status={v} /> },
        { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
        { key: 'isMajor', label: 'Major', render: (v) => (v ? 'Yes' : 'No') },
        { key: 'createdAt', label: 'Created' },
      ]}
    />
  );
}
