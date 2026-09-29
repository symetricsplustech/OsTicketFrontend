import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  ArrowLeft, Check, ChevronRight, Loader2,
  Building2, Globe, Mail, MapPin, Package,
  Settings, Shield, Users, Server, Zap,
} from "lucide-react";
import {
  Card, CardBody, CardHeader, Button, EmptyState,
  ErrorState, PageLoader, Spinner, Badge,
} from "@shared/components/ui";
import { PageHeader } from "@shared/components/PageHeader";
import { PermissionGate } from "@shared/components/PermissionGate";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks";
import { selectPermissions } from "@shared/auth/authSlice";
import { useCreateInstanceMutation, loginErrorMessage } from "@shared/api/authApi";
import { can } from "@shared/authorization/permissions";
import { cn } from "@shared/lib/cn";

type Step = "identity" | "regional" | "modules" | "review" | "provisioning";

const STEPS: { id: Step; label: string; icon: React.ReactNode }[] = [
  { id: "identity", label: "Identity", icon: <Building2 className="h-4 w-4" /> },
  { id: "regional", label: "Regional", icon: <MapPin className="h-4 w-4" /> },
  { id: "modules", label: "Modules", icon: <Package className="h-4 w-4" /> },
  { id: "review", label: "Review", icon: <Shield className="h-4 w-4" /> },
  { id: "provisioning", label: "Provision", icon: <Server className="h-4 w-4" /> },
];

const STEP_ORDER: Step[] = ["identity", "regional", "modules", "review", "provisioning"];

const MODULE_OPTIONS = [
  { id: "incidents", label: "Incident Management", description: "Track and resolve service incidents" },
  { id: "problems", label: "Problem Management", description: "Identify and resolve root causes" },
  { id: "changes", label: "Change Management", description: "Control the change lifecycle" },
  { id: "requests", label: "Service Requests", description: "Manage catalog-based requests" },
  { id: "knowledge", label: "Knowledge Base", description: "Organize and share knowledge articles" },
  { id: "assets", label: "Asset & CMDB", description: "Track configuration items" },
  { id: "reports", label: "Reporting & Analytics", description: "Operational dashboards and reports" },
  { id: "automation", label: "Automation Engine", description: "Scheduled tasks and workflows" },
];

const REGIONS = [
  { id: "us-east", label: "US East (Virginia)" },
  { id: "us-west", label: "US West (Oregon)" },
  { id: "eu-west", label: "EU West (Ireland)" },
  { id: "eu-central", label: "EU Central (Frankfurt)" },
  { id: "ap-south", label: "Asia Pacific (Mumbai)" },
  { id: "ap-east", label: "Asia Pacific (Singapore)" },
];

export function CreateInstancePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const permissions = useAppSelector(selectPermissions);
  const [create, { isLoading: isCreating }] = useCreateInstanceMutation();

  const [step, setStep] = useState<Step>("identity");
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set());

  // Identity
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [instanceCode, setInstanceCode] = useState("");

  // Regional
  const [region, setRegion] = useState("us-east");
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");

  // Modules
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set(["incidents"]));

  // Review
  const [reviewNotes, setReviewNotes] = useState("");

  // Provisioning
  const [provisioningLog, setProvisioningLog] = useState<string[]>([]);
  const [provisioningComplete, setProvisioningComplete] = useState(false);

  const [error, setError] = useState("");

  const currentStepIndex = STEP_ORDER.indexOf(step);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  const canProceedIdentity = name.trim().length >= 3 && domain.trim().length > 0 && companyName.trim().length >= 2 && companyEmail.trim().includes("@");
  const canProceedRegional = region !== "" && timezone !== "";
  const canProceedModules = selectedModules.size > 0;

  const handleNext = () => {
    setError("");
    const currentIdx = STEP_ORDER.indexOf(step);
    if (currentIdx < STEP_ORDER.length - 1) {
      setCompletedSteps((prev) => new Set([...prev, step]));
      setStep(STEP_ORDER[currentIdx + 1]);
    }
  };

  const handleBack = () => {
    setError("");
    const currentIdx = STEP_ORDER.indexOf(step);
    if (currentIdx > 0) {
      setStep(STEP_ORDER[currentIdx - 1]);
    }
  };

  const handleModuleToggle = (moduleId: string) => {
    setSelectedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const validateDomain = (domainValue: string) => /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/i.test(domainValue.trim());

  const handleSubmitReview = async () => {
    setError("");
    if (!validateDomain(domain)) {
      setError("Enter a valid domain such as acme.example.com.");
      return;
    }
    if (name.trim().length < 3 || companyName.trim().length < 2) {
      setError("Enter a valid instance and company name.");
      return;
    }

    try {
      const result = await create({
        name: name.trim(),
        domain: domain.trim().toLowerCase(),
        companyName: companyName.trim(),
        companyEmail: companyEmail.trim().toLowerCase(),
        region,
        modules: Array.from(selectedModules),
        timezone,
        instanceCode: instanceCode.trim() || undefined,
        reviewNotes,
      }).unwrap();

      setStep("provisioning");
      setProvisioningLog(["Instance created successfully. Beginning provisioning…", "Configuring services…", "Setting up modules…", "Provisioning complete!"]);
      setProvisioningComplete(true);
      toast.success("Instance created successfully!");
    } catch (cause) {
      setError(loginErrorMessage((cause as { data?: unknown }).data));
      toast.error("Failed to create instance");
    }
  };

  const handleFinish = () => {
    navigate("/platform", { replace: true });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <PageHeader
        title="Create an Instance"
        description="Your account becomes the instance owner. Domain and instance name must be unique."
        breadcrumbs={<nav className="flex items-center gap-1 text-xs text-slate-500"><Link to="/platform" className="hover:text-brand-600">Platform</Link><ArrowLeft className="h-3 w-3" /><span>Create Instance</span></nav>}
        actions={<Link to="/platform" className="text-sm text-brand-600 hover:underline">← Back</Link>}
      />

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-1 w-full rounded-full bg-slate-200">
              <div
                className="h-1 rounded-full bg-brand-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <span className="ml-3 text-sm font-medium text-brand-700">
            Step {currentStepIndex + 1} of {STEPS.length}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                i === currentStepIndex
                  ? "bg-brand-100 text-brand-700 ring-2 ring-brand-200"
                  : completedSteps.has(s.id)
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
              )}>
                {completedSteps.has(s.id) && i !== currentStepIndex ? <Check className="h-3 w-3" /> : <span className="h-4 w-4 grid place-items-center rounded-full bg-current/20 text-[10px]">{i + 1}</span>}
                {s.label}
              </div>
              {i < STEPS.length - 1 && <div className={cn("h-0.5 w-8 rounded-full", completedSteps.has(s.id) ? "bg-emerald-400" : "bg-slate-200")} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <Card>
        <CardBody>
          {/* Identity Step */}
          {step === "identity" && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-900">Instance Identity</h2>
              <p className="text-sm text-slate-500">Define the basic identity of your new instance.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Instance Display Name *</label>
                  <Input
                    placeholder="Acme Corporation"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    minLength={3}
                    maxLength={80}
                  />
                  <p className="mt-1 text-xs text-slate-400">3-80 characters</p>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Instance Domain *</label>
                  <Input
                    placeholder="acme.example.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    required
                    pattern="[a-z0-9][a-z0-9.-]*\.[a-z]{2,}"
                  />
                  <p className="mt-1 text-xs text-slate-400">Must be a valid domain</p>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Instance Code (optional)</label>
                  <Input placeholder="ACME" value={instanceCode} onChange={(e) => setInstanceCode(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Primary Company Name *</label>
                  <Input
                    placeholder="Acme Corporation"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    minLength={2}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-slate-600">Company Contact Email *</label>
                  <Input type="email" placeholder="admin@acme.com" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} required />
                </div>
              </div>
              {error && <ErrorState message={error} />}
              <div className="flex justify-end">
                <Button onClick={handleNext} disabled={!canProceedIdentity}>
                  Continue to Regional <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Regional Settings Step */}
          {step === "regional" && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-900">Regional Settings</h2>
              <p className="text-sm text-slate-500">Configure the deployment region and organization details.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Deployment Region *</label>
                  <Select value={region} onChange={(e) => setRegion(e.target.value)}>
                    {REGIONS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Timezone *</label>
                  <Select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                    <option value="America/New_York">Eastern (America/New_York)</option>
                    <option value="America/Chicago">Central (America/Chicago)</option>
                    <option value="America/Denver">Mountain (America/Denver)</option>
                    <option value="America/Los_Angeles">Pacific (America/Los_Angeles)</option>
                    <option value="Europe/London">GMT (Europe/London)</option>
                    <option value="Europe/Paris">Central European (Europe/Paris)</option>
                    <option value="Asia/Kolkata">India (Asia/Kolkata)</option>
                    <option value="Asia/Singapore">Singapore (Asia/Singapore)</option>
                    <option value="Asia/Tokyo">Japan (Asia/Tokyo)</option>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-slate-600">Company Name (confirmed)</label>
                  <Input value={companyName} disabled />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-slate-600">Company Contact Email (confirmed)</label>
                  <Input type="email" value={companyEmail} disabled />
                </div>
              </div>
              {error && <ErrorState message={error} />}
              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>← Back</Button>
                <Button onClick={handleNext} disabled={!canProceedRegional}>
                  Continue to Modules <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Modules Step */}
          {step === "modules" && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-900">Select Modules</h2>
              <p className="text-sm text-slate-500">Choose the operational modules to enable for this instance.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {MODULE_OPTIONS.map((mod) => (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => handleModuleToggle(mod.id)}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                      selectedModules.has(mod.id)
                        ? "border-brand-400 bg-brand-50 ring-1 ring-brand-200"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    )}
                  >
                    <div className={cn(
                      "mt-0.5 grid h-5 w-5 place-items-center rounded border text-xs",
                      selectedModules.has(mod.id) ? "border-brand-500 bg-brand-500 text-white" : "border-slate-300 bg-white text-slate-400"
                    )}>
                      {selectedModules.has(mod.id) && <Check className="h-3 w-3" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{mod.label}</p>
                      <p className="text-xs text-slate-500">{mod.description}</p>
                    </div>
                  </button>
                ))}
              </div>
              {error && <ErrorState message={error} />}
              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>← Back</Button>
                <Button onClick={handleNext} disabled={!canProceedModules}>
                  Continue to Review <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Review Step */}
          {step === "review" && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-900">Review & Confirm</h2>
              <p className="text-sm text-slate-500">Review all instance settings before provisioning.</p>
              <div className="space-y-4">
                {[
                  { label: "Instance Name", value: name },
                  { label: "Domain", value: domain },
                  { label: "Instance Code", value: instanceCode || "—" },
                  { label: "Company", value: companyName },
                  { label: "Contact Email", value: companyEmail },
                  { label: "Region", value: REGIONS.find((r) => r.id === region)?.label ?? region },
                  { label: "Timezone", value: timezone },
                  { label: "Modules", value: Array.from(selectedModules).join(", ") },
                ].map((item) => (
                  <div key={item.label} className="grid grid-cols-[180px_1fr] gap-3 py-2 text-sm">
                    <dt className="text-slate-500">{item.label}</dt>
                    <dd className="font-medium text-slate-900">{item.value}</dd>
                  </div>
                ))}
                <div className="grid grid-cols-[180px_1fr] gap-3 py-2 text-sm">
                  <dt className="text-slate-500">Notes</dt>
                  <dd className="text-slate-900">{reviewNotes || "—"}</dd>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Additional Notes (optional)</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                  className="focus-ring block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400"
                  placeholder="Any additional notes for provisioning…"
                />
              </div>
              {error && <ErrorState message={error} />}
              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>← Back</Button>
                <Button onClick={handleSubmitReview} loading={isCreating} disabled={isCreating}>
                  <Shield className="h-4 w-4" /> Provision Instance
                </Button>
              </div>
            </div>
          )}

          {/* Provisioning Step */}
          {step === "provisioning" && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-900">Provisioning</h2>
              <p className="text-sm text-slate-500">Your instance is being provisioned. This may take a few moments.</p>
              <div className="space-y-2">
                {provisioningLog.map((log, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={cn(
                      "mt-0.5 grid h-5 w-5 place-items-center rounded-full text-[10px]",
                      provisioningComplete ? "bg-emerald-100 text-emerald-700" : i === provisioningLog.length - 1 ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-500"
                    )}>
                      {provisioningComplete ? <Check className="h-3 w-3" /> : i === provisioningLog.length - 1 ? <Spinner className="h-3 w-3" /> : i + 1}
                    </div>
                    <p className={cn("text-sm", provisioningComplete ? "text-emerald-700" : "text-slate-700")}>{log}</p>
                  </div>
                ))}
              </div>
              {provisioningComplete && (
                <CardBody className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 className="h-5 w-5" />
                    <p className="font-semibold">Instance provisioned successfully!</p>
                  </div>
                </CardBody>
              )}
              <div className="flex justify-between">
                {provisioningComplete ? (
                  <Button onClick={handleFinish}>Go to Platform Home</Button>
                ) : (
                  <Button variant="outline" onClick={handleBack}>← Back</Button>
                )}
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
