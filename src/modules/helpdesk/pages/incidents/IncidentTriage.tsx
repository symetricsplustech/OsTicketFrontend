import React, { useState } from "react";
import { incidentApi } from "@modules/helpdesk/services/incidents/incidentApi";
import toast from "react-hot-toast";
import { useAuth } from "@core/auth/useAuth";

export default function IncidentTriage() {
  const { hasPermission } = useAuth();
  const [incidentId, setIncidentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    category: "",
    subcategory: "",
    impact: "3",
    urgency: "3",
    severity: "Sev3",
    assignedTo: "",
    assignmentGroup: "",
  });

  const handleClassify = async () => {
    if (!incidentId || !hasPermission("incident.update")) return;
    setLoading(true);
    try {
      await incidentApi.update(incidentId, {
        category: form.category,
        subcategory: form.subcategory,
        severity: form.severity,
        impact: form.impact,
        urgency: form.urgency,
      });
      toast.success("Incident classified");
    } catch {
      toast.error("Failed to classify");
    } finally {
      setLoading(false);
    }
  };

  const handleRoute = async () => {
    if (!incidentId || !hasPermission("incident.assign")) return;
    setLoading(true);
    try {
      await incidentApi.assign(incidentId, {
        assignedTo: form.assignedTo,
        assignmentGroup: form.assignmentGroup,
      });
      toast.success("Incident routed");
    } catch {
      toast.error("Failed to route");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Incident Triage</h1>
      <div className="card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Incident ID
          </label>
          <input
            value={incidentId}
            onChange={(e) => setIncidentId(e.target.value)}
            className="mt-1 block w-full border rounded px-3 py-2"
            placeholder="Enter incident ID"
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
              className="mt-1 block w-full border rounded px-3 py-2"
            >
              <option value="">Select</option>
              <option value="hardware">Hardware</option>
              <option value="software">Software</option>
              <option value="network">Network</option>
              <option value="security">Security</option>
              <option value="access">Access</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subcategory
            </label>
            <input
              value={form.subcategory}
              onChange={(e) =>
                setForm((f) => ({ ...f, subcategory: e.target.value }))
              }
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Severity
            </label>
            <select
              value={form.severity}
              onChange={(e) =>
                setForm((f) => ({ ...f, severity: e.target.value }))
              }
              className="mt-1 block w-full border rounded px-3 py-2"
            >
              {["Sev1", "Sev2", "Sev3", "Sev4"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Impact (1=highest)
            </label>
            <select
              value={form.impact}
              onChange={(e) =>
                setForm((f) => ({ ...f, impact: e.target.value }))
              }
              className="mt-1 block w-full border rounded px-3 py-2"
            >
              {["1", "2", "3", "4"].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Urgency (1=highest)
            </label>
            <select
              value={form.urgency}
              onChange={(e) =>
                setForm((f) => ({ ...f, urgency: e.target.value }))
              }
              className="mt-1 block w-full border rounded px-3 py-2"
            >
              {["1", "2", "3", "4"].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleClassify}
            disabled={loading || !incidentId}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Classify
          </button>
          <button
            onClick={handleRoute}
            disabled={loading || !incidentId}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Route
          </button>
        </div>
      </div>
    </div>
  );
}
