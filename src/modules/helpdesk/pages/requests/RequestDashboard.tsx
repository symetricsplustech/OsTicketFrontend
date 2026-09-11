import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Package, Clock, CheckCircle, XCircle, BarChart3, Plus } from 'lucide-react';
import { requestApi, type Request, type RequestedItem } from '../../services/requests/requestApi';

const statusColors: Record<string, string> = {
  open: 'bg-blue-100 text-blue-800',
  work_in_progress: 'bg-yellow-100 text-yellow-800',
  closed_complete: 'bg-green-100 text-green-800',
  closed_incomplete: 'bg-orange-100 text-orange-800',
  closed_canceled: 'bg-red-100 text-red-800',
  pending_approval: 'bg-purple-100 text-purple-800',
  not_started: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  complete: 'bg-green-100 text-green-800',
  partial: 'bg-orange-100 text-orange-800',
};

export default function RequestDashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[]>([]);
  const [ritms, setRitms] = useState<RequestedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, completed: 0 });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reqRes, ritmRes] = await Promise.all([
        requestApi.listRequests({ limit: 50 }),
        requestApi.listRITMs({ limit: 50 }),
      ]);
      const reqs = reqRes.data.data.items || [];
      const items = ritmRes.data.data.items || [];
      setRequests(reqs);
      setRitms(items);
      setStats({
        total: reqs.length,
        open: reqs.filter(r => r.status === 'open').length,
        inProgress: reqs.filter(r => r.status === 'work_in_progress').length,
        completed: reqs.filter(r => r.status === 'closed_complete').length,
      });
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Request Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/catalog')}>
            <ShoppingCart className="h-4 w-4 mr-2" /> Browse Catalog
          </Button>
          <Button onClick={() => navigate('/requests/new')}>
            <Plus className="h-4 w-4 mr-2" /> New Request
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="p-3 bg-blue-100 rounded-lg"><BarChart3 className="h-6 w-6 text-blue-600" /></div>
            <div><p className="text-2xl font-bold">{stats.total}</p><p className="text-sm text-muted-foreground">Total Requests</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="p-3 bg-blue-100 rounded-lg"><Package className="h-6 w-6 text-blue-600" /></div>
            <div><p className="text-2xl font-bold">{stats.open}</p><p className="text-sm text-muted-foreground">Open</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="p-3 bg-yellow-100 rounded-lg"><Clock className="h-6 w-6 text-yellow-600" /></div>
            <div><p className="text-2xl font-bold">{stats.inProgress}</p><p className="text-sm text-muted-foreground">In Progress</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="p-3 bg-green-100 rounded-lg"><CheckCircle className="h-6 w-6 text-green-600" /></div>
            <div><p className="text-2xl font-bold">{stats.completed}</p><p className="text-sm text-muted-foreground">Completed</p></div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Recent Requests</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {requests.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No requests yet</p>
            ) : (
              requests.slice(0, 10).map(req => (
                <div key={req._id} className="flex items-center justify-between py-2 border-b last:border-0 cursor-pointer hover:bg-muted/50 px-2 rounded"
                  onClick={() => navigate(`/requests/${req._id}`)}>
                  <div>
                    <p className="font-medium text-sm">{req.number}</p>
                    <p className="text-xs text-muted-foreground">{req.title}</p>
                  </div>
                  <Badge className={statusColors[req.status]}>{req.status.replace(/_/g, ' ')}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Requested Items</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {ritms.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No requested items yet</p>
            ) : (
              ritms.slice(0, 10).map(ritm => (
                <div key={ritm._id} className="flex items-center justify-between py-2 border-b last:border-0 cursor-pointer hover:bg-muted/50 px-2 rounded"
                  onClick={() => navigate(`/ritms/${ritm._id}`)}>
                  <div>
                    <p className="font-medium text-sm">{ritm.number}</p>
                    <p className="text-xs text-muted-foreground">{ritm.catalogItemName}</p>
                  </div>
                  <div className="flex gap-1">
                    <Badge className={statusColors[ritm.status]}>{ritm.status.replace(/_/g, ' ')}</Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
