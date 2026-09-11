import React, { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import toast from 'react-hot-toast';
import { ShoppingCart } from 'lucide-react';

interface CatalogItem {
  _id: string;
  name: string;
  category: string;
  description: string;
  estimatedTime?: string;
  price?: number;
  icon?: string;
}

const conditionVisible = (field: any, values: Record<string, any>) => {
  if (!field.condition?.field) return true;
  const actual = String(values[field.condition.field] ?? '');
  const target = String(field.condition.value ?? '');
  switch (field.condition.operator) {
    case 'equals': return actual === target;
    case 'not_equals': return actual !== target;
    case 'contains': return actual.toLowerCase().includes(target.toLowerCase());
    default: return true;
  }
};

export default function ServiceCatalog() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [showRequest, setShowRequest] = useState<CatalogItem | null>(null);
  const [requestForm, setRequestForm] = useState({ title: '', description: '', quantity: '1' });
  const [dynamicForm, setDynamicForm] = useState<any>(null);
  const [dynValues, setDynValues] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  const openRequest = (item: CatalogItem) => {
    setShowRequest(item);
    api.get('/ops/custom-forms/for-item/' + item._id).then(r => { setDynamicForm(r.data); setDynValues({}); }).catch(() => setDynamicForm(null));
  };

  const load = async () => {
    try {
      const params: Record<string, string> = {};
      if (category) params.category = category;
      const res = await api.get('/kb/catalog', { params });
      setItems(res.data.items || res.data.services || []);
    } catch { setItems([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [category]);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRequest) return;
    if (dynamicForm?.fields?.some((f: any) => f.required && conditionVisible(f, dynValues) && (dynValues[f.name] === undefined || dynValues[f.name] === '' || dynValues[f.name] === false))) {
      toast.error('Please fill required form fields');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/tickets', {
        title: requestForm.title || `Request: ${showRequest.name}`,
        body: requestForm.description,
        source: 'catalog',
        category: showRequest.category,
        customFields: { catalogItemId: showRequest._id, quantity: Number(requestForm.quantity), ...(Object.keys(dynValues).length ? { dynamicFormData: dynValues } : {}) },
      });
      toast.success('Request submitted!');
      setShowRequest(null);
      setDynamicForm(null);
      setDynValues({});
      setRequestForm({ title: '', description: '', quantity: '1' });
    } catch { toast.error('Failed to submit request'); } finally { setSubmitting(false); }
  };

  const categories = [...new Set(items.map(i => i.category))];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Service Catalog</h1>

      {showRequest && (
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Request: {showRequest.name}</h2>
          <form onSubmit={handleRequest} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input type="text" value={requestForm.title} onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })} className="mt-1 input-field" placeholder={`Request: ${showRequest.name}`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea value={requestForm.description} onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })} rows={4} className="mt-1 input-field" placeholder="Describe your request..." />
            </div>
            {dynamicForm?.fields?.length ? (
              <>
                <h4 className="text-sm font-medium text-gray-700">{dynamicForm.name}</h4>
                {dynamicForm.fields.slice().sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)).map((f: any) => (
                  conditionVisible(f, dynValues) ? (
                    <div key={f.name}>
                      <label className="block text-sm font-medium text-gray-700">{f.label}{f.required && ' *'}</label>
                      {f.type === 'select' || f.type === 'radio' ? (
                        f.type === 'select' ? (
                          <select className="mt-1 input-field" value={dynValues[f.name] || ''} onChange={(e) => setDynValues({ ...dynValues, [f.name]: e.target.value })}>
                            <option value="">Select...</option>
                            {(f.options || []).map((o: string) => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <div className="flex gap-3 mt-1">
                            {(f.options || []).map((o: string) => (
                              <label key={o} className="flex items-center gap-1 text-sm"><input type="radio" name={f.name} checked={dynValues[f.name] === o} onChange={() => setDynValues({ ...dynValues, [f.name]: o })} />{o}</label>
                            ))}
                          </div>
                        )
                      ) : f.type === 'textarea' ? (
                        <textarea className="mt-1 input-field" rows={2} value={dynValues[f.name] || ''} onChange={(e) => setDynValues({ ...dynValues, [f.name]: e.target.value })} />
                      ) : f.type === 'checkbox' ? (
                        <input type="checkbox" className="mt-2" checked={!!dynValues[f.name]} onChange={(e) => setDynValues({ ...dynValues, [f.name]: e.target.checked })} />
                      ) : (
                        <input type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'} className="mt-1 input-field" value={dynValues[f.name] || ''} onChange={(e) => setDynValues({ ...dynValues, [f.name]: e.target.value })} />
                      )}
                    </div>
                  ) : null
                ))}
              </>
            ) : null}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input type="number" value={requestForm.quantity} onChange={(e) => setRequestForm({ ...requestForm, quantity: e.target.value })} className="mt-1 input-field" min="1" />
              </div>
              {showRequest.price && <div className="flex items-end"><p className="text-lg font-bold text-gray-900">${showRequest.price}</p></div>}
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Submitting...' : 'Submit Request'}</button>
              <button type="button" onClick={() => { setShowRequest(null); setDynamicForm(null); setDynValues({}); }} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={() => setCategory('')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${!category ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>All</button>
        {categories.map(c => (
          <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${category === c ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{c}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <div className="col-span-3 py-12 text-center text-gray-500">Loading...</div> :
          items.length === 0 ? <div className="col-span-3 py-12 text-center text-gray-500">No catalog items available</div> :
          items.map((item) => (
            <div key={item._id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{item.name}</h3>
                    <p className="text-xs text-gray-500">{item.category}</p>
                  </div>
                </div>
                {item.price && <span className="text-sm font-bold text-gray-900">${item.price}</span>}
              </div>
              <p className="text-sm text-gray-500 line-clamp-2 mb-3">{item.description}</p>
              <div className="flex items-center justify-between">
                {item.estimatedTime && <span className="text-xs text-gray-400">Est. {item.estimatedTime}</span>}
                <button onClick={() => openRequest(item)} className="text-sm text-brand-600 hover:text-brand-700 font-medium">Request</button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
