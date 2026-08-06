'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PolymathButton } from '@/app/components/PolymathButton';
import { PolymathFooter } from '@/app/components/PolymathFooter';
import RejectionFeedbackModal from './RejectionFeedbackModal';

interface ApprovalArticle {
  id: string;
  title: string;
  abstract?: string;
  content: string;
  authorType: string;
  authorId: string;
  organizationId?: string;
  communityId?: string;
  eventId?: string;
  visibility: string;
  approvalChain: string[];
  createdAt: string;
  topic?: string;
}

interface ApprovalQueueResponse {
  articles: ApprovalArticle[];
  modules?: any[];
  tools?: any[];
  collections?: any[];
}

type SortBy = 'newest' | 'oldest';
type AuthorTypeFilter = 'all' | 'organization' | 'community' | 'event';

export default function ApprovalsQueuePage() {
  const router = useRouter();
  const [articles, setArticles] = useState<ApprovalArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<ApprovalArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [authorTypeFilter, setAuthorTypeFilter] = useState<AuthorTypeFilter>('all');
  const [topicFilter, setTopicFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortBy>('newest');

  // Action states
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedArticleForRejection, setSelectedArticleForRejection] = useState<ApprovalArticle | null>(null);

  // Toast notifications
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch approval queue
  const fetchApprovalQueue = async () => {
    try {
      setError(null);
      const response = await fetch('/api/polymath/approval-queue?contentType=articles');

      if (!response.ok) {
        throw new Error('Failed to fetch approval queue');
      }

      const data: ApprovalQueueResponse = await response.json();
      const articles = data.articles || [];

      setArticles(articles);
      applyFilters(articles);
    } catch (err) {
      console.error('Error fetching approval queue:', err);
      setError(err instanceof Error ? err.message : 'Failed to load approvals');
      setArticles([]);
      setFilteredArticles([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to articles
  const applyFilters = (articlesToFilter: ApprovalArticle[]) => {
    let filtered = [...articlesToFilter];

    // Filter by author type
    if (authorTypeFilter !== 'all') {
      filtered = filtered.filter(article => article.authorType === authorTypeFilter);
    }

    // Filter by topic
    if (topicFilter !== 'all') {
      filtered = filtered.filter(article => article.topic === topicFilter);
    }

    // Sort
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    setFilteredArticles(filtered);
  };

  // Initialize
  useEffect(() => {
    fetchApprovalQueue();

    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      setRefreshing(true);
      fetchApprovalQueue().then(() => setRefreshing(false));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Apply filters when they change
  useEffect(() => {
    applyFilters(articles);
  }, [authorTypeFilter, topicFilter, sortBy, articles]);

  // Show toast notification
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // Handle approve
  const handleApprove = async (articleId: string) => {
    try {
      setApprovingId(articleId);
      const response = await fetch(`/api/polymath/articles/${articleId}/approve`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to approve article');
      }

      showToast('success', 'Article approved successfully');

      // Remove from list
      setArticles(articles.filter(a => a.id !== articleId));
    } catch (err) {
      console.error('Error approving article:', err);
      showToast('error', err instanceof Error ? err.message : 'Failed to approve article');
    } finally {
      setApprovingId(null);
    }
  };

  // Handle reject with modal
  const handleRejectClick = (article: ApprovalArticle) => {
    setSelectedArticleForRejection(article);
    setShowRejectionModal(true);
  };

  // Handle reject submission
  const handleRejectSubmit = async (feedback: string) => {
    if (!selectedArticleForRejection) return;

    try {
      setRejectingId(selectedArticleForRejection.id);
      const response = await fetch(`/api/polymath/articles/${selectedArticleForRejection.id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject article');
      }

      showToast('success', 'Article rejected successfully');

      // Remove from list
      setArticles(articles.filter(a => a.id !== selectedArticleForRejection.id));
      setShowRejectionModal(false);
      setSelectedArticleForRejection(null);
    } catch (err) {
      console.error('Error rejecting article:', err);
      showToast('error', err instanceof Error ? err.message : 'Failed to reject article');
    } finally {
      setRejectingId(null);
    }
  };

  // Get unique topics
  const topics = ['all', ...new Set(articles.map(a => a.topic).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#B8A899] border-t-[#8B3A3A] rounded-full animate-spin"></div>
          <p className="text-[#B8A899]">Loading approval queue...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-white border-b border-[#B8A899]/20">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#3C3C3C] mb-1">Approval Queue</h1>
              <p className="text-[#B8A899]">
                {filteredArticles.length} pending {filteredArticles.length === 1 ? 'approval' : 'approvals'}
              </p>
            </div>
            {refreshing && (
              <div className="flex items-center gap-2 text-sm text-[#B8A899]">
                <div className="w-3 h-3 bg-[#8B3A3A] rounded-full animate-pulse"></div>
                Refreshing...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 flex-wrap items-start md:items-center">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-[#3C3C3C] mb-2 uppercase tracking-wider">
              Author Type
            </label>
            <select
              value={authorTypeFilter}
              onChange={(e) => setAuthorTypeFilter(e.target.value as AuthorTypeFilter)}
              className="px-4 py-2 border border-[#B8A899]/20 rounded bg-white text-sm text-[#3C3C3C] focus:outline-none focus:border-[#8B3A3A]"
            >
              <option value="all">All Types</option>
              <option value="organization">Organization</option>
              <option value="community">Community</option>
              <option value="event">Event</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-semibold text-[#3C3C3C] mb-2 uppercase tracking-wider">
              Topic
            </label>
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="px-4 py-2 border border-[#B8A899]/20 rounded bg-white text-sm text-[#3C3C3C] focus:outline-none focus:border-[#8B3A3A]"
            >
              {topics.map(topic => (
                <option key={topic} value={topic}>
                  {topic === 'all' ? 'All Topics' : topic}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-semibold text-[#3C3C3C] mb-2 uppercase tracking-wider">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-4 py-2 border border-[#B8A899]/20 rounded bg-white text-sm text-[#3C3C3C] focus:outline-none focus:border-[#8B3A3A]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Empty State */}
        {filteredArticles.length === 0 && !error && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-[#3C3C3C] mb-2">No Pending Approvals</h2>
            <p className="text-[#B8A899] mb-6">
              {articles.length === 0
                ? "You don't have any articles awaiting approval"
                : 'No articles match your filters'}
            </p>
            <PolymathButton
              variant="secondary"
              onClick={() => router.push('/polymath/feed')}
            >
              View Magazine
            </PolymathButton>
          </div>
        )}

        {/* Articles List */}
        <div className="space-y-4">
          {filteredArticles.map((article) => {
            const originalChainLength = article.approvalChain.length;
            const isApproving = approvingId === article.id;
            const isRejecting = rejectingId === article.id;

            return (
              <div
                key={article.id}
                className="bg-white border border-[#B8A899]/20 rounded-lg p-6 hover:shadow-md transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Author Type Badge */}
                    <div className="inline-flex mb-2">
                      <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded ${
                        article.authorType === 'organization'
                          ? 'bg-[#8B3A3A]/20 text-[#8B3A3A]'
                          : article.authorType === 'community'
                          ? 'bg-[#9CAF88]/20 text-[#9CAF88]'
                          : 'bg-[#D4A574]/20 text-[#D4A574]'
                      }`}>
                        {article.authorType}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-[#3C3C3C] mb-2 line-clamp-2">{article.title}</h3>

                    {/* Abstract */}
                    {article.abstract && (
                      <p className="text-sm text-[#B8A899] mb-3 line-clamp-2">{article.abstract}</p>
                    )}

                    {/* Progress Indicator */}
                    <div className="flex items-center gap-2 text-sm text-[#B8A899] mb-3">
                      <div className="flex-1 max-w-xs bg-[#B8A899]/20 rounded-full h-2">
                        <div
                          className="bg-[#8B3A3A] h-2 rounded-full transition-all"
                          style={{
                            width: originalChainLength > 0
                              ? `${((originalChainLength - originalChainLength) / originalChainLength) * 100}%`
                              : '100%'
                          }}
                        ></div>
                      </div>
                      <span className="whitespace-nowrap">
                        {originalChainLength} {originalChainLength === 1 ? 'approval' : 'approvals'} needed
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-4 text-xs text-[#B8A899]">
                      {article.topic && (
                        <div>
                          <span className="font-semibold">Topic:</span> {article.topic}
                        </div>
                      )}
                      <div>
                        <span className="font-semibold">Submitted:</span> {new Date(article.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 md:gap-3 min-w-fit">
                    <PolymathButton
                      variant="primary"
                      size="sm"
                      onClick={() => handleApprove(article.id)}
                      disabled={isApproving || isRejecting}
                      className="w-full md:w-auto"
                    >
                      {isApproving ? (
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Approving...
                        </span>
                      ) : (
                        'Approve'
                      )}
                    </PolymathButton>

                    <PolymathButton
                      variant="secondary"
                      size="sm"
                      onClick={() => handleRejectClick(article)}
                      disabled={isApproving || isRejecting}
                      className="w-full md:w-auto"
                    >
                      {isRejecting ? (
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 border-2 border-[#8B3A3A] border-t-transparent rounded-full animate-spin"></span>
                          Rejecting...
                        </span>
                      ) : (
                        'Reject'
                      )}
                    </PolymathButton>

                    <button
                      onClick={() => router.push(`/polymath/article/${article.id}`)}
                      className="px-4 py-2 text-sm text-[#8B3A3A] hover:bg-[#F5F3F0] rounded transition-colors"
                    >
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg text-white text-sm font-semibold shadow-lg animate-in fade-in slide-in-from-bottom-4 ${
            toast.type === 'success' ? 'bg-[#9CAF88]' : 'bg-red-500'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && selectedArticleForRejection && (
        <RejectionFeedbackModal
          articleTitle={selectedArticleForRejection.title}
          onSubmit={handleRejectSubmit}
          onClose={() => {
            setShowRejectionModal(false);
            setSelectedArticleForRejection(null);
          }}
          isSubmitting={rejectingId === selectedArticleForRejection.id}
        />
      )}

      <PolymathFooter />
    </main>
  );
}
