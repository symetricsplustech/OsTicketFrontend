import { useEffect, useState } from "react";
import api from "@shared/lib/api";
import toast from "react-hot-toast";
import { Activity, AlertTriangle, Clock, Plus, Server } from "lucide-react";

const defaultTargets = [
  {
    service: "platform_availability",
    metric: "percentage",
    threshold: 99.9,
    comparison: "gte",
  },
  {
    service: "api_availability",
    metric: "percentage",
    threshold: 99.9,
    comparison: "gte",
  },
  {
    service: "support_response",
    priority: "P1",
    metric: "duration_minutes",
    threshold: 15,
    comparison: "lte",
  },
  {
    service: "support_resolution",
    priority: "P1",
    metric: "duration_minutes",
    threshold: 120,
    comparison: "lte",
  },
  {
    service: "incident_communication",
    priority: "P1",
    metric: "frequency_minutes",
    threshold: 30,
    comparison: "lte",
  },
  {
    service: "backup",
    metric: "frequency_minutes",
    threshold: 360,
    comparison: "lte",
  },
  {
    service: "rpo",
    metric: "duration_minutes",
    threshold: 15,
    comparison: "lte",
  },
  {
    service: "rto",
    metric: "duration_minutes",
    threshold: 120,
    comparison: "lte",
  },
  {
    service: "email_processing",
    metric: "duration_minutes",
    threshold: 1,
    comparison: "lte",
  },
  {
    service: "notification_processing",
    metric: "duration_minutes",
    threshold: 1,
    comparison: "lte",
  },
  {
    service: "api_performance",
    metric: "percentile_duration_ms",
    threshold: 500,
    percentile: 95,
    comparison: "lte",
  },
  {
    service: "security_incident",
    priority: "critical",
    metric: "duration_minutes",
    threshold: 1,
    comparison: "lte",
  },
  {
    service: "tenant_provisioning",
    metric: "duration_minutes",
    threshold: 5,
    comparison: "lte",
  },
];

export default function SuperAdminSla() {
  const [dashboard, setDashboard] = useState<any>({});
  const [policies, setPolicies] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const load = async () => {
    try {
      const [d, p, planResponse] = await Promise.all([
        api.get("/superadmin/sla/dashboard"),
        api.get("/superadmin/sla/policies"),
        api.get("/superadmin/plans"),
      ]);
      setDashboard(d.data?.data || {});
      setPolicies(p.data?.data || []);
      setPlans(planResponse.data?.data || []);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Unable to load platform SLA",
      );
    }
  };
  const assignPlan = async (policy: any, planId: string) => {
    const ids = Array.from(
      new Set(
        [
          ...(policy.plans || []).map((plan: any) => plan._id || plan),
          planId,
        ].filter(Boolean),
      ),
    );
    try {
      await api.put(`/superadmin/sla/policies/${policy._id}`, {
        plans: ids,
        status: "active",
      });
      await api.put(`/superadmin/plans/${planId}`, {
        platformSlaPolicy: policy._id,
      });
      toast.success("SLA entitlement assigned");
      load();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Unable to assign plan");
    }
  };
  useEffect(() => {
    load();
  }, []);
  const create = async () => {
    const name = window.prompt("Platform SLA policy name:")?.trim();
    if (!name) return;
    try {
      await api.post("/superadmin/sla/policies", {
        name,
        status: "draft",
        targets: defaultTargets,
        calendar: { type: "24/7", timezone: "UTC" },
      });
      toast.success("Platform SLA policy created");
      load();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Unable to create policy");
    }
  };
  const services = Object.entries(dashboard.services || {});
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Platform SLA</h1>
          <p className="text-sm text-gray-500">
            Availability, support, recovery and processing commitments by
            subscription plan
          </p>
        </div>
        <button
          onClick={create}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> New policy
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[
          [
            "Tenants within SLA",
            `${Number(dashboard.tenantsWithinSlaPct ?? 100).toFixed(1)}%`,
            Activity,
          ],
          [
            "Open platform incidents",
            dashboard.openPlatformIncidents || 0,
            AlertTriangle,
          ],
          ["P1 incidents", dashboard.p1Incidents || 0, Server],
          ["Tenant SLA breaches", dashboard.breachedTickets || 0, Clock],
        ].map(([label, value, Icon]: any) => (
          <div key={label} className="card p-5">
            <Icon className="mb-3 h-5 w-5 text-purple-600" />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>
      <div className="card overflow-hidden">
        <div className="border-b px-5 py-4 font-semibold">
          Service health — last {dashboard.periodDays || 30} days
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-5 py-3">Service</th>
              <th>Measurements</th>
              <th>Average</th>
              <th>Compliance</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {services.map(([name, value]: any) => (
              <tr key={name}>
                <td className="px-5 py-3 font-medium">
                  {name.replace(/_/g, " ")}
                </td>
                <td>{value.measurements}</td>
                <td>{Number(value.average || 0).toFixed(2)}</td>
                <td>{Number(value.compliance ?? 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!services.length && (
          <p className="p-8 text-center text-sm text-gray-400">
            No measurements received yet.
          </p>
        )}
      </div>
      <div className="card overflow-hidden">
        <div className="border-b px-5 py-4 font-semibold">Policies by plan</div>
        <div className="divide-y">
          {policies.map((policy) => (
            <div
              key={policy._id}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="flex-1">
                <p className="font-medium">{policy.name}</p>
                <p className="text-xs text-gray-500">
                  {policy.targets?.length || 0} targets ·{" "}
                  {policy.calendar?.type || "24/7"} ·{" "}
                  {(policy.plans || []).map((p: any) => p.name).join(", ") ||
                    "Not assigned"}
                </p>
              </div>
              <select
                defaultValue=""
                onChange={(event) => {
                  if (event.target.value)
                    assignPlan(policy, event.target.value);
                }}
                className="rounded border px-2 py-1 text-xs"
              >
                <option value="">Assign plan…</option>
                {plans
                  .filter(
                    (plan) =>
                      !(policy.plans || []).some(
                        (assigned: any) =>
                          String(assigned._id || assigned) === String(plan._id),
                      ),
                  )
                  .map((plan) => (
                    <option key={plan._id} value={plan._id}>
                      {plan.name}
                    </option>
                  ))}
              </select>
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                {policy.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
