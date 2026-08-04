'use client';

import React, { useEffect, useState } from 'react';

interface CredibilityBadgeProps {
  authorType: 'individual' | 'organization' | 'community' | 'event';
  authorId: string;
  organizationId?: string;
  communityId?: string;
  eventId?: string;
  compact?: boolean;
}

interface AuthorData {
  name?: string;
  tier?: 'Expert' | 'Intermediate' | 'Beginner';
  yearsExperience?: number;
  contributionCount?: number;
  credentials?: string;
  verified?: boolean;
  memberCount?: number;
  rating?: number;
  communityModerated?: boolean;
  moderatorName?: string;
  eventName?: string;
  eventDate?: string;
  eventSpeaker?: boolean;
}

export const CredibilityBadge: React.FC<CredibilityBadgeProps> = ({
  authorType,
  authorId,
  organizationId,
  communityId,
  eventId,
  compact = false,
}) => {
  const [data, setData] = useState<AuthorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Mock data for now - replace with actual API calls
        const mockData: Record<string, AuthorData> = {
          individual: {
            name: 'Dr. Jane Smith',
            tier: 'Expert',
            yearsExperience: 8,
            contributionCount: 24,
            credentials: 'PhD in Education',
          },
          organization: {
            name: 'Acme Learning Inc',
            verified: true,
            memberCount: 156,
            rating: 4.8,
          },
          community: {
            name: 'Python Developers',
            rating: 4.6,
            communityModerated: true,
            moderatorName: 'Alice Johnson',
          },
          event: {
            eventName: 'EdTech Summit 2026',
            eventDate: '2026-09-15',
            eventSpeaker: true,
          },
        };

        setData(mockData[authorType] || {});
      } catch (err) {
        setError('Failed to load credibility data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authorType, authorId]);

  if (loading) {
    return <div className="text-xs text-[#B8A899]">Loading...</div>;
  }

  if (error) {
    return null;
  }

  if (compact) {
    switch (authorType) {
      case 'individual':
        return (
          <div className="text-xs text-[#B8A899] flex items-center gap-1">
            <span className="font-medium text-[#3C3C3C]">{data?.name}</span>
            {data?.tier && <span className="ml-1">⭐ {data.tier}</span>}
          </div>
        );
      case 'organization':
        return (
          <div className="text-xs text-[#B8A899] flex items-center gap-1">
            <span className="font-medium text-[#3C3C3C]">{data?.name}</span>
            {data?.verified && <span className="text-green-600">✓</span>}
          </div>
        );
      case 'community':
        return (
          <div className="text-xs text-[#B8A899] flex items-center gap-1">
            <span className="font-medium text-[#3C3C3C]">{data?.name}</span>
            {data?.communityModerated && <span>Moderated</span>}
          </div>
        );
      case 'event':
        return (
          <div className="text-xs text-[#B8A899] flex items-center gap-1">
            <span className="font-medium text-[#3C3C3C]">{data?.eventName}</span>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="space-y-2">
      {authorType === 'individual' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="font-semibold text-[#3C3C3C] text-sm mb-1">{data?.name}</h4>
          <div className="text-xs text-[#B8A899] space-y-1">
            {data?.tier && (
              <p>
                <span className="text-lg">⭐</span> {data.tier} Contributor
              </p>
            )}
            {data?.yearsExperience && <p>{data.yearsExperience} years of experience</p>}
            {data?.contributionCount && <p>{data.contributionCount} articles published</p>}
            {data?.credentials && <p className="italic">{data.credentials}</p>}
          </div>
        </div>
      )}

      {authorType === 'organization' && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-[#3C3C3C] text-sm">{data?.name}</h4>
            {data?.verified && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">✓ Verified</span>}
          </div>
          <div className="text-xs text-[#B8A899] space-y-1">
            {data?.memberCount && <p>{data.memberCount} members</p>}
            {data?.rating && <p>⭐ {data.rating} rating</p>}
          </div>
        </div>
      )}

      {authorType === 'community' && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
          <h4 className="font-semibold text-[#3C3C3C] text-sm mb-1">{data?.name}</h4>
          <div className="text-xs text-[#B8A899] space-y-1">
            {data?.rating && <p>⭐ {data.rating} community rating</p>}
            {data?.communityModerated && data?.moderatorName && (
              <p>Moderated by {data.moderatorName}</p>
            )}
          </div>
        </div>
      )}

      {authorType === 'event' && (
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
          <h4 className="font-semibold text-[#3C3C3C] text-sm mb-1">📅 {data?.eventName}</h4>
          <div className="text-xs text-[#B8A899] space-y-1">
            {data?.eventDate && <p>Date: {new Date(data.eventDate).toLocaleDateString()}</p>}
            {data?.eventSpeaker && <p>Keynote speaker</p>}
          </div>
        </div>
      )}
    </div>
  );
};
