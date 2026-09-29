import { useState } from "react";
import {
  Building2, ChevronDown, ChevronUp, Globe,
  Settings, User, Lock, Loader2, Check,
} from "lucide-react";
import { Input } from "@shared/components/ui";
import { Button } from "@shared/components/ui";
import { Card, CardBody, CardHeader } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { cn } from "@shared/lib/cn";
import { useCan } from "@shared/authorization/permissions";

export interface Experience {
  id: string;
  name: string;
  type: "platform" | "dispatcher" | "field_engineer" | "manager" | "itsm_admin" | "requester" | "saas";
  icon?: string;
  description: string;
  status: "active" | "inactive" | "restricted";
  permissions?: string[];
}

interface ExperienceSwitcherProps {
  experiences: Experience[];
  activeExperience: string;
  onSwitch: (experienceId: string) => void;
  loading?: boolean;
  canManageExperiences?: boolean;
}

const experienceColors = {
  platform: "bg-brand-500",
  dispatcher: "bg-amber-500",
  field_engineer: "bg-cyan-500",
  manager: "bg-purple-500",
  itsm_admin: "bg-red-500",
  requester: "bg-emerald-500",
  saas: "bg-slate-500",
};

const experienceLabels = {
  platform: "Platform",
  dispatcher: "Dispatcher",
  field_engineer: "Field Engineer",
  manager: "Manager",
  itsm_admin: "ITSM Admin",
  requester: "Requester Portal",
  saas: "SaaS",
};

export function ExperienceSwitcher({ experiences, activeExperience, onSwitch, loading, canManageExperiences = false }: ExperienceSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const activeExperienceData = experiences.find((e) => e.id === activeExperience);
  const filtered = experiences.filter((e) => {
    if (!searchQuery) return true;
    return e.name.toLowerCase().includes(searchQuery.toLowerCase()) || experienceLabels[e.type].toLowerCase().includes(searchQuery.toLowerCase());
  });

  const canSwitch = useCan("platform.experience.switch");

  if (loading) {
    return (
      <Card><CardBody className="flex items-center justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></CardBody></Card>
    );
  }

  return (
    <Card>
      <CardHeader title="Experience Switcher" description="Switch between operational experiences" />
      <CardBody>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 transition hover:border-brand-300"
        >
          <div className={`flex h-10 w-10 items-center justify-center rounded-full text-white ${experienceColors[activeExperienceData?.type ?? "platform"]}`}>
            {activeExperienceData?.type === "platform" ? <Globe className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-slate-900">{activeExperienceData?.name ?? "Select Experience"}</p>
            <p className="text-xs text-slate-500">{activeExperienceData?.description ?? ""}</p>
          </div>
          <Badge variant={activeExperienceData?.status ?? "muted"}>{activeExperienceData?.status ?? "unknown"}</Badge>
          {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </button>

        {isOpen && (
          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
            {canManageExperiences ? (
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input placeholder="Search experiences…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
              </div>
            ) : null}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filtered.map((exp) => {
                const isActive = exp.id === activeExperience;
                const canAccess = exp.status !== "restricted" || canSwitch;
                return (
                  <button
                    key={exp.id}
                    onClick={() => { if (canAccess) { onSwitch(exp.id); setIsOpen(false); } }}
                    disabled={!canAccess}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition",
                      isActive ? "border-brand-400 bg-brand-50" : "border-slate-200 hover:border-slate-300",
                      !canAccess ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                    )}
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${experienceColors[exp.type]}`}>
                      {exp.type === "platform" ? <Globe className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800">{exp.name}</p>
                        {isActive ? <Check className="h-3.5 w-3.5 text-brand-600" /> : null}
                      </div>
                      <p className="text-[10px] text-slate-500">{experienceLabels[exp.type]} · {exp.description}</p>
                    </div>
                    {exp.status === "restricted" ? <Lock className="h-3.5 w-3.5 text-amber-500" /> : null}
                    {exp.status === "inactive" ? <Badge variant="muted">Inactive</Badge> : null}
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="py-4 text-center text-sm text-slate-500">No experiences found</div>
              )}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
