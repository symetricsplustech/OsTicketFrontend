import { EntityPage, StatusBadge } from '@shared/components/EntityPage';

export default function LegalMatterCrud() {
  return (
    <EntityPage
      entity="legal_matter"
      title="Legal Matters"
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'practiceArea', label: 'Practice Area' },
        { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
        { key: 'budget', label: 'Budget', render: (v) => `$${v?.toLocaleString() || '0'}` },
      ]}
    />
  );
}
