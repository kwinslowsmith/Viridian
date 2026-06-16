'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface ConversationParticipant {
  userId: string;
  user: User;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: User;
  googleDocUrl?: string;
}

interface Conversation {
  id: string;
  type: string;
  title?: string;
  lastMessageAt?: string;
  unreadCount: number;
  participants: ConversationParticipant[];
  messages: Message[];
  class?: { id: string; name: string };
  event?: { id: string; title: string };
  organization?: { id: string; name: string };
  createdBy: User;
  isMail?: boolean;
  allowReplies?: boolean;
  isArchived?: boolean;
}

interface MessagingCenterProps {
  defaultOrgSlug?: string;
}

export function MessagingCenter({ defaultOrgSlug }: MessagingCenterProps = {}) {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageContent, setMessageContent] = useState('');
  const [googleDocUrl, setGoogleDocUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'messages' | 'announcements' | 'mail'>('messages');
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [modalType, setModalType] = useState<'message' | 'announcement' | 'mail' | null>(null);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  // Fetch messages for selected conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      console.log('📥 Fetching messages for conversation:', conversationId);
      const res = await fetch(`/api/conversations/${conversationId}/messages`);
      if (res.ok) {
        const data = await res.json();
        console.log('📨 Got', data.messages?.length || 0, 'messages');
        setMessages(data.messages);
      } else {
        console.error('Failed to fetch messages, status:', res.status);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  // Mark conversation as read
  const markAsRead = async (conversationId: string) => {
    try {
      await fetch(`/api/conversations/${conversationId}/read`, {
        method: 'PUT',
      });
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  // Archive conversation
  const handleArchiveConversation = async () => {
    if (!selectedConversation) return;
    if (!window.confirm('Archive this conversation?')) return;

    try {
      const res = await fetch(`/api/conversations/${selectedConversation.id}/archive`, {
        method: 'PUT',
      });

      if (res.ok) {
        setConversations(conversations.filter((c) => c.id !== selectedConversation.id));
        setSelectedConversation(null);
      }
    } catch (error) {
      console.error('Failed to archive conversation:', error);
    }
  };

  // Delete conversation
  const handleDeleteConversation = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/delete`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setConversations(conversations.filter((c) => c.id !== conversationId));
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(null);
        }
      } else {
        alert('Failed to delete conversation');
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      alert('Failed to delete conversation');
    }
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📤 Sending message:', messageContent);
    console.log('Selected conversation:', selectedConversation?.id);

    if (!selectedConversation || !messageContent.trim()) {
      console.log('⚠️ Skipping send - conversation:', !!selectedConversation, 'content:', !!messageContent.trim());
      return;
    }

    // Check if replies are allowed (only for announcements)
    if (selectedConversation.isMail && !selectedConversation.allowReplies) {
      alert('Replies are disabled for this announcement');
      return;
    }

    try {
      console.log('Posting to /api/conversations/' + selectedConversation.id + '/messages');
      const res = await fetch(`/api/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: messageContent,
          googleDocUrl: googleDocUrl || null,
        }),
      });

      console.log('Response status:', res.status);
      if (res.ok) {
        const data = await res.json();
        console.log('✅ Message sent:', data.message);
        setMessages([...messages, data.message]);
        setMessageContent('');
        setGoogleDocUrl('');

        // Mark as read after sending
        await markAsRead(selectedConversation.id);

        // Update conversation in list
        await fetchConversations();
      } else {
        const error = await res.json();
        console.error('❌ Server error:', error);
      }
    } catch (error) {
      console.error('❌ Failed to send message:', error);
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm('Delete this message?')) return;

    try {
      const res = await fetch(`/api/conversations/${selectedConversation?.id}/messages/${messageId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMessages(messages.filter((m) => m.id !== messageId));
      } else {
        const error = await res.json();
        console.error('Failed to delete message:', error);
        alert('Failed to delete message');
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
      alert('Failed to delete message');
    }
  };

  // Select conversation
  const handleSelectConversation = async (conversation: Conversation) => {
    console.log('📌 Selected conversation:', conversation);
    setSelectedConversation(conversation);
    await fetchMessages(conversation.id);
    await markAsRead(conversation.id);

    // Clear unread count immediately by refreshing conversations
    await fetchConversations();
  };

  // Initial fetch
  useEffect(() => {
    setLoading(true);
    fetchConversations().then(() => setLoading(false));
  }, []);

  // Refresh conversations periodically
  useEffect(() => {
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  // Refresh messages periodically if a conversation is selected
  useEffect(() => {
    if (!selectedConversation) return;

    const interval = setInterval(() => {
      fetchMessages(selectedConversation.id);
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedConversation]);

  if (loading) {
    return <div className="p-4">Loading conversations...</div>;
  }

  // Filter conversations based on view
  const filteredConversations = conversations.filter((c) => {
    if (c.isArchived) return false;
    // Messages: direct or group messages (not mail/announcements)
    if (view === 'messages') return c.type === 'direct' || (!c.isMail && c.type !== 'organization');
    // Announcements: organization-type broadcasts
    if (view === 'announcements') return c.isMail && c.type === 'organization';
    // Mail: other mail-type broadcasts (non-organization)
    if (view === 'mail') return c.isMail && c.type !== 'organization';
    return true;
  });

  return (
    <div className="flex h-full gap-4">
      {/* Conversations List */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Header with tabs and action buttons */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#000' }}>
            Message Center
          </h2>

          {/* View Tabs */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setView('messages')}
              style={{
                flex: 1,
                padding: '8px 12px',
                backgroundColor: view === 'messages' ? '#0066cc' : '#f0f0f0',
                color: view === 'messages' ? 'white' : '#000',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
              }}
            >
              💬 Messages
            </button>
            <button
              onClick={() => setView('announcements')}
              style={{
                flex: 1,
                padding: '8px 12px',
                backgroundColor: view === 'announcements' ? '#0066cc' : '#f0f0f0',
                color: view === 'announcements' ? 'white' : '#000',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
              }}
            >
              📢 Announcements
            </button>
            <button
              onClick={() => setView('mail')}
              style={{
                flex: 1,
                padding: '8px 12px',
                backgroundColor: view === 'mail' ? '#0066cc' : '#f0f0f0',
                color: view === 'mail' ? 'white' : '#000',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
              }}
            >
              📧 Mail
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {view === 'messages' && (
              <button
                onClick={() => {
                  setModalType('message');
                  setShowNewConversationModal(true);
                }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                }}
              >
                ➕ Start Message
              </button>
            )}
            {view === 'announcements' && (
              <button
                onClick={() => {
                  setModalType('announcement');
                  setShowNewConversationModal(true);
                }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                }}
              >
                ➕ Create Announcement
              </button>
            )}
            {view === 'mail' && (
              <button
                onClick={() => {
                  setModalType('mail');
                  setShowNewConversationModal(true);
                }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                }}
              >
                ➕ Send Mail
              </button>
            )}
          </div>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4" style={{ color: '#999', fontSize: '13px' }}>
              No {view === 'messages' ? 'messages' : 'mail'} yet
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 group ${
                  selectedConversation?.id === conv.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {/* Conversation Title/Subject */}
                    <h3 className="font-medium text-sm truncate" style={{ color: '#000' }}>
                      {conv.title ||
                        (conv.type === 'direct'
                          ? conv.participants.find((p) => p.userId !== session?.user?.id)?.user.name
                          : conv.class?.name || conv.event?.title || conv.organization?.name || 'Conversation')}
                    </h3>
                    {/* Conversation Type Badge */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.05)', color: '#666' }}>
                        {conv.type === 'direct' ? 'Direct' : conv.type === 'organization' ? 'Announcement' : conv.type}
                      </span>
                      {conv.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    {/* Last Message Preview */}
                    <p className="text-xs mt-1 truncate" style={{ color: '#666' }}>
                      {conv.messages[0]?.content || 'No messages yet'}
                    </p>
                  </div>
                  {conv.createdBy?.id === session?.user?.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Delete this conversation?')) {
                          handleDeleteConversation(conv.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Messages View */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Conversation Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: '#000' }}>
                    {selectedConversation.title ||
                      (selectedConversation.type === 'direct'
                        ? selectedConversation.participants.find((p) => p.userId !== session?.user?.id)?.user.name
                        : selectedConversation.class?.name || selectedConversation.event?.title || selectedConversation.organization?.name)}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.05)', color: '#666' }}>
                      {selectedConversation.type === 'direct'
                        ? '💬 Direct'
                        : selectedConversation.type === 'organization'
                        ? '📢 Announcement'
                        : `📋 ${selectedConversation.type}`}
                    </span>
                    <span className="text-xs" style={{ color: '#999' }}>
                      {selectedConversation.participants.length}{' '}
                      {selectedConversation.participants.length === 1 ? 'participant' : 'participants'}
                    </span>
                    {selectedConversation.isMail && !selectedConversation.allowReplies && (
                      <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#fff3cd', color: '#856404' }}>
                        Replies disabled
                      </span>
                    )}
                  </div>
                </div>
                {selectedConversation.type !== 'direct' && (
                  <button
                    onClick={handleArchiveConversation}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#f0f0f0',
                      color: '#666',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                    }}
                  >
                    Archive
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-sm" style={{ color: '#333' }}>
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender.id === session?.user?.id ? 'justify-end' : 'justify-start'} group w-full`}>
                    <div style={{ position: 'relative', display: 'flex', gap: '0.5rem', alignItems: 'flex-start', maxWidth: msg.googleDocUrl ? '95%' : '80%', width: msg.googleDocUrl ? '100%' : 'auto' }}>
                      <div
                        className={`px-4 py-2 rounded ${
                          msg.sender.id === session?.user?.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                        style={{ width: msg.googleDocUrl ? '100%' : 'auto' }}
                      >
                        {msg.sender.id !== session?.user?.id && (
                          <p className="text-xs font-semibold mb-1">{msg.sender.name}</p>
                        )}
                        <p className="text-sm">{msg.content}</p>
                        {msg.googleDocUrl && (
                          <div style={{ marginTop: '0.75rem', marginBottom: '0.5rem', width: '100%' }}>
                            <div style={{ marginBottom: '0.5rem' }}>
                              <a
                                href={msg.googleDocUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-block',
                                  padding: '6px 12px',
                                  backgroundColor: msg.sender.id === session?.user?.id ? 'rgba(255,255,255,0.2)' : '#4285F4',
                                  color: msg.sender.id === session?.user?.id ? 'white' : 'white',
                                  textDecoration: 'none',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  border: 'none',
                                }}
                              >
                                📄 Open in Google Docs
                              </a>
                            </div>
                            <iframe
                              src={msg.googleDocUrl}
                              style={{
                                width: '100%',
                                height: '600px',
                                border: 'none',
                                borderRadius: '4px',
                              }}
                              title="Embedded Google Doc"
                            />
                          </div>
                        )}
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      {msg.sender.id === session?.user?.id && (
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className={selectedConversation?.isMail ? 'text-xs' : 'opacity-0 group-hover:opacity-100 transition-opacity text-xs'}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: selectedConversation?.isMail ? '#dc3545' : 'rgba(0,0,0,0.1)',
                            color: selectedConversation?.isMail ? 'white' : '#666',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            marginTop: '0.5rem',
                          }}
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            {selectedConversation.isMail && !selectedConversation.allowReplies ? (
              <div className="p-4 border-t border-gray-200 text-center">
                <p style={{ color: '#999', fontSize: '13px' }}>Replies are disabled for this announcement</p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200" style={{ backgroundColor: '#fafafa' }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <textarea
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Type a message..."
                    style={{ color: '#000' }}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <input
                    type="text"
                    value={googleDocUrl}
                    onChange={(e) => setGoogleDocUrl(e.target.value)}
                    placeholder="Paste Google Doc URL (optional)"
                    style={{ color: '#000' }}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="submit"
                    disabled={!messageContent.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center" style={{ color: '#999' }}>
              <p>Select a conversation to view messages</p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showNewConversationModal && modalType === 'message' && (
        <StartMessageModal onClose={() => {
          setShowNewConversationModal(false);
          setModalType(null);
        }} onSuccess={() => {
          setShowNewConversationModal(false);
          setModalType(null);
          fetchConversations();
        }} />
      )}

      {showNewConversationModal && modalType === 'announcement' && (
        <CreateAnnouncementModal defaultOrgSlug={defaultOrgSlug} onClose={() => {
          setShowNewConversationModal(false);
          setModalType(null);
        }} onSuccess={() => {
          setShowNewConversationModal(false);
          setModalType(null);
          fetchConversations();
        }} />
      )}

      {showNewConversationModal && modalType === 'mail' && (
        <SendMailModal onClose={() => {
          setShowNewConversationModal(false);
          setModalType(null);
        }} onSuccess={() => {
          setShowNewConversationModal(false);
          setModalType(null);
          fetchConversations();
        }} />
      )}
    </div>
  );
}

function StartMessageModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { data: session } = useSession();
  const [tab, setTab] = useState<'people' | 'communities' | 'classes'>('people');
  const [selectedPeople, setSelectedPeople] = useState<Set<string>>(new Set());
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [people, setPeople] = useState<(User & { id: string })[]>([]);
  const [communities, setCommunities] = useState<Array<{ id: string; name: string }>>([]);
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([]);
  const [organizations, setOrganizations] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [selectedOrgSlug, setSelectedOrgSlug] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orgRes = await fetch('/api/me/organizations');
        if (orgRes.ok) {
          const orgData = await orgRes.json();
          setOrganizations(orgData.organizations);
          if (orgData.organizations.length > 0) {
            setSelectedOrgSlug(orgData.organizations[0].slug);
          }
        }
      } catch (error) {
        console.error('Failed to fetch organizations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch members when selected organization changes
  useEffect(() => {
    const fetchOrgData = async () => {
      if (!selectedOrgSlug) return;

      try {
        setLoading(true);

        // Fetch members
        const membersRes = await fetch(`/api/organizations/${selectedOrgSlug}/members`);
        if (membersRes.ok) {
          const membersData = await membersRes.json();
          const filtered = membersData.members
            .filter((m: any) => m.user.id !== session?.user?.id)
            .map((m: any) => m.user);
          setPeople(filtered);
        }

        // Fetch communities
        const communitiesRes = await fetch(`/api/organizations/${selectedOrgSlug}/communities`);
        if (communitiesRes.ok) {
          const communitiesData = await communitiesRes.json();
          setCommunities(communitiesData.communities || []);
        }

        // Fetch classes
        const classesRes = await fetch(`/api/organizations/${selectedOrgSlug}/classes`);
        if (classesRes.ok) {
          const classesData = await classesRes.json();
          setClasses(classesData.classes || []);
        }
      } catch (error) {
        console.error('Failed to fetch org data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrgData();
  }, [selectedOrgSlug, session?.user?.id]);

  const togglePerson = (personId: string) => {
    const newSelected = new Set(selectedPeople);
    if (newSelected.has(personId)) {
      newSelected.delete(personId);
    } else {
      newSelected.add(personId);
    }
    setSelectedPeople(newSelected);
  };

  const filteredPeople = people.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateMessage = async () => {
    let body: any = {
      type: 'direct',
      isMail: false,
      allowReplies: true,
    };

    if (tab === 'people') {
      if (selectedPeople.size === 0) {
        alert('Please select at least one person');
        return;
      }
      body.participantIds = Array.from(selectedPeople);
    } else if (tab === 'communities') {
      if (!selectedCommunity) {
        alert('Please select a community');
        return;
      }
      body.type = 'community';
      body.communityIds = [selectedCommunity];
    } else if (tab === 'classes') {
      if (!selectedClass) {
        alert('Please select a class');
        return;
      }
      body.type = 'class';
      body.classId = selectedClass;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const error = await res.json();
        alert(`Failed to start message: ${error.error}`);
      }
    } catch (err) {
      console.error('Failed to create message:', err);
      alert('Failed to start message');
    } finally {
      setCreating(false);
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
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ color: '#000', fontSize: '24px', fontWeight: '700', margin: '0 0 1rem 0' }}>
          Start a Message
        </h2>

        {/* Organization Selector */}
        {organizations.length > 1 && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: '#000', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
              Organization
            </label>
            <select
              value={selectedOrgSlug}
              onChange={(e) => {
                setSelectedOrgSlug(e.target.value);
                setSelectedPeople(new Set());
                setSelectedCommunity(null);
                setSelectedClass(null);
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#000',
              }}
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.slug}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', borderBottom: '1px solid #e0e0e0' }}>
          <button
            onClick={() => {
              setTab('people');
              setSearchQuery('');
              setSelectedCommunity(null);
              setSelectedClass(null);
            }}
            style={{
              flex: 1,
              padding: '10px 12px',
              backgroundColor: tab === 'people' ? 'transparent' : 'transparent',
              color: tab === 'people' ? '#0066cc' : '#666',
              border: 'none',
              borderBottom: tab === 'people' ? '2px solid #0066cc' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: tab === 'people' ? '600' : '500',
              fontSize: '14px',
              marginBottom: '-1px',
            }}
          >
            People
          </button>
          <button
            onClick={() => {
              setTab('communities');
              setSearchQuery('');
              setSelectedPeople(new Set());
              setSelectedClass(null);
            }}
            style={{
              flex: 1,
              padding: '10px 12px',
              backgroundColor: 'transparent',
              color: tab === 'communities' ? '#0066cc' : '#666',
              border: 'none',
              borderBottom: tab === 'communities' ? '2px solid #0066cc' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: tab === 'communities' ? '600' : '500',
              fontSize: '14px',
              marginBottom: '-1px',
            }}
          >
            Communities
          </button>
          <button
            onClick={() => {
              setTab('classes');
              setSearchQuery('');
              setSelectedPeople(new Set());
              setSelectedCommunity(null);
            }}
            style={{
              flex: 1,
              padding: '10px 12px',
              backgroundColor: 'transparent',
              color: tab === 'classes' ? '#0066cc' : '#666',
              border: 'none',
              borderBottom: tab === 'classes' ? '2px solid #0066cc' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: tab === 'classes' ? '600' : '500',
              fontSize: '14px',
              marginBottom: '-1px',
            }}
          >
            Classes
          </button>
        </div>

        {/* Search Input - only for people */}
        {tab === 'people' && (
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
        )}

        {/* Content based on tab */}
        <div style={{
          backgroundColor: '#f9f9f9',
          border: '1px solid #e0e0e0',
          borderRadius: '6px',
          flex: 1,
          minHeight: '200px',
          maxHeight: '300px',
          overflowY: 'auto',
          marginBottom: '1rem',
        }}>
          {loading ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#999', fontSize: '13px' }}>
              Loading...
            </div>
          ) : tab === 'people' ? (
            // People list
            filteredPeople.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#999', fontSize: '13px' }}>
                {searchQuery ? 'No matches found' : 'No members available'}
              </div>
            ) : (
              filteredPeople.map((person) => (
                <div
                  key={person.id}
                  style={{
                    padding: '10px 12px',
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    backgroundColor: selectedPeople.has(person.id) ? '#f0f7ff' : 'transparent',
                  }}
                  onClick={() => togglePerson(person.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedPeople.has(person.id)}
                    onChange={() => togglePerson(person.id)}
                    style={{
                      cursor: 'pointer',
                      width: '16px',
                      height: '16px',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, color: '#000', fontSize: '14px', fontWeight: '500' }}>
                      {person.name}
                    </p>
                    <p style={{ margin: 0, color: '#999', fontSize: '12px' }}>
                      {person.email}
                    </p>
                  </div>
                </div>
              ))
            )
          ) : tab === 'communities' ? (
            // Communities list
            communities.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#999', fontSize: '13px' }}>
                No communities available
              </div>
            ) : (
              communities.map((community) => (
                <div
                  key={community.id}
                  style={{
                    padding: '10px 12px',
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    backgroundColor: selectedCommunity === community.id ? '#f0f7ff' : 'transparent',
                  }}
                  onClick={() => setSelectedCommunity(selectedCommunity === community.id ? null : community.id)}
                >
                  <input
                    type="radio"
                    name="community"
                    checked={selectedCommunity === community.id}
                    onChange={() => setSelectedCommunity(community.id)}
                    style={{
                      cursor: 'pointer',
                      width: '16px',
                      height: '16px',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <p style={{ margin: 0, color: '#000', fontSize: '14px', fontWeight: '500', flex: 1 }}>
                    {community.name}
                  </p>
                </div>
              ))
            )
          ) : (
            // Classes list
            classes.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#999', fontSize: '13px' }}>
                No classes available
              </div>
            ) : (
              classes.map((cls) => (
                <div
                  key={cls.id}
                  style={{
                    padding: '10px 12px',
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    backgroundColor: selectedClass === cls.id ? '#f0f7ff' : 'transparent',
                  }}
                  onClick={() => setSelectedClass(selectedClass === cls.id ? null : cls.id)}
                >
                  <input
                    type="radio"
                    name="class"
                    checked={selectedClass === cls.id}
                    onChange={() => setSelectedClass(cls.id)}
                    style={{
                      cursor: 'pointer',
                      width: '16px',
                      height: '16px',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <p style={{ margin: 0, color: '#000', fontSize: '14px', fontWeight: '500', flex: 1 }}>
                    {cls.name}
                  </p>
                </div>
              ))
            )
          )}
        </div>

        {/* Selected count/item */}
        {tab === 'people' && selectedPeople.size > 0 && (
          <div style={{
            padding: '8px 12px',
            backgroundColor: '#f0f7ff',
            borderRadius: '6px',
            marginBottom: '1rem',
            fontSize: '13px',
            color: '#0066cc',
            fontWeight: '500',
          }}>
            {selectedPeople.size} person{selectedPeople.size !== 1 ? 's' : ''} selected
          </div>
        )}
        {tab === 'communities' && selectedCommunity && (
          <div style={{
            padding: '8px 12px',
            backgroundColor: '#f0f7ff',
            borderRadius: '6px',
            marginBottom: '1rem',
            fontSize: '13px',
            color: '#0066cc',
            fontWeight: '500',
          }}>
            {communities.find(c => c.id === selectedCommunity)?.name} selected
          </div>
        )}
        {tab === 'classes' && selectedClass && (
          <div style={{
            padding: '8px 12px',
            backgroundColor: '#f0f7ff',
            borderRadius: '6px',
            marginBottom: '1rem',
            fontSize: '13px',
            color: '#0066cc',
            fontWeight: '500',
          }}>
            {classes.find(c => c.id === selectedClass)?.name} selected
          </div>
        )}

        {/* Action Buttons */}
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
            onClick={handleCreateMessage}
            disabled={
              creating ||
              (tab === 'people' && selectedPeople.size === 0) ||
              (tab === 'communities' && !selectedCommunity) ||
              (tab === 'classes' && !selectedClass)
            }
            style={{
              padding: '10px 16px',
              backgroundColor: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              opacity:
                creating ||
                (tab === 'people' && selectedPeople.size === 0) ||
                (tab === 'communities' && !selectedCommunity) ||
                (tab === 'classes' && !selectedClass)
                  ? 0.6
                  : 1,
            }}
          >
            {creating ? 'Creating...' : 'Start Message'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateAnnouncementModal({ onClose, onSuccess, defaultOrgSlug }: { onClose: () => void; onSuccess: () => void; defaultOrgSlug?: string }) {
  const { data: session } = useSession();
  const [tab, setTab] = useState<'all' | 'people' | 'communities' | 'classes' | 'departments'>('all');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [allowReplies, setAllowReplies] = useState(true);
  const [selectedPeople, setSelectedPeople] = useState<Set<string>>(new Set());
  const [selectedCommunities, setSelectedCommunities] = useState<Set<string>>(new Set());
  const [selectedDepartments, setSelectedDepartments] = useState<Set<string>>(new Set());
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [people, setPeople] = useState<(User & { id: string })[]>([]);
  const [communities, setCommunities] = useState<Array<{ id: string; name: string }>>([]);
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([]);
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [organizations, setOrganizations] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [selectedOrgSlug, setSelectedOrgSlug] = useState<string>(defaultOrgSlug || '');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [googleDocUrl, setGoogleDocUrl] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orgRes = await fetch('/api/me/organizations');
        if (orgRes.ok) {
          const orgData = await orgRes.json();
          setOrganizations(orgData.organizations);
          if (orgData.organizations.length > 0) {
            // If defaultOrgSlug is provided, try to use that; otherwise use the first org
            if (defaultOrgSlug) {
              const defaultOrg = orgData.organizations.find((o: any) => o.slug === defaultOrgSlug);
              setSelectedOrgSlug(defaultOrg?.slug || orgData.organizations[0].slug);
            } else {
              setSelectedOrgSlug(orgData.organizations[0].slug);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch organizations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [defaultOrgSlug]);

  useEffect(() => {
    const fetchOrgData = async () => {
      if (!selectedOrgSlug) return;
      try {
        setLoading(true);
        const [membersRes, communitiesRes, classesRes, departmentsRes] = await Promise.all([
          fetch(`/api/organizations/${selectedOrgSlug}/members`),
          fetch(`/api/organizations/${selectedOrgSlug}/communities`),
          fetch(`/api/organizations/${selectedOrgSlug}/classes`),
          fetch(`/api/organizations/${selectedOrgSlug}/departments`),
        ]);

        if (membersRes.ok) {
          const membersData = await membersRes.json();
          const filtered = membersData.members
            .filter((m: any) => m.user.id !== session?.user?.id)
            .map((m: any) => m.user);
          setPeople(filtered);
        }

        if (communitiesRes.ok) {
          const communitiesData = await communitiesRes.json();
          setCommunities(communitiesData.communities || []);
        }

        if (classesRes.ok) {
          const classesData = await classesRes.json();
          setClasses(classesData.classes || []);
        }

        if (departmentsRes.ok) {
          const departmentsData = await departmentsRes.json();
          setDepartments(departmentsData.departments || []);
        }
      } catch (error) {
        console.error('Failed to fetch org data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrgData();
  }, [selectedOrgSlug, session?.user?.id]);

  const handleSendAnnouncement = async () => {
    if (!subject.trim() || !message.trim()) {
      alert('Please enter both subject and message');
      return;
    }

    setSending(true);
    try {
      const orgId = organizations.find(o => o.slug === selectedOrgSlug)?.id;
      console.log('📢 [CreateAnnouncementModal] handleSendAnnouncement:', {
        selectedOrgSlug,
        organizations: organizations.map(o => ({ name: o.name, slug: o.slug, id: o.id })),
        foundOrgId: orgId,
        subject,
        tab,
      });

      let body: any = {
        type: 'organization',
        isMail: true,
        allowReplies: allowReplies,
        title: subject,
        organizationId: orgId,
      };

      if (tab === 'people' && selectedPeople.size > 0) {
        body.participantIds = Array.from(selectedPeople);
      } else if (tab === 'communities' && selectedCommunities.size > 0) {
        body.communityIds = Array.from(selectedCommunities);
      } else if (tab === 'classes' && selectedClass) {
        body.classId = selectedClass;
      } else if (tab === 'departments' && selectedDepartments.size > 0) {
        body.departmentIds = Array.from(selectedDepartments);
      }

      console.log('📢 [CreateAnnouncementModal] Sending POST /api/conversations:', body);
      const convRes = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      console.log('📢 [CreateAnnouncementModal] Response status:', convRes.status);
      if (!convRes.ok) {
        const error = await convRes.json();
        console.error('📢 [CreateAnnouncementModal] Error response:', error);
        alert(`Failed to send announcement: ${error.error}`);
        return;
      }

      const convData = await convRes.json();
      const conversationId = convData.conversation.id;
      console.log('📢 [CreateAnnouncementModal] Conversation created:', {
        id: conversationId,
        ...convData.conversation,
      });

      const msgRes = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: message,
          googleDocUrl: googleDocUrl || null,
        }),
      });

      if (msgRes.ok) {
        onSuccess();
      } else {
        alert('Announcement sent but failed to send initial message');
      }
    } catch (err) {
      console.error('Failed to send announcement:', err);
      alert('Failed to send announcement');
    } finally {
      setSending(false);
    }
  };

  const filteredPeople = people.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ color: '#000', fontSize: '24px', fontWeight: '700', margin: 0 }}>
            Send Announcement
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#999',
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ color: '#000', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Announcement subject..."
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
            Send to:
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['all', 'people', 'communities', 'classes', 'departments'].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t as any);
                  setSearchQuery('');
                  setSelectedPeople(new Set());
                  setSelectedCommunities(new Set());
                  setSelectedDepartments(new Set());
                  setSelectedClass(null);
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: tab === t ? '#5fc7df' : '#f0f0f0',
                  color: tab === t ? 'white' : '#000',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: tab === t ? '600' : '500',
                  fontSize: '13px',
                }}
              >
                {t === 'all' ? 'All Members' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {tab !== 'all' && (
          <>
            {tab === 'people' && (
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder="Search people..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: '#000',
                    boxSizing: 'border-box',
                    marginBottom: '0.5rem',
                  }}
                />
                <div style={{
                  backgroundColor: '#f9f9f9',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  maxHeight: '150px',
                  overflowY: 'auto',
                }}>
                  {filteredPeople.map((person) => (
                    <div
                      key={person.id}
                      style={{
                        padding: '8px 12px',
                        borderBottom: '1px solid #f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        const newSelected = new Set(selectedPeople);
                        if (newSelected.has(person.id)) {
                          newSelected.delete(person.id);
                        } else {
                          newSelected.add(person.id);
                        }
                        setSelectedPeople(newSelected);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPeople.has(person.id)}
                        onChange={() => {}}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span style={{ fontSize: '13px', color: '#000' }}>{person.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'communities' && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  backgroundColor: '#f9f9f9',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  maxHeight: '150px',
                  overflowY: 'auto',
                }}>
                  {communities.map((community) => (
                    <div
                      key={community.id}
                      style={{
                        padding: '8px 12px',
                        borderBottom: '1px solid #f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        const newSelected = new Set(selectedCommunities);
                        if (newSelected.has(community.id)) {
                          newSelected.delete(community.id);
                        } else {
                          newSelected.add(community.id);
                        }
                        setSelectedCommunities(newSelected);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCommunities.has(community.id)}
                        onChange={() => {
                          const newSelected = new Set(selectedCommunities);
                          if (newSelected.has(community.id)) {
                            newSelected.delete(community.id);
                          } else {
                            newSelected.add(community.id);
                          }
                          setSelectedCommunities(newSelected);
                        }}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span style={{ fontSize: '13px', color: '#000' }}>{community.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'classes' && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  backgroundColor: '#f9f9f9',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  maxHeight: '150px',
                  overflowY: 'auto',
                }}>
                  {classes.map((cls) => (
                    <div
                      key={cls.id}
                      style={{
                        padding: '8px 12px',
                        borderBottom: '1px solid #f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        backgroundColor: selectedClass === cls.id ? '#f0f7ff' : 'transparent',
                      }}
                      onClick={() => setSelectedClass(selectedClass === cls.id ? null : cls.id)}
                    >
                      <input
                        type="radio"
                        name="class"
                        checked={selectedClass === cls.id}
                        onChange={() => setSelectedClass(selectedClass === cls.id ? null : cls.id)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span style={{ fontSize: '13px', color: '#000' }}>{cls.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'departments' && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  backgroundColor: '#f9f9f9',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  maxHeight: '150px',
                  overflowY: 'auto',
                }}>
                  {departments.map((dept) => (
                    <div
                      key={dept.id}
                      style={{
                        padding: '8px 12px',
                        borderBottom: '1px solid #f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        const newSelected = new Set(selectedDepartments);
                        if (newSelected.has(dept.id)) {
                          newSelected.delete(dept.id);
                        } else {
                          newSelected.add(dept.id);
                        }
                        setSelectedDepartments(newSelected);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedDepartments.has(dept.id)}
                        onChange={() => {
                          const newSelected = new Set(selectedDepartments);
                          if (newSelected.has(dept.id)) {
                            newSelected.delete(dept.id);
                          } else {
                            newSelected.add(dept.id);
                          }
                          setSelectedDepartments(newSelected);
                        }}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span style={{ fontSize: '13px', color: '#000' }}>{dept.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            id="allowReplies"
            checked={allowReplies}
            onChange={(e) => setAllowReplies(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <label
            htmlFor="allowReplies"
            style={{
              color: '#000',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            Allow people to reply to this announcement
          </label>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ color: '#000', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your announcement message here..."
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#000',
              boxSizing: 'border-box',
              minHeight: '100px',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ color: '#000', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
            Google Doc URL (optional)
          </label>
          <input
            type="text"
            value={googleDocUrl}
            onChange={(e) => setGoogleDocUrl(e.target.value)}
            placeholder="Paste Google Doc URL..."
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
            onClick={handleSendAnnouncement}
            disabled={sending || !subject.trim() || !message.trim()}
            style={{
              padding: '10px 16px',
              backgroundColor: '#5fc7df',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              opacity: sending || !subject.trim() || !message.trim() ? 0.6 : 1,
            }}
          >
            {sending ? 'Sending...' : 'Send Announcement'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SendMailModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { data: session } = useSession();
  const [tab, setTab] = useState<'people' | 'communities' | 'classes'>('people');
  const [selectedPeople, setSelectedPeople] = useState<Set<string>>(new Set());
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [people, setPeople] = useState<(User & { id: string })[]>([]);
  const [communities, setCommunities] = useState<Array<{ id: string; name: string }>>([]);
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([]);
  const [organizations, setOrganizations] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [selectedOrgSlug, setSelectedOrgSlug] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [googleDocUrl, setGoogleDocUrl] = useState('');
  const [allowReplies, setAllowReplies] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orgRes = await fetch('/api/me/organizations');
        if (orgRes.ok) {
          const orgData = await orgRes.json();
          setOrganizations(orgData.organizations);
          if (orgData.organizations.length > 0) {
            setSelectedOrgSlug(orgData.organizations[0].slug);
          }
        }
      } catch (error) {
        console.error('Failed to fetch organizations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch members when selected organization changes
  useEffect(() => {
    const fetchOrgData = async () => {
      if (!selectedOrgSlug) return;

      try {
        setLoading(true);

        // Fetch members
        const membersRes = await fetch(`/api/organizations/${selectedOrgSlug}/members`);
        if (membersRes.ok) {
          const membersData = await membersRes.json();
          const filtered = membersData.members
            .filter((m: any) => m.user.id !== session?.user?.id)
            .map((m: any) => m.user);
          setPeople(filtered);
        }

        // Fetch communities
        const communitiesRes = await fetch(`/api/organizations/${selectedOrgSlug}/communities`);
        if (communitiesRes.ok) {
          const communitiesData = await communitiesRes.json();
          setCommunities(communitiesData.communities || []);
        }

        // Fetch classes
        const classesRes = await fetch(`/api/organizations/${selectedOrgSlug}/classes`);
        if (classesRes.ok) {
          const classesData = await classesRes.json();
          setClasses(classesData.classes || []);
        }
      } catch (error) {
        console.error('Failed to fetch org data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrgData();
  }, [selectedOrgSlug, session?.user?.id]);

  const togglePerson = (personId: string) => {
    const newSelected = new Set(selectedPeople);
    if (newSelected.has(personId)) {
      newSelected.delete(personId);
    } else {
      newSelected.add(personId);
    }
    setSelectedPeople(newSelected);
  };

  const filteredPeople = people.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMail = async () => {
    if (!subject.trim() || !message.trim()) {
      alert('Please enter both subject and message');
      return;
    }

    let body: any = {
      type: 'direct',
      isMail: true,
      allowReplies: allowReplies,
      title: subject,
    };

    if (tab === 'people') {
      if (selectedPeople.size === 0) {
        alert('Please select at least one person');
        return;
      }
      body.participantIds = Array.from(selectedPeople);
    } else if (tab === 'communities') {
      if (!selectedCommunity) {
        alert('Please select a community');
        return;
      }
      body.type = 'community';
      body.communityIds = [selectedCommunity];
    } else if (tab === 'classes') {
      if (!selectedClass) {
        alert('Please select a class');
        return;
      }
      body.type = 'class';
      body.classId = selectedClass;
    }

    setSending(true);
    try {
      // Create conversation
      const convRes = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!convRes.ok) {
        const error = await convRes.json();
        alert(`Failed to send mail: ${error.error}`);
        return;
      }

      const convData = await convRes.json();
      const conversationId = convData.conversation.id;

      // Send initial message
      const msgRes = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: message,
          googleDocUrl: googleDocUrl.trim() || null,
        }),
      });

      if (msgRes.ok) {
        onSuccess();
      } else {
        console.error('Message creation failed, status:', msgRes.status);
        let errorData: any = {};
        try {
          errorData = await msgRes.json();
        } catch (e) {
          const text = await msgRes.text();
          console.error('Response text:', text);
          errorData = { error: 'Unknown error', status: msgRes.status, body: text };
        }
        console.error('Full error response:', errorData);
        alert(`Mail sent but failed to send initial message: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Failed to send mail:', err);
      alert('Failed to send mail');
    } finally {
      setSending(false);
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
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ color: '#000', fontSize: '24px', fontWeight: '700', margin: '0 0 1rem 0' }}>
          Send Mail
        </h2>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '1rem' }}>
          Send one-way messages that recipients cannot reply to
        </p>

        {/* Organization Selector */}
        {organizations.length > 1 && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: '#000', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
              Organization
            </label>
            <select
              value={selectedOrgSlug}
              onChange={(e) => {
                setSelectedOrgSlug(e.target.value);
                setSelectedPeople(new Set());
                setSelectedCommunity(null);
                setSelectedClass(null);
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#000',
              }}
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.slug}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Subject and Message Inputs */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ color: '#000', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., Important Update"
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
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message here..."
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#000',
              boxSizing: 'border-box',
              minHeight: '80px',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ color: '#000', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
            Embedded Google Doc (optional)
          </label>
          <input
            type="text"
            value={googleDocUrl}
            onChange={(e) => setGoogleDocUrl(e.target.value)}
            placeholder="Paste Google Doc URL..."
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

        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            id="allowReplies"
            checked={allowReplies}
            onChange={(e) => setAllowReplies(e.target.checked)}
            style={{
              width: '18px',
              height: '18px',
              cursor: 'pointer',
            }}
          />
          <label
            htmlFor="allowReplies"
            style={{
              color: '#000',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            Allow recipients to reply
          </label>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', borderBottom: '1px solid #e0e0e0' }}>
          <button
            onClick={() => {
              setTab('people');
              setSearchQuery('');
              setSelectedCommunity(null);
              setSelectedClass(null);
            }}
            style={{
              flex: 1,
              padding: '10px 12px',
              backgroundColor: 'transparent',
              color: tab === 'people' ? '#0066cc' : '#666',
              border: 'none',
              borderBottom: tab === 'people' ? '2px solid #0066cc' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: tab === 'people' ? '600' : '500',
              fontSize: '14px',
              marginBottom: '-1px',
            }}
          >
            People
          </button>
          <button
            onClick={() => {
              setTab('communities');
              setSearchQuery('');
              setSelectedPeople(new Set());
              setSelectedClass(null);
            }}
            style={{
              flex: 1,
              padding: '10px 12px',
              backgroundColor: 'transparent',
              color: tab === 'communities' ? '#0066cc' : '#666',
              border: 'none',
              borderBottom: tab === 'communities' ? '2px solid #0066cc' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: tab === 'communities' ? '600' : '500',
              fontSize: '14px',
              marginBottom: '-1px',
            }}
          >
            Communities
          </button>
          <button
            onClick={() => {
              setTab('classes');
              setSearchQuery('');
              setSelectedPeople(new Set());
              setSelectedCommunity(null);
            }}
            style={{
              flex: 1,
              padding: '10px 12px',
              backgroundColor: 'transparent',
              color: tab === 'classes' ? '#0066cc' : '#666',
              border: 'none',
              borderBottom: tab === 'classes' ? '2px solid #0066cc' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: tab === 'classes' ? '600' : '500',
              fontSize: '14px',
              marginBottom: '-1px',
            }}
          >
            Classes
          </button>
        </div>

        {/* Search Input - only for people */}
        {tab === 'people' && (
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
        )}

        {/* Content based on tab */}
        <div style={{
          backgroundColor: '#f9f9f9',
          border: '1px solid #e0e0e0',
          borderRadius: '6px',
          flex: 1,
          minHeight: '150px',
          maxHeight: '250px',
          overflowY: 'auto',
          marginBottom: '1rem',
        }}>
          {loading ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#999', fontSize: '13px' }}>
              Loading...
            </div>
          ) : tab === 'people' ? (
            filteredPeople.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#999', fontSize: '13px' }}>
                {searchQuery ? 'No matches found' : 'No members available'}
              </div>
            ) : (
              filteredPeople.map((person) => (
                <div
                  key={person.id}
                  style={{
                    padding: '10px 12px',
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    backgroundColor: selectedPeople.has(person.id) ? '#f0f7ff' : 'transparent',
                  }}
                  onClick={() => togglePerson(person.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedPeople.has(person.id)}
                    onChange={() => togglePerson(person.id)}
                    style={{
                      cursor: 'pointer',
                      width: '16px',
                      height: '16px',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, color: '#000', fontSize: '14px', fontWeight: '500' }}>
                      {person.name}
                    </p>
                    <p style={{ margin: 0, color: '#999', fontSize: '12px' }}>
                      {person.email}
                    </p>
                  </div>
                </div>
              ))
            )
          ) : tab === 'communities' ? (
            communities.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#999', fontSize: '13px' }}>
                No communities available
              </div>
            ) : (
              communities.map((community) => (
                <div
                  key={community.id}
                  style={{
                    padding: '10px 12px',
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    backgroundColor: selectedCommunity === community.id ? '#f0f7ff' : 'transparent',
                  }}
                  onClick={() => setSelectedCommunity(selectedCommunity === community.id ? null : community.id)}
                >
                  <input
                    type="radio"
                    name="community"
                    checked={selectedCommunity === community.id}
                    onChange={() => setSelectedCommunity(community.id)}
                    style={{
                      cursor: 'pointer',
                      width: '16px',
                      height: '16px',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <p style={{ margin: 0, color: '#000', fontSize: '14px', fontWeight: '500', flex: 1 }}>
                    {community.name}
                  </p>
                </div>
              ))
            )
          ) : (
            classes.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#999', fontSize: '13px' }}>
                No classes available
              </div>
            ) : (
              classes.map((cls) => (
                <div
                  key={cls.id}
                  style={{
                    padding: '10px 12px',
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    backgroundColor: selectedClass === cls.id ? '#f0f7ff' : 'transparent',
                  }}
                  onClick={() => setSelectedClass(selectedClass === cls.id ? null : cls.id)}
                >
                  <input
                    type="radio"
                    name="class"
                    checked={selectedClass === cls.id}
                    onChange={() => setSelectedClass(cls.id)}
                    style={{
                      cursor: 'pointer',
                      width: '16px',
                      height: '16px',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <p style={{ margin: 0, color: '#000', fontSize: '14px', fontWeight: '500', flex: 1 }}>
                    {cls.name}
                  </p>
                </div>
              ))
            )
          )}
        </div>

        {/* Selected count/item */}
        {tab === 'people' && selectedPeople.size > 0 && (
          <div style={{
            padding: '8px 12px',
            backgroundColor: '#f0f7ff',
            borderRadius: '6px',
            marginBottom: '1rem',
            fontSize: '13px',
            color: '#0066cc',
            fontWeight: '500',
          }}>
            {selectedPeople.size} recipient{selectedPeople.size !== 1 ? 's' : ''}
          </div>
        )}
        {tab === 'communities' && selectedCommunity && (
          <div style={{
            padding: '8px 12px',
            backgroundColor: '#f0f7ff',
            borderRadius: '6px',
            marginBottom: '1rem',
            fontSize: '13px',
            color: '#0066cc',
            fontWeight: '500',
          }}>
            {communities.find(c => c.id === selectedCommunity)?.name}
          </div>
        )}
        {tab === 'classes' && selectedClass && (
          <div style={{
            padding: '8px 12px',
            backgroundColor: '#f0f7ff',
            borderRadius: '6px',
            marginBottom: '1rem',
            fontSize: '13px',
            color: '#0066cc',
            fontWeight: '500',
          }}>
            {classes.find(c => c.id === selectedClass)?.name}
          </div>
        )}

        {/* Action Buttons */}
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
            onClick={handleSendMail}
            disabled={
              sending ||
              !subject.trim() ||
              !message.trim() ||
              (tab === 'people' && selectedPeople.size === 0) ||
              (tab === 'communities' && !selectedCommunity) ||
              (tab === 'classes' && !selectedClass)
            }
            style={{
              padding: '10px 16px',
              backgroundColor: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              opacity:
                sending ||
                !subject.trim() ||
                !message.trim() ||
                (tab === 'people' && selectedPeople.size === 0) ||
                (tab === 'communities' && !selectedCommunity) ||
                (tab === 'classes' && !selectedClass)
                  ? 0.6
                  : 1,
            }}
          >
            {sending ? 'Sending...' : 'Send Mail'}
          </button>
        </div>
      </div>
    </div>
  );
}
