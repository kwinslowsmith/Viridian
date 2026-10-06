/**
 * T3 Priority 2: Real-Time Subscriptions with Supabase
 * Real-time updates for discussions, messages, members, and community activity
 * Date: Oct 6, 2026
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for browser (public key only)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// DISCUSSION MESSAGE SUBSCRIPTIONS
// ============================================================================

export interface DiscussionMessage {
  id: string;
  discussionId: string;
  content: string;
  authorId: string;
  author?: { id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export function useRealtimeDiscussionMessages(
  communitySlug: string,
  discussionId: string,
  onNewMessage?: (message: DiscussionMessage) => void
) {
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!communitySlug || !discussionId) return;

    let isMounted = true;

    const subscribe = async () => {
      try {
        // Initial fetch
        const res = await fetch(
          `/api/communities/${communitySlug}/discussions/${discussionId}/messages`
        );
        if (!res.ok) throw new Error('Failed to fetch messages');
        const data = await res.json();

        if (isMounted) {
          setMessages(data);
          setError(null);
        }

        // Subscribe to real-time updates
        subscriptionRef.current = supabase
          .channel(`discussion:${discussionId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'DiscussionMessage',
              filter: `discussionId=eq.${discussionId}`,
            },
            (payload: any) => {
              if (isMounted) {
                const newMessage = payload.new as DiscussionMessage;
                setMessages((prev) => [...prev, newMessage]);
                onNewMessage?.(newMessage);
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'DiscussionMessage',
              filter: `discussionId=eq.${discussionId}`,
            },
            (payload: any) => {
              if (isMounted) {
                const updatedMessage = payload.new as DiscussionMessage;
                setMessages((prev) =>
                  prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m))
                );
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'DiscussionMessage',
              filter: `discussionId=eq.${discussionId}`,
            },
            (payload: any) => {
              if (isMounted) {
                const deletedId = payload.old.id;
                setMessages((prev) => prev.filter((m) => m.id !== deletedId));
              }
            }
          )
          .subscribe();

        if (isMounted) {
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to subscribe to messages');
          setLoading(false);
        }
      }
    };

    subscribe();

    return () => {
      isMounted = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [communitySlug, discussionId, onNewMessage]);

  return { messages, loading, error };
}

// ============================================================================
// COMMUNITY DISCUSSIONS SUBSCRIPTIONS
// ============================================================================

export interface Discussion {
  id: string;
  communityId: string;
  title: string;
  content: string;
  authorId: string;
  author?: { id: string; name: string; email: string };
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export function useRealtimeDiscussions(
  communitySlug: string,
  onNewDiscussion?: (discussion: Discussion) => void
) {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!communitySlug) return;

    let isMounted = true;

    const subscribe = async () => {
      try {
        // Initial fetch
        const res = await fetch(`/api/communities/${communitySlug}/discussions`);
        if (!res.ok) throw new Error('Failed to fetch discussions');
        const data = await res.json();

        if (isMounted) {
          setDiscussions(data);
          setError(null);
        }

        // Subscribe to real-time updates
        subscriptionRef.current = supabase
          .channel(`discussions:${communitySlug}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'Discussion',
            },
            (payload: any) => {
              if (isMounted) {
                const newDiscussion = payload.new as Discussion;
                setDiscussions((prev) => [newDiscussion, ...prev]);
                onNewDiscussion?.(newDiscussion);
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'Discussion',
            },
            (payload: any) => {
              if (isMounted) {
                const updatedDiscussion = payload.new as Discussion;
                setDiscussions((prev) =>
                  prev.map((d) => (d.id === updatedDiscussion.id ? updatedDiscussion : d))
                );
              }
            }
          )
          .subscribe();

        if (isMounted) {
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to subscribe to discussions');
          setLoading(false);
        }
      }
    };

    subscribe();

    return () => {
      isMounted = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [communitySlug, onNewDiscussion]);

  return { discussions, loading, error };
}

// ============================================================================
// COMMUNITY MEMBERS SUBSCRIPTIONS
// ============================================================================

export interface CommunityMember {
  id: string;
  userId: string;
  communityId: string;
  role: 'member' | 'moderator' | 'curator';
  joinedAt: string;
  user?: { id: string; name: string; email: string };
}

export function useRealtimeCommunityMembers(
  communitySlug: string,
  onMemberJoined?: (member: CommunityMember) => void,
  onMemberLeft?: (memberId: string) => void
) {
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!communitySlug) return;

    let isMounted = true;

    const subscribe = async () => {
      try {
        // Initial fetch
        const res = await fetch(`/api/communities/${communitySlug}/members`);
        if (!res.ok) throw new Error('Failed to fetch members');
        const data = await res.json();

        if (isMounted) {
          setMembers(data.members || []);
          setMemberCount(data.members?.length || 0);
          setError(null);
        }

        // Subscribe to member join/leave events
        subscriptionRef.current = supabase
          .channel(`members:${communitySlug}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'CommunityMember',
            },
            (payload: any) => {
              if (isMounted) {
                const newMember = payload.new as CommunityMember;
                setMembers((prev) => [...prev, newMember]);
                setMemberCount((prev) => prev + 1);
                onMemberJoined?.(newMember);
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'CommunityMember',
            },
            (payload: any) => {
              if (isMounted) {
                const memberId = payload.old.id;
                setMembers((prev) => prev.filter((m) => m.id !== memberId));
                setMemberCount((prev) => Math.max(0, prev - 1));
                onMemberLeft?.(memberId);
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'CommunityMember',
            },
            (payload: any) => {
              if (isMounted) {
                const updatedMember = payload.new as CommunityMember;
                setMembers((prev) =>
                  prev.map((m) => (m.id === updatedMember.id ? updatedMember : m))
                );
              }
            }
          )
          .subscribe();

        if (isMounted) {
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to subscribe to members');
          setLoading(false);
        }
      }
    };

    subscribe();

    return () => {
      isMounted = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [communitySlug, onMemberJoined, onMemberLeft]);

  return { members, memberCount, loading, error };
}

// ============================================================================
// COMMUNITY STATS SUBSCRIPTIONS
// ============================================================================

export interface CommunityStats {
  memberCount: number;
  discussionCount: number;
  messageCount: number;
  meetingCount: number;
  resourceCount: number;
  lastActivityAt?: string;
}

export function useRealtimeCommunityStats(communitySlug: string) {
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!communitySlug) return;

    let isMounted = true;

    const subscribe = async () => {
      try {
        // Initial fetch
        const res = await fetch(`/api/communities/${communitySlug}/stats`);
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();

        if (isMounted) {
          setStats(data);
          setError(null);
        }

        // Subscribe to stats updates (discussions, messages, members, meetings)
        subscriptionRef.current = supabase
          .channel(`stats:${communitySlug}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'Discussion',
            },
            (payload: any) => {
              if (isMounted) {
                setStats((prev) =>
                  prev ? { ...prev, discussionCount: prev.discussionCount + 1 } : null
                );
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'DiscussionMessage',
            },
            (payload: any) => {
              if (isMounted) {
                setStats((prev) =>
                  prev ? { ...prev, messageCount: prev.messageCount + 1 } : null
                );
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'CommunityMember',
            },
            (payload: any) => {
              if (isMounted) {
                setStats((prev) =>
                  prev ? { ...prev, memberCount: prev.memberCount + 1 } : null
                );
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'Meeting',
            },
            (payload: any) => {
              if (isMounted) {
                setStats((prev) =>
                  prev ? { ...prev, meetingCount: prev.meetingCount + 1 } : null
                );
              }
            }
          )
          .subscribe();

        if (isMounted) {
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to subscribe to stats');
          setLoading(false);
        }
      }
    };

    subscribe();

    return () => {
      isMounted = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [communitySlug]);

  return { stats, loading, error };
}

// ============================================================================
// MEETING SUBSCRIPTIONS
// ============================================================================

export interface Meeting {
  id: string;
  communityId: string;
  title: string;
  date: string;
  time: string;
  zoomUrl: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
}

export function useRealtimeMeetings(
  communitySlug: string,
  onNewMeeting?: (meeting: Meeting) => void
) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!communitySlug) return;

    let isMounted = true;

    const subscribe = async () => {
      try {
        // Initial fetch
        const res = await fetch(`/api/communities/${communitySlug}/meetings`);
        if (!res.ok) throw new Error('Failed to fetch meetings');
        const data = await res.json();

        if (isMounted) {
          setMeetings(data);
          setError(null);
        }

        // Subscribe to meeting updates
        subscriptionRef.current = supabase
          .channel(`meetings:${communitySlug}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'Meeting',
            },
            (payload: any) => {
              if (isMounted) {
                const newMeeting = payload.new as Meeting;
                setMeetings((prev) => [...prev, newMeeting].sort(
                  (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
                ));
                onNewMeeting?.(newMeeting);
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'Meeting',
            },
            (payload: any) => {
              if (isMounted) {
                const updatedMeeting = payload.new as Meeting;
                setMeetings((prev) =>
                  prev.map((m) => (m.id === updatedMeeting.id ? updatedMeeting : m))
                );
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'Meeting',
            },
            (payload: any) => {
              if (isMounted) {
                const deletedId = payload.old.id;
                setMeetings((prev) => prev.filter((m) => m.id !== deletedId));
              }
            }
          )
          .subscribe();

        if (isMounted) {
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to subscribe to meetings');
          setLoading(false);
        }
      }
    };

    subscribe();

    return () => {
      isMounted = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [communitySlug, onNewMeeting]);

  return { meetings, loading, error };
}

// ============================================================================
// UTILITY: CLEANUP ALL SUBSCRIPTIONS
// ============================================================================

export function useCleanupSubscriptions() {
  const subscriptionsRef = useRef<any[]>([]);

  const addSubscription = useCallback((subscription: any) => {
    subscriptionsRef.current.push(subscription);
  }, []);

  const cleanup = useCallback(() => {
    subscriptionsRef.current.forEach((sub) => {
      if (sub) {
        sub.unsubscribe();
      }
    });
    subscriptionsRef.current = [];
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return { addSubscription, cleanup };
}
