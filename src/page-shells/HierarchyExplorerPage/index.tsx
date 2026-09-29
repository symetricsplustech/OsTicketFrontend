import type { ReactNode } from "react";
import { useState } from "react";
import { Button, Card, CardBody, CardHeader, Input } from "@shared/components/ui";

export interface HierarchyNode {
  id: string;
  name: string;
  type: "company" | "businessUnit" | "department" | "location" | "team";
  children?: HierarchyNode[];
}

interface Props {
  title: ReactNode;
  instanceId?: string;
  nodes?: HierarchyNode[];
  loading?: boolean;
  onNodeSelect?: (node: HierarchyNode) => void;
  onNodeCreate?: (parentId: string | null, type: HierarchyNode["type"]) => void;
}

export function HierarchyExplorerPage({ title, instanceId, nodes = [], loading, onNodeSelect, onNodeCreate }: Props) {
  const [search, setSearch] = useState("");
  const renderNodes = (items: HierarchyNode[], depth = 0): ReactNode => items
    .filter((node) => !search || node.name.toLowerCase().includes(search.toLowerCase()) || node.children?.some((child) => child.name.toLowerCase().includes(search.toLowerCase())))
    .map((node) => <div key={node.id}><button onClick={() => onNodeSelect?.(node)} style={{ paddingLeft: depth * 20 + 12 }} className="flex w-full items-center gap-2 border-b border-slate-100 py-2 text-left text-sm hover:bg-slate-50"><span className="h-2 w-2 rounded-full bg-brand-500" />{node.name}<span className="text-xs text-slate-400">{node.type}</span></button>{node.children ? renderNodes(node.children, depth + 1) : null}</div>);
  return <Card><CardHeader title={title} description={instanceId ? `Instance ${instanceId}` : undefined} actions={<Button size="sm" onClick={() => onNodeCreate?.(null, "company")}>Add company</Button>} /><CardBody><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search hierarchy…" className="mb-4 max-w-sm" />{loading ? <p className="py-12 text-center text-sm text-slate-500">Loading hierarchy…</p> : nodes.length ? renderNodes(nodes) : <p className="rounded-lg border border-dashed p-10 text-center text-sm text-slate-500">No hierarchy nodes yet.</p>}</CardBody></Card>;
}
