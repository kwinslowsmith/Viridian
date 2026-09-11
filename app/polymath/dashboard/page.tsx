'use client';

import { useState } from 'react';
import { Card, Button, Badge, EmptyState, Spinner } from '@/app/components/polymath/ComponentLibrary';
import { PolymathLayout } from '../layout-main';

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);

  // Sample data
  const communities = [
    {
      id: 1,
      name: 'Boston K-8 Curriculum',
      members: 24,
      resources: 18,
      discussions: 12,
      lastActivity: '2 hours ago',
    },
    {
      id: 2,
      name: 'STEM Educators Network',
      members: 31,
      resources: 42,
      discussions: 28,
      lastActivity: '30 minutes ago',
    },
  ];

  const recentActivity = [
    { type: 'resource', user: 'Sarah Chen', action: 'shared a resource', community: 'Boston K-8', time: '1h ago' },
    { type: 'discussion', user: 'Marcus Johnson', action: 'started a discussion', community: 'STEM Network', time: '2h ago' },
    { type: 'meeting', user: 'Elena Rodriguez', action: 'scheduled a meeting', community: 'Boston K-8', time: '4h ago' },
  ];

  return (
    <PolymathLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0', color: '#1c1917' }}>
            Welcome to Polymath
          </h1>
          <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>
            Collaborate with educators to build equitable curricula
          </p>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
          <Card hoverable onClick={() => console.log('Create community')}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>👥</div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 8px 0', color: '#1c1917' }}>
                Create Community
              </h3>
              <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Start a new learning community</p>
            </div>
          </Card>

          <Card hoverable onClick={() => console.log('Upload resource')}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📚</div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 8px 0', color: '#1c1917' }}>
                Share Resource
              </h3>
              <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Upload curriculum material</p>
            </div>
          </Card>

          <Card hoverable onClick={() => console.log('Start discussion')}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>💬</div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 8px 0', color: '#1c1917' }}>
                Start Discussion
              </h3>
              <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Engage with your community</p>
            </div>
          </Card>
        </div>

        {/* Communities Section */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#1c1917' }}>
              Your Communities
            </h2>
            <Button variant="primary" size="sm">
              View All
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {communities.map((community) => (
              <Card key={community.id} hoverable>
                <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 12px 0', color: '#1c1917' }}>
                  {community.name}
                </h3>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <Badge variant="primary">{community.members} members</Badge>
                  <Badge variant="secondary">{community.resources} resources</Badge>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
                    💬 {community.discussions} discussions
                  </p>
                  <p style={{ fontSize: '12px', color: '#999', margin: '4px 0 0 0' }}>
                    Last activity {community.lastActivity}
                  </p>
                </div>

                <Button variant="outline" size="sm" style={{ width: '100%' }}>
                  View Community
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 20px 0', color: '#1c1917' }}>
            Recent Activity
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentActivity.map((activity, i) => (
              <Card key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '500', margin: '0 0 4px 0', color: '#1c1917' }}>
                      <strong>{activity.user}</strong> {activity.action}
                    </p>
                    <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
                      in <strong>{activity.community}</strong>
                    </p>
                  </div>
                  <span style={{ fontSize: '12px', color: '#999' }}>{activity.time}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </PolymathLayout>
  );
}
