import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Search, Package, Filter } from 'lucide-react';
import { requestApi, type CatalogItem, type CatalogCategory } from '../../services/requests/requestApi';

export default function CatalogBrowser() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [itemsRes, catsRes] = await Promise.all([
        requestApi.listCatalogItems({ visibleInPortal: true, isActive: true, limit: 100 }),
        requestApi.listCategories({ visibleInPortal: true, isActive: true }),
      ]);
      setItems(itemsRes.data.data || []);
      setCategories(catsRes.data.data || []);
      // Get cart count
      try {
        const cartRes = await requestApi.getMyCart();
        setCartCount(cartRes.data.data?.totalItems || 0);
      } catch { /* no cart yet */ }
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || (item.categoryId as string) === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOrderDirect = async (itemId: string) => {
    try {
      await requestApi.orderDirect(itemId, { quantity: 1 });
      navigate('/requests');
    } catch {
      // Error handled silently
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64">Loading catalog...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Service Catalog</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/cart')}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Cart {cartCount > 0 && <Badge className="ml-1">{cartCount}</Badge>}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search catalog items..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2">
          <Button variant={selectedCategory === '' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory('')}>
            All
          </Button>
          {categories.map(cat => (
            <Button key={cat._id} variant={selectedCategory === cat._id ? 'default' : 'outline'} size="sm"
              onClick={() => setSelectedCategory(cat._id)}>
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No catalog items found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => (
            <Card key={item._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{item.name}</CardTitle>
                      {item.price > 0 && (
                        <p className="text-sm font-medium text-green-600">${item.price.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                  {item.requiresApproval && <Badge variant="outline">Approval Required</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">{item.description || item.shortDescription || 'No description'}</p>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={() => navigate(`/catalog/${item._id}`)}>
                    View Details
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleOrderDirect(item._id)}>
                    Order Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
