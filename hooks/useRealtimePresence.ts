'use client';

/**
 * T3 Advanced Features: Real-Time Presence & Typing Indicators
 * Track who's online, who's typing, read receipts
 * Date: Oct 6, 2026
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// PRESENCE TRACKING
// ============================================================================

export interface UserPresence {
  userId: string;
  username: string;
  status: 'online' | 'typing' | 'away' | 'offline';
  lastSeen: string;
  avatar?: string;
}

export function useRealtimePresence(communitySlug: string, discussionId: string) {
  const [presence, setPresence] = useState<UserPresence[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const channelRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!communitySlug || !discussionId) return;

    let isMounted = true;

    const setupPresence = async () => {
      // Subscribe to presence channel
      const channel = supabase.channel(`presence:${discussionId}`);

      channelRef.current = channel
        .on('presence', { event: 'sync' }, () => {
          if (isMounted) {
            const state = channel.presenceState();
            const users = Object.values(state)
              .flat()
              .map((user: any) => ({
                userId: user.user_id,
                username: user.user_name,
                status: user.status,
                lastSeen: new Date().toISOString(),
                avatar: user.avatar,
              }));
            setPresence(users as UserPresence[]);
          }
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          if (isMounted) {
            const newUsers = newPresences.map((user: any) => ({
              userId: user.user_id,
              username: user.user_name,
              status: 'online' as const,
              lastSeen: new Date().toISOString(),
            }));
            setPresence((prev) => [...prev, ...newUsers]);
            console.log('👤 Users joined:', newUsers);
          }
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          if (isMounted) {
            const leftUserIds = leftPresences.map((u: any) => u.user_id);
            setPresence((prev) => prev.filter((p) => !leftUserIds.includes(p.userId)));
            console.log('👋 Users left:', leftUserIds);
          }
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            // Track that this user is online
            await channel.track({
              user_id: 'current-user-id', // Would get from session
              user_name: 'Current User',
              status: 'online',
              timestamp: new Date().toISOString(),
            });
          }
        });
    };

    setupPresence();

    return () => {
      isMounted = false;
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [communitySlug, discussionId]);

  // Typing indicator
  const startTyping = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.track({
        status: 'typing',
        timestamp: new Date().toISOString(),
      });

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        if (channelRef.current) {
          channelRef.current.track({
            status: 'online',
            timestamp: new Date().toISOString(),
          });
        }
      }, 3000);
    }
  }, []);

  const stopTyping = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.track({
        status: 'online',
        timestamp: new Date().toISOString(),
      });
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, []);

  return {
    presence,
    typingUsers: presence.filter((p) => p.status === 'typing').map((p) => p.username),
    onlineCount: presence.filter((p) => p.status === 'online').length,
    startTyping,
    stopTyping,
  };
}

// ============================================================================
// READ RECEIPTS
// ============================================================================

export interface ReadReceipt {
  userId: string;
  messageId: string;
  readAt: string;
}

export function useRealtimeReadReceipts(discussionId: string) {
  const [readReceipts, setReadReceipts] = useState<ReadReceipt[]>([]);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!discussionId) return;

    let isMounted = true;

    const subscribe = async () => {
      try {
        subscriptionRef.current = supabase
          .channel(`read-receipts:${discussionId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'ReadReceipt',
              filter: `discussionId=eq.${discussionId}`,
            },
            (payload: any) => {
              if (isMounted) {
                setReadReceipts((prev) => [...prev, payload.new]);
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.error('Failed to subscribe to read receipts:', err);
      }
    };

    subscribe();

    return () => {
      isMounted = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [discussionId]);

  const markAsRead = useCallback(
    async (messageId: string) => {
      try {
        await fetch('/api/read-receipts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messageId,
            discussionId,
          }),
        });
      } catch (err) {
        console.error('Failed to mark message as read:', err);
      }
    },
    [discussionId]
  );

  return {
    readReceipts,
    getReadUsers: (messageId: string) =>
      readReceipts.filter((r) => r.messageId === messageId).map((r) => r.userId),
    markAsRead,
  };
}

// ============================================================================
// PRESENCE INDICATOR COMPONENT
// ============================================================================

export function PresenceIndicator({ communitySlug, discussionId }: { communitySlug: string; discussionId: string }) {
  const { onlineCount, typingUsers } = useRealtimePresence(communitySlug, discussionId);

  if (onlineCount === 0) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '12px',
        color: '#6b7280',
      }}
    >
      <div
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#10b981',
          animation: 'pulse 2s infinite',
        }}
      />
      {onlineCount} {onlineCount === 1 ? 'person' : 'people'} online

      {typingUsers.length > 0 && (
        <>
          <span>•</span>
          <span>
            {typingUsers.length} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </span>
        </>
      )}
    </div>
  );
}
