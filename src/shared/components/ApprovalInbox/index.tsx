import type { ReactNode } from "react";
import { CheckCircle2, XCircle, MessageSquare, Clock3 } from "lucide-react";
import { Button } from "@shared/components/ui";
import { Card, CardBody } from "@shared/components/ui";
import { Badge } from "@shared/components/Badge";

export interface ApprovalItem {
  id: string;
  sourceRecord: string;
  sourceType: string;
  requester: string;
  reason: string;
  status: "pending" | "approved" | "rejected" | "information_requested";
  createdAt: string;
}

interface ApprovalInboxProps {
  items: ApprovalItem[];
  loading?: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onRequestInfo: (id: string) => void;
}

export function ApprovalInbox({ items, loading, onApprove, onReject, onRequestInfo }: ApprovalInboxProps) {
  if (loading) return <Card><CardBody><p className="py-4 text-center text-sm text-slate-500">Loading approvals…</p></CardBody></Card>;
  return (
    <Card><CardBody><h3 className="text-sm font-bold">Approval Inbox</h3><div className="mt-4 space-y-3">{items.map((item) => <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-4"><div className="flex items-start justify-between"><div><p className="text-sm font-semibold">{item.sourceRecord}</p><p className="text-[10px] text-slate-500">{item.sourceType} · Requested by {item.requester}</p><p className="mt-1 text-xs text-slate-600">{item.reason}</p></div><Badge variant={item.status === "pending" ? "warning" : item.status === "approved" ? "success" : item.status === "rejected" ? "danger" : "info"}>{item.status}</Badge></div><div className="mt-3 flex items-center gap-2"><p className="flex items-center gap-1 text-[10px] text-slate-400"><Clock3 className="h-3 w-3" />{new Date(item.createdAt).toLocaleString()}</p></div>{item.status === "pending" ? <div className="mt-3 flex gap-2"><button onClick={() => onApprove(item.id)} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">Approve</button><button onClick={() => onReject(item.id, "")} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700">Reject</button><button onClick={() => onRequestInfo(item.id)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Request Info</button></div> : null}</div>)}</div></CardBody></Card>
  );
}
