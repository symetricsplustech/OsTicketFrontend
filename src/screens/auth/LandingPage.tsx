import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { PublicShell } from "@layouts/PublicShell";
import { Card, CardHeader, CardBody } from "@components/common/ui";
import { Button } from "@components/common/ui";
import { Badge } from "@components/common/Badge";

export function LandingPage() {
  return (
    <PublicShell>
      <section className="overflow-hidden rounded-2xl bg-[#0b1830] px-7 py-14 text-white md:px-12">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="h-8 w-8 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-[.22em] text-cyan-300">
            TICKETX
          </span>
        </div>
        <p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-300 mb-4">
          Enterprise service management
        </p>
        <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight md:text-5xl">
          A clear path from service request to resolution.
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300">
          Manage incidents, requests, knowledge and service operations in one
          workspace, with access governed by your organization.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-5 py-3 text-sm font-bold text-[#07152d] hover:bg-cyan-300"
          >
            Create an account <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/login"
            className="rounded-lg border border-white/30 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"
          >
            Sign in
          </Link>
        </div>
      </section>

      <section
        aria-label="Capabilities"
        className="mt-6 grid gap-4 md:grid-cols-3"
      >
        {[
          {
            icon: ClipboardList,
            title: "Track service work",
            text: "Create and follow incidents and requests through their lifecycle.",
          },
          {
            icon: BookOpen,
            title: "Find answers",
            text: "Use knowledge articles and service catalog items when available to your account.",
          },
          {
            icon: ShieldCheck,
            title: "Work within your access",
            text: "Instance membership and permissions determine which records and actions you can use.",
          },
        ].map(({ icon: Icon, title, text }) => (
          <Card key={title}>
            <CardBody>
              <Icon className="h-6 w-6 text-cyan-700" />
              <h2 className="mt-4 text-base font-bold text-slate-900">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </CardBody>
          </Card>
        ))}
      </section>

      <section className="mt-10 rounded-xl border border-slate-200 bg-white p-8">
        <h2 className="text-lg font-bold text-slate-900">Platform Features</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="success">Incident Management</Badge>
          <Badge variant="info">Service Catalog</Badge>
          <Badge variant="warning">Knowledge Base</Badge>
          <Badge variant="success">Approvals</Badge>
          <Badge variant="info">SLA Tracking</Badge>
          <Badge variant="muted">Multi-tenancy</Badge>
          <Badge variant="warning">Audit Trail</Badge>
        </div>
      </section>
    </PublicShell>
  );
}
