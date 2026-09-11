'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardBody, Button, LoadingState, EmptyState, Badge } from '@/app/components/polymath';

interface Member {
  id: string;
  name: string;
  email?: string;
  role: 'curator' | 'member';
  joinDate?: string;
  expertise?: string[];
}

export default function MembersPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'curator' | 'member'>('member');

  useEffect(() => {
    if (slug) {
      fetchMembers();
    }
  }, [slug]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/communities/${slug}/members`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
        // Set user role based on response
        setUserRole(data.userRole || 'member');
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      const res = await fetch(`/api/communities/${slug}/members/${memberId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== memberId));
      }
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  if (loading) {
    return <LoadingState message="Loading members..." />;
  }

  // Separate curators and members
  const curators = members.filter((m) => m.role === 'curator');
  const regularMembers = members.filter((m) => m.role === 'member');

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold text-[#3C3C3C]">Members</h1>
        {userRole === 'curator' && (
          <Button>+ Invite Member</Button>
        )}
      </div>

      {members.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No members yet"
          description="Invite members to join this community"
          actionLabel={userRole === 'curator' ? 'Invite Member' : undefined}
          onAction={
            userRole === 'curator'
              ? () => (window.location.href = '#')
              : undefined
          }
        />
      ) : (
        <>
          {/* Curators Section */}
          {curators.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xl font-semibold text-[#3C3C3C] mb-4">
                👑 Curators ({curators.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {curators.map((member) => (
                  <Card key={member.id}>
                    <CardBody>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-[#3C3C3C]">
                            {member.name}
                          </h3>
                          <p className="text-sm text-[#666666]">{member.email}</p>
                        </div>
                        <Badge variant="primary">Curator</Badge>
                      </div>
                      {member.expertise && member.expertise.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {member.expertise.map((exp, idx) => (
                            <Badge key={idx} variant="default">
                              {exp}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {member.joinDate && (
                        <p className="text-xs text-[#999999]">
                          Joined {new Date(member.joinDate).toLocaleDateString()}
                        </p>
                      )}
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Members Section */}
          {regularMembers.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-[#3C3C3C] mb-4">
                👤 Members ({regularMembers.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {regularMembers.map((member) => (
                  <Card key={member.id}>
                    <CardBody>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-[#3C3C3C]">
                            {member.name}
                          </h3>
                          <p className="text-sm text-[#666666]">{member.email}</p>
                        </div>
                        {userRole === 'curator' && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      {member.expertise && member.expertise.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {member.expertise.map((exp, idx) => (
                            <Badge key={idx} variant="default">
                              {exp}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {member.joinDate && (
                        <p className="text-xs text-[#999999]">
                          Joined {new Date(member.joinDate).toLocaleDateString()}
                        </p>
                      )}
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
