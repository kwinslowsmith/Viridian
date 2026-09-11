'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button, LoadingState, EmptyState } from '@/app/components/polymath';
import { DiscussionThread } from '@/app/components/polymath/DiscussionThread';
import { CreateDiscussionModal } from '@/app/components/polymath/CreateDiscussionModal';

interface Discussion {
  id: string;
  title: string;
  startedBy?: string;
  replyCount?: number;
  isPinned?: boolean;
  lastActivityDate?: string;
}

export default function DiscussionsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchDiscussions();
    }
  }, [slug]);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/communities/${slug}/discussions`);
      if (res.ok) {
        const data = await res.json();
        setDiscussions(data.discussions || []);
      }
    } catch (error) {
      console.error('Failed to fetch discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscussion = async (discussion: any) => {
    try {
      const res = await fetch(`/api/communities/${slug}/discussions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discussion),
      });

      if (!res.ok) {
        throw new Error('Failed to create discussion');
      }

      const data = await res.json();
      setDiscussions((prev) => [data.discussion, ...prev]);
    } catch (error) {
      console.error('Failed to create discussion:', error);
      throw error;
    }
  };

  if (loading) {
    return <LoadingState message="Loading discussions..." />;
  }

  // Separate pinned and regular discussions
  const pinnedDiscussions = discussions.filter((d) => d.isPinned);
  const regularDiscussions = discussions.filter((d) => !d.isPinned);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold text-[#3C3C3C]">Discussions</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>+ Start Discussion</Button>
      </div>

      {/* Pinned Discussions */}
      {pinnedDiscussions.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-[#3C3C3C] mb-4">
            📌 Pinned
          </h2>
          <div className="space-y-4">
            {pinnedDiscussions.map((discussion) => (
              <DiscussionThread
                key={discussion.id}
                id={discussion.id}
                communitySlug={slug}
                title={discussion.title}
                startedBy={discussion.startedBy}
                replyCount={discussion.replyCount}
                isPinned={discussion.isPinned}
                lastActivityDate={discussion.lastActivityDate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular Discussions */}
      {regularDiscussions.length === 0 && pinnedDiscussions.length === 0 ? (
        <EmptyState
          icon="💬"
          title="No discussions yet"
          description="Start a discussion to engage with your community"
          actionLabel="Start Discussion"
          onAction={() => (window.location.href = '#')}
        />
      ) : (
        <div>
          {regularDiscussions.length > 0 && (
            <h2 className="text-xl font-semibold text-[#3C3C3C] mb-4">
              Recent Discussions
            </h2>
          )}
          <div className="space-y-4">
            {regularDiscussions.map((discussion) => (
              <DiscussionThread
                key={discussion.id}
                id={discussion.id}
                communitySlug={slug}
                title={discussion.title}
                startedBy={discussion.startedBy}
                replyCount={discussion.replyCount}
                isPinned={discussion.isPinned}
                lastActivityDate={discussion.lastActivityDate}
              />
            ))}
          </div>
        </div>
      )}

      <CreateDiscussionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateDiscussion}
        communitySlug={slug}
      />
    </div>
  );
}
