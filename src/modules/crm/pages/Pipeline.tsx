import React, { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import toast from 'react-hot-toast';

interface Opportunity {
  _id: string;
  name: string;
  stage: string;
  value?: number;
  account?: { name: string };
}

const STAGES = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

export default function Pipeline() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await api.get('/crm/opportunities');
      setItems(res.data.opportunities || []);
    } catch { setItems([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stage);
  };

  const handleDragLeave = () => setDragOverStage(null);

  const handleDrop = async (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    setDragOverStage(null);
    if (!draggedId) return;

    const item = items.find(i => i._id === draggedId);
    if (!item || item.stage === targetStage) { setDraggedId(null); return; }

    setItems(prev => prev.map(i => i._id === draggedId ? { ...i, stage: targetStage } : i));
    setDraggedId(null);

    try {
      await api.put(`/crm/opportunities/${draggedId}`, { stage: targetStage });
      toast.success(`Moved to ${targetStage}`);
    } catch {
      toast.error('Failed to move. Refreshing...');
      load();
    }
  };

  const handleDragEnd = () => { setDraggedId(null); setDragOverStage(null); };

  const grouped = STAGES.map((stage) => ({
    stage,
    items: items.filter((i) => i.stage === stage),
    total: items.filter((i) => i.stage === stage).reduce((s, i) => s + (i.value || 0), 0),
  }));

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {grouped.map((col) => (
          <div
            key={col.stage}
            className={`min-w-[280px] flex-shrink-0 rounded-xl transition-colors ${
              dragOverStage === col.stage ? 'bg-brand-50 ring-2 ring-brand-300' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, col.stage)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.stage)}
          >
            <div className="bg-gray-100 rounded-t-xl px-4 py-3">
              <h3 className="font-semibold text-sm">{col.stage}</h3>
              <p className="text-xs text-gray-500">{col.items.length} deals · ${col.total.toLocaleString()}</p>
            </div>
            <div className="space-y-2 mt-2 min-h-[100px] px-1">
              {col.items.map((opp) => (
                <div
                  key={opp._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, opp._id)}
                  onDragEnd={handleDragEnd}
                  className={`card p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${
                    draggedId === opp._id ? 'opacity-50 scale-95' : ''
                  }`}
                >
                  <p className="text-sm font-medium">{opp.name}</p>
                  {opp.value && <p className="text-xs text-gray-500 mt-1">${opp.value.toLocaleString()}</p>}
                  {opp.account && <p className="text-xs text-gray-400 mt-1">{opp.account.name}</p>}
                </div>
              ))}
              {col.items.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  Drop deals here
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
