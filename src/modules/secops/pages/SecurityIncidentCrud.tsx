import { EntityPage, StatusBadge } from '@shared/components/EntityPage';

export default function SecurityIncidentCrud() {
  return (
    <EntityPage
      entity="security_incident"
      title="Security Incidents"
      columns={[
        { key: 'number', label: '#' },
        { key: 'title', label: 'Title' },
        { key: 'category', label: 'Category' },
        { key: 'severity', label: 'Severity', render: (v) => <StatusBadge status={v} /> },
        { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
      ]}
    />
  );
}
