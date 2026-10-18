import { useState, useMemo } from "react";
import { Plus, Trash2, Settings, Shield, Route, Bell, CheckCircle, ArrowRight, GitBranch, AlertTriangle } from "lucide-react";
import { Input } from "@components/common/ui";
import { Button } from "@components/common/ui";
import { Card, CardBody, CardHeader } from "@components/common/ui";
import { Tabs } from "@components/common/Tabs";
import { Badge } from "@components/common/Badge";
import { cn } from "@utils/cn";

export type RuleType = "assignment" | "routing" | "record_condition" | "approval" | "sla" | "notification" | "eligibility";

export interface Condition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

export interface Action {
  id: string;
  type: string;
  target: string;
  config: Record<string, unknown>;
}

export interface ElseAction {
  id: string;
  type: string;
  target: string;
  config: Record<string, unknown>;
}

export interface PolicyRule {
  id: string;
  name: string;
  type: RuleType;
  conditions: Condition[];
  actions: Action[];
  elseActions: ElseAction[];
  enabled: boolean;
  priority: number;
}

const ruleTypeConfig: Record<RuleType, { label: string; icon: typeof Shield; color: string }> = {
  assignment: { label: "Assignment Rules", icon: Route, color: "brand" },
  routing: { label: "Routing Rules", icon: ArrowRight, color: "info" },
  record_condition: { label: "Record Conditions", icon: CheckCircle, color: "success" },
  approval: { label: "Approval Conditions", icon: Shield, color: "warning" },
  sla: { label: "SLA Conditions", icon: AlertTriangle, color: "danger" },
  notification: { label: "Notification Conditions", icon: Bell, color: "muted" },
  eligibility: { label: "Eligibility Rules", icon: GitBranch, color: "purple" },
};

const ruleTypeColors = { brand: "bg-brand-50 text-brand-700 ring-brand-200", info: "bg-sky-50 text-sky-700 ring-sky-200", success: "bg-emerald-50 text-emerald-700 ring-emerald-200", warning: "bg-amber-50 text-amber-700 ring-amber-200", danger: "bg-red-50 text-red-700 ring-red-200", muted: "bg-slate-100 text-slate-600 ring-slate-200", purple: "bg-purple-50 text-purple-700 ring-purple-200" };

interface PolicyBuilderPageProps {
  title: string;
  rules: PolicyRule[];
  onChange: (rules: PolicyRule[]) => void;
  loading?: boolean;
}

export function PolicyBuilderPage({ title, rules, onChange, loading }: PolicyBuilderPageProps) {
  const [activeTab, setActiveTab] = useState("when");
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [selectedRuleType, setSelectedRuleType] = useState<RuleType>("assignment");

  const addRule = () => {
    const newRule: PolicyRule = {
      id: `rule-${Date.now()}`,
      name: `New ${ruleTypeConfig[selectedRuleType].label.slice(0, -1)}`,
      type: selectedRuleType,
      conditions: [{ id: `cond-${Date.now()}`, field: "", operator: "equals", value: "" }],
      actions: [{ id: `act-${Date.now()}`, type: "", target: "", config: {} }],
      elseActions: [],
      enabled: true,
      priority: rules.length + 1,
    };
    onChange([...rules, newRule]);
    setEditingRule(newRule.id);
  };

  const updateRule = (id: string, updates: Partial<PolicyRule>) => {
    onChange(rules.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const removeRule = (id: string) => {
    onChange(rules.filter((r) => r.id !== id));
    if (editingRule === id) setEditingRule(null);
  };

  const updateCondition = (ruleId: string, condId: string, updates: Partial<Condition>) => {
    const rule = rules.find((r) => r.id === ruleId);
    if (!rule) return;
    updateRule(ruleId, {
      conditions: rule.conditions.map((c) => (c.id === condId ? { ...c, ...updates } : c)),
    });
  };

  const removeCondition = (ruleId: string, condId: string) => {
    const rule = rules.find((r) => r.id === ruleId);
    if (!rule) return;
    updateRule(ruleId, { conditions: rule.conditions.filter((c) => c.id !== condId) });
  };

  const updateAction = (ruleId: string, actId: string, updates: Partial<Action>) => {
    const rule = rules.find((r) => r.id === ruleId);
    if (!rule) return;
    updateRule(ruleId, { actions: rule.actions.map((a) => (a.id === actId ? { ...a, ...updates } : a)) });
  };

  const removeAction = (ruleId: string, actId: string) => {
    const rule = rules.find((r) => r.id === ruleId);
    if (!rule) return;
    updateRule(ruleId, { actions: rule.actions.filter((a) => a.id !== actId) });
  };

  const addCondition = (ruleId: string) => {
    const rule = rules.find((r) => r.id === ruleId);
    if (!rule) return;
    updateRule(ruleId, { conditions: [...rule.conditions, { id: `cond-${Date.now()}`, field: "", operator: "equals", value: "" }] });
  };

  const addAction = (ruleId: string) => {
    const rule = rules.find((r) => r.id === ruleId);
    if (!rule) return;
    updateRule(ruleId, { actions: [...rule.actions, { id: `act-${Date.now()}`, type: "", target: "", config: {} }] });
  };

  const addElseAction = (ruleId: string) => {
    const rule = rules.find((r) => r.id === ruleId);
    if (!rule) return;
    updateRule(ruleId, { elseActions: [...rule.elseActions, { id: `else-${Date.now()}`, type: "", target: "", config: {} }] });
  };

  const removeElseAction = (ruleId: string, elseId: string) => {
    const rule = rules.find((r) => r.id === ruleId);
    if (!rule) return;
    updateRule(ruleId, { elseActions: rule.elseActions.filter((e) => e.id !== elseId) });
  };

  const tabs = [
    { id: "when", label: "WHEN", icon: AlertTriangle },
    { id: "then", label: "THEN", icon: CheckCircle },
    { id: "else", label: "ELSE", icon: ArrowRight },
  ];

  const activeRule = rules.find((r) => r.id === editingRule);

  return (
    <Card>
      <CardHeader
        title={title}
        description="Build WHEN/THEN/ELSE policy rules"
        actions={
          <div className="flex items-center gap-2">
            <select className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs" value={selectedRuleType} onChange={(e) => setSelectedRuleType(e.target.value as RuleType)}>
              {Object.entries(ruleTypeConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <Button size="sm" onClick={addRule}><Plus className="h-3.5 w-3.5" /> Add Rule</Button>
          </div>
        }
      />
      <CardBody>
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">Loading policy builder…</div>
        ) : (
          <div className="space-y-4">
            {rules.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 py-8 text-center text-sm text-slate-500">
                No rules yet. Select a rule type and click "Add Rule" to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {rules.map((rule) => {
                  const config = ruleTypeConfig[rule.type];
                  const isActive = editingRule === rule.id;
                  const colorClass = ruleTypeColors[config.color] ?? ruleTypeColors.brand;
                  return (
                    <div key={rule.id} className={`rounded-lg border overflow-hidden ${isActive ? "border-brand-400 shadow-sm" : "border-slate-200"}`}>
                      <div className="flex items-center justify-between bg-slate-50 px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setEditingRule(isActive ? null : rule.id)} className="flex items-center gap-2 text-left">
                            <config.icon className="h-4 w-4 text-slate-500" />
                            <span className="text-sm font-semibold text-slate-800">{rule.name}</span>
                          </button>
                          <Badge variant={rule.enabled ? "success" : "muted"}>{rule.enabled ? "Active" : "Disabled"}</Badge>
                          <Badge variant="muted" className={colorClass}>{config.label}</Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => updateRule(rule.id, { enabled: !rule.enabled })} className="rounded p-1 text-slate-500 hover:bg-slate-200">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button onClick={() => removeRule(rule.id)} className="rounded p-1 text-red-500 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {isActive && (
                        <div className="space-y-3 p-4">
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-slate-600">Conditions ({activeTab})</label>
                            {tabs.map((tab) => (
                              <div key={tab.id} className={`rounded border p-3 ${activeTab === tab.id ? "border-brand-200 bg-brand-50" : "border-slate-100 bg-slate-50"}`}>
                                <div className="flex items-center gap-2 mb-2">
                                  <button onClick={() => setActiveTab(tab.id)} className="text-xs font-semibold text-slate-700">{tab.label}</button>
                                  {tab.id === "when" ? <button onClick={() => addCondition(rule.id)} className="ml-auto rounded bg-brand-100 px-2 py-0.5 text-[10px] text-brand-700 hover:bg-brand-200"><Plus className="h-2.5 w-2.5 inline" /> Add</button> : null}
                                  {tab.id === "then" ? <button onClick={() => addAction(rule.id)} className="ml-auto rounded bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-700 hover:bg-emerald-200"><Plus className="h-2.5 w-2.5 inline" /> Add</button> : null}
                                  {tab.id === "else" ? <button onClick={() => addElseAction(rule.id)} className="ml-auto rounded bg-amber-100 px-2 py-0.5 text-[10px] text-amber-700 hover:bg-amber-200"><Plus className="h-2.5 w-2.5 inline" /> Add</button> : null}
                                </div>
                                {tab.id === "when" && rule.conditions.map((cond) => (
                                  <div key={cond.id} className="mb-2 flex items-center gap-2">
                                    <Input placeholder="Field" value={cond.field} onChange={(e) => updateCondition(rule.id, cond.id, { field: e.target.value })} className="w-32 text-xs" />
                                    <select className="rounded border border-slate-300 px-2 py-1 text-[10px]" value={cond.operator} onChange={(e) => updateCondition(rule.id, cond.id, { operator: e.target.value })}>
                                      <option value="equals">equals</option>
                                      <option value="not_equals">not equals</option>
                                      <option value="contains">contains</option>
                                      <option value="greater_than">greater than</option>
                                      <option value="less_than">less than</option>
                                    </select>
                                    <Input placeholder="Value" value={cond.value} onChange={(e) => updateCondition(rule.id, cond.id, { value: e.target.value })} className="flex-1 text-xs" />
                                    <button onClick={() => removeCondition(rule.id, cond.id)} className="rounded p-1 text-red-500 hover:bg-red-50"><Trash2 className="h-3 w-3" /></button>
                                  </div>
                                ))}
                                {tab.id === "then" && rule.actions.map((act) => (
                                  <div key={act.id} className="mb-2 flex items-center gap-2">
                                    <Input placeholder="Action type" value={act.type} onChange={(e) => updateAction(rule.id, act.id, { type: e.target.value })} className="w-32 text-xs" />
                                    <Input placeholder="Target" value={act.target} onChange={(e) => updateAction(rule.id, act.id, { target: e.target.value })} className="flex-1 text-xs" />
                                    <button onClick={() => removeAction(rule.id, act.id)} className="rounded p-1 text-red-500 hover:bg-red-50"><Trash2 className="h-3 w-3" /></button>
                                  </div>
                                ))}
                                {tab.id === "else" && rule.elseActions.map((act) => (
                                  <div key={act.id} className="mb-2 flex items-center gap-2">
                                    <Input placeholder="Else action" value={act.type} onChange={(e) => updateRule(rule.id, { elseActions: rule.elseActions.map((a) => a.id === act.id ? { ...a, type: e.target.value } : a) })} className="w-32 text-xs" />
                                    <Input placeholder="Target" value={act.target} onChange={(e) => updateRule(rule.id, { elseActions: rule.elseActions.map((a) => a.id === act.id ? { ...a, target: e.target.value } : a) })} className="flex-1 text-xs" />
                                    <button onClick={() => removeElseAction(rule.id, act.id)} className="rounded p-1 text-red-500 hover:bg-red-50"><Trash2 className="h-3 w-3" /></button>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button size="sm" onClick={() => setEditingRule(null)}>Done</Button>
                            <Button variant="outline" size="sm" onClick={() => removeRule(rule.id)}>Delete Rule</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
