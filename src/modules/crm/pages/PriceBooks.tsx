import { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import { Plus, Book, Edit2, Trash2, Search, Save, X, DollarSign, Package } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  sku: string;
}

interface PriceBook {
  id: number;
  name: string;
  currency: string;
  products: Product[];
  created: string;
  updated: string;
}

interface PriceBookFormData {
  name: string;
  currency: string;
  products: { product_id: number; price: number }[];
}

export default function PriceBooks() {
  const [priceBooks, setPriceBooks] = useState<PriceBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);

  const [form, setForm] = useState<PriceBookFormData>({
    name: '',
    currency: 'USD',
    products: [],
  });

  useEffect(() => {
    fetchPriceBooks();
    fetchProducts();
  }, []);

  const fetchPriceBooks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/extra/price-books');
      setPriceBooks(response.data as PriceBook[]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch price books');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/extra/products');
      setProducts(response.data as Product[]);
    } catch (err: any) {
      console.error('Failed to fetch products', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/extra/price-books/${editingId}`, form);
      } else {
        await api.post('/extra/price-books', form);
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchPriceBooks();
    } catch (err: any) {
      setError(err.message || 'Failed to save price book');
    }
  };

  const handleEdit = (priceBook: PriceBook) => {
    setForm({
      name: priceBook.name,
      currency: priceBook.currency,
      products: priceBook.products.map((p) => ({ product_id: p.id, price: p.price })),
    });
    setEditingId(priceBook.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this price book?')) return;
    try {
      await api.delete(`/extra/price-books/${id}`);
      fetchPriceBooks();
    } catch (err: any) {
      setError(err.message || 'Failed to delete price book');
    }
  };

  const resetForm = () => {
    setForm({ name: '', currency: 'USD', products: [] });
  };

  const addProduct = () => {
    setForm({
      ...form,
      products: [...form.products, { product_id: 0, price: 0 }],
    });
  };

  const removeProduct = (index: number) => {
    setForm({
      ...form,
      products: form.products.filter((_, i) => i !== index),
    });
  };

  const updateProductEntry = (index: number, field: string, value: string | number) => {
    const updated = [...form.products];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, products: updated });
  };

  const filteredBooks = priceBooks.filter((pb) =>
    pb.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Book className="h-6 w-6" />
            Price Books
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage price books and product pricing</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingId(null);
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Price Book
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button onClick={() => setError(null)} className="float-right">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mb-4">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search price books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {editingId ? 'Edit Price Book' : 'New Price Book'}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                resetForm();
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Price book name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="INR">INR - Indian Rupee</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  <Package className="inline h-4 w-4 mr-1" />
                  Products
                </label>
                <button
                  type="button"
                  onClick={addProduct}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Product
                </button>
              </div>
              <div className="space-y-2">
                {form.products.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <select
                      required
                      value={entry.product_id}
                      onChange={(e) =>
                        updateProductEntry(index, 'product_id', parseInt(e.target.value))
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={0}>Select product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </option>
                      ))}
                    </select>
                    <div className="relative w-32">
                      <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={entry.price}
                        onChange={(e) =>
                          updateProductEntry(index, 'price', parseFloat(e.target.value))
                        }
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Price"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeProduct(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {form.products.length === 0 && (
                  <p className="text-sm text-gray-500">No products added yet</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  resetForm();
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading price books...</p>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Book className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {searchQuery ? 'No price books match your search' : 'No price books found'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Currency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Products
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBooks.map((priceBook) => (
                <tr key={priceBook.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{priceBook.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{priceBook.currency}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {priceBook.products?.length || 0} products
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(priceBook.created).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEdit(priceBook)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(priceBook.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
