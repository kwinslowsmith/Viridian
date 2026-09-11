/**
 * Polymath API Wrapper
 * Central location for all API calls to backend
 * Handles: communities, resources, discussions, meetings, members, curator dashboard
 */

// ============================================================================
// COMMUNITIES
// ============================================================================

export interface Community {
  id: string;
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
  scope: 'global' | 'organization';
  topic?: string;
  difficulty?: string;
  estimatedHours?: number;
  isPublic: boolean;
  requiresApprovalToJoin: boolean;
  status: 'active' | 'archived';
  curator: { id: string; name: string; email: string };
  organization?: { id: string; name: string; slug: string };
  _count?: { members: number; modules: number };
  createdAt: string;
}

export interface CommunitiesResponse {
  communities: Community[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export async function fetchCommunities(
  params: {
    scope?: 'global' | 'organization' | 'all';
    topic?: string;
    search?: string;
    organizationId?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<CommunitiesResponse> {
  const url = new URL('/api/communities', window.location.origin);
  if (params.scope) url.searchParams.append('scope', params.scope);
  if (params.topic) url.searchParams.append('topic', params.topic);
  if (params.search) url.searchParams.append('search', params.search);
  if (params.organizationId) url.searchParams.append('organizationId', params.organizationId);
  if (params.limit) url.searchParams.append('limit', params.limit.toString());
  if (params.offset) url.searchParams.append('offset', params.offset.toString());

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch communities');
  return res.json();
}

export async function fetchMyCommunities(): Promise<Community[]> {
  const res = await fetch('/api/communities/my');
  if (!res.ok) throw new Error('Failed to fetch my communities');
  const data = await res.json();
  return data.communities || [];
}

export async function fetchCommunity(slug: string): Promise<Community> {
  const res = await fetch(`/api/communities/${slug}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error('Community not found');
    throw new Error('Failed to fetch community');
  }
  return res.json();
}

export async function createCommunity(data: {
  name: string;
  description?: string;
  coverImage?: string;
  scope: 'global' | 'organization';
  organizationId?: string;
  topic?: string;
  difficulty?: string;
  estimatedHours?: number;
  isPublic?: boolean;
  requiresApprovalToJoin?: boolean;
}): Promise<Community> {
  const res = await fetch('/api/communities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create community');
  }
  return res.json();
}

export async function updateCommunity(
  slug: string,
  data: Partial<Community>
): Promise<Community> {
  const res = await fetch(`/api/communities/${slug}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update community');
  }
  return res.json();
}

// ============================================================================
// COMMUNITY MEMBERS
// ============================================================================

export interface CommunityMember {
  id: string;
  userId: string;
  communityId: string;
  role: 'member' | 'moderator' | 'curator';
  joinedAt: string;
  user?: { id: string; name: string; email: string };
}

export async function fetchCommunityMembers(slug: string): Promise<CommunityMember[]> {
  const res = await fetch(`/api/communities/${slug}/members`);
  if (!res.ok) throw new Error('Failed to fetch community members');
  const data = await res.json();
  return data.members || [];
}

export async function joinCommunity(slug: string): Promise<{ message: string }> {
  const res = await fetch(`/api/communities/${slug}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to join community');
  }
  return res.json();
}

// ============================================================================
// RESOURCES
// ============================================================================

export interface Resource {
  id: string;
  title: string;
  description?: string;
  url?: string;
  fileKey?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  type: 'document' | 'video' | 'image' | 'link' | 'other';
  format?: string;
  tags?: string[];
  visibility: 'community' | 'organization' | 'private';
  communityId: string;
  createdById: string;
  createdBy?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export async function fetchCommunityResources(slug: string): Promise<Resource[]> {
  const res = await fetch(`/api/communities/${slug}/resources`);
  if (!res.ok) throw new Error('Failed to fetch community resources');
  const data = await res.json();
  return data.resources || [];
}

export async function createResource(
  slug: string,
  data: {
    title: string;
    description?: string;
    url?: string;
    fileKey?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    type: string;
    format?: string;
    tags?: string[];
    skillIds?: string[];
    objectiveIds?: string[];
  }
): Promise<Resource> {
  const res = await fetch(`/api/communities/${slug}/resources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create resource');
  }
  const responseData = await res.json();
  return responseData.resource || responseData;
}

export async function deleteResource(slug: string, resourceId: string): Promise<void> {
  const res = await fetch(`/api/communities/${slug}/resources/${resourceId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to delete resource');
  }
}

// ============================================================================
// DISCUSSIONS
// ============================================================================

export interface Discussion {
  id: string;
  title: string;
  description?: string;
  communityId: string;
  createdById: string;
  createdBy?: { id: string; name: string };
  isPinned: boolean;
  status: 'active' | 'archived';
  messageCount?: number;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionMessage {
  id: string;
  content: string;
  discussionId: string;
  createdById: string;
  createdBy?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export async function fetchCommunityDiscussions(slug: string): Promise<Discussion[]> {
  const res = await fetch(`/api/communities/${slug}/discussions`);
  if (!res.ok) throw new Error('Failed to fetch community discussions');
  const data = await res.json();
  return data.discussions || [];
}

export async function createDiscussion(
  slug: string,
  data: {
    title: string;
    description?: string;
  }
): Promise<Discussion> {
  const res = await fetch(`/api/communities/${slug}/discussions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create discussion');
  }
  const responseData = await res.json();
  return responseData.discussion || responseData;
}

export async function fetchDiscussion(slug: string, discussionId: string): Promise<Discussion> {
  const res = await fetch(`/api/communities/${slug}/discussions/${discussionId}`);
  if (!res.ok) throw new Error('Failed to fetch discussion');
  const data = await res.json();
  return data.discussion || data;
}

export async function fetchDiscussionMessages(
  slug: string,
  discussionId: string
): Promise<DiscussionMessage[]> {
  const res = await fetch(`/api/communities/${slug}/discussions/${discussionId}/messages`);
  if (!res.ok) throw new Error('Failed to fetch discussion messages');
  const data = await res.json();
  return data.messages || [];
}

export async function postDiscussionMessage(
  slug: string,
  discussionId: string,
  content: string
): Promise<DiscussionMessage> {
  const res = await fetch(`/api/communities/${slug}/discussions/${discussionId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to post message');
  }
  const responseData = await res.json();
  return responseData.message || responseData;
}

// ============================================================================
// MEETINGS
// ============================================================================

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  communityId: string;
  scheduledAt: string;
  duration?: number;
  zoomUrl?: string;
  location?: string;
  notes?: string;
  createdById: string;
  createdBy?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export async function fetchCommunityMeetings(slug: string): Promise<Meeting[]> {
  const res = await fetch(`/api/communities/${slug}/meetings`);
  if (!res.ok) throw new Error('Failed to fetch community meetings');
  const data = await res.json();
  return data.meetings || [];
}

export async function createMeeting(
  slug: string,
  data: {
    title: string;
    description?: string;
    scheduledAt: string;
    duration?: number;
    zoomUrl?: string;
    location?: string;
  }
): Promise<Meeting> {
  const res = await fetch(`/api/communities/${slug}/meetings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create meeting');
  }
  const responseData = await res.json();
  return responseData.meeting || responseData;
}

export async function updateMeeting(
  slug: string,
  meetingId: string,
  data: Partial<Meeting>
): Promise<Meeting> {
  const res = await fetch(`/api/communities/${slug}/meetings/${meetingId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update meeting');
  }
  return res.json();
}

export async function deleteMeeting(slug: string, meetingId: string): Promise<void> {
  const res = await fetch(`/api/communities/${slug}/meetings/${meetingId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to delete meeting');
  }
}

// ============================================================================
// CURATOR DASHBOARD
// ============================================================================

export interface CuratorStats {
  communityId: string;
  memberCount: number;
  resourceCount: number;
  discussionCount: number;
  meetingCount: number;
  totalEngagement: number; // messages + resource views
  recentActivity?: Array<{
    type: 'member_joined' | 'resource_created' | 'discussion_started' | 'meeting_scheduled';
    timestamp: string;
    actor: { id: string; name: string };
    details: string;
  }>;
}

export async function fetchCuratorStats(slug: string): Promise<CuratorStats> {
  const res = await fetch(`/api/communities/${slug}/stats`);
  if (!res.ok) throw new Error('Failed to fetch curator stats');
  const data = await res.json();
  return data.stats || data;
}

// ============================================================================
// USER PROFILE
// ============================================================================

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio?: string;
  expertise?: string[];
  affiliations?: string[];
  avatar?: string;
}

export async function fetchMyProfile(): Promise<UserProfile> {
  const res = await fetch('/api/me/profile');
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

export async function updateMyProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  const res = await fetch('/api/me/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update profile');
  }
  return res.json();
}

// ============================================================================
// MY DASHBOARD
// ============================================================================

export interface MyDashboardData {
  communities: Community[];
  recentResources: Resource[];
  recentDiscussions: Discussion[];
  upcomingMeetings: Meeting[];
  unreadMessages: number;
}

export async function fetchMyDashboard(): Promise<MyDashboardData> {
  const res = await fetch('/api/me/dashboard');
  if (!res.ok) throw new Error('Failed to fetch dashboard');
  return res.json();
}
