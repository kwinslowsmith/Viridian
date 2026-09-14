'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardBody, Button, LoadingState, EmptyState, Badge } from '@/app/components/polymath';
import { useCommunityMembers } from '@/hooks/usePolymath';

export default function MembersPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { members, loading, error } = useCommunityMembers(slug);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      setRemovingMemberId(memberId);
      const res = await fetch(`/api/communities/${slug}/members/${memberId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        // Reload page to reflect changes
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to remove member:', error);
      setRemovingMemberId(null);
    }
  };

  if (loading) {
    return <LoadingState message="Loading members..." />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <p className="text-red-800 font-medium">Error loading members</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
        <Link href={`/polymath/communities/${slug}`}>
          <Button>Back to Community</Button>
        </Link>
      </div>
    );
  }

  // Separate curators and members
  const curators = members.filter((m) => m.role === 'curator');
  const regularMembers = members.filter((m) => m.role === 'member');

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#3C3C3C] mb-2">Members</h1>
          <p className="text-[#666666]">{members.length} members</p>
        </div>
        <Button>+ Invite Member</Button>
      </div>

      {members.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No members yet"
          description="Invite members to join this community"
          actionLabel="Invite Member"
          onAction={() => (window.location.href = '#')}
        />
      ) : (
        <>
          {/* Curators Section */}
          {curators.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xl font-semibold text-[#3C3C3C] mb-4">
                👑 Curators ({curators.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {curators.map((member) => (
                  <Link key={member.id} href={`/polymath/communities/${slug}/members/${member.id}`}>
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                      <CardBody>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-[#3C3C3C]">
                              {member.user?.name || 'Unknown'}
                            </h3>
                            <p className="text-sm text-[#666666]">{member.user?.email}</p>
                          </div>
                          <Badge variant="primary">Curator</Badge>
                        </div>
                        <p className="text-xs text-[#999999]">
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </p>
                      </CardBody>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Members Section */}
          {regularMembers.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-[#3C3C3C] mb-4">
                👤 Members ({regularMembers.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {regularMembers.map((member) => (
                  <div key={member.id} className="group">
                    <Link href={`/polymath/communities/${slug}/members/${member.id}`}>
                      <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                        <CardBody>
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-[#3C3C3C]">
                                {member.user?.name || 'Unknown'}
                              </h3>
                              <p className="text-sm text-[#666666]">{member.user?.email}</p>
                            </div>
                          </div>
                          <p className="text-xs text-[#999999]">
                            Joined {new Date(member.joinedAt).toLocaleDateString()}
                          </p>
                        </CardBody>
                      </Card>
                    </Link>
                    <div className="mt-2">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={removingMemberId === member.id}
                        className="w-full"
                      >
                        {removingMemberId === member.id ? 'Removing...' : 'Remove Member'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
