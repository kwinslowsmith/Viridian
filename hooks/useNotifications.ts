'use client';

/**
 * Notifications System
 * Real-time alerts, toasts, and notification management
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// TYPES
// ============================================================================

export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationChannel = 'toast' | 'inapp' | 'email' | 'push';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  channel: NotificationChannel;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  actionLabel?: string;
  expiresAt?: string;
}

export interface NotificationPreferences {
  enableToasts: boolean;
  enableInApp: boolean;
  enableEmail: boolean;
  enablePush: boolean;
  muteUntil?: string;
  categories: {
    messages: boolean;
    mentions: boolean;
    milestones: boolean;
    system: boolean;
  };
}

// ============================================================================
// HOOK: useNotifications
// ============================================================================

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const subscriptionRef = useRef<any>(null);
  const toastQueueRef = useRef<Notification[]>([]);

  // Load user preferences
  useEffect(() => {
    if (!userId) return;

    const loadPreferences = async () => {
      try {
        const { data, error } = await supabase
          .from('NotificationPreferences')
          .select('*')
          .eq('userId', userId)
          .single();

        if (!error && data) {
          setPreferences(data);
        } else {
          setPreferences({
            enableToasts: true,
            enableInApp: true,
            enableEmail: false,
            enablePush: false,
            categories: {
              messages: true,
              mentions: true,
              milestones: true,
              system: true,
            },
          });
        }
      } catch (err) {
        console.error('Failed to load notification preferences:', err);
      }
    };

    loadPreferences();
  }, [userId]);

  // Subscribe to notifications
  useEffect(() => {
    if (!userId) return;

    let isMounted = true;

    const subscribe = async () => {
      subscriptionRef.current = supabase
        .channel(`notifications:${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'Notification',
            filter: `userId=eq.${userId}`,
          },
          (payload: any) => {
            if (isMounted) {
              const notification = payload.new as Notification;
              setNotifications((prev) => [notification, ...prev]);
              toastQueueRef.current.push(notification);
            }
          }
        )
        .subscribe();
    };

    subscribe();

    return () => {
      isMounted = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [userId]);

  const addNotification = useCallback(
    async (
      title: string,
      message: string,
      type: NotificationType = 'info',
      channel: NotificationChannel = 'inapp',
      options?: {
        actionUrl?: string;
        actionLabel?: string;
        expiresIn?: number;
      }
    ) => {
      const notification: Notification = {
        id: `notif-${Date.now()}`,
        title,
        message,
        type,
        channel,
        read: false,
        createdAt: new Date().toISOString(),
        actionUrl: options?.actionUrl,
        actionLabel: options?.actionLabel,
        expiresAt: options?.expiresIn
          ? new Date(Date.now() + options.expiresIn).toISOString()
          : undefined,
      };

      if (userId) {
        try {
          await supabase.from('Notification').insert({
            ...notification,
            userId,
          });
        } catch (err) {
          console.error('Failed to save notification:', err);
        }
      }

      setNotifications((prev) => [notification, ...prev]);
      return notification.id;
    },
    [userId]
  );

  const markAsRead = useCallback(
    async (notificationId: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );

      if (userId) {
        try {
          await supabase
            .from('Notification')
            .update({ read: true })
            .eq('id', notificationId)
            .eq('userId', userId);
        } catch (err) {
          console.error('Failed to mark notification as read:', err);
        }
      }
    },
    [userId]
  );

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    if (userId) {
      try {
        await supabase
          .from('Notification')
          .update({ read: true })
          .eq('userId', userId)
          .eq('read', false);
      } catch (err) {
        console.error('Failed to mark all notifications as read:', err);
      }
    }
  }, [userId]);

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      if (userId) {
        try {
          await supabase
            .from('Notification')
            .delete()
            .eq('id', notificationId)
            .eq('userId', userId);
        } catch (err) {
          console.error('Failed to delete notification:', err);
        }
      }
    },
    [userId]
  );

  const updatePreferences = useCallback(
    async (newPreferences: Partial<NotificationPreferences>) => {
      const updated = { ...preferences, ...newPreferences } as NotificationPreferences;
      setPreferences(updated);

      if (userId) {
        try {
          await supabase
            .from('NotificationPreferences')
            .upsert({
              userId,
              ...updated,
            });
        } catch (err) {
          console.error('Failed to update notification preferences:', err);
        }
      }
    },
    [userId, preferences]
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    preferences,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
    toastQueue: toastQueueRef.current,
  };
}

// ============================================================================
// HOOK: useToastNotifications
// ============================================================================

export interface ToastConfig {
  autoCloseDuration?: number;
  position?: 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function useToastNotifications(config: ToastConfig = {}) {
  const { autoCloseDuration = 3000, position = 'bottom-right' } = config;
  const [toasts, setToasts] = useState<Array<Notification & { dismissedAt?: number }>>([]);

  const showToast = useCallback(
    (
      title: string,
      message: string,
      type: NotificationType = 'info',
      options?: {
        duration?: number;
        actionUrl?: string;
        actionLabel?: string;
      }
    ) => {
      const id = `toast-${Date.now()}`;
      const toast: Notification & { dismissedAt?: number } = {
        id,
        title,
        message,
        type,
        channel: 'toast',
        read: false,
        createdAt: new Date().toISOString(),
        actionUrl: options?.actionUrl,
        actionLabel: options?.actionLabel,
      };

      setToasts((prev) => [...prev, toast]);

      const duration = options?.duration ?? autoCloseDuration;
      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }

      return id;
    },
    [autoCloseDuration]
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    toasts,
    showToast,
    dismissToast,
  };
}

// ============================================================================
// HOOK: usePushNotifications
// ============================================================================

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window;

    setIsSupported(supported);

    if (supported) {
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();

      if (sub) {
        setSubscription(sub);
        setIsSubscribed(true);
      }
    } catch (err) {
      console.error('Failed to check push subscription:', err);
    }
  };

  const subscribe = async () => {
    if (!isSupported || !('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_KEY,
      });

      setSubscription(sub);
      setIsSubscribed(true);

      await savePushSubscription(sub);
    } catch (err) {
      console.error('Failed to subscribe to push notifications:', err);
    }
  };

  const unsubscribe = async () => {
    if (!subscription) return;

    try {
      await subscription.unsubscribe();
      setSubscription(null);
      setIsSubscribed(false);
    } catch (err) {
      console.error('Failed to unsubscribe from push notifications:', err);
    }
  };

  const savePushSubscription = async (sub: PushSubscription) => {
    try {
      await fetch('/api/push-subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      });
    } catch (err) {
      console.error('Failed to save push subscription:', err);
    }
  };

  return {
    isSupported,
    isSubscribed,
    subscription,
    subscribe,
    unsubscribe,
  };
}
