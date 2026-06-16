'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { colors } from '@/app/modules/improv/design/colors';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string };
}

interface Announcement {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  createdBy: { id: string; name: string };
}

interface OrgNewsfeedProps {
  orgSlug: string;
  userRole?: string;
  onCreateClick?: () => void;
}

export function OrgNewsfeed({ orgSlug, userRole, onCreateClick }: OrgNewsfeedProps) {
  const { data: session } = useSession();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readAnnouncementIds, setReadAnnouncementIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAnnouncements();
  }, [orgSlug, session?.user?.id]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`📢 [OrgNewsfeed] Fetching announcements from: /api/organizations/${orgSlug}/announcements-conversations`);

      const res = await fetch(`/api/organizations/${orgSlug}/announcements-conversations`);
      console.log('📢 [OrgNewsfeed] Response status:', res.status);

      if (res.ok) {
        const data = await res.json();
        console.log('📢 [OrgNewsfeed] Got announcements:', {
          count: data.announcements?.length || 0,
          announcements: data.announcements?.map((a: Announcement) => ({
            id: a.id,
            title: a.title,
            createdAt: a.createdAt,
            messageCount: a.messages?.length || 0,
          }))
        });
        if (data.debug) {
          console.log('📢 [OrgNewsfeed] DEBUG INFO:', data.debug);
        }
        setAnnouncements(data.announcements || []);
      } else {
        const errorData = await res.json();
        setError(`Error: ${errorData.error || 'Failed to load announcements'}`);
        console.error('📢 [OrgNewsfeed] API error:', errorData);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(`Error: ${errorMsg}`);
      console.error('📢 [OrgNewsfeed] Failed to fetch announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (announcementId: string) => {
    try {
      const newReadIds = new Set(readAnnouncementIds);
      newReadIds.add(announcementId);
      setReadAnnouncementIds(newReadIds);

      // Remove from display after marking
      setAnnouncements(announcements.filter(a => a.id !== announcementId));
    } catch (err) {
      console.error('Failed to mark announcement as read:', err);
    }
  };

  if (loading) {
    return <div style={{ color: colors.text2 }}>Loading announcements...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '1rem', backgroundColor: colors.approaching.bg, borderRadius: '6px', color: colors.approaching.text }}>
        <strong>Newsfeed Error:</strong> {error}
      </div>
    );
  }

  return (
    <div>
      <style>{`
        @keyframes tickerScroll {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          95% {
            opacity: 1;
          }
          100% {
            transform: translateX(-100%);
            opacity: 0;
          }
        }

        .ticker-container {
          overflow: hidden;
          background: linear-gradient(90deg, ${colors.surface} 0%, ${colors.surface} 95%, transparent 100%);
          border-radius: 6px;
          position: relative;
        }

        .ticker-content {
          display: flex;
          gap: 2rem;
          padding: 0.75rem 0;
          animation: tickerScroll ${Math.max(announcements.length * 4, 8)}s linear infinite;
        }

        .ticker-item {
          flex-shrink: 0;
          display: inline-flex;
          gap: 1rem;
          align-items: center;
          padding: 0.75rem 1.5rem;
          background: ${colors.bg};
          border: 1px solid ${colors.border};
          border-left: 4px solid ${colors.teal.accent};
          border-radius: 4px;
          min-width: max-content;
          white-space: nowrap;
        }
      `}</style>

      <h2 style={{ color: colors.text, margin: '0 0 1rem 0', fontSize: '18px', fontWeight: '600' }}>
        📢 Latest News
      </h2>

      {announcements.length === 0 ? (
        <div style={{ color: colors.text2, fontSize: '14px', padding: '2rem 1rem', textAlign: 'center' }}>
          No announcements yet
        </div>
      ) : (
        <div className="ticker-container">
          <div className="ticker-content">
            {/* Duplicate announcements for seamless loop */}
            {[...announcements, ...announcements].map((announcement, idx) => {
              const firstMessage = announcement.messages?.[0];
              const publishDate = new Date(announcement.createdAt);
              const isFirstSet = idx < announcements.length;

              return (
                <div
                  key={`${announcement.id}-${isFirstSet ? 0 : 1}`}
                  className="ticker-item"
                  onMouseEnter={(e) => {
                    const container = (e.currentTarget as HTMLElement).closest('.ticker-container') as HTMLElement;
                    container.style.animationPlayState = 'paused';
                  }}
                  onMouseLeave={(e) => {
                    const container = (e.currentTarget as HTMLElement).closest('.ticker-container') as HTMLElement;
                    container.style.animationPlayState = 'running';
                  }}
                >
                  <div style={{ minWidth: '300px' }}>
                    <div style={{ color: colors.text, fontSize: '13px', fontWeight: '600', marginBottom: '0.25rem' }}>
                      {announcement.title}
                    </div>
                    {firstMessage && (
                      <div style={{ color: colors.text2, fontSize: '12px', marginBottom: '0.25rem' }}>
                        {firstMessage.content.substring(0, 80)}
                        {firstMessage.content.length > 80 ? '...' : ''}
                      </div>
                    )}
                    <div style={{ fontSize: '11px', color: colors.text2 }}>
                      {firstMessage?.sender?.name || announcement.createdBy.name} • {publishDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <button
                    style={{
                      padding: '4px 8px',
                      backgroundColor: colors.teal.accent,
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: '500',
                      whiteSpace: 'nowrap',
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.opacity = '0.8';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.opacity = '1';
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(announcement.id);
                    }}
                  >
                    ✓ Mark Read
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
