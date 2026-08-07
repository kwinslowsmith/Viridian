'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { colors } from '@/app/design/colors';

export default function JoinRequestsPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [slug, setSlug] = useState('');
  const [community, setCommunity] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { slug: resolvedSlug } = await params;
      setSlug(resolvedSlug);
      fetchData(resolvedSlug);
    })();
  }, [params]);

  const fetchData = async (communitySlug: string) => {
    try {
      const [communityRes, requestsRes] = await Promise.all([
        fetch(`/api/communities/${communitySlug}`),
        fetch(`/api/communities/${communitySlug}/join-requests`),
      ]);

      if (communityRes.ok) {
        const data = await communityRes.json();
        setCommunity(data);
      }

      if (requestsRes.ok) {
        const data = await requestsRes.json();
        console.log('Join requests response:', data);
        const requestsList = Array.isArray(data) ? data : (data.joinRequests || data.requests || []);
        console.log('Parsed requests:', requestsList);
        setRequests(requestsList);
      } else {
        console.error('Failed to fetch join requests:', requestsRes.status);
        const error = await requestsRes.json().catch(() => null);
        console.error('Error response:', error);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      const res = await fetch(`/api/communities/${slug}/join-requests/${requestId}/approve`, {
        method: 'POST',
      });

      if (res.ok) {
        setRequests(requests.filter((r) => r.id !== requestId));
        alert('Request approved!');
        // Refetch after a brief delay to ensure backend is updated
        setTimeout(() => fetchData(slug), 500);
      } else {
        alert('Failed to approve request');
      }
    } catch (err) {
      alert('Failed to approve request');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const res = await fetch(`/api/communities/${slug}/join-requests/${requestId}/reject`, {
        method: 'POST',
      });

      if (res.ok) {
        setRequests(requests.filter((r) => r.id !== requestId));
        alert('Request rejected');
        // Refetch after a brief delay to ensure backend is updated
        setTimeout(() => fetchData(slug), 500);
      } else {
        alert('Failed to reject request');
      }
    } catch (err) {
      alert('Failed to reject request');
    }
  };

  if (status === 'loading' || loading) {
    return <div style={{ color: colors.text, padding: '2rem' }}>Loading...</div>;
  }

  if (!community) {
    return <div style={{ color: colors.text, padding: '2rem' }}>Community not found</div>;
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: colors.bg }}>
      <div className="max-w-3xl mx-auto p-6">
        <button
          onClick={() => router.push('/curator')}
          className="mb-6 px-4 py-2 rounded font-semibold text-sm"
          style={{
            backgroundColor: colors.bg,
            color: colors.text,
            border: `1px solid ${colors.border}`,
          }}
        >
          ← Back to Curator Panel
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text, fontFamily: "'DM Serif Display', serif" }}>
            Join Requests
          </h1>
          <p style={{ color: colors.text2 }}>Manage requests to join {community.name}</p>
        </div>

        {requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="p-6 rounded-lg border flex justify-between items-center"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              >
                <div>
                  <h3 className="font-semibold text-lg" style={{ color: colors.text }}>
                    {request.user?.name || 'Unknown User'}
                  </h3>
                  <p style={{ color: colors.text2 }} className="text-sm">
                    {request.user?.email}
                  </p>
                  <p style={{ color: colors.text2 }} className="text-sm mt-2">
                    Requested {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(request.id)}
                    className="px-6 py-2 rounded font-semibold text-white"
                    style={{ backgroundColor: '#10b981' }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    className="px-6 py-2 rounded font-semibold"
                    style={{ backgroundColor: '#ef4444', color: 'white' }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="p-6 rounded-lg text-center"
            style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
          >
            <p style={{ color: colors.text2 }}>No pending requests</p>
          </div>
        )}
      </div>
    </main>
  );
}
