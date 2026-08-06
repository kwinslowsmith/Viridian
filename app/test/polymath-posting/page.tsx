'use client';

import { useState } from 'react';
import { PolymathPostingForm } from '@/app/components/PolymathPostingForm';

export default function PolymathPostingTestPage() {
  const [lastPostId, setLastPostId] = useState<string | null>(null);
  const [postHistory, setPostHistory] = useState<string[]>([]);

  const handleSuccess = (postId: string) => {
    console.log('Post created:', postId);
    setLastPostId(postId);
    setPostHistory([postId, ...postHistory]);
  };

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-950 mb-2">Polymath Posting Form Test</h1>
          <p className="text-stone-600">
            Test the Polymath posting form with all 4 stakeholder types
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <PolymathPostingForm
            userId="test-user-123"
            userName="Test User"
            userAvatar="👤"
            userTier="Intermediate"
            userCredentials={['Teaching', 'Python']}
            organizations={[
              {
                id: 'org-123',
                name: 'Test Organization',
                logo: '🏢',
                isVerified: true,
              },
              {
                id: 'org-456',
                name: 'Another Org',
                logo: '🏛️',
                isVerified: false,
              },
            ]}
            communities={[
              {
                id: 'community-456',
                name: 'Python Learning Community',
                badge: '🐍',
                moderatorName: 'Sarah Chen',
              },
              {
                id: 'community-789',
                name: 'Web Development Hub',
                badge: '💻',
                moderatorName: 'Tom Johnson',
              },
            ]}
            onSuccess={handleSuccess}
          />
        </div>

        {/* Status */}
        {lastPostId && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <p className="text-green-800">
              ✓ Last post created: <span className="font-mono font-bold">{lastPostId}</span>
            </p>
          </div>
        )}

        {/* History */}
        {postHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-amber-950 mb-4">Post History</h2>
            <div className="space-y-2">
              {postHistory.map((postId, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 border border-stone-200 rounded"
                >
                  <span className="font-mono text-sm">{postId}</span>
                  <a
                    href={`/polymath/articles/${postId}`}
                    className="text-amber-700 hover:text-amber-900 text-sm font-medium"
                  >
                    View →
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
