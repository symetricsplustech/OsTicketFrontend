import { EntityPage, StatusBadge } from '@shared/components/EntityPage';

export default function AssetCrud() {
  return (
    <EntityPage
      entity="asset"
      title="Assets"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'type', label: 'Type' },
        { key: 'serialNumber', label: 'Serial Number' },
        { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
        { key: 'location', label: 'Location' },
      ]}
    />
  );
}
