import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  incidentApi,
  IncidentRelationship,
} from "@modules/helpdesk/services/incidents/incidentApi";
import toast from "react-hot-toast";
import { formatDate } from "@shared/lib/format";

export default function IncidentRelatedIncidents() {
  const { id } = useParams<{ id: string }>();
  const [relationships, setRelationships] = useState<IncidentRelationship[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [targetId, setTargetId] = useState("");
  const [relType, setRelType] = useState("relates_to");

  const load = async () => {
    if (!id) return;
    try {
      const res = await incidentApi.listRelationships(id);
      setRelationships(res.data.data || []);
    } catch {
      toast.error("Failed to load relationships");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleLink = async () => {
    if (!id || !targetId) return;
    try {
      await incidentApi.linkIncident(id, {
        targetIncidentId: targetId,
        relationshipType: relType,
      });
      toast.success("Incident linked");
      setTargetId("");
      load();
    } catch {
      toast.error("Failed to link incident");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Related Incidents</h1>
      <div className="card p-6 space-y-4">
        <div className="flex gap-2">
          <input
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            placeholder="Target incident ID"
            className="flex-1 border rounded px-3 py-2 text-sm"
          />
          <select
            value={relType}
            onChange={(e) => setRelType(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="relates_to">Relates To</option>
            <option value="parent_child">Parent/Child</option>
            <option value="duplicates">Duplicates</option>
            <option value="caused_by">Caused By</option>
            <option value="blocks">Blocks</option>
            <option value="blocked_by">Blocked By</option>
          </select>
          <button
            onClick={handleLink}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Link
          </button>
        </div>
      </div>
      <div className="card p-6">
        {loading ? (
          <p>Loading...</p>
        ) : relationships.length === 0 ? (
          <p className="text-gray-500">No related incidents</p>
        ) : (
          <div className="space-y-2">
            {relationships.map((rel) => (
              <div key={rel._id} className="border rounded p-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">
                    {typeof rel.sourceIncident === "string"
                      ? rel.sourceIncident
                      : rel.sourceIncident?.number}{" "}
                    &harr;{" "}
                    {typeof rel.targetIncident === "string"
                      ? rel.targetIncident
                      : rel.targetIncident?.number}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-100">
                    {rel.relationshipType}
                  </span>
                </div>
                <div className="text-gray-500 text-xs mt-1">
                  Linked {formatDate(rel.linkedAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
