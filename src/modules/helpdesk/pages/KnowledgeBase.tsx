import React, { useState, useEffect } from 'react';
import api from '@shared/lib/api';
import { useAuth } from '@core/auth/useAuth';
import toast from 'react-hot-toast';
import { BookOpenIcon, ThumbsUpIcon, ThumbsDownIcon } from 'lucide-react';

interface Faq {
  _id: string;
  question: string;
  answer: string;
  category?: { name: string };
  helpful: number;
  notHelpful: number;
  viewCount: number;
  lifecycle: string;
  status?: string;
}

// Knowledge lifecycle (ITSM-08): draft -> review -> approved -> published,
// with expire / retire / archive paths. Backend enforces legal transitions.
const NEXT_STEPS: Record<string, string[]> = {
  draft: ['review'],
  review: ['approved', 'draft'],
  approved: ['published', 'review'],
  published: ['expired', 'archived'],
  expired: ['review', 'archived'],
  archived: ['draft'],
};

interface Category {
  _id: string;
  name: string;
}

export default function KnowledgeBase() {
  const { hasPermission } = useAuth();
  const canManageKb = hasPermission('kb.manage');
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const [faqsRes, catsRes] = await Promise.all([
          api.get('/kb/faqs'),
          api.get('/kb/categories'),
        ]);
        setFaqs(faqsRes.data.faqs || []);
        setCategories(catsRes.data.categories || []);
      } catch {
        setFaqs([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = faqs.filter((f) => {
    const matchesSearch = f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || f.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const transition = async (faqId: string, to: string) => {
    try {
      await api.post(`/agent/faqs/${faqId}/transition`, { to });
      setFaqs((prev) => prev.map((f) => (f._id === faqId ? { ...f, status: to } : f)));
      toast.success(`Article moved to ${to}`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Transition rejected');
    }
  };

  const handleVote = async (faqId: string, helpful: boolean) => {
    try {
      await api.post(`/kb/faqs/${faqId}/vote`, { helpful });
      setFaqs((prev) => prev.map((f) =>
        f._id === faqId ? { ...f, helpful: helpful ? f.helpful + 1 : f.helpful, notHelpful: helpful ? f.notHelpful : f.notHelpful + 1 } : f
      ));
    } catch {
      // handle error
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>

      <div className="flex items-center gap-4">
        <input type="text" placeholder="Search articles..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-12 text-center text-gray-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-gray-500">No articles found</div>
        ) : (
          filtered.map((faq) => (
            <div key={faq._id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start gap-3">
                <BookOpenIcon className="h-5 w-5 text-brand-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                    <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-gray-100 text-gray-600">{faq.status || 'published'}</span>
                  </div>
                  {canManageKb && (
                    <div className="mt-1.5 flex gap-1.5 flex-wrap">
                      {(NEXT_STEPS[faq.status || 'published'] || []).map((step) => (
                        <button key={step} onClick={() => transition(faq._id, step)}
                          className="text-[11px] px-2 py-0.5 border rounded-full text-brand-700 border-brand-200 hover:bg-brand-50">
                          → {step}
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="mt-2 text-sm text-gray-600 line-clamp-3">{faq.answer}</p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                    {faq.category && <span className="bg-gray-100 px-2 py-0.5 rounded">{faq.category.name}</span>}
                    <span>{faq.viewCount} views</span>
                    <button onClick={() => handleVote(faq._id, true)} className="flex items-center gap-1 hover:text-green-600">
                      <ThumbsUpIcon className="h-3 w-3" /> {faq.helpful}
                    </button>
                    <button onClick={() => handleVote(faq._id, false)} className="flex items-center gap-1 hover:text-red-600">
                      <ThumbsDownIcon className="h-3 w-3" /> {faq.notHelpful}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
