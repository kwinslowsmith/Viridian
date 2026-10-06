'use client';

/**
 * TEMPLATE: Community Dashboard with Real-Time Integration
 * Shows all T3 components working together
 * Usage: Copy this as base for your community page
 */

import { useState } from 'react';
import Link from 'next/link';
import { ErrorBoundary } from '@/app/components/polymath/ErrorBoundary';
import { RealtimeDiscussionsList } from '@/app/components/polymath/RealtimeDiscussionsList';
import { RealtimeMemberCount, RealtimeStatsCard } from '@/app/components/polymath/RealtimeStats';
import { PerformanceMonitor } from '@/app/components/polymath/PerformanceMonitor';

interface CommunityPageProps {
  params: {
    slug: string;
  };
}

export default function CommunityDashboardPage({ params }: CommunityPageProps) {
  const { slug } = params;
  const [selectedDiscussionId, setSelectedDiscussionId] = useState<string | null>(null);

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
            <h2 style={{ color: '#991b1b', marginTop: 0 }}>Error Loading Community</h2>
            <p style={{ color: '#7f1d1d', margin: '0 0 12px 0' }}>
              {error.message}
            </p>
            <button
              onClick={retry}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      )}
    >
      <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
        {/* Header */}
        <div
          style={{
            backgroundColor: 'white',
            borderBottom: '1px solid #e5e7eb',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ margin: 0, color: '#1f2937', fontSize: '28px', fontWeight: 'bold' }}>
                  {slug.replace(/-/g, ' ').toUpperCase()}
                </h1>
                <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                  ✨ Real-time collaboration enabled
                </p>
              </div>
              <Link href={`/polymath/communities/${slug}/discussions/new`}>
                <button
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  + New Discussion
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
          {/* Stats Section */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', fontWeight: 'bold' }}>
              Community Overview
            </h2>
            <RealtimeStatsCard communitySlug={slug} />
          </div>

          {/* Member Count */}
          <div style={{ marginBottom: '24px' }}>
            <RealtimeMemberCount
              communitySlug={slug}
              onMemberJoined={(member) => {
                console.log('📍 New member joined:', member.user?.name);
              }}
              onMemberLeft={(memberId) => {
                console.log('👋 Member left:', memberId);
              }}
            />
          </div>

          {/* Discussions Section */}
          <div>
            <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', fontWeight: 'bold' }}>
              Discussions
            </h2>
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
              }}
            >
              <RealtimeDiscussionsList
                communitySlug={slug}
                onDiscussionSelected={(id) => {
                  setSelectedDiscussionId(id);
                  // Navigate to discussion
                  window.location.href = `/polymath/communities/${slug}/discussions/${id}`;
                }}
              />
            </div>
          </div>

          {/* Selected Discussion Info */}
          {selectedDiscussionId && (
            <div
              style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '6px',
                color: '#1e40af',
                fontSize: '14px',
              }}
            >
              📍 You selected: {selectedDiscussionId}
              <Link href={`/polymath/communities/${slug}/discussions/${selectedDiscussionId}`}>
                <span style={{ marginLeft: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Open Discussion →
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* Performance Monitor (floating) */}
        <PerformanceMonitor />
      </div>
    </ErrorBoundary>
  );
}
