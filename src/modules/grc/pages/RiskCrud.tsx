import { EntityPage } from '@shared/components/EntityPage';

export default function RiskCrud() {
  return (
    <EntityPage
      entity="risk_item"
      title="Risk Register"
      columns={[
        { key: 'statement', label: 'Statement', render: (v) => v?.slice(0, 60) ?? '' },
        { key: 'category', label: 'Category' },
        { key: 'likelihood', label: 'Likelihood' },
        { key: 'impact', label: 'Impact' },
        { key: 'residualScore', label: 'Residual Score' },
      ]}
    />
  );
}
