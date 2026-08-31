import { useState, useEffect } from 'react';
import { Search, Plus, Package, AlertTriangle, Truck, Wrench, ArrowRightLeft, RotateCcw } from 'lucide-react';
import api from '@shared/lib/api';

interface Stockroom { _id: string; name: string; location: string; status: string; }
interface StockItem { _id: string; product: { name: string; sku: string }; stockroom: { name: string }; quantity: number; reservedQuantity: number; reorderLevel: number; }
interface Procurement { _id: string; number: string; product: string; vendor: string; quantity: number; totalCost: number; status: string; createdAt: string; }
interface Repair { _id: string; asset: string; type: string; status: string; totalCost: number; createdAt: string; }
interface Loaner { _id: string; asset: string; loanedTo: { name: string }; loanDate: string; expectedReturnDate: string; status: string; }

type Tab = 'stockrooms' | 'items' | 'procurement' | 'repairs' | 'loaners';

export default function InventoryManagement() {
  const [tab, setTab] = useState<Tab>('items');
  const [stockrooms, setStockrooms] = useState<Stockroom[]>([]);
  const [items, setItems] = useState<StockItem[]>([]);
  const [procurement, setProcurement] = useState<Procurement[]>([]);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loaners, setLoaners] = useState<Loaner[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => { loadAll(); }, [tab]);

  const loadAll = async () => {
    try {
      if (tab === 'stockrooms') { const { data } = await api.get('/stockroom/stockrooms'); setStockrooms(data); }
      if (tab === 'items') { const { data } = await api.get('/stockroom/stock-items'); setItems(data); }
      if (tab === 'procurement') { const { data } = await api.get('/stockroom/procurement'); setProcurement(data); }
      if (tab === 'repairs') { const { data } = await api.get('/stockroom/repairs'); setRepairs(data); }
      if (tab === 'loaners') { const { data } = await api.get('/stockroom/loaners'); setLoaners(data); }
    } catch {}
  };

  const handleCreateStockroom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/stockroom/stockrooms', form);
      setShowForm(false); setForm({}); loadAll();
    } catch {}
  };

  const handleCreateStockItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/stockroom/stock-items', form);
      setShowForm(false); setForm({}); loadAll();
    } catch {}
  };

  const handleCreateProcurement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/stockroom/procurement', form);
      setShowForm(false); setForm({}); loadAll();
    } catch {}
  };

  const handleApproveProcurement = async (id: string) => {
    try { await api.put(`/stockroom/procurement/${id}/approve`); loadAll(); } catch {}
  };

  const handleReceiveProcurement = async (id: string) => {
    try { await api.put(`/stockroom/procurement/${id}/receive`, { receivedQuantity: 10 }); loadAll(); } catch {}
  };

  const handleReturnLoaner = async (id: string) => {
    try { await api.put(`/stockroom/loaners/${id}/return`, { condition: 'good' }); loadAll(); } catch {}
  };

  const lowStockItems = items.filter(i => i.quantity <= i.reorderLevel);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Package className="h-6 w-6" /> Inventory & Stockroom</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Add {tab === 'stockrooms' ? 'Stockroom' : tab === 'items' ? 'Stock Item' : 'Procurement'}
        </button>
      </div>

      <div className="flex gap-1 border-b">
        {(['stockrooms', 'items', 'procurement', 'repairs', 'loaners'] as Tab[]).map(t => (
          <button key={t} onClick={() => { setTab(t); setShowForm(false); }} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {lowStockItems.length > 0 && tab === 'items' && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <span className="text-sm text-orange-700">{lowStockItems.length} items below reorder level</span>
        </div>
      )}

      {showForm && tab === 'stockrooms' && (
        <form onSubmit={handleCreateStockroom} className="bg-white p-4 rounded-lg border space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Stockroom Name" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="border rounded-lg px-3 py-2" required />
            <input placeholder="Location" value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })} className="border rounded-lg px-3 py-2" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      {showForm && tab === 'items' && (
        <form onSubmit={handleCreateStockItem} className="bg-white p-4 rounded-lg border space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <select value={form.stockroom || ''} onChange={e => setForm({ ...form, stockroom: e.target.value })} className="border rounded-lg px-3 py-2" required>
              <option value="">Select Stockroom</option>
              {stockrooms.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
            <input placeholder="Product Name" value={form.product || ''} onChange={e => setForm({ ...form, product: e.target.value })} className="border rounded-lg px-3 py-2" required />
            <input type="number" placeholder="Quantity" value={form.quantity || 0} onChange={e => setForm({ ...form, quantity: +e.target.value })} className="border rounded-lg px-3 py-2" min={0} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" placeholder="Reorder Level" value={form.reorderLevel || 0} onChange={e => setForm({ ...form, reorderLevel: +e.target.value })} className="border rounded-lg px-3 py-2" min={0} />
            <input type="number" placeholder="Unit Cost" value={form.unitCost || 0} onChange={e => setForm({ ...form, unitCost: +e.target.value })} className="border rounded-lg px-3 py-2" step="0.01" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      {showForm && tab === 'procurement' && (
        <form onSubmit={handleCreateProcurement} className="bg-white p-4 rounded-lg border space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <input placeholder="Product" value={form.product || ''} onChange={e => setForm({ ...form, product: e.target.value })} className="border rounded-lg px-3 py-2" required />
            <input placeholder="Vendor" value={form.vendor || ''} onChange={e => setForm({ ...form, vendor: e.target.value })} className="border rounded-lg px-3 py-2" />
            <input type="number" placeholder="Quantity" value={form.quantity || 1} onChange={e => setForm({ ...form, quantity: +e.target.value })} className="border rounded-lg px-3 py-2" min={1} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" placeholder="Unit Cost" value={form.unitCost || 0} onChange={e => setForm({ ...form, unitCost: +e.target.value })} className="border rounded-lg px-3 py-2" step="0.01" />
            <input type="date" value={form.expectedDelivery || ''} onChange={e => setForm({ ...form, expectedDelivery: e.target.value })} className="border rounded-lg px-3 py-2" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      {tab === 'stockrooms' && (
        <div className="grid grid-cols-3 gap-4">
          {stockrooms.map(s => (
            <div key={s._id} className="bg-white p-4 rounded-lg border">
              <h3 className="font-semibold">{s.name}</h3>
              <p className="text-sm text-gray-500">{s.location}</p>
              <span className={`mt-2 inline-block px-2 py-1 text-xs rounded-full ${s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{s.status}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'items' && (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Product</th>
                <th className="text-left px-4 py-3 font-medium">Stockroom</th>
                <th className="text-left px-4 py-3 font-medium">Quantity</th>
                <th className="text-left px-4 py-3 font-medium">Reserved</th>
                <th className="text-left px-4 py-3 font-medium">Reorder Level</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map(item => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{item.product?.name || 'N/A'}</td>
                  <td className="px-4 py-3">{item.stockroom?.name || 'N/A'}</td>
                  <td className="px-4 py-3 font-medium">{item.quantity}</td>
                  <td className="px-4 py-3">{item.reservedQuantity}</td>
                  <td className="px-4 py-3">{item.reorderLevel}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${item.quantity <= item.reorderLevel ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {item.quantity <= item.reorderLevel ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'procurement' && (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">PO #</th>
                <th className="text-left px-4 py-3 font-medium">Product</th>
                <th className="text-left px-4 py-3 font-medium">Vendor</th>
                <th className="text-left px-4 py-3 font-medium">Qty</th>
                <th className="text-left px-4 py-3 font-medium">Total</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {procurement.map(po => (
                <tr key={po._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm">{po.number}</td>
                  <td className="px-4 py-3">{po.product}</td>
                  <td className="px-4 py-3">{po.vendor}</td>
                  <td className="px-4 py-3">{po.quantity}</td>
                  <td className="px-4 py-3">${po.totalCost?.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${po.status === 'approved' ? 'bg-green-100 text-green-700' : po.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                      {po.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {po.status === 'pending_approval' && (
                        <button onClick={() => handleApproveProcurement(po._id)} className="text-green-600 hover:text-green-800 text-xs px-2 py-1 bg-green-50 rounded">Approve</button>
                      )}
                      {po.status === 'ordered' && (
                        <button onClick={() => handleReceiveProcurement(po._id)} className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 bg-blue-50 rounded">Receive</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'loaners' && (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Asset</th>
                <th className="text-left px-4 py-3 font-medium">Loaned To</th>
                <th className="text-left px-4 py-3 font-medium">Loan Date</th>
                <th className="text-left px-4 py-3 font-medium">Expected Return</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loaners.map(l => (
                <tr key={l._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{l.asset}</td>
                  <td className="px-4 py-3">{l.loanedTo?.name}</td>
                  <td className="px-4 py-3">{new Date(l.loanDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{l.expectedReturnDate ? new Date(l.expectedReturnDate).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${l.status === 'active' ? 'bg-blue-100 text-blue-700' : l.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {l.status === 'active' && (
                      <button onClick={() => handleReturnLoaner(l._id)} className="text-green-600 hover:text-green-800 text-xs px-2 py-1 bg-green-50 rounded">Return</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
