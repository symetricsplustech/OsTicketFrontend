import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, CheckCircle, Archive, TrendingUp, MessageSquare, Star } from 'lucide-react';
import { knowledgeApi, type KBDashboard } from '../../services/knowledge/knowledgeApi';

export default function KnowledgeDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<KBDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try { const res = await knowledgeApi.getDashboard(); setDashboard(res.data.data); } catch { /* empty */ } finally { setLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>;
  if (!dashboard) return <div className="flex items-center justify-center h-64">Failed to load dashboard</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Knowledge Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/kb')}>View Articles</Button>
          <Button onClick={() => navigate('/knowledge-insights')}>KB Insights</Button>
        </div>
      </div>
      <div className="grid grid-cols-6 gap-4">
        {[
          { label: 'Total', value: dashboard.total, icon: FileText, color: 'blue' },
          { label: 'Published', value: dashboard.published, icon: CheckCircle, color: 'green' },
          { label: 'Draft', value: dashboard.draft, icon: FileText, color: 'gray' },
          { label: 'In Review', value: dashboard.review, icon: Clock, color: 'yellow' },
          { label: 'Expired', value: dashboard.expired, icon: Archive, color: 'orange' },
          { label: 'Archived', value: dashboard.archived, icon: Archive, color: 'red' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 py-4">
              <div className={`p-2 bg-${s.color}-100 rounded-lg`}><s.icon className={`h-5 w-5 text-${s.color}-600`} /></div>
              <div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Most Viewed</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {dashboard.topViewed.length === 0 ? <p className="text-muted-foreground text-center py-4">No articles yet</p> : dashboard.topViewed.map(a => (
              <div key={a._id} className="flex items-center justify-between py-2 border-b last:border-0 cursor-pointer hover:bg-muted/50 px-2 rounded" onClick={() => navigate(`/kb/${a._id}`)}>
                <p className="font-medium text-sm truncate">{a.question}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><span>{a.views} views</span><span>{a.helpful} helpful</span></div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Star className="h-4 w-4" /> Top Rated</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {dashboard.topRated.length === 0 ? <p className="text-muted-foreground text-center py-4">No ratings yet</p> : dashboard.topRated.map(a => (
              <div key={a._id} className="flex items-center justify-between py-2 border-b last:border-0 cursor-pointer hover:bg-muted/50 px-2 rounded" onClick={() => navigate(`/kb/${a._id}`)}>
                <p className="font-medium text-sm truncate">{a.question}</p>
                <div className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /><span className="text-sm font-medium">{a.averageRating}</span><span className="text-xs text-muted-foreground">({a.ratingCount})</span></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Recent Feedback</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {dashboard.recentFeedback.length === 0 ? <p className="text-muted-foreground text-center py-4">No feedback yet</p> : dashboard.recentFeedback.map(f => (
            <div key={f._id} className="flex items-start justify-between py-2 border-b last:border-0">
              <div>
                <p className="text-sm"><span className="font-medium">{(f.userId as unknown as { name: string })?.name}</span> rated as <Badge className={`ml-1 ${f.type === 'helpful' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{f.type.replace(/_/g, ' ')}</Badge></p>
                {f.comment && <p className="text-sm text-muted-foreground mt-1">{f.comment}</p>}
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(f.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
