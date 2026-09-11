import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { incidentApi } from '@modules/helpdesk/services/incidents/incidentApi';
import toast from 'react-hot-toast';
import { formatDate } from '@shared/lib/format';

export default function SlaTimeline() {
  const { id } = useParams<{ id: string }>();
  const [incident, setIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    incidentApi.getById(id).then(res => {
      setIncident(res.data.data);
      setLoading(false);
    }).catch(() => { toast.error('Failed to load SLA data'); setLoading(false); });
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!incident) return <div className="p-6 text-red-600">Incident not found</div>;

  const slaStatus = getSlaStatus(incident);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">SLA Timeline</h1>
      <div className="card p-6 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-500">Response SLA Due</label>
            <p className="font-medium">{incident.responseSlaDue ? formatDate(incident.responseSlaDue) : 'Not set'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Resolution SLA Due</label>
            <p className="font-medium">{incident.slaDue ? formatDate(incident.slaDue) : 'Not set'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">SLA Status</label>
            <p className={`font-medium ${slaStatus.color}`}>{slaStatus.label}</p>
          </div>
        </div>
        <div>
          <label className="text-sm text-gray-500">Created</label>
          <p>{formatDate(incident.createdAt)}</p>
        </div>
        {incident.resolvedAt && (
          <div>
            <label className="text-sm text-gray-500">Resolved</label>
            <p>{formatDate(incident.resolvedAt)}</p>
            <p className="text-sm text-gray-500">Resolution time: {getTimeDiff(incident.createdAt, incident.resolvedAt)}</p>
          </div>
        )}
        {incident.closedAt && (
          <div>
            <label className="text-sm text-gray-500">Closed</label>
            <p>{formatDate(incident.closedAt)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function getSlaStatus(incident: any) {
  if (incident.status === 'resolved' || incident.status === 'closed') {
    return { label: 'Met', color: 'text-green-600' };
  }
  if (incident.slaDue && new Date(incident.slaDue) < new Date()) {
    return { label: 'Breached', color: 'text-red-600' };
  }
  if (incident.slaDue) {
    const hoursLeft = (new Date(incident.slaDue).getTime() - Date.now()) / 3600000;
    if (hoursLeft < 2) return { label: 'At Risk', color: 'text-orange-600' };
  }
  return { label: 'On Track', color: 'text-green-600' };
}

function getTimeDiff(start: string, end: string) {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}
