import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, ThumbsUp, ThumbsDown, Star, MessageSquare, History, Eye } from 'lucide-react';
import { knowledgeApi, type KnowledgeArticle, type KnowledgeVersion, type KnowledgeComment, type KnowledgeFeedback } from '../../services/knowledge/knowledgeApi';

const lifecycleColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800', review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800', published: 'bg-green-100 text-green-800',
  expired: 'bg-orange-100 text-orange-800', archived: 'bg-red-100 text-red-800',
};
const NEXT_STEPS: Record<string, string[]> = {
  draft: ['review', 'archived'], review: ['approved', 'draft'],
  approved: ['published', 'review'], published: ['expired', 'archived', 'review', 'draft'],
  expired: ['review', 'archived'], archived: ['draft'],
};

export default function ArticleRecord() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<KnowledgeArticle | null>(null);
  const [versions, setVersions] = useState<KnowledgeVersion[]>([]);
  const [comments, setComments] = useState<KnowledgeComment[]>([]);
  const [feedback, setFeedback] = useState<KnowledgeFeedback[]>([]);
  const [ratings, setRatings] = useState<{ averageRating: number; ratingCount: number } | null>(null);
  const [metrics, setMetrics] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content');
  const [newComment, setNewComment] = useState('');
  const [userRating, setUserRating] = useState(0);

  useEffect(() => { if (id) loadData(); }, [id]);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [artRes, verRes, comRes, fbRes, ratRes, metRes] = await Promise.all([
        knowledgeApi.getArticle(id), knowledgeApi.listVersions(id), knowledgeApi.listComments(id),
        knowledgeApi.listFeedback(id), knowledgeApi.getRatings(id), knowledgeApi.getMetrics(id),
      ]);
      setArticle(artRes.data.data); setVersions(verRes.data.data || []); setComments(comRes.data.data || []);
      setFeedback(fbRes.data.data || []); setRatings(ratRes.data.data); setMetrics(metRes.data.data);
    } catch { /* empty */ } finally { setLoading(false); }
  };

  const handleTransition = async (lifecycle: string) => { if (!id) return; await knowledgeApi.transitionArticle(id, { lifecycle }); loadData(); };
  const handleVote = async (helpful: boolean) => { if (!id) return; await knowledgeApi.createFeedback(id, { type: helpful ? 'helpful' : 'not_helpful' }); loadData(); };
  const handleRate = async (rating: number) => { if (!id) return; setUserRating(rating); await knowledgeApi.rateArticle(id, rating); loadData(); };
  const handleComment = async () => { if (!id || !newComment.trim()) return; await knowledgeApi.createComment(id, { content: newComment }); setNewComment(''); loadData(); };

  if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>;
  if (!article) return <div className="flex items-center justify-center h-64">Article not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/kb')}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1"><h1 className="text-2xl font-bold">{article.question}</h1><p className="text-muted-foreground">{article.number} | v{article.version}</p></div>
        <Badge className={lifecycleColors[article.lifecycle]}>{article.lifecycle}</Badge>
        {NEXT_STEPS[article.lifecycle]?.map(step => (<Button key={step} size="sm" variant="outline" onClick={() => handleTransition(step)}>{step}</Button>))}
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {metrics?.views || 0}</span>
        <span className="flex items-center gap-1"><ThumbsUp className="h-4 w-4" /> {article.helpful}</span>
        <span className="flex items-center gap-1"><ThumbsDown className="h-4 w-4" /> {article.notHelpful}</span>
        <span className="flex items-center gap-1"><Star className="h-4 w-4" /> {ratings?.averageRating || 0} ({ratings?.ratingCount || 0})</span>
        <span className="flex items-center gap-1"><MessageSquare className="h-4 w-4" /> {comments.length}</span>
        <span className="flex items-center gap-1"><History className="h-4 w-4" /> {versions.length}</span>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => handleVote(true)}><ThumbsUp className="h-4 w-4 mr-1" /> Helpful</Button>
        <Button size="sm" variant="outline" onClick={() => handleVote(false)}><ThumbsDown className="h-4 w-4 mr-1" /> Not Helpful</Button>
        <div className="flex items-center gap-1 ml-4">
          {[1,2,3,4,5].map(star => (<Star key={star} className={`h-5 w-5 cursor-pointer ${star <= userRating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} onClick={() => handleRate(star)} />))}
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="versions">Versions ({versions.length})</TabsTrigger>
          <TabsTrigger value="comments">Comments ({comments.length})</TabsTrigger>
          <TabsTrigger value="feedback">Feedback ({feedback.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="content" className="space-y-4">
          <Card><CardContent className="py-6"><div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: article.answer }} /></CardContent></Card>
        </TabsContent>
        <TabsContent value="versions" className="space-y-3">
          {versions.map(v => (
            <Card key={v._id}><CardContent className="flex items-center justify-between py-3">
              <div><p className="font-medium">v{v.version} - {v.changeSummary}</p><p className="text-sm text-muted-foreground">{v.changeType} at {new Date(v.createdAt).toLocaleString()}</p></div>
              <Badge className={lifecycleColors[v.lifecycle] || 'bg-gray-100'}>{v.lifecycle}</Badge>
            </CardContent></Card>
          ))}
        </TabsContent>
        <TabsContent value="comments" className="space-y-4">
          <div className="flex gap-2">
            <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a comment..." className="flex-1 px-3 py-2 border rounded-md text-sm" onKeyDown={e => e.key === 'Enter' && handleComment()} />
            <Button size="sm" onClick={handleComment}>Post</Button>
          </div>
          {comments.map(c => (
            <Card key={c._id}><CardContent className="py-3">
              <div className="flex items-center justify-between mb-2"><span className="font-medium text-sm">{(c.userId as unknown as { name: string })?.name}</span><span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</span></div>
              <p className="text-sm">{c.content}</p>
            </CardContent></Card>
          ))}
        </TabsContent>
        <TabsContent value="feedback" className="space-y-3">
          {feedback.map(f => (
            <Card key={f._id}><CardContent className="py-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{(f.userId as unknown as { name: string })?.name}</span>
                <Badge className={f.type === 'helpful' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>{f.type.replace(/_/g, ' ')}</Badge>
              </div>
              {f.comment && <p className="text-sm text-muted-foreground">{f.comment}</p>}
              {f.response && <div className="mt-2 p-2 bg-muted rounded text-sm"><span className="font-medium">Response:</span> {f.response}</div>}
            </CardContent></Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
