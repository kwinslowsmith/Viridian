'use client';

import React, { useState } from 'react';
import { Button, Card, CardBody, Badge } from './index';

interface TeacherProfileData {
  id: string;
  name: string;
  email: string;
  bio?: string;
  expertise: string[];
  publishedCurricula: number;
  sharedCurricula: number;
  collaborations: number;
  joinedDate?: string;
  isOwner?: boolean;
}

interface TeacherProfileProps {
  teacher: TeacherProfileData;
  onEdit?: () => void;
  onMessage?: () => void;
  onViewCurricula?: () => void;
}

const expertiseOptions = [
  'English Language Arts',
  'Mathematics',
  'Science',
  'Social Studies',
  'History',
  'Foreign Language',
  'Arts & Music',
  'Physical Education',
  'STEM',
  'Special Education',
  'Early Childhood',
  'Secondary',
];

export function TeacherProfile({
  teacher,
  onEdit,
  onMessage,
  onViewCurricula,
}: TeacherProfileProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <Card className="mb-8">
        <CardBody>
          <div className="flex items-start justify-between mb-6">
            <div className="flex gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-lg bg-[#20B2AA] text-white flex items-center justify-center font-bold text-3xl flex-shrink-0">
                {getInitials(teacher.name)}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-[#3C3C3C] mb-1">
                  {teacher.name}
                </h1>
                <p className="text-[#666666] mb-4">{teacher.email}</p>

                {teacher.bio && (
                  <p className="text-sm text-[#666666] max-w-2xl mb-4">
                    {teacher.bio}
                  </p>
                )}

                {teacher.joinedDate && (
                  <p className="text-xs text-[#999999]">
                    Joined {teacher.joinedDate}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {teacher.isOwner ? (
                <Button onClick={onEdit}>Edit Profile</Button>
              ) : (
                <>
                  <Button onClick={onMessage}>Message</Button>
                  <button
                    onClick={onViewCurricula}
                    className="px-4 py-2 text-sm font-medium text-[#20B2AA] border border-[#20B2AA] rounded-lg hover:bg-[#20B2AA]/10"
                  >
                    View Curriculum
                  </button>
                </>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Expertise Section */}
      {teacher.expertise.length > 0 && (
        <Card className="mb-8">
          <CardBody>
            <h2 className="text-lg font-bold text-[#3C3C3C] mb-4">
              Teaching Expertise
            </h2>
            <div className="flex flex-wrap gap-2">
              {teacher.expertise.map((exp) => (
                <Badge key={exp} variant="primary">
                  {exp}
                </Badge>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Contribution Stats */}
      <Card className="mb-8">
        <CardBody>
          <h2 className="text-lg font-bold text-[#3C3C3C] mb-6">
            Contributions to Polymath
          </h2>

          <div className="grid grid-cols-3 gap-6">
            {/* Curricula Created */}
            <div className="text-center">
              <div className="text-4xl font-bold text-[#20B2AA] mb-2">
                {teacher.publishedCurricula}
              </div>
              <div className="text-sm text-[#666666]">Curricula Created</div>
              <p className="text-xs text-[#999999] mt-1">
                Published for your community
              </p>
            </div>

            {/* Curricula Shared */}
            <div className="text-center">
              <div className="text-4xl font-bold text-[#20B2AA] mb-2">
                {teacher.sharedCurricula}
              </div>
              <div className="text-sm text-[#666666]">Shared With</div>
              <p className="text-xs text-[#999999] mt-1">
                Teachers collaborating with you
              </p>
            </div>

            {/* Collaborations */}
            <div className="text-center">
              <div className="text-4xl font-bold text-[#20B2AA] mb-2">
                {teacher.collaborations}
              </div>
              <div className="text-sm text-[#666666]">Collaborations</div>
              <p className="text-xs text-[#999999] mt-1">
                Active curriculum partnerships
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Published Curricula Preview */}
      {teacher.publishedCurricula > 0 && (
        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#3C3C3C]">
                Recent Curriculum
              </h2>
              <button
                onClick={onViewCurricula}
                className="text-sm font-medium text-[#20B2AA] hover:underline"
              >
                View All ({teacher.publishedCurricula})
              </button>
            </div>

            <div className="space-y-3">
              {/* Mock curriculum items */}
              <div className="p-3 bg-[#F9F9F9] rounded border border-[#E5E5E5] hover:border-[#20B2AA] transition cursor-pointer">
                <div className="font-medium text-[#3C3C3C] text-sm mb-1">
                  American Literature - Fall 2026
                </div>
                <div className="text-xs text-[#666666]">
                  Grade 11 • English Language Arts • 12 lessons
                </div>
                <div className="mt-2 flex gap-2">
                  <span className="text-xs bg-[#DCFCE7] text-[#166534] px-2 py-1 rounded">
                    Published
                  </span>
                  <span className="text-xs text-[#999999]">
                    2 teachers using this
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#F9F9F9] rounded border border-[#E5E5E5] hover:border-[#20B2AA] transition cursor-pointer">
                <div className="font-medium text-[#3C3C3C] text-sm mb-1">
                  Introduction to Algebra
                </div>
                <div className="text-xs text-[#666666]">
                  Grade 8 • Mathematics • 15 lessons
                </div>
                <div className="mt-2 flex gap-2">
                  <span className="text-xs bg-[#DCFCE7] text-[#166534] px-2 py-1 rounded">
                    Published
                  </span>
                  <span className="text-xs text-[#999999]">
                    5 teachers using this
                  </span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
