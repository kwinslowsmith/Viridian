'use client';

import React, { useState, useEffect } from 'react';
import styles from './ParentTeacherMessaging.module.css';

interface Teacher {
  id: string;
  name: string;
  email: string;
  className?: string;
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  sentAt: string;
  isFromParent: boolean;
}

interface TeacherConversation {
  teacher: Teacher;
  conversationId?: string;
  unreadCount: number;
  lastMessage?: Message;
  lastMessageAt?: string;
}

interface Props {
  childId: string;
  childName: string;
  parentId: string;
}

export default function ParentTeacherMessaging({
  childId,
  childName,
  parentId,
}: Props) {
  const [teachers, setTeachers] = useState<TeacherConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Load teachers for this child
  useEffect(() => {
    const loadTeachers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `/api/k12/parents/children/${childId}/teachers`
        );
        if (!response.ok) throw new Error('Failed to load teachers');
        const data = await response.json();
        setTeachers(data.teachers || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load teachers'
        );
        console.error('Error loading teachers:', err);
      } finally {
        setLoading(false);
      }
    };

    if (childId) {
      loadTeachers();
    }
  }, [childId]);

  // Load conversation and messages when teacher is selected
  useEffect(() => {
    if (!selectedTeacher || !parentId) return;

    const loadConversation = async () => {
      try {
        // Get or create direct conversation
        const response = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'direct',
            participantId: selectedTeacher.id,
            title: `Chat with ${selectedTeacher.name}`,
          }),
        });

        if (!response.ok) throw new Error('Failed to load conversation');
        const { conversation } = await response.json();
        setConversationId(conversation.id);

        // Load messages
        const messagesResponse = await fetch(
          `/api/conversations/${conversation.id}/messages`
        );
        if (!messagesResponse.ok)
          throw new Error('Failed to load messages');
        const { messages: loadedMessages } = await messagesResponse.json();

        // Map API response to component interface
        const mappedMessages = loadedMessages.map((msg: any) => ({
          id: msg.id,
          text: msg.content,
          senderId: msg.senderId,
          senderName: msg.sender.name,
          sentAt: msg.createdAt,
          isFromParent: msg.senderId === parentId,
        }));
        setMessages(mappedMessages);
      } catch (err) {
        console.error('Error loading conversation:', err);
      }
    };

    loadConversation();
  }, [selectedTeacher, parentId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !selectedTeacher) return;

    try {
      setSendingMessage(true);
      const response = await fetch(
        `/api/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: newMessage,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to send message');
      const message = await response.json();

      // Map response to component's Message interface
      setMessages((prev) => [...prev, {
        id: message.id,
        text: message.content,
        senderId: message.senderId,
        senderName: message.sender.name,
        sentAt: message.createdAt,
        isFromParent: true,
      }]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p className={styles.loadingText}>Loading messages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <p className={styles.errorText}>{error}</p>
      </div>
    );
  }

  if (teachers.length === 0) {
    return (
      <div className={styles.container}>
        <p className={styles.emptyText}>
          No teachers found for {childName}.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.messagingContainer}>
      {/* Teachers List */}
      <div className={styles.teachersList}>
        <h3 className={styles.listTitle}>Teachers</h3>
        <div className={styles.teachersGrid}>
          {teachers.map((tc) => (
            <button
              key={tc.teacher.id}
              className={`${styles.teacherButton} ${
                selectedTeacher?.id === tc.teacher.id
                  ? styles.teacherButtonActive
                  : ''
              }`}
              onClick={() => setSelectedTeacher(tc.teacher)}
            >
              <div className={styles.teacherInfo}>
                <p className={styles.teacherName}>{tc.teacher.name}</p>
                {tc.lastMessage && (
                  <p className={styles.lastMessagePreview}>
                    {tc.lastMessage.text.substring(0, 40)}...
                  </p>
                )}
              </div>
              {tc.unreadCount > 0 && (
                <span className={styles.unreadBadge}>{tc.unreadCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Messages View */}
      {selectedTeacher && (
        <div className={styles.messagesPanel}>
          {/* Header */}
          <div className={styles.messageHeader}>
            <div>
              <h2 className={styles.messageTitle}>{selectedTeacher.name}</h2>
              {selectedTeacher.className && (
                <p className={styles.className}>{selectedTeacher.className}</p>
              )}
            </div>
            <a
              href={`mailto:${selectedTeacher.email}`}
              className={styles.emailLink}
              title="Send email"
            >
              ✉️
            </a>
          </div>

          {/* Messages */}
          <div className={styles.messagesScroll}>
            {messages.length === 0 ? (
              <p className={styles.noMessagesText}>
                No messages yet. Start the conversation!
              </p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`${styles.messageBubble} ${
                    msg.isFromParent
                      ? styles.messageBubbleParent
                      : styles.messageBubbleTeacher
                  }`}
                >
                  <p className={styles.messageSender}>{msg.senderName}</p>
                  <p className={styles.messageText}>{msg.text}</p>
                  <p className={styles.messageTime}>
                    {formatDate(msg.sentAt)}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div className={styles.messageInputContainer}>
            <textarea
              className={styles.messageInput}
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={sendingMessage}
              rows={3}
            />
            <button
              className={styles.sendButton}
              onClick={handleSendMessage}
              disabled={sendingMessage || !newMessage.trim()}
            >
              {sendingMessage ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
