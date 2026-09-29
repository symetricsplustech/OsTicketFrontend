import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Plus, Mail, Building2, Users, Shield, Clock, KeyRound } from "lucide-react";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardBody, CardHeader, Input, Button, Label, Field, Select, Textarea } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { DynamicFormRenderer, type FieldConfig } from "@shared/components/DynamicFormRenderer";
import { showSuccess, showError } from "@shared/components/Toast/ToastContainer";
import { useAppSelector } from "@shared/store/hooks";
import { selectPermissions } from "@shared/auth/authSlice";
import { PERMISSIONS } from "@shared/authorization/permissions";
import { useDirectoryQuery } from "@shared/api/instanceApi";
import type { DirectoryUser } from "@shared/types";

export function InviteUser() {
  const { instanceId = "" } = useParams<{ instanceId: string }>();
  const { data: directory } = useDirectoryQuery({ instanceId, limit: 50 }, { skip: !instanceId });
  const permissions = useAppSelector(selectPermissions);
  const canInvite = permissions.includes(PERMISSIONS.tenantUserUpdate) || permissions.includes("*");

  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState("identity");

  const sections = [
    { id: "identity", label: "Identity", icon: <Mail className="h-4 w-4" /> },
    { id: "organization", label: "Organization", icon: <Building2 className="h-4 w-4" /> },
    { id: "reporting", label: "Reporting", icon: <Users className="h-4 w-4" /> },
    { id: "operational", label: "Operational", icon: <Clock className="h-4 w-4" /> },
    { id: "access", label: "Access", icon: <Shield className="h-4 w-4" /> },
  ];

  const handleChange = (name: string, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showSuccess("Invitation sent successfully");
    } catch (cause) {
      const msg = cause instanceof Error ? cause.message : "Invitation failed";
      setErrors({ submit: msg });
      showError("Invitation failed", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const identityFields: FieldConfig[] = [
    { name: "fullName", label: "Full Name", type: "text", required: true, placeholder: "Enter full name" },
    { name: "email", label: "Email", type: "email", required: true, placeholder: "user@example.com" },
  ];

  const orgFields: FieldConfig[] = [
    { name: "company", label: "Company", type: "text", placeholder: "Search company" },
    { name: "businessUnit", label: "Business Unit", type: "text", placeholder: "Search business unit" },
    { name: "department", label: "Department", type: "text", placeholder: "Search department" },
    { name: "location", label: "Location", type: "text", placeholder: "Search location" },
  ];

  const reportingFields: FieldConfig[] = [
    { name: "manager", label: "Manager", type: "user-reference", placeholder: "Search manager" },
    { name: "teamLead", label: "Team Lead", type: "user-reference", placeholder: "Search team lead" },
  ];

  const accessFields: FieldConfig[] = [
    { name: "memberRole", label: "Member Role", type: "select", options: [{ value: "member", label: "Member" }, { value: "admin", label: "Admin" }, { value: "manager", label: "Manager" }] },
    { name: "groups", label: "Groups", type: "group-reference", placeholder: "Search groups" },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "identity": return <DynamicFormRenderer fields={identityFields} values={formValues} onChange={handleChange} errors={errors} disabled={submitting} onSubmit={handleSubmit} submitLabel="Send Invitation" />;
      case "organization": return <DynamicFormRenderer fields={orgFields} values={formValues} onChange={handleChange} errors={errors} disabled={submitting} onSubmit={handleSubmit} submitLabel="Continue" />;
      case "reporting": return <DynamicFormRenderer fields={reportingFields} values={formValues} onChange={handleChange} errors={errors} disabled={submitting} onSubmit={handleSubmit} submitLabel="Continue" />;
      case "operational": return <div className="space-y-4"><Field label="Timezone"><Select><option>UTC</option><option>America/New_York</option><option>Europe/London</option></Select></Field><Field label="Locale"><Select><option>en-US</option><option>en-GB</option></Select></Field></div>;
      case "access": return <DynamicFormRenderer fields={accessFields} values={formValues} onChange={handleChange} errors={errors} disabled={submitting} onSubmit={handleSubmit} submitLabel="Complete Invitation" />;
      default: return null;
    }
  };

  return (
    <div>
      <PageHeader
        title="Invite User"
        description="Invite a new member to this instance with identity, organization, and access settings."
        breadcrumbs={<Link to={`/instances/${instanceId}`} className="hover:text-brand-600">Instance</Link>}
      />
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card>
          <CardHeader title="Sections" />
          <CardBody className="space-y-1">
            {sections.map((section) => (
              <button key={section.id} onClick={() => setActiveSection(section.id)} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${activeSection === section.id ? "bg-brand-50 text-brand-700 font-semibold" : "text-slate-600 hover:bg-slate-50"}`}>
                {section.icon}<span>{section.label}</span>
              </button>
            ))}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title={sections.find((s) => s.id === activeSection)?.label} />
          <CardBody>
            {renderSection()}
            {errors.submit ? <p className="mt-4 text-sm text-red-600">{errors.submit}</p> : null}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
