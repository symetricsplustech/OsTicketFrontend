import { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import { QrCode, Printer, ScanLine } from 'lucide-react';

interface Asset {
  id: number;
  name: string;
  assetTag?: string;
}

function LabelCard({ asset }: { asset: Asset }) {
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const [barcodeSrc, setBarcodeSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const toDataUri = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    api
      .get('/ops/assets/' + asset.id + '/qrcode', { responseType: 'text' })
      .then((res: any) => {
        if (!cancelled) setQrSrc(toDataUri(res.data));
      })
      .catch(() => {});
    api
      .get('/ops/assets/' + asset.id + '/barcode', { responseType: 'text' })
      .then((res: any) => {
        if (!cancelled) setBarcodeSrc(toDataUri(res.data));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [asset.id]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col items-center text-center break-inside-avoid">
      <div className="w-full mb-2">
        <p className="text-sm font-semibold text-gray-900 truncate">{asset.name}</p>
        <p className="text-xs font-mono text-gray-500 truncate">{asset.assetTag || asset.id}</p>
      </div>
      <div className="w-32 h-32 flex items-center justify-center bg-gray-50 rounded">
        {qrSrc ? (
          <img src={qrSrc} alt={`QR code for ${asset.name}`} className="w-full h-full" />
        ) : (
          <ScanLine className="h-8 w-8 text-gray-300 animate-pulse" />
        )}
      </div>
      <div className="w-full h-10 mt-2 flex items-center justify-center">
        {barcodeSrc && <img src={barcodeSrc} alt={`Barcode for ${asset.name}`} className="max-h-full" />}
      </div>
    </div>
  );
}

export default function AssetLabels() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    api
      .get('/assets')
      .then((res: any) => {
        const data = res.data;
        setAssets(Array.isArray(data) ? data : data?.assets || []);
      })
      .catch(() => setAssets([]))
      .finally(() => setLoading(false));
  }, [reloadKey]);

  const filtered = assets.filter((a) => a.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-2">
          <QrCode className="h-7 w-7 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">Asset Labels</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-3 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-64"
            />
          </div>
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="inline-flex items-center gap-1.5 border border-gray-300 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm font-medium transition"
          >
            <ScanLine className="h-4 w-4" />
            Load labels
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading assets...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-400">No assets match your search.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 print:grid-cols-2 gap-4">
          {filtered.map((a) => (
            <LabelCard key={a.id} asset={a} />
          ))}
        </div>
      )}
    </div>
  );
}
