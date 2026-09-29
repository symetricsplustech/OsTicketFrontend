import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardBody } from "@shared/components/ui";
import { Badge } from "@shared/components/ui";

export function SaaSInstanceDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = React.useState("overview");

  return (
    <div>
      <Card>
        <CardHeader title="Instance Detail" />
        <CardBody>
          <p>Instance details for: {id || "Unknown"}</p>
        </CardBody>
      </Card>

      {activeTab === "users" && (
        <Card>
          <CardHeader title="Instance Users" />
          <CardBody>Users content</CardBody>
        </Card>
      )}

      {activeTab === "settings" && (
        <Card>
          <CardHeader title="Instance Settings" />
          <CardBody>Settings content</CardBody>
        </Card>
      )}
    </div>
  );
}
