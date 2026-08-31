import { EntityPage, StatusBadge } from '@shared/components/EntityPage';

export default function FinanceCaseCrud() {
  return (
    <EntityPage
      entity="finance_case"
      title="Finance Cases"
      columns={[
        { key: 'number', label: '#' },
        { key: 'title', label: 'Title' },
        { key: 'caseType', label: 'Type' },
        { key: 'amount', label: 'Amount', render: (v) => `$${v?.toLocaleString() || '0'}` },
        { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
      ]}
    />
  );
}
