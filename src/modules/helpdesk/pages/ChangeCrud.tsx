import { EntityPage, StatusBadge } from '@shared/components/EntityPage';

export default function ChangeCrud() {
  return (
    <EntityPage
      entity="change"
      title="Changes"
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'type', label: 'Type' },
        { key: 'riskLevel', label: 'Risk Level', render: (v) => <StatusBadge status={v} /> },
        { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
        { key: 'windowStart', label: 'Window Start' },
      ]}
    />
  );
}
