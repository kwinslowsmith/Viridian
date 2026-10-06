'use client';

/**
 * TEMPLATE: Discussion Detail Page with Real-Time Messages
 * Shows real-time message streaming and interaction
 * Usage: Copy this as base for your discussion detail page
 */

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ErrorBoundary } from '@/app/components/polymath/ErrorBoundary';
import { RealtimeMessageList } from '@/app/components/polymath/RealtimeMessageList';
import { RealtimeMemberCount } from '@/app/components/polymath/RealtimeStats';
import { PerformanceMonitor } from '@/app/components/polymath/PerformanceMonitor';

interface DiscussionPageProps {
  params: {
    slug: string;
    id: string;
  };
}

export default function DiscussionDetailPage({ params }: DiscussionPageProps) {
  const { slug, id } = params;
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messageCount, setMessageCount] = useState(0);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    setIsSending(true);
    try {
      const response = await fetch(
        `/api/communities/${slug}/discussions/${id}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: messageText }),
        }
      );

      if (response.ok) {
        setMessageText('');
        setMessageCount((prev) => prev + 1);
      } else {
        alert('Failed to send message');
      }
    } catch (error) {
      alert('Error sending message');
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSendMessage();
    }
  };

  return (
    <ErrorBoundary
      fallback={(error, retry) => (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
          <div
            style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '16px',
            }}
          >
            <h2 style={{ color: '#991b1b', marginTop: 0 }}>Error Loading Discussion</h2>
            <p style={{ color: '#7f1d1d' }}>{error.message}</p>
            <button
              onClick={retry}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      )}
    >
      <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 280px' }}>
        {/* Main Discussion Area */}
        <div>
          {/* Header */}
          <div
            style={{
              backgroundColor: 'white',
              borderBottom: '1px solid #e5e7eb',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <Link href={`/polymath/communities/${slug}`}>
              <button
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  marginBottom: '12px',
                  fontSize: '14px',
                }}
              >
                ← Back to Community
              </button>
            </Link>
            <h1 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '24px' }}>
              Discussion #{id.slice(0, 8)}
            </h1>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
              Real-time synchronized conversation
            </p>
          </div>

          {/* Messages Section */}
          <div style={{ padding: '20px' }}>
            <div
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: 'white',
              }}
            >
              <RealtimeMessageList
                communitySlug={slug}
                discussionId={id}
                onNewMessage={(msg) => {
                  console.log('💬 New message:', msg.content.substring(0, 50));
                  setMessageCount((prev) => prev + 1);
                }}
              />
            </div>

            {/* Message Input */}
            <div style={{ marginTop: '16px' }}>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message... (Ctrl+Enter to send)"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  minHeight: '80px',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  onClick={handleSendMessage}
                  disabled={isSending || !messageText.trim()}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: isSending || !messageText.trim() ? '#d1d5db' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isSending || !messageText.trim() ? 'default' : 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                  }}
                >
                  {isSending ? 'Sending...' : 'Send Message'}
                </button>
                <button
                  onClick={() => setMessageText('')}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Info Box */}
            <div
              style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#1e40af',
              }}
            >
              <strong>💡 Real-Time Tip:</strong> Messages appear instantly for all participants.
              Open this page in another tab to see real-time sync in action!
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div style={{ borderLeft: '1px solid #e5e7eb', backgroundColor: 'white', padding: '20px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>
            Participants
          </h3>
          <RealtimeMemberCount
            communitySlug={slug}
            onMemberJoined={(member) => {
              console.log('👤 Member joined:', member);
            }}
          />

          <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

          <h3 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>
            Conversation Stats
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Messages</span>
              <span style={{ fontWeight: '600', color: '#1f2937' }}>{messageCount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Status</span>
              <span style={{ color: '#10b981', fontWeight: '600' }}>✅ Live</span>
            </div>
          </div>

          <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

          <div
            style={{
              padding: '12px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#166534',
            }}
          >
            ✅ <strong>Connected</strong><br/>
            Real-time sync active<br/>
            Latency: &lt;500ms
          </div>
        </div>

        {/* Performance Monitor */}
        <PerformanceMonitor />
      </div>
    </ErrorBoundary>
  );
}
