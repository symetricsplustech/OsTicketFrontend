import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@shared/lib/api';
import { formatDate } from '@shared/lib/format';

interface Asset {
  _id: string;
  assetId: string;
  name: string;
  type: string;
  status: string;
  condition?: string;
  location?: string;
  assignedTo?: { name: string };
  department?: { name: string };
  purchaseDate?: string;
  warrantyEnd?: string;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  createdAt: string;
}

export default function AssetDetail() {
  const { id } = useParams();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/enterprise/assets/${id}`);
        setAsset(res.data.asset || res.data);
      } catch {} finally { setLoading(false); }
    };
    load();
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" /></div>;
  if (!asset) return <div className="text-center py-12 text-gray-500">Asset not found</div>;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/assets" className="text-sm text-gray-500 hover:text-gray-700">&larr; Back to Assets</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">{asset.name}</h1>
        <p className="text-sm text-gray-500">Asset ID: {asset.assetId}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold mb-4">Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Type:</span> {asset.type}</div>
              <div><span className="text-gray-500">Status:</span> <span className={`px-2 py-1 text-xs rounded-full ${asset.status === 'deployed' ? 'bg-green-100 text-green-700' : asset.status === 'in_stock' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{asset.status}</span></div>
              <div><span className="text-gray-500">Condition:</span> {asset.condition || '—'}</div>
              <div><span className="text-gray-500">Location:</span> {asset.location || '—'}</div>
              <div><span className="text-gray-500">Manufacturer:</span> {asset.manufacturer || '—'}</div>
              <div><span className="text-gray-500">Model:</span> {asset.model || '—'}</div>
              <div><span className="text-gray-500">Serial #:</span> {asset.serialNumber || '—'}</div>
              <div><span className="text-gray-500">Purchase Date:</span> {formatDate(asset.purchaseDate)}</div>
              <div><span className="text-gray-500">Warranty End:</span> {formatDate(asset.warrantyEnd)}</div>
              <div><span className="text-gray-500">Created:</span> {formatDate(asset.createdAt)}</div>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold mb-4">Assignment</h2>
            <p className="text-sm text-gray-500">Assigned to: {asset.assignedTo?.name || 'Unassigned'}</p>
            <p className="text-sm text-gray-500 mt-2">Department: {asset.department?.name || '—'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
