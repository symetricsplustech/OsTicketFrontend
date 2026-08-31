import { EntityPage, StatusBadge } from '@shared/components/EntityPage';

export default function HrCaseCrud() {
  return (
    <EntityPage
      entity="hr_case"
      title="HR Cases"
      columns={[
        { key: 'number', label: '#' },
        { key: 'title', label: 'Title' },
        { key: 'category', label: 'Category' },
        { key: 'confidential', label: 'Confidential', render: (v) => (v ? 'Yes' : 'No') },
        { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
      ]}
    />
  );
}
