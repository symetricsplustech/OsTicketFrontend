import { EntityPage, StatusBadge } from '@shared/components/EntityPage';

export default function CiCrud() {
  return (
    <EntityPage
      entity="ci"
      title="Configuration Items"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'ciClass', label: 'Class' },
        { key: 'environment', label: 'Environment' },
        { key: 'criticality', label: 'Criticality', render: (v) => <StatusBadge status={v} /> },
        { key: 'ipAddress', label: 'IP Address' },
      ]}
    />
  );
}
