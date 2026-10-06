'use client';

/**
 * Notification Center & Toast Components
 * Real-time user notifications, alerts, and message center
 */

import { Notification, useNotifications, useToastNotifications } from '@/hooks/useNotifications';
import { useState } from 'react';

const notificationTypeColors = {
  info: { bg: '#dbeafe', text: '#1e40af', icon: 'ℹ️' },
  success: { bg: '#d1fae5', text: '#065f46', icon: '✅' },
  warning: { bg: '#fef3c7', text: '#92400e', icon: '⚠️' },
  error: { bg: '#fee2e2', text: '#991b1b', icon: '❌' },
};

// ============================================================================
// TOAST CONTAINER
// ============================================================================

export function ToastContainer({ toasts, onDismiss }: { toasts: Notification[]; onDismiss: (id: string) => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 50000,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '400px',
      }}
    >
      {toasts.map((toast) => {
        const colors = notificationTypeColors[toast.type];
        return (
          <div
            key={toast.id}
            style={{
              backgroundColor: colors.bg,
              border: `1px solid ${colors.text}`,
              color: colors.text,
              borderRadius: '8px',
              padding: '12px 16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'start',
              gap: '12px',
              animation: 'slideIn 0.3s ease-out',
            }}
          >
            <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
              <span style={{ fontSize: '18px', flexShrink: 0 }}>{colors.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>{toast.title}</div>
                <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '2px' }}>
                  {toast.message}
                </div>
                {toast.actionUrl && toast.actionLabel && (
                  <a
                    href={toast.actionUrl}
                    style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      marginTop: '4px',
                      display: 'inline-block',
                      opacity: 0.9,
                    }}
                  >
                    {toast.actionLabel} →
                  </a>
                )}
              </div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                padding: 0,
                color: colors.text,
                opacity: 0.6,
              }}
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// NOTIFICATION BELL
// ============================================================================

export function NotificationBell({ userId }: { userId?: string }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(userId);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '24px',
          padding: '8px',
        }}
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '0',
              right: '0',
              backgroundColor: '#ef4444',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: '700',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            width: '360px',
            maxHeight: '500px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => {
                  markAllAsRead();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#3b82f6',
                  fontWeight: '600',
                }}
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <div
              style={{
                padding: '32px 16px',
                textAlign: 'center',
                color: '#9ca3af',
                fontSize: '13px',
              }}
            >
              No notifications yet
            </div>
          ) : (
            <div style={{ overflow: 'auto', flex: 1 }}>
              {notifications.map((notification) => {
                const colors = notificationTypeColors[notification.type];
                return (
                  <div
                    key={notification.id}
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification.id);
                      }
                    }}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer',
                      backgroundColor: notification.read ? 'white' : '#f9fafb',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = notification.read
                        ? 'white'
                        : '#f9fafb';
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        marginBottom: '4px',
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>{colors.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: notification.read ? '400' : '600',
                            color: '#1f2937',
                          }}
                        >
                          {notification.title}
                        </div>
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            marginTop: '2px',
                          }}
                        >
                          {notification.message}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#9ca3af',
                        marginLeft: '24px',
                      }}
                    >
                      {new Date(notification.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// NOTIFICATION CENTER (Full Page)
// ============================================================================

export function NotificationCenterPage({ userId }: { userId?: string }) {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
    preferences,
  } = useNotifications(userId);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>🔔 Notification Center</h1>
          <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>
            Manage your notifications and preferences
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
          {/* Notifications */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            {/* Filter Tabs */}
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                gap: '16px',
              }}
            >
              {(['all', 'unread'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: filter === f ? '2px solid #3b82f6' : 'none',
                    color: filter === f ? '#3b82f6' : '#6b7280',
                    cursor: 'pointer',
                    fontWeight: filter === f ? '600' : '400',
                    padding: '0 0 8px 0',
                    textTransform: 'capitalize',
                  }}
                >
                  {f === 'all' ? `All (${notifications.length})` : `Unread (${notifications.filter((n) => !n.read).length})`}
                </button>
              ))}
            </div>

            {/* Mark all as read button */}
            {notifications.some((n) => !n.read) && (
              <div style={{ padding: '8px 16px', borderBottom: '1px solid #f3f4f6' }}>
                <button
                  onClick={() => markAllAsRead()}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: '#3b82f6',
                    fontWeight: '600',
                  }}
                >
                  Mark all as read
                </button>
              </div>
            )}

            {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
              <div
                style={{
                  padding: '48px 16px',
                  textAlign: 'center',
                  color: '#9ca3af',
                }}
              >
                No {filter === 'unread' ? 'unread' : ''} notifications
              </div>
            ) : (
              <div>
                {filteredNotifications.map((notification) => {
                  const colors = notificationTypeColors[notification.type];
                  return (
                    <div
                      key={notification.id}
                      style={{
                        padding: '16px',
                        borderBottom: '1px solid #f3f4f6',
                        backgroundColor: notification.read ? 'white' : '#f9fafb',
                        display: 'flex',
                        gap: '12px',
                      }}
                    >
                      <div style={{ fontSize: '20px', flexShrink: 0 }}>
                        {colors.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: '14px',
                            fontWeight: notification.read ? '400' : '600',
                            color: '#1f2937',
                            marginBottom: '4px',
                          }}
                        >
                          {notification.title}
                        </div>
                        <div
                          style={{
                            fontSize: '13px',
                            color: '#6b7280',
                            marginBottom: '8px',
                          }}
                        >
                          {notification.message}
                        </div>
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#9ca3af',
                            display: 'flex',
                            gap: '8px',
                            alignItems: 'center',
                          }}
                        >
                          {new Date(notification.createdAt).toLocaleString()}
                          {!notification.read && (
                            <>
                              <span>•</span>
                              <button
                                onClick={() => markAsRead(notification.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: '#3b82f6',
                                  fontWeight: '500',
                                }}
                              >
                                Mark as read
                              </button>
                            </>
                          )}
                          <span>•</span>
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#ef4444',
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Preferences Sidebar */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '16px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>
              Preferences
            </h3>

            {preferences && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                {[
                  { key: 'enableToasts', label: 'Toast Notifications' },
                  { key: 'enableInApp', label: 'In-App Alerts' },
                  { key: 'enableEmail', label: 'Email Notifications' },
                  { key: 'enablePush', label: 'Push Notifications' },
                ].map(({ key, label }) => (
                  <label
                    key={key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(preferences[key as keyof typeof preferences])}
                      onChange={(e) => {
                        updatePreferences({
                          [key]: e.target.checked,
                        });
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    {label}
                  </label>
                ))}
              </div>
            )}

            <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

            <h4 style={{ marginTop: 0, marginBottom: '8px', fontSize: '12px', fontWeight: '600' }}>
              Categories
            </h4>
            {preferences?.categories && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                {Object.entries(preferences.categories).map(([category, enabled]) => (
                  <label
                    key={category}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => {
                        updatePreferences({
                          categories: {
                            ...preferences.categories,
                            [category]: e.target.checked,
                          },
                        });
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
