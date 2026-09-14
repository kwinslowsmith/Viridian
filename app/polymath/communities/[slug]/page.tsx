'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardBody, Button, LoadingState, Tabs } from '@/app/components/polymath';
import { useCommunity, useCommunityResources, useCommunityDiscussions, useCommunityMeetings, useCommunityMembers, useJoinCommunity } from '@/hooks/usePolymath';

export default function CommunityPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { community, loading, error } = useCommunity(slug);
  const { resources, loading: loadingResources } = useCommunityResources(slug);
  const { discussions, loading: loadingDiscussions } = useCommunityDiscussions(slug);
  const { meetings, loading: loadingMeetings } = useCommunityMeetings(slug);
  const { members, loading: loadingMembers } = useCommunityMembers(slug);
  const { join, loading: joiningCommunity, error: joinError } = useJoinCommunity();
  const [joinStatus, setJoinStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (loading) {
    return <LoadingState message="Loading community..." />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-12">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <Link href="/polymath/communities">
            <Button>Back to Communities</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="max-w-7xl mx-auto py-12">
        <div className="text-center">
          <p className="text-[#666666] font-medium mb-4">Community not found</p>
          <Link href="/polymath/communities">
            <Button>Back to Communities</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleJoinCommunity = async () => {
    try {
      await join(slug);
      setJoinStatus('success');
    } catch {
      setJoinStatus('error');
    }
  };

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div>
          <h2 className="text-2xl font-bold text-[#3C3C3C] mb-4">Overview</h2>
          <Card>
            <CardBody className="space-y-6">
              <p className="text-[#666666]">{community.description || 'No description provided'}</p>

              {joinStatus === 'idle' && (
                <Button
                  onClick={handleJoinCommunity}
                  disabled={joiningCommunity}
                  isLoading={joiningCommunity}
                >
                  {joiningCommunity ? 'Joining...' : 'Join Community'}
                </Button>
              )}

              {joinStatus === 'success' && (
                <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                  Successfully joined the community!
                </div>
              )}

              {joinStatus === 'error' && joinError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {joinError}
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#E5E5E5]">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#20B2AA]">
                    {community._count?.members || 0}
                  </div>
                  <div className="text-sm text-[#666666]">Members</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#20B2AA]">
                    {resources.length}
                  </div>
                  <div className="text-sm text-[#666666]">Resources</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#20B2AA]">
                    {discussions.length}
                  </div>
                  <div className="text-sm text-[#666666]">Discussions</div>
                </div>
              </div>

              {community.curator && (
                <div className="p-4 bg-[#F0F9FF] rounded-lg border border-[#BFDBFE]">
                  <p className="text-xs text-[#0369A1] font-medium mb-1">CURATOR</p>
                  <p className="text-sm font-medium text-[#3C3C3C]">{community.curator.name}</p>
                  <p className="text-xs text-[#666666]">{community.curator.email}</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      ),
    },
    {
      id: 'resources',
      label: 'Resources',
      content: (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#3C3C3C]">Resources ({resources.length})</h2>
            <Button size="sm">+ Upload Resource</Button>
          </div>

          {loadingResources ? (
            <p className="text-[#666666]">Loading resources...</p>
          ) : resources.length === 0 ? (
            <p className="text-[#666666]">No resources yet. Be the first to share!</p>
          ) : (
            <div className="space-y-3">
              {resources.map((resource) => (
                <Card key={resource.id}>
                  <CardBody>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-[#3C3C3C]">{resource.title}</h3>
                        {resource.description && (
                          <p className="text-sm text-[#666666] mt-1">{resource.description}</p>
                        )}
                        <p className="text-xs text-[#999999] mt-2">
                          By {resource.createdBy?.name || 'Unknown'}
                        </p>
                      </div>
                      {resource.type && (
                        <span className="text-xs bg-[#E5E5E5] text-[#3C3C3C] px-2 py-1 rounded whitespace-nowrap">
                          {resource.type}
                        </span>
                      )}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'discussions',
      label: 'Discussions',
      content: (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#3C3C3C]">Discussions ({discussions.length})</h2>
            <Link href={`/polymath/communities/${slug}/discussions`}>
              <Button size="sm">+ Start Discussion</Button>
            </Link>
          </div>

          {loadingDiscussions ? (
            <p className="text-[#666666]">Loading discussions...</p>
          ) : discussions.length === 0 ? (
            <p className="text-[#666666]">No discussions yet. Start one to engage!</p>
          ) : (
            <div className="space-y-3">
              {discussions.slice(0, 5).map((discussion) => (
                <Card key={discussion.id}>
                  <CardBody>
                    <div>
                      <h3 className="font-semibold text-[#3C3C3C]">{discussion.title}</h3>
                      <p className="text-xs text-[#999999] mt-2">
                        By {discussion.createdBy?.name || 'Unknown'} • {discussion._count?.messages || 0} messages
                      </p>
                    </div>
                  </CardBody>
                </Card>
              ))}
              {discussions.length > 5 && (
                <Link href={`/polymath/communities/${slug}/discussions`}>
                  <Button variant="secondary" className="w-full">
                    View all discussions
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'meetings',
      label: 'Meetings',
      content: (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#3C3C3C]">Meetings ({meetings.length})</h2>
            <Button size="sm">+ Schedule Meeting</Button>
          </div>

          {loadingMeetings ? (
            <p className="text-[#666666]">Loading meetings...</p>
          ) : meetings.length === 0 ? (
            <p className="text-[#666666]">No meetings scheduled yet</p>
          ) : (
            <div className="space-y-3">
              {meetings.map((meeting) => (
                <Card key={meeting.id}>
                  <CardBody>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-[#3C3C3C]">{meeting.title}</h3>
                        {meeting.description && (
                          <p className="text-sm text-[#666666] mt-1">{meeting.description}</p>
                        )}
                        <p className="text-xs text-[#999999] mt-2">
                          📅 {new Date(meeting.scheduledAt).toLocaleDateString()}
                          {meeting.location && ` • 📍 ${meeting.location}`}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'members',
      label: 'Members',
      content: (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#3C3C3C]">Members ({members.length})</h2>
            <Button size="sm">+ Invite Member</Button>
          </div>

          {loadingMembers ? (
            <p className="text-[#666666]">Loading members...</p>
          ) : members.length === 0 ? (
            <p className="text-[#666666]">No members yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {members.map((member) => (
                <Card key={member.id}>
                  <CardBody className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#3C3C3C]">{member.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-[#666666]">{member.user?.email}</p>
                      <p className="text-xs text-[#999999] mt-1">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs font-medium bg-[#E5E5E5] text-[#3C3C3C] px-2 py-1 rounded capitalize">
                      {member.role}
                    </span>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Community Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-4xl font-bold text-[#3C3C3C] flex-1">
            {community.name}
          </h1>
          <div className="flex gap-2">
            {community.curator?.id && (
              <span className="px-3 py-1 bg-[#20B2AA]/20 text-[#20B2AA] text-sm font-medium rounded-full">
                {community.scope === 'organization' ? 'Organization' : 'Global'}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-[#666666]">
          {community.isPublic && <span>🔓 Public</span>}
          {community.topic && <span>📌 {community.topic}</span>}
          <span>Created {new Date(community.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} defaultTabId="overview" />
    </div>
  );
}
