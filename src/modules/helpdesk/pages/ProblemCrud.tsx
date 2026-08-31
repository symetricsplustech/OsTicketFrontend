import { EntityPage, StatusBadge } from '@shared/components/EntityPage';

export default function ProblemCrud() {
  return (
    <EntityPage
      entity="problem"
      title="Problems"
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
        { key: 'knownError', label: 'Known Error', render: (v) => (v ? 'Yes' : 'No') },
        { key: 'createdAt', label: 'Created' },
      ]}
    />
  );
}
