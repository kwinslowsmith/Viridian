'use client';

import React, { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

export function AddPeopleModal({
  orgId,
  orgSlug,
  onClose,
  onSuccess,
}: {
  orgId: string;
  orgSlug: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [tab, setTab] = useState<'existing' | 'invite'>('existing');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [role, setRole] = useState('Student');
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('Student');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch all users for "Add Existing"
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/me/users');
        if (res.ok) {
          const data = await res.json();
          setAllUsers(data.users || []);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    if (tab === 'existing') {
      fetchUsers();
    }
  }, [tab]);

  const filteredUsers = allUsers.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddExisting = async () => {
    if (!selectedUser) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/organizations/${orgSlug}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          role,
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const error = await res.json();
        alert(`Failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to add member:', error);
      alert('Failed to add member');
    } finally {
      setSaving(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !inviteName.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setSaving(true);
    try {
      // Generate a temporary password (12 random characters)
      const tempPassword = Math.random().toString(36).substring(2, 14);

      // First, create the user with a temporary password
      const userRes = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-invite': 'true',
        },
        body: JSON.stringify({
          email: inviteEmail,
          name: inviteName,
          password: tempPassword,
        }),
      });

      if (userRes.ok) {
        const userData = await userRes.json();

        // Then add to organization
        const memberRes = await fetch(`/api/organizations/${orgSlug}/members`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userData.user.id,
            role: inviteRole,
          }),
        });

        if (memberRes.ok) {
          alert(`User invited successfully! They can now log in with their email.`);
          onSuccess();
          onClose();
        } else {
          alert('Created user but failed to add to organization');
        }
      } else {
        const error = await userRes.json();
        alert(`Failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to invite member:', error);
      alert('Failed to invite member');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ color: '#000', margin: '0 0 1rem 0', fontSize: '24px', fontWeight: '700' }}>
          Add People to Organization
        </h2>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', borderBottom: '1px solid #e0e0e0' }}>
          <button
            onClick={() => setTab('existing')}
            style={{
              padding: '8px 16px',
              backgroundColor: tab === 'existing' ? '#0D9488' : '#f0f0f0',
              color: tab === 'existing' ? 'white' : '#000',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
            }}
          >
            Add Existing User
          </button>
          <button
            onClick={() => setTab('invite')}
            style={{
              padding: '8px 16px',
              backgroundColor: tab === 'invite' ? '#0D9488' : '#f0f0f0',
              color: tab === 'invite' ? 'white' : '#000',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
            }}
          >
            Invite New User
          </button>
        </div>

        {/* Add Existing Tab */}
        {tab === 'existing' && (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#000', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                Search User
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#000',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#000', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                Select User
              </label>
              <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '6px', backgroundColor: '#f9f9f9' }}>
                {filteredUsers.length === 0 ? (
                  <div style={{ padding: '12px', color: '#999', textAlign: 'center' }}>No users found</div>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      style={{
                        padding: '10px 12px',
                        borderBottom: '1px solid #f0f0f0',
                        cursor: 'pointer',
                        backgroundColor: selectedUser?.id === user.id ? '#e8f5f3' : '#fff',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ fontWeight: '500', color: '#000', fontSize: '13px' }}>{user.name}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{user.email}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: '#000', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#000',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                }}
              >
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
                <option value="Admin">Admin</option>
                <option value="SuperAdmin">Super Admin</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={onClose}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#f0f0f0',
                  color: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddExisting}
                disabled={saving || !selectedUser}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#0D9488',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  opacity: saving || !selectedUser ? 0.6 : 1,
                }}
              >
                {saving ? 'Adding...' : 'Add User'}
              </button>
            </div>
          </>
        )}

        {/* Invite New Tab */}
        {tab === 'invite' && (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#000', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                Name *
              </label>
              <input
                type="text"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="Full name"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#000',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#000', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                Email *
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="user@example.com"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#000',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: '#000', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                Role
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#000',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                }}
              >
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
                <option value="Admin">Admin</option>
                <option value="SuperAdmin">Super Admin</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={onClose}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#f0f0f0',
                  color: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={saving || !inviteEmail.trim() || !inviteName.trim()}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#0D9488',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  opacity: saving || !inviteEmail.trim() || !inviteName.trim() ? 0.6 : 1,
                }}
              >
                {saving ? 'Inviting...' : 'Create & Add User'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
