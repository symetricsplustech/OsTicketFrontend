import React, { useState, useEffect } from 'react';
import api from '@shared/lib/api';

interface Integration {
  _id: string;
  name: string;
  key: string;
  category: string;
  status: string;
}

export default function Integrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/admin/integrations');
        setIntegrations(res.data.integrations || []);
      } catch {
        setIntegrations([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <div className="col-span-3 text-center py-12 text-gray-500">Loading...</div> :
          integrations.length === 0 ? <div className="col-span-3 text-center py-12 text-gray-500">No integrations configured</div> :
          integrations.map((i) => (
            <div key={i._id} className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold">{i.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{i.key}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{i.category}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${i.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{i.status}</span>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
