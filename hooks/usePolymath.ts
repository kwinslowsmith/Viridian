/**
 * Polymath Custom Hooks
 * Data fetching hooks for all Polymath API endpoints
 * Handles loading, error, and empty states
 */

import { useState, useEffect, useCallback } from 'react';
import * as polymathAPI from '@/lib/polymath-api';

// ============================================================================
// COMMUNITIES
// ============================================================================

export function useCommunities(params?: Parameters<typeof polymathAPI.fetchCommunities>[0]) {
  const [communities, setCommunities] = useState<polymathAPI.Community[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await polymathAPI.fetchCommunities(params);
        if (isMounted) {
          setCommunities(data.communities);
          setTotal(data.total);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load communities');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [params?.scope, params?.topic, params?.search, params?.organizationId, params?.limit, params?.offset]);

  return { communities, total, loading, error };
}

export function useMyCommunities() {
  const [communities, setCommunities] = useState<polymathAPI.Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await polymathAPI.fetchMyCommunities();
        if (isMounted) {
          setCommunities(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load your communities');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return { communities, loading, error };
}

export function useCommunity(slug: string) {
  const [community, setCommunity] = useState<polymathAPI.Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await polymathAPI.fetchCommunity(slug);
        if (isMounted) {
          setCommunity(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load community');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (slug) load();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  return { community, loading, error };
}

export function useCreateCommunity() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (data: Parameters<typeof polymathAPI.createCommunity>[0]) => {
      try {
        setLoading(true);
        setError(null);
        const community = await polymathAPI.createCommunity(data);
        return community;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create community';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { create, loading, error };
}

// ============================================================================
// COMMUNITY MEMBERS
// ============================================================================

export function useCommunityMembers(slug: string) {
  const [members, setMembers] = useState<polymathAPI.CommunityMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await polymathAPI.fetchCommunityMembers(slug);
        if (isMounted) {
          setMembers(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load members');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (slug) load();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  return { members, loading, error };
}

export function useJoinCommunity() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const join = useCallback(async (slug: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await polymathAPI.joinCommunity(slug);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join community';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { join, loading, error };
}

// ============================================================================
// RESOURCES
// ============================================================================

export function useCommunityResources(slug: string) {
  const [resources, setResources] = useState<polymathAPI.Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await polymathAPI.fetchCommunityResources(slug);
      setResources(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) {
      refetch();
    }
  }, [slug, refetch]);

  return { resources, loading, error, refetch };
}

export function useCreateResource(slug: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (data: Parameters<typeof polymathAPI.createResource>[1]) => {
      try {
        setLoading(true);
        setError(null);
        const resource = await polymathAPI.createResource(slug, data);
        return resource;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create resource';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [slug]
  );

  return { create, loading, error };
}

export function useDeleteResource(slug: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const delete_ = useCallback(
    async (resourceId: string) => {
      try {
        setLoading(true);
        setError(null);
        await polymathAPI.deleteResource(slug, resourceId);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete resource';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [slug]
  );

  return { delete: delete_, loading, error };
}

// ============================================================================
// DISCUSSIONS
// ============================================================================

export function useCommunityDiscussions(slug: string) {
  const [discussions, setDiscussions] = useState<polymathAPI.Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await polymathAPI.fetchCommunityDiscussions(slug);
      setDiscussions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load discussions');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) {
      refetch();
    }
  }, [slug, refetch]);

  return { discussions, loading, error, refetch };
}

export function useCreateDiscussion(slug: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (data: Parameters<typeof polymathAPI.createDiscussion>[1]) => {
      try {
        setLoading(true);
        setError(null);
        const discussion = await polymathAPI.createDiscussion(slug, data);
        return discussion;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create discussion';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [slug]
  );

  return { create, loading, error };
}

export function useDiscussion(slug: string, discussionId: string) {
  const [discussion, setDiscussion] = useState<polymathAPI.Discussion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await polymathAPI.fetchDiscussion(slug, discussionId);
        if (isMounted) {
          setDiscussion(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load discussion');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (slug && discussionId) load();

    return () => {
      isMounted = false;
    };
  }, [slug, discussionId]);

  return { discussion, loading, error };
}

export function useDiscussionMessages(slug: string, discussionId: string) {
  const [messages, setMessages] = useState<polymathAPI.DiscussionMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await polymathAPI.fetchDiscussionMessages(slug, discussionId);
      setMessages(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [slug, discussionId]);

  useEffect(() => {
    if (slug && discussionId) {
      refetch();
    }
  }, [slug, discussionId, refetch]);

  return { messages, loading, error, refetch };
}

export function usePostMessage(slug: string, discussionId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const post = useCallback(
    async (content: string) => {
      try {
        setLoading(true);
        setError(null);
        const message = await polymathAPI.postDiscussionMessage(slug, discussionId, content);
        return message;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to post message';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [slug, discussionId]
  );

  return { post, loading, error };
}

// ============================================================================
// MEETINGS
// ============================================================================

export function useCommunityMeetings(slug: string) {
  const [meetings, setMeetings] = useState<polymathAPI.Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await polymathAPI.fetchCommunityMeetings(slug);
      setMeetings(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load meetings');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) {
      refetch();
    }
  }, [slug, refetch]);

  return { meetings, loading, error, refetch };
}

export function useCreateMeeting(slug: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (data: Parameters<typeof polymathAPI.createMeeting>[1]) => {
      try {
        setLoading(true);
        setError(null);
        const meeting = await polymathAPI.createMeeting(slug, data);
        return meeting;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create meeting';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [slug]
  );

  return { create, loading, error };
}

// ============================================================================
// CURATOR STATS
// ============================================================================

export function useCuratorStats(slug: string) {
  const [stats, setStats] = useState<polymathAPI.CuratorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await polymathAPI.fetchCuratorStats(slug);
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) {
      refetch();
    }
  }, [slug, refetch]);

  return { stats, loading, error, refetch };
}

// ============================================================================
// USER PROFILE
// ============================================================================

export function useMyProfile() {
  const [profile, setProfile] = useState<polymathAPI.UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await polymathAPI.fetchMyProfile();
        if (isMounted) {
          setProfile(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load profile');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return { profile, loading, error };
}

export function useUpdateProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(async (data: Partial<polymathAPI.UserProfile>) => {
    try {
      setLoading(true);
      setError(null);
      const profile = await polymathAPI.updateMyProfile(data);
      return profile;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { update, loading, error };
}

// ============================================================================
// MY DASHBOARD
// ============================================================================

export function useMyDashboard() {
  const [data, setData] = useState<polymathAPI.MyDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const dashboardData = await polymathAPI.fetchMyDashboard();
        if (isMounted) {
          setData(dashboardData);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load dashboard');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading, error };
}
