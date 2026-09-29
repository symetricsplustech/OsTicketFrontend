import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Search, AlertTriangle, HelpCircle, ArrowRight } from "lucide-react";
import { useAppSelector } from "@shared/store/hooks";
import { selectPermissions } from "@shared/auth/authSlice";
import { can } from "@shared/authorization/permissions";
import { PageHeader } from "@shared/components/PageHeader";
import { Card, CardHeader, CardBody } from "@shared/components/ui";
import { Button } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { Input } from "@shared/components/ui";
import { Spinner } from "@shared/components/ui";
import { EmptyState } from "@shared/components/ui";
import { DynamicFormRenderer, FieldConfig } from "@shared/components/DynamicFormRenderer";
import { showSuccess } from "@shared/components/Toast/ToastContainer";
import { cn } from "@shared/lib/cn";

export function GetHelp() {
  const navigate = useNavigate();
  const { instanceId = "" } = useParams();
  const permissions = useAppSelector(selectPermissions);
  const [search, setSearch] = useState("");
  const [step, setStep] = useState<"form" | "results">("form");
  const [selectedType, setSelectedType] = useState<"incident" | "request" | null>(null);
  const [knowledgeResults, setKnowledgeResults] = useState<Array<{ id: string; title: string; summary: string }>>([]);
  const [catalogResults, setCatalogResults] = useState<Array<{ id: string; name: string; price: string }>>([]);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const canSubmitIncident = can(permissions, "itsm.incident.create");
  const canSubmitRequest = can(permissions, "itsm.request.create");
  const canReadCatalog = can(permissions, "itsm.catalog.read");
  const canReadKnowledge = can(permissions, "itsm.knowledge.read");

  const formFields: FieldConfig[] = [
    { name: "subject", label: "Subject", type: "text", required: true, placeholder: "Brief description of the issue" },
    { name: "description", label: "Description", type: "textarea", required: true, placeholder: "Describe what's happening…" },
    { name: "priority", label: "Priority", type: "select", options: [{ value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }, { value: "critical", label: "Critical" }], required: true },
  ];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormErrors({});
    if (!formValues.subject || !formValues.description) {
      setFormErrors({ subject: !formValues.subject ? "Subject is required" : "", description: !formValues.description ? "Description is required" : "" });
      return;
    }
    setSubmitting(true);
    try {
      const endpoint = selectedType === "incident" ? "/api/v1/portal/incidents" : "/api/v1/portal/requests";
      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formValues) });
      const data = await res.json();
      if (data.success) {
        showSuccess("Submitted", `Your ${selectedType} has been submitted.`);
        navigate(`/instances/${instanceId}/portal/${selectedType === "incident" ? "my-incidents" : "my-requests"}`);
      }
    } catch {
      setFormErrors({ subject: "Submission failed. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearchKnowledge = async () => {
    if (!search.trim()) return;
    try {
      const res = await fetch(`/api/v1/portal/knowledge/search?q=${encodeURIComponent(search)}`);
      const data = await res.json();
      setKnowledgeResults(data.items ?? []);
    } catch {
      setKnowledgeResults([]);
    }
  };

  const handleSearchCatalog = async () => {
    if (!search.trim()) return;
    try {
      const res = await fetch(`/api/v1/portal/catalog/search?q=${encodeURIComponent(search)}`);
      const data = await res.json();
      setCatalogResults(data.items ?? []);
    } catch {
      setCatalogResults([]);
    }
  };

  const handleSuggestionClick = (title: string) => {
    setFormValues((prev) => ({ ...prev, subject: title }));
    setStep("form");
    setTimeout(() => {
      const el = document.getElementById("subject-input");
      el?.focus();
    }, 100);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader title="Get Help" description="Submit an incident or request. We'll suggest relevant knowledge and catalog items." actions={<Link to={`/instances/${instanceId}/portal/home`} className="text-sm text-brand-600 hover:underline"><ArrowRight className="h-4 w-4 inline" /> Back to Home</Link>} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Describe Your Issue" description="Tell us what's happening and we'll guide you." />
          <CardBody>
            <div className="flex gap-2 mb-4">
              <button onClick={() => { setSelectedType("incident"); setStep("form"); }} className={cn("rounded-lg px-4 py-2.5 text-sm font-semibold border", selectedType === "incident" ? "border-red-300 bg-red-50 text-red-700" : "border-slate-200 bg-white text-slate-600")}><AlertTriangle className="h-4 w-4 inline mr-1" /> Incident</button>
              <button onClick={() => { setSelectedType("request"); setStep("form"); }} className={cn("rounded-lg px-4 py-2.5 text-sm font-semibold border", selectedType === "request" ? "border-brand-300 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-600")}><ShoppingCart className="h-4 w-4 inline mr-1" /> Request</button>
            </div>

            {step === "form" ? (
              <DynamicFormRenderer
                fields={formFields}
                values={formValues}
                onChange={(name, value) => setFormValues((prev) => ({ ...prev, [name]: value }))}
                errors={formErrors}
                onSubmit={handleSubmit}
                submitLabel={selectedType === "incident" ? "Submit Incident" : "Submit Request"}
                onCancel={() => { setStep("form"); setFormValues({}); }}
              />
            ) : null}
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Suggested Knowledge Articles" description="Based on your description.">
              <div className="relative">
                <Input placeholder="Search knowledge…" value={search} onChange={(e) => setSearch(e.target.value)} className="pr-8" />
                <Search className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </CardHeader>
            <CardBody>
              {search ? (
                knowledgeResults.length > 0 ? (
                  <ul className="space-y-2">
                    {knowledgeResults.map((article) => (
                      <li key={article.id} onClick={() => handleSuggestionClick(article.title)} className="cursor-pointer rounded-lg border border-slate-200 p-3 hover:bg-brand-50">
                        <p className="text-sm font-medium text-brand-700">{article.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{article.summary}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState title="No articles found" description="Try a different search term." />
                )
              ) : (
                <p className="py-4 text-center text-sm text-slate-500">Type a search or describe your issue to get suggestions.</p>
              )}
            </CardBody>
          </Card>

          {canReadCatalog && (
            <Card>
              <CardHeader title="Suggested Catalog Items" description="Items that might help resolve your issue.">
                <div className="relative">
                  <Input placeholder="Search catalog…" value={search} onChange={(e) => { setSearch(e.target.value); handleSearchCatalog(); }} className="pr-8" />
                  <Search className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </CardHeader>
              <CardBody>
                {catalogResults.length > 0 ? (
                  <ul className="space-y-2">
                    {catalogResults.map((item) => (
                      <li key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                        <div><p className="text-sm font-medium">{item.name}</p><p className="text-[10px] text-slate-500">{item.price}</p></div>
                        <Link to={`/instances/${instanceId}/portal/catalog/${item.id}`} className="text-xs text-brand-600 hover:underline">View</Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-4 text-center text-sm text-slate-500">No catalog items match this query.</p>
                )}
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
