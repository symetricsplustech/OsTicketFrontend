import { useState, useMemo } from "react";
import { Shield, ShieldCheck, ShieldOff, Search, RefreshCw, Lock, Unlock } from "lucide-react";
import { Input } from "@shared/components/ui";
import { Button } from "@shared/components/ui";
import { Card, CardBody, CardHeader } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";
import { cn } from "@shared/lib/cn";
import { useCan } from "@shared/authorization/permissions";

export interface PermissionEntry {
  permission: string;
  granted: boolean;
  source: string;
  description: string;
}

export interface PermissionSimulatorProps {
  permissions: PermissionEntry[];
  userId?: string;
  userName?: string;
  loading?: boolean;
  onSimulate?: (permission: string, granted: boolean) => void;
}

export function PermissionSimulator({ permissions, userId, userName, loading, onSimulate }: PermissionSimulatorProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = useMemo(() => {
    const cats = new Set(permissions.map((p) => p.permission.split(".")[0] ?? "general"));
    return ["all", ...Array.from(cats)];
  }, [permissions]);

  const filteredPermissions = useMemo(() => {
    return permissions.filter((p) => {
      if (query && !p.permission.toLowerCase().includes(query.toLowerCase()) && !p.description.toLowerCase().includes(query.toLowerCase())) return false;
      if (selectedCategory !== "all" && !p.permission.startsWith(selectedCategory)) return false;
      return true;
    });
  }, [permissions, query, selectedCategory]);

  const grantedCount = permissions.filter((p) => p.granted).length;
  const deniedCount = permissions.filter((p) => !p.granted).length;
  const totalCount = permissions.length;

  const handleToggle = (permission: string) => {
    const entry = permissions.find((p) => p.permission === permission);
    if (entry && onSimulate) {
      onSimulate(permission, !entry.granted);
    }
  };

  if (loading) {
    return <Card><CardBody className="flex items-center justify-center py-8"><RefreshCw className="h-6 w-6 animate-spin text-brand-500" /></CardBody></Card>;
  }

  return (
    <Card>
      <CardHeader
        title="Permission Simulator"
        description={`Authorization analysis for ${userName ?? userId ?? "user"}`}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="success">{grantedCount} granted</Badge>
            <Badge variant="danger">{deniedCount} denied</Badge>
            <Badge variant="muted">{totalCount} total</Badge>
          </div>
        }
      />
      <CardBody>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search permissions…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
        </div>
        <div className="mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4 text-slate-500" />
          <select className="rounded border border-slate-300 bg-white px-2 py-1 text-xs" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat === "all" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          {filteredPermissions.map((entry) => {
            const canUse = useCan(entry.permission);
            return (
              <div key={entry.permission} onClick={() => handleToggle(entry.permission)} className={cn(
                "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition hover:shadow-sm",
                entry.granted ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"
              )}>
                {entry.granted ? <ShieldCheck className="h-5 w-5 text-emerald-600" /> : <ShieldOff className="h-5 w-5 text-red-600" />}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono font-medium text-slate-800">{entry.permission}</p>
                    <Badge variant={entry.granted ? "success" : "danger"}>{entry.granted ? "Granted" : "Denied"}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{entry.description}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">Source: {entry.source}</p>
                </div>
                <div className="flex items-center gap-1">
                  {entry.granted ? <Unlock className="h-4 w-4 text-emerald-500" /> : <Lock className="h-4 w-4 text-red-500" />}
                </div>
              </div>
            );
          })}
          {filteredPermissions.length === 0 && (
            <div className="py-6 text-center text-sm text-slate-500">No permissions match your criteria</div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
