'use client';

import React, { useState } from 'react';
import { IndividualPostForm } from './IndividualPostForm';
import { OrgPostForm } from './OrgPostForm';
import { CommunityPostForm } from './CommunityPostForm';
import { EventPostForm } from './EventPostForm';
import { PolymathButton } from './PolymathButton';

type AuthorType = 'individual' | 'organization' | 'community' | 'event';

interface PolymathPostingFormProps {
  userId: string;
  authorType?: AuthorType;
  organizations?: Array<{
    id: string;
    name: string;
    logo?: string;
    isVerified?: boolean;
  }>;
  communities?: Array<{
    id: string;
    name: string;
    badge?: string;
    moderatorName?: string;
  }>;
  userName?: string;
  userAvatar?: string;
  userTier?: 'Expert' | 'Intermediate' | 'Beginner';
  userCredentials?: string[];
  onSuccess?: (postId: string) => void;
}

export const PolymathPostingForm: React.FC<PolymathPostingFormProps> = ({
  userId,
  authorType,
  organizations = [],
  communities = [],
  userName = 'You',
  userAvatar = '👤',
  userTier = 'Intermediate',
  userCredentials = [],
  onSuccess,
}) => {
  const [selectedAuthorType, setSelectedAuthorType] = useState<AuthorType | null>(authorType || null);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);

  // Get default org/community
  const defaultOrg = organizations?.[0];
  const defaultCommunity = communities?.[0];

  // If authorType is provided and only one org/community, auto-select
  if (authorType === 'organization' && !selectedOrgId && defaultOrg) {
    setSelectedOrgId(defaultOrg.id);
  }
  if (authorType === 'community' && !selectedCommunityId && defaultCommunity) {
    setSelectedCommunityId(defaultCommunity.id);
  }

  // Step 1: Show type selector if not specified
  if (!selectedAuthorType) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#3C3C3C] mb-2">Create New Content</h2>
          <p className="text-[#B8A899]">Choose how you'd like to publish your content</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Individual */}
          <button
            onClick={() => setSelectedAuthorType('individual')}
            className="p-6 border-2 border-[#B8A899]/30 rounded-lg hover:border-[#8B3A3A] hover:bg-[#F5F3F0] transition-all text-left"
          >
            <div className="text-3xl mb-3">👤</div>
            <h3 className="font-bold text-[#3C3C3C] mb-1">Personal Article</h3>
            <p className="text-sm text-[#B8A899]">
              Publish as yourself with your own credentials and profile
            </p>
            <div className="mt-3 text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded inline-block">
              ✓ Instant publication
            </div>
          </button>

          {/* Organization */}
          <button
            onClick={() => {
              setSelectedAuthorType('organization');
              if (defaultOrg) setSelectedOrgId(defaultOrg.id);
            }}
            disabled={organizations.length === 0}
            className="p-6 border-2 border-[#B8A899]/30 rounded-lg hover:border-[#8B3A3A] hover:bg-[#F5F3F0] transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-3xl mb-3">🏢</div>
            <h3 className="font-bold text-[#3C3C3C] mb-1">Organization Content</h3>
            <p className="text-sm text-[#B8A899]">
              Publish on behalf of your organization with approval workflow
            </p>
            <div className="mt-3 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded inline-block">
              ⏳ Requires approval
            </div>
          </button>

          {/* Community */}
          <button
            onClick={() => {
              setSelectedAuthorType('community');
              if (defaultCommunity) setSelectedCommunityId(defaultCommunity.id);
            }}
            disabled={communities.length === 0}
            className="p-6 border-2 border-[#B8A899]/30 rounded-lg hover:border-[#8B3A3A] hover:bg-[#F5F3F0] transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-3xl mb-3">📚</div>
            <h3 className="font-bold text-[#3C3C3C] mb-1">Community Resource</h3>
            <p className="text-sm text-[#B8A899]">
              Contribute to your community with moderator review
            </p>
            <div className="mt-3 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded inline-block">
              ⏳ Moderator review (24-48h)
            </div>
          </button>

          {/* Event */}
          <button
            onClick={() => setSelectedAuthorType('event')}
            className="p-6 border-2 border-[#B8A899]/30 rounded-lg hover:border-[#8B3A3A] hover:bg-[#F5F3F0] transition-all text-left"
          >
            <div className="text-3xl mb-3">📅</div>
            <h3 className="font-bold text-[#3C3C3C] mb-1">Event Resource</h3>
            <p className="text-sm text-[#B8A899]">
              Share resources for an event you're organizing
            </p>
            <div className="mt-3 text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded inline-block">
              ✓ Instant publication
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Show org selector if organization type selected
  if (selectedAuthorType === 'organization' && !selectedOrgId) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedAuthorType(null)}
          className="text-sm text-[#8B3A3A] hover:underline mb-4"
        >
          ← Back to type selection
        </button>

        <div>
          <h2 className="text-2xl font-bold text-[#3C3C3C] mb-4">Select Organization</h2>

          {organizations.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-700 text-sm">
              You don't have access to any organizations. Please join an organization first.
            </div>
          ) : (
            <div className="space-y-3">
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => setSelectedOrgId(org.id)}
                  className="w-full p-4 border-2 border-[#B8A899]/30 rounded-lg hover:border-[#8B3A3A] hover:bg-[#F5F3F0] transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{org.logo || '🏢'}</span>
                      <div>
                        <h3 className="font-bold text-[#3C3C3C]">{org.name}</h3>
                        {org.isVerified && (
                          <p className="text-xs text-green-700">✓ Verified Organization</p>
                        )}
                      </div>
                    </div>
                    <span className="text-[#B8A899]">→</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 3: Show community selector if community type selected
  if (selectedAuthorType === 'community' && !selectedCommunityId) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedAuthorType(null)}
          className="text-sm text-[#8B3A3A] hover:underline mb-4"
        >
          ← Back to type selection
        </button>

        <div>
          <h2 className="text-2xl font-bold text-[#3C3C3C] mb-4">Select Community</h2>

          {communities.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-700 text-sm">
              You're not a member of any communities. Please join a community first.
            </div>
          ) : (
            <div className="space-y-3">
              {communities.map((community) => (
                <button
                  key={community.id}
                  onClick={() => setSelectedCommunityId(community.id)}
                  className="w-full p-4 border-2 border-[#B8A899]/30 rounded-lg hover:border-[#8B3A3A] hover:bg-[#F5F3F0] transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{community.badge || '📚'}</span>
                      <div>
                        <h3 className="font-bold text-[#3C3C3C]">{community.name}</h3>
                        {community.moderatorName && (
                          <p className="text-xs text-[#B8A899]">
                            Moderated by {community.moderatorName}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-[#B8A899]">→</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 3: Show the appropriate form
  return (
    <div className="space-y-6">
      <button
        onClick={() => {
          setSelectedAuthorType(null);
          setSelectedOrgId(null);
          setSelectedCommunityId(null);
        }}
        className="text-sm text-[#8B3A3A] hover:underline mb-4"
      >
        ← Back to type selection
      </button>

      {selectedAuthorType === 'individual' && (
        <IndividualPostForm
          userId={userId}
          userName={userName}
          userAvatar={userAvatar}
          userTier={userTier}
          userCredentials={userCredentials}
          onSuccess={(postId) => {
            onSuccess?.(postId);
            setSelectedAuthorType(null);
          }}
        />
      )}

      {selectedAuthorType === 'organization' && selectedOrgId && (
        <OrgPostForm
          organizationId={selectedOrgId}
          organizationName={organizations.find((o) => o.id === selectedOrgId)?.name}
          organizationLogo={organizations.find((o) => o.id === selectedOrgId)?.logo}
          isVerified={organizations.find((o) => o.id === selectedOrgId)?.isVerified}
          userId={userId}
          onSuccess={(postId) => {
            onSuccess?.(postId);
            setSelectedAuthorType(null);
            setSelectedOrgId(null);
          }}
        />
      )}

      {selectedAuthorType === 'community' && selectedCommunityId && (
        <CommunityPostForm
          communityId={selectedCommunityId}
          communityName={communities.find((c) => c.id === selectedCommunityId)?.name}
          communityBadge={communities.find((c) => c.id === selectedCommunityId)?.badge}
          moderatorName={communities.find((c) => c.id === selectedCommunityId)?.moderatorName}
          userId={userId}
          onSuccess={(postId) => {
            onSuccess?.(postId);
            setSelectedAuthorType(null);
            setSelectedCommunityId(null);
          }}
        />
      )}

      {selectedAuthorType === 'event' && (
        <EventPostForm
          userId={userId}
          onSuccess={(postId) => {
            onSuccess?.(postId);
            setSelectedAuthorType(null);
          }}
        />
      )}
    </div>
  );
};
