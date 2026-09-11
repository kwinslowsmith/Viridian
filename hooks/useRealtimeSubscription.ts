/**
 * Polymath Real-Time Subscriptions
 * Supabase real-time channel subscriptions for live data sync
 * Handles: discussions, messages, resources, meetings, members
 */

import { useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseClient: any = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
}

// ============================================================================
// RESOURCES REAL-TIME SYNC
// ============================================================================

/**
 * Subscribe to resource changes in a community
 * Calls the callback whenever a resource is created, updated, or deleted
 */
export function useResourcesRealtime(
  communityId: string,
  onInsert?: (resource: any) => void,
  onUpdate?: (resource: any) => void,
  onDelete?: (resourceId: string) => void
) {
  const supabase = useRef(getSupabaseClient());
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!communityId) return;

    const channel = supabase.current
      .channel(`resources-${communityId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Resource',
          filter: `communityId=eq.${communityId}`,
        },
        (payload: any) => {
          onInsert?.(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'Resource',
          filter: `communityId=eq.${communityId}`,
        },
        (payload: any) => {
          onUpdate?.(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'Resource',
          filter: `communityId=eq.${communityId}`,
        },
        (payload: any) => {
          onDelete?.(payload.old.id);
        }
      )
      .subscribe();

    subscriptionRef.current = channel;

    return () => {
      if (subscriptionRef.current) {
        supabase.current.removeChannel(subscriptionRef.current);
      }
    };
  }, [communityId, onInsert, onUpdate, onDelete]);
}

// ============================================================================
// DISCUSSION MESSAGES REAL-TIME SYNC
// ============================================================================

/**
 * Subscribe to discussion message changes
 * Calls the callback whenever a message is created, updated, or deleted
 */
export function useDiscussionMessagesRealtime(
  discussionId: string,
  onInsert?: (message: any) => void,
  onUpdate?: (message: any) => void,
  onDelete?: (messageId: string) => void
) {
  const supabase = useRef(getSupabaseClient());
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!discussionId) return;

    const channel = supabase.current
      .channel(`messages-${discussionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'DiscussionMessage',
          filter: `discussionId=eq.${discussionId}`,
        },
        (payload: any) => {
          onInsert?.(payload.new);
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
          onUpdate?.(payload.new);
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
          onDelete?.(payload.old.id);
        }
      )
      .subscribe();

    subscriptionRef.current = channel;

    return () => {
      if (subscriptionRef.current) {
        supabase.current.removeChannel(subscriptionRef.current);
      }
    };
  }, [discussionId, onInsert, onUpdate, onDelete]);
}

// ============================================================================
// DISCUSSIONS REAL-TIME SYNC
// ============================================================================

/**
 * Subscribe to discussion changes in a community
 * Calls the callback whenever a discussion is created, updated, or deleted
 */
export function useDiscussionsRealtime(
  communityId: string,
  onInsert?: (discussion: any) => void,
  onUpdate?: (discussion: any) => void,
  onDelete?: (discussionId: string) => void
) {
  const supabase = useRef(getSupabaseClient());
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!communityId) return;

    const channel = supabase.current
      .channel(`discussions-${communityId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Discussion',
          filter: `communityId=eq.${communityId}`,
        },
        (payload: any) => {
          onInsert?.(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'Discussion',
          filter: `communityId=eq.${communityId}`,
        },
        (payload: any) => {
          onUpdate?.(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'Discussion',
          filter: `communityId=eq.${communityId}`,
        },
        (payload: any) => {
          onDelete?.(payload.old.id);
        }
      )
      .subscribe();

    subscriptionRef.current = channel;

    return () => {
      if (subscriptionRef.current) {
        supabase.current.removeChannel(subscriptionRef.current);
      }
    };
  }, [communityId, onInsert, onUpdate, onDelete]);
}

// ============================================================================
// COMMUNITY MEMBERS REAL-TIME SYNC
// ============================================================================

/**
 * Subscribe to community member changes
 * Calls the callback whenever someone joins, leaves, or updates their role
 */
export function useCommunityMembersRealtime(
  communityId: string,
  onInsert?: (member: any) => void,
  onUpdate?: (member: any) => void,
  onDelete?: (memberId: string) => void
) {
  const supabase = useRef(getSupabaseClient());
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!communityId) return;

    const channel = supabase.current
      .channel(`members-${communityId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'LearningCommunityMember',
          filter: `communityId=eq.${communityId}`,
        },
        (payload: any) => {
          onInsert?.(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'LearningCommunityMember',
          filter: `communityId=eq.${communityId}`,
        },
        (payload: any) => {
          onUpdate?.(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'LearningCommunityMember',
          filter: `communityId=eq.${communityId}`,
        },
        (payload: any) => {
          onDelete?.(payload.old.id);
        }
      )
      .subscribe();

    subscriptionRef.current = channel;

    return () => {
      if (subscriptionRef.current) {
        supabase.current.removeChannel(subscriptionRef.current);
      }
    };
  }, [communityId, onInsert, onUpdate, onDelete]);
}

// ============================================================================
// MEETINGS REAL-TIME SYNC
// ============================================================================

/**
 * Subscribe to meeting changes in a community
 * Calls the callback whenever a meeting is created, updated, or deleted
 */
export function useMeetingsRealtime(
  communityId: string,
  onInsert?: (meeting: any) => void,
  onUpdate?: (meeting: any) => void,
  onDelete?: (meetingId: string) => void
) {
  const supabase = useRef(getSupabaseClient());
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!communityId) return;

    const channel = supabase.current
      .channel(`meetings-${communityId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Meeting',
          filter: `communityId=eq.${communityId}`,
        },
        (payload: any) => {
          onInsert?.(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'Meeting',
          filter: `communityId=eq.${communityId}`,
        },
        (payload: any) => {
          onUpdate?.(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'Meeting',
          filter: `communityId=eq.${communityId}`,
        },
        (payload: any) => {
          onDelete?.(payload.old.id);
        }
      )
      .subscribe();

    subscriptionRef.current = channel;

    return () => {
      if (subscriptionRef.current) {
        supabase.current.removeChannel(subscriptionRef.current);
      }
    };
  }, [communityId, onInsert, onUpdate, onDelete]);
}

// ============================================================================
// PRESENCE TRACKING
// ============================================================================

/**
 * Track user presence in a community (who's online)
 * Useful for showing "X members online" indicators
 */
export function usePresenceTracking(
  communityId: string,
  userId: string,
  onPresenceChange?: (onlineUsers: any[]) => void
) {
  const supabase = useRef(getSupabaseClient());
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!communityId || !userId) return;

    const channel = supabase.current.channel(`presence-${communityId}`);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const onlineUsers = Object.values(state).flat();
        onPresenceChange?.(onlineUsers);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }: any) => {
        console.log('User joined:', newPresences);
        const state = channel.presenceState();
        const onlineUsers = Object.values(state).flat();
        onPresenceChange?.(onlineUsers);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }: any) => {
        console.log('User left:', leftPresences);
        const state = channel.presenceState();
        const onlineUsers = Object.values(state).flat();
        onPresenceChange?.(onlineUsers);
      })
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          // Announce this user's presence
          await channel.track({
            user_id: userId,
            online_at: new Date().toISOString(),
          });
        }
      });

    subscriptionRef.current = channel;

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [communityId, userId, onPresenceChange]);
}
