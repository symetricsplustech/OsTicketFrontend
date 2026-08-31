import { EntityPage, StatusBadge } from '@shared/components/EntityPage';

export default function TicketCrud() {
  return (
    <EntityPage
      entity="ticket"
      title="Tickets"
      columns={[
        { key: 'number', label: '#' },
        { key: 'title', label: 'Subject' },
        { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
        { key: 'priority', label: 'Priority', render: (v) => <StatusBadge status={v} /> },
        { key: 'source', label: 'Source' },
        { key: 'createdAt', label: 'Created' },
      ]}
    />
  );
}
