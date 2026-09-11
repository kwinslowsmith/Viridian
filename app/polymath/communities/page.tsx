'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, LoadingState, EmptyState, TextInput } from '@/app/components/polymath';
import { CommunityCard } from '@/app/components/polymath/CommunityCard';
import { useCommunities } from '@/hooks/usePolymath';

export default function CommunitiesPage() {
  const { communities, loading, error } = useCommunities({ scope: 'all' });
  const [filteredCommunities, setFilteredCommunities] = useState<typeof communities>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const filtered = communities.filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredCommunities(filtered);
  }, [searchTerm, communities]);

  if (loading) {
    return <LoadingState message="Loading communities..." />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <p className="text-red-800 font-medium">Error loading communities</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#3C3C3C] mb-2">
            Communities
          </h1>
          <p className="text-[#666666]">
            Join a community and collaborate with educators
          </p>
        </div>
        <Link href="/polymath/communities/create">
          <Button>+ Create Community</Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <TextInput
          type="text"
          placeholder="Search communities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Communities Grid */}
      {filteredCommunities.length === 0 ? (
        <EmptyState
          icon="🔍"
          title={searchTerm ? "No communities found" : "No communities available"}
          description={
            searchTerm
              ? "Try adjusting your search terms"
              : "Be the first to create a community!"
          }
          actionLabel={!searchTerm ? "Create Community" : undefined}
          onAction={
            !searchTerm
              ? () => (window.location.href = '/polymath/communities/create')
              : undefined
          }
        />
      ) : (
        <>
          <div className="text-sm text-[#666666] mb-6">
            Showing {filteredCommunities.length} of {communities.length} communities
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommunities.map((community) => (
              <CommunityCard
                key={community.id}
                id={community.id}
                slug={community.slug}
                name={community.name}
                description={community.description}
                memberCount={community.memberCount}
                role={community.role}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
