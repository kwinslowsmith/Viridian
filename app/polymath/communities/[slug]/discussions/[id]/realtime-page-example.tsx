'use client';

/**
 * Example: Real-Time Discussion Page
 * Shows how to integrate T3 real-time components into a page
 *
 * Usage: Replace existing page.tsx with this pattern
 */

import { useState } from 'react';
import { ErrorBoundary } from '@/app/components/polymath/ErrorBoundary';
import { RealtimeMessageList } from '@/app/components/polymath/RealtimeMessageList';
import { RealtimeDiscussionsList } from '@/app/components/polymath/RealtimeDiscussionsList';
import { RealtimeMemberCount, RealtimeStatsCard } from '@/app/components/polymath/RealtimeStats';

interface DiscussionPageProps {
  params: {
    slug: string;
    id: string;
  };
}

export default function RealtimeDiscussionPage({ params }: DiscussionPageProps) {
  const { slug: communitySlug, id: discussionId } = params;
  const [selectedDiscussionId, setSelectedDiscussionId] = useState(discussionId);

  return (
    <ErrorBoundary
      fallback={(error, retry) => (
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <p>{error.message}</p>
          <button onClick={retry}>Try again</button>
        </div>
      )}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr 300px', gap: '20px', padding: '20px' }}>
        {/* Sidebar: Discussions List */}
        <div style={{ borderRight: '1px solid #e5e7eb' }}>
          <h3 style={{ marginTop: 0 }}>Discussions</h3>
          <RealtimeDiscussionsList
            communitySlug={communitySlug}
            onDiscussionSelected={setSelectedDiscussionId}
          />
        </div>

        {/* Main: Message List */}
        <div>
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ marginTop: 0 }}>Discussion Messages</h2>
            <p style={{ color: '#666', fontSize: '14px' }}>
              ✨ Real-time sync enabled - messages appear instantly
            </p>
          </div>

          <div
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: '#fafafa',
            }}
          >
            <RealtimeMessageList
              communitySlug={communitySlug}
              discussionId={selectedDiscussionId || discussionId}
              onNewMessage={(msg) => {
                console.log('New message arrived:', msg);
              }}
            />
          </div>

          {/* Message Input (example) */}
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Type your message..."
              style={{
                flex: 1,
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
            <button
              style={{
                padding: '12px 24px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Send
            </button>
          </div>
        </div>

        {/* Right Sidebar: Stats */}
        <div style={{ borderLeft: '1px solid #e5e7eb', paddingLeft: '20px' }}>
          <h3 style={{ marginTop: 0 }}>Community</h3>

          <div style={{ marginBottom: '20px' }}>
            <RealtimeMemberCount
              communitySlug={communitySlug}
              onMemberJoined={(member) => {
                console.log('Member joined:', member);
              }}
              onMemberLeft={(memberId) => {
                console.log('Member left:', memberId);
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
              Community Stats
            </h4>
            <RealtimeStatsCard communitySlug={communitySlug} />
          </div>

          {/* Additional info panel */}
          <div
            style={{
              padding: '12px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#1e40af',
            }}
          >
            <strong>Real-Time Status: ✅ Connected</strong>
            <p style={{ margin: '4px 0 0 0' }}>
              Messages and members update instantly. Message latency: &lt;500ms
            </p>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
