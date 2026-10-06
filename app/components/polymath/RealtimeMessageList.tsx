'use client';

import React, { useRef, useEffect } from 'react';
import { useRealtimeDiscussionMessages } from '@/hooks/useRealtimeSubscriptions';
import { VirtualList } from '@/hooks/useVirtualScroll';

interface RealtimeMessageListProps {
  communitySlug: string;
  discussionId: string;
  onNewMessage?: (message: any) => void;
  className?: string;
}

export function RealtimeMessageList({
  communitySlug,
  discussionId,
  onNewMessage,
  className,
}: RealtimeMessageListProps) {
  const { messages, loading, error } = useRealtimeDiscussionMessages(
    communitySlug,
    discussionId,
    onNewMessage
  );

  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages.length]);

  if (loading && messages.length === 0) {
    return (
      <div className={className} style={{ padding: '24px', textAlign: 'center', color: '#666' }}>
        Loading messages...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={className}
        style={{
          padding: '16px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#7f1d1d',
        }}
      >
        Error loading messages: {error}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className={className} style={{ padding: '24px', textAlign: 'center', color: '#999' }}>
        No messages yet. Be the first to start the conversation!
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        height: '600px',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '16px',
      }}
    >
      {messages.map((message, index) => (
        <MessageBubble key={message.id || index} message={message} />
      ))}
    </div>
  );
}

// Message bubble component
function MessageBubble({ message }: { message: any }) {
  const isCurrentUser = false; // Would check against session

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
        marginBottom: '8px',
      }}
    >
      <div
        style={{
          maxWidth: '70%',
          padding: '12px',
          borderRadius: '8px',
          backgroundColor: isCurrentUser ? '#3b82f6' : '#e5e7eb',
          color: isCurrentUser ? 'white' : '#1f2937',
          wordWrap: 'break-word',
        }}
      >
        {message.author?.name && (
          <div
            style={{
              fontSize: '12px',
              fontWeight: '600',
              marginBottom: '4px',
              opacity: 0.8,
            }}
          >
            {message.author.name}
          </div>
        )}
        <div style={{ fontSize: '14px' }}>{message.content}</div>
        {message.createdAt && (
          <div
            style={{
              fontSize: '11px',
              marginTop: '4px',
              opacity: 0.7,
            }}
          >
            {new Date(message.createdAt).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}
