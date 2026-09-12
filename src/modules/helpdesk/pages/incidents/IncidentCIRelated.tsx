import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  incidentApi,
  IncidentCI,
} from "@modules/helpdesk/services/incidents/incidentApi";
import toast from "react-hot-toast";

export default function IncidentCIRelated() {
  const { id } = useParams<{ id: string }>();
  const [cis, setCis] = useState<IncidentCI[]>([]);
  const [loading, setLoading] = useState(true);
  const [ciId, setCiId] = useState("");
  const [role, setRole] = useState("affected");

  const load = async () => {
    if (!id) return;
    try {
      const res = await incidentApi.listCIs(id);
      setCis(res.data.data || []);
    } catch {
      toast.error("Failed to load CIs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleLink = async () => {
    if (!id || !ciId) return;
    try {
      await incidentApi.linkCI(id, { ciId, role });
      toast.success("CI linked");
      setCiId("");
      load();
    } catch {
      toast.error("Failed to link CI");
    }
  };

  const handleUnlink = async (ciId: string) => {
    if (!id) return;
    try {
      await incidentApi.unlinkCI(id, ciId);
      toast.success("CI unlinked");
      load();
    } catch {
      toast.error("Failed to unlink CI");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Related CIs / Service Offerings
      </h1>
      <div className="card p-6 space-y-4">
        <div className="flex gap-2">
          <input
            value={ciId}
            onChange={(e) => setCiId(e.target.value)}
            placeholder="CI ID"
            className="flex-1 border rounded px-3 py-2 text-sm"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="primary">Primary</option>
            <option value="affected">Affected</option>
            <option value="related">Related</option>
          </select>
          <button
            onClick={handleLink}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Link CI
          </button>
        </div>
      </div>
      <div className="card p-6">
        {loading ? (
          <p>Loading...</p>
        ) : cis.length === 0 ? (
          <p className="text-gray-500">No CIs linked</p>
        ) : (
          <div className="space-y-2">
            {cis.map((ci) => (
              <div
                key={ci._id}
                className="flex justify-between items-center border rounded p-3"
              >
                <div>
                  <span className="font-medium">
                    {typeof ci.ci === "string" ? ci.ci : ci.ci?.name}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">{ci.role}</span>
                </div>
                <button
                  onClick={() =>
                    handleUnlink(typeof ci.ci === "string" ? ci.ci : ci.ci._id)
                  }
                  className="text-red-600 text-sm hover:underline"
                >
                  Unlink
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
