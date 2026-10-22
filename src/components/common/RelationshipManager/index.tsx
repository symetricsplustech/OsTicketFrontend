import { useState, useMemo } from "react";
import {
  Link,
  Plus,
  Trash2,
  Search,
  Lock,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { Input } from "@components/common/ui";
import { Button } from "@components/common/ui";
import { Card, CardBody, CardHeader } from "@components/common/ui";
import { Badge } from "@components/common/Badge";
import { PermissionGate } from "@components/common/PermissionGate";
import { cn } from "@utils/cn";
import { useCan } from "@services/authorization/permissions";

export interface Relationship {
  id: string;
  type: string;
  sourceType: string;
  sourceId: string;
  targetType: string;
  targetId: string;
  targetName: string;
  direction: "parent" | "child" | "related";
  instanceId?: string;
}

interface RelationshipManagerProps {
  relationships: Relationship[];
  sourceType: string;
  sourceId: string;
  onAdd: (type: string, targetId: string) => void;
  onRemove: (id: string) => void;
  onSearch: (query: string) => void;
  searchResults: Array<{ id: string; name: string; type: string }>;
  loading?: boolean;
  canEdit?: boolean;
}

const directionLabels = {
  parent: { label: "Parent", color: "info" as const },
  child: { label: "Child", color: "success" as const },
  related: { label: "Related", color: "muted" as const },
};

export function RelationshipManager({
  relationships,
  sourceType,
  sourceId,
  onAdd,
  onRemove,
  onSearch,
  searchResults,
  loading,
  canEdit = true,
}: RelationshipManagerProps) {
  const [query, setQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [selectedTarget, setSelectedTarget] = useState("");
  const canManage = useCan("itsm.relationship.manage");

  const filteredResults = useMemo(() => {
    if (!query) return [];
    return searchResults.filter(
      (r) =>
        r.name.toLowerCase().includes(query.toLowerCase()) ||
        r.type.toLowerCase().includes(query.toLowerCase()),
    );
  }, [query, searchResults]);

  const handleAdd = () => {
    if (selectedType && selectedTarget && canManage && canEdit) {
      onAdd(selectedType, selectedTarget);
      setSelectedType("");
      setSelectedTarget("");
      setShowAddForm(false);
      setQuery("");
    }
  };

  const isCrossInstance = relationships.some(
    (r) => r.instanceId && r.instanceId !== sourceId,
  );

  return (
    <Card>
      <CardHeader
        title="Relationships"
        description={`${sourceType} relationships and connections`}
        actions={
          <PermissionGate permissions="itsm.relationship.manage">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
              disabled={!canManage || !canEdit}
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          </PermissionGate>
        }
      />
      <CardBody>
        {isCrossInstance && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <AlertTriangle className="h-4 w-4" />
            Cross-instance relationships detected. Verify permissions before
            modifying.
          </div>
        )}

        {showAddForm && canManage && canEdit ? (
          <div className="mb-4 rounded-lg border border-brand-200 bg-brand-50 p-4">
            <h4 className="mb-3 text-sm font-bold text-brand-800">
              Add Relationship
            </h4>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Relationship Type
                </label>
                <select
                  className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="">Select type</option>
                  <option value="Incident↔Problem">Incident ↔ Problem</option>
                  <option value="Problem↔Change">Problem ↔ Change</option>
                  <option value="Change↔CI">Change ↔ CI</option>
                  <option value="Request↔Task">Request ↔ Task</option>
                  <option value="Incident↔CI">Incident ↔ CI</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Search Target
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search records…"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      onSearch(e.target.value);
                    }}
                    className="pl-9"
                  />
                </div>
              </div>
              {filteredResults.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {filteredResults.map((result) => (
                    <div
                      key={result.id}
                      onClick={() => setSelectedTarget(result.id)}
                      className={`flex items-center gap-3 rounded-lg border p-2.5 cursor-pointer ${selectedTarget === result.id ? "border-brand-400 bg-brand-50" : "border-slate-200 bg-white"}`}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{result.name}</p>
                        <p className="text-[10px] text-slate-500">
                          {result.type}
                        </p>
                      </div>
                      <Badge variant="info">{result.type}</Badge>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleAdd}
                  disabled={!selectedTarget}
                >
                  Confirm
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowAddForm(false);
                    setSelectedType("");
                    setSelectedTarget("");
                    setQuery("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ) : !canManage ? (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <Lock className="h-4 w-4" /> You do not have permission to manage
            relationships.
          </div>
        ) : null}

        {loading ? (
          <div className="py-4 text-center text-sm text-slate-500">
            Loading relationships…
          </div>
        ) : (
          <div className="space-y-2">
            {relationships.map((rel) => {
              const dir = directionLabels[rel.direction];
              return (
                <div
                  key={rel.id}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3"
                >
                  <Link className="h-4 w-4 text-brand-600 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{rel.targetName}</p>
                      <Badge variant={dir.color}>{dir.label}</Badge>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      {rel.type} · {rel.targetType} · {rel.targetId}
                    </p>
                  </div>
                  {rel.instanceId ? (
                    <Badge variant="muted" className="text-[10px]">
                      {rel.instanceId}
                    </Badge>
                  ) : null}
                  {canManage && canEdit ? (
                    <button
                      onClick={() => onRemove(rel.id)}
                      className="rounded p-1 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </div>
              );
            })}
            {relationships.length === 0 && (
              <div className="py-6 text-center text-sm text-slate-500">
                No relationships defined
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
