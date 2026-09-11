'use client';

import React, { useState } from 'react';
import { Button, Card, CardBody, TextInput, Badge } from './index';

interface SharedUser {
  id: string;
  email: string;
  name?: string;
  role: 'viewer' | 'editor' | 'owner';
  addedDate?: string;
}

interface CurriculumSharingProps {
  curriculumTitle: string;
  currentStatus: 'private' | 'organization' | 'public';
  sharedWith: SharedUser[];
  onStatusChange: (status: 'private' | 'organization' | 'public') => void;
  onAddUser: (email: string, role: 'viewer' | 'editor') => void;
  onRemoveUser: (userId: string) => void;
  onChangeRole: (userId: string, role: 'viewer' | 'editor') => void;
  onCancel: () => void;
}

export function CurriculumSharing({
  curriculumTitle,
  currentStatus,
  sharedWith,
  onStatusChange,
  onAddUser,
  onRemoveUser,
  onChangeRole,
  onCancel,
}: CurriculumSharingProps) {
  const [visibilityStatus, setVisibilityStatus] = useState(currentStatus);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'viewer' | 'editor'>('viewer');
  const [addUserError, setAddUserError] = useState('');

  const handleAddUser = () => {
    if (!newUserEmail.trim()) {
      setAddUserError('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserEmail)) {
      setAddUserError('Please enter a valid email address');
      return;
    }

    // Check if already shared
    if (sharedWith.some((u) => u.email === newUserEmail)) {
      setAddUserError('This curriculum is already shared with this user');
      return;
    }

    onAddUser(newUserEmail, newUserRole);
    setNewUserEmail('');
    setAddUserError('');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-[#DCFCE7] text-[#166534]';
      case 'editor':
        return 'bg-[#DBEAFE] text-[#1E40AF]';
      case 'viewer':
        return 'bg-[#F3F4F6] text-[#374151]';
      default:
        return 'bg-[#F3F4F6] text-[#374151]';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#3C3C3C] mb-2">
          Share Curriculum
        </h1>
        <p className="text-[#666666]">
          {curriculumTitle}
        </p>
      </div>

      {/* Visibility Settings */}
      <Card className="mb-8">
        <CardBody>
          <h2 className="text-lg font-bold text-[#3C3C3C] mb-4">
            Visibility
          </h2>
          <p className="text-sm text-[#666666] mb-6">
            Choose who can see and access this curriculum
          </p>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-4 border border-[#E5E5E5] rounded-lg cursor-pointer hover:bg-[#F9F9F9]">
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={visibilityStatus === 'private'}
                onChange={() => {
                  setVisibilityStatus('private');
                  onStatusChange('private');
                }}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-[#3C3C3C]">Private</div>
                <p className="text-sm text-[#666666]">
                  Only you can access this curriculum
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 border border-[#E5E5E5] rounded-lg cursor-pointer hover:bg-[#F9F9F9]">
              <input
                type="radio"
                name="visibility"
                value="organization"
                checked={visibilityStatus === 'organization'}
                onChange={() => {
                  setVisibilityStatus('organization');
                  onStatusChange('organization');
                }}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-[#3C3C3C]">Community</div>
                <p className="text-sm text-[#666666]">
                  Share with your curriculum community
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 border border-[#E5E5E5] rounded-lg cursor-pointer hover:bg-[#F9F9F9]">
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={visibilityStatus === 'public'}
                onChange={() => {
                  setVisibilityStatus('public');
                  onStatusChange('public');
                }}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-[#3C3C3C]">Public</div>
                <p className="text-sm text-[#666666]">
                  Anyone can find and view this curriculum
                </p>
              </div>
            </label>
          </div>
        </CardBody>
      </Card>

      {/* Share with Specific People */}
      <Card className="mb-8">
        <CardBody>
          <h2 className="text-lg font-bold text-[#3C3C3C] mb-4">
            Invite Specific Teachers
          </h2>

          {/* Add User Form */}
          <div className="mb-6 p-4 bg-[#F9F9F9] rounded-lg border border-[#E5E5E5]">
            <div className="flex gap-3 mb-3">
              <input
                type="email"
                placeholder="teacher@example.com"
                value={newUserEmail}
                onChange={(e) => {
                  setNewUserEmail(e.target.value);
                  setAddUserError('');
                }}
                className="flex-1 px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#20B2AA]"
              />
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value as 'viewer' | 'editor')}
                className="px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#20B2AA]"
              >
                <option value="viewer">Can view</option>
                <option value="editor">Can edit</option>
              </select>
              <Button onClick={handleAddUser}>Share</Button>
            </div>
            {addUserError && (
              <p className="text-sm text-red-500">{addUserError}</p>
            )}
          </div>

          {/* Shared Users List */}
          <h3 className="font-medium text-[#3C3C3C] mb-3">
            Shared with {sharedWith.length} teacher{sharedWith.length !== 1 ? 's' : ''}
          </h3>

          {sharedWith.length === 0 ? (
            <p className="text-sm text-[#666666]">
              Not shared with anyone yet
            </p>
          ) : (
            <div className="space-y-2">
              {sharedWith.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-[#F9F9F9] rounded border border-[#E5E5E5]"
                >
                  <div className="flex-1">
                    <div className="font-medium text-[#3C3C3C] text-sm">
                      {user.name || user.email}
                    </div>
                    <div className="text-xs text-[#999999]">
                      {user.email}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-4">
                    {user.role !== 'owner' && (
                      <select
                        value={user.role}
                        onChange={(e) =>
                          onChangeRole(user.id, e.target.value as 'viewer' | 'editor')
                        }
                        className="px-2 py-1 text-xs border border-[#E5E5E5] rounded focus:outline-none focus:ring-2 focus:ring-[#20B2AA]"
                      >
                        <option value="viewer">Can view</option>
                        <option value="editor">Can edit</option>
                      </select>
                    )}

                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>

                    {user.role !== 'owner' && (
                      <button
                        onClick={() => onRemoveUser(user.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Collaboration Info */}
      <Card className="mb-8 bg-[#DBEAFE]/20 border-[#BFDBFE]">
        <CardBody>
          <h3 className="font-medium text-[#1E40AF] mb-2">💡 Collaboration Tips</h3>
          <ul className="text-sm text-[#1E40AF] space-y-1">
            <li>• Viewers can read and comment on your curriculum</li>
            <li>• Editors can modify lessons and materials</li>
            <li>• Changes are tracked automatically</li>
            <li>• You remain the owner and can revoke access anytime</li>
          </ul>
        </CardBody>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <button
          onClick={onCancel}
          className="px-6 py-3 text-sm font-medium text-[#666666] border border-[#E5E5E5] rounded-lg hover:bg-[#F5F5F5]"
        >
          Close
        </button>
      </div>
    </div>
  );
}
