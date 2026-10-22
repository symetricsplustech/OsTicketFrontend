import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LifeBuoy } from "lucide-react";
import { Button, Field, Input, Select, Textarea } from "@components/common/ui";
import { toast } from "react-hot-toast";
import { useCreateIncidentMutation } from "@services/tenantadmin";
import {
  useListIncidentCategoryQuery,
  useListIncidentPriorityQuery,
} from "@services/tenantadmin";
import { SaasAdminScreen } from "@/screens/saas-admin/components/SaasAdminScreen";
import { apiErrorMessage } from "@services/http";

export function CreateTicketScreen() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    categoryId: "",
    priorityKey: "medium",
    impact: "MEDIUM",
    urgency: "MEDIUM",
    source: "PORTAL",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [trigger] = useCreateIncidentMutation();
  const { data: categoriesData, isLoading: categoriesLoading } =
    useListIncidentCategoryQuery();
  const { data: prioritiesData, isLoading: prioritiesLoading } =
    useListIncidentPriorityQuery();

  const categories = categoriesData?.data ?? [];
  const priorities = prioritiesData?.data ?? [];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});
    try {
      await trigger({
        title: form.title,
        description: form.description || null,
        categoryId: form.categoryId || null,
        priorityKey: form.priorityKey,
        impact: form.impact,
        urgency: form.urgency,
        source: form.source,
      }).unwrap();
      toast.success("Ticket created");
      navigate("/organization/service-desk/all-service-desk-tickets", {
        replace: true,
      });
    } catch (cause) {
      const msg = apiErrorMessage(
        (cause as { data?: unknown } | undefined)?.data,
      );
      setErrors({ submit: msg });
      toast.error(msg);
    }
  };

  if (categoriesLoading || prioritiesLoading) {
    return (
      <div className="p-6 text-slate-500">Loading ticket form…</div>
    );
  }

  return (
    <SaasAdminScreen
      title="Create Ticket"
      description="Report a data-center issue. The ticket is routed to the support group matching its category."
      breadcrumbs={[
        { label: "Service Desk", href: "/organization" },
        { label: "Create Ticket" },
      ]}
      backTo="/organization/service-desk/all-service-desk-tickets"
      backLabel="Back to tickets"
      actions={
        <Button onClick={handleSubmit}>
          <LifeBuoy className="h-4 w-4 mr-1" />
          Create Ticket
        </Button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Subject" htmlFor="title">
          <Input
            id="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            placeholder="Cooling unit alert in Ashburn DC1"
          />
        </Field>
        <Field label="Description" htmlFor="description">
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            required
            rows={4}
            placeholder="Describe the issue, affected service, and any error messages."
          />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Category" htmlFor="categoryId">
            <Select
              id="categoryId"
              value={form.categoryId}
              onChange={(e) =>
                setForm({ ...form, categoryId: e.target.value })
              }
            >
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Priority" htmlFor="priorityKey">
            <Select
              id="priorityKey"
              value={form.priorityKey}
              onChange={(e) =>
                setForm({ ...form, priorityKey: e.target.value })
              }
              required
            >
              {priorities.map((priority) => (
                <option key={priority.id} value={priority.key}>
                  {priority.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Impact" htmlFor="impact">
            <Select
              id="impact"
              value={form.impact}
              onChange={(e) => setForm({ ...form, impact: e.target.value })}
              required
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </Select>
          </Field>
          <Field label="Urgency" htmlFor="urgency">
            <Select
              id="urgency"
              value={form.urgency}
              onChange={(e) => setForm({ ...form, urgency: e.target.value })}
              required
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </Select>
          </Field>
        </div>
        <Field label="Source channel" htmlFor="source">
          <Select
            id="source"
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
          >
            <option value="PORTAL">Customer Portal</option>
            <option value="EMAIL">Email</option>
            <option value="PHONE">Phone</option>
            <option value="API">REST API</option>
            <option value="MONITORING">Monitoring Alert</option>
          </Select>
        </Field>
        {errors.submit && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errors.submit}
          </p>
        )}
      </form>
    </SaasAdminScreen>
  );
}
