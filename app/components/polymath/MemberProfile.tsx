'use client';

import React from 'react';
import { Card, CardBody, Badge } from './index';

interface MemberProfileProps {
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

export const MemberProfile: React.FC<MemberProfileProps> = ({
  id,
  name,
  email,
  bio,
  role,
  expertise,
  affiliation,
  joinDate,
  contributionCount = 0,
  resourcesShared = 0,
  discussionsStarted = 0,
}) => {
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-[#3C3C3C]">{name}</h1>
                {role === 'curator' && (
                  <Badge variant="primary">👑 Curator</Badge>
                )}
              </div>
              <p className="text-[#666666] mb-3">{email}</p>

              {bio && (
                <p className="text-[#666666] leading-relaxed mb-3">{bio}</p>
              )}

              {affiliation && (
                <p className="text-sm text-[#999999]">
                  <span className="font-medium">Affiliation:</span> {affiliation}
                </p>
              )}

              {joinDate && (
                <p className="text-sm text-[#999999]">
                  <span className="font-medium">Joined:</span>{' '}
                  {new Date(joinDate).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Profile Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#20B2AA] to-[#0d9488] flex items-center justify-center text-4xl text-white flex-shrink-0">
              {name.charAt(0).toUpperCase()}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Expertise */}
      {expertise && expertise.length > 0 && (
        <Card>
          <CardBody>
            <h2 className="text-lg font-semibold text-[#3C3C3C] mb-4">Expertise Areas</h2>
            <div className="flex flex-wrap gap-2">
              {expertise.map((exp, idx) => (
                <Badge key={idx} variant="default">
                  {exp}
                </Badge>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Contributions */}
      <Card>
        <CardBody>
          <h2 className="text-lg font-semibold text-[#3C3C3C] mb-6">Contributions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-[#FAFAFA] rounded-lg">
              <div className="text-3xl font-bold text-[#20B2AA] mb-2">
                {resourcesShared}
              </div>
              <div className="text-sm text-[#666666]">Resources Shared</div>
            </div>

            <div className="text-center p-4 bg-[#FAFAFA] rounded-lg">
              <div className="text-3xl font-bold text-[#20B2AA] mb-2">
                {discussionsStarted}
              </div>
              <div className="text-sm text-[#666666]">Discussions Started</div>
            </div>

            <div className="text-center p-4 bg-[#FAFAFA] rounded-lg">
              <div className="text-3xl font-bold text-[#20B2AA] mb-2">
                {contributionCount}
              </div>
              <div className="text-sm text-[#666666]">Total Contributions</div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
