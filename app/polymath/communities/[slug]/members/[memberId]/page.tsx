'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { LoadingState, Button } from '@/app/components/polymath';
import { MemberProfile } from '@/app/components/polymath/MemberProfile';

interface Member {
  id: string;
  name: string;
  email: string;
  bio?: string;
  role: 'curator' | 'member';
  expertise?: string[];
  affiliation?: string;
  joinDate?: string;
  contributionCount?: number;
  resourcesShared?: number;
  discussionsStarted?: number;
}

export default function MemberDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const memberId = params.memberId as string;
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug && memberId) {
      fetchMember();
    }
  }, [slug, memberId]);

  const fetchMember = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/communities/${slug}/members/${memberId}`);
      if (res.ok) {
        const data = await res.json();
        setMember(data.member);
      } else {
        setError('Member not found');
      }
    } catch (err) {
      console.error('Failed to fetch member:', err);
      setError('Failed to load member profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading member profile..." />;
  }

  if (error || !member) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-[#3C3C3C] mb-2">
            {error || 'Member not found'}
          </h1>
          <p className="text-[#666666] mb-6">
            The member you're looking for doesn't exist or you don't have access
          </p>
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
        >
          ← Back to Members
        </Button>
      </div>

      {/* Member Profile */}
      <MemberProfile
        id={member.id}
        name={member.name}
        email={member.email}
        bio={member.bio}
        role={member.role}
        expertise={member.expertise}
        affiliation={member.affiliation}
        joinDate={member.joinDate}
        contributionCount={member.contributionCount}
        resourcesShared={member.resourcesShared}
        discussionsStarted={member.discussionsStarted}
      />
    </div>
  );
}
