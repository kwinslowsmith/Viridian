'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, LoadingState, EmptyState, Card, CardBody } from '@/app/components/polymath';
import { useCommunityDiscussions, useCreateDiscussion } from '@/hooks/usePolymath';
import { CreateDiscussionModal } from '@/app/components/polymath/CreateDiscussionModal';

export default function DiscussionsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { discussions, loading, error, refetch } = useCommunityDiscussions(slug);
  const { create: createDiscussion, loading: creatingDiscussion, error: createError } = useCreateDiscussion(slug);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateDiscussion = async (data: { title: string; description?: string }) => {
    try {
      await createDiscussion(data);
      setIsCreateModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Failed to create discussion:', error);
    }
  };

  if (loading) {
    return <LoadingState message="Loading discussions..." />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <p className="text-red-800 font-medium">Error loading discussions</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
        <Link href={`/polymath/communities/${slug}`}>
          <Button>Back to Community</Button>
        </Link>
      </div>
    );
  }

  // Separate pinned and regular discussions
  const pinnedDiscussions = discussions.filter((d) => d.isPinned);
  const regularDiscussions = discussions.filter((d) => !d.isPinned);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#3C3C3C] mb-2">Discussions</h1>
          <p className="text-[#666666]">{discussions.length} total discussions</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>+ Start Discussion</Button>
      </div>

      {/* Pinned Discussions */}
      {pinnedDiscussions.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-[#3C3C3C] mb-4">
            📌 Pinned ({pinnedDiscussions.length})
          </h2>
          <div className="space-y-4">
            {pinnedDiscussions.map((discussion) => (
              <Link key={discussion.id} href={`/polymath/communities/${slug}/discussions/${discussion.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardBody>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#3C3C3C] text-lg">{discussion.title}</h3>
                        <p className="text-xs text-[#999999] mt-2">
                          By {discussion.createdBy?.name || 'Unknown'} • {discussion._count?.messages || 0} messages
                          {discussion.updatedAt && ` • Updated ${new Date(discussion.updatedAt).toLocaleDateString()}`}
                        </p>
                      </div>
                      <span className="text-xs font-medium bg-[#FFE5B4] text-[#8B4513] px-2 py-1 rounded whitespace-nowrap">
                        📌 Pinned
                      </span>
                    </div>
                  </CardBody>
                </Card>
              </Link>
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
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div>
          {regularDiscussions.length > 0 && (
            <h2 className="text-xl font-semibold text-[#3C3C3C] mb-4">
              Recent Discussions ({regularDiscussions.length})
            </h2>
          )}
          <div className="space-y-4">
            {regularDiscussions.map((discussion) => (
              <Link key={discussion.id} href={`/polymath/communities/${slug}/discussions/${discussion.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardBody>
                    <h3 className="font-semibold text-[#3C3C3C] text-lg">{discussion.title}</h3>
                    <p className="text-xs text-[#999999] mt-2">
                      By {discussion.createdBy?.name || 'Unknown'} • {discussion._count?.messages || 0} messages
                      {discussion.updatedAt && ` • Updated ${new Date(discussion.updatedAt).toLocaleDateString()}`}
                    </p>
                  </CardBody>
                </Card>
              </Link>
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
