'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardBody, Button, LoadingState, TextArea } from '@/app/components/polymath';
import { useDiscussion, useDiscussionMessages, usePostMessage } from '@/hooks/usePolymath';

export default function DiscussionThreadPage() {
  const params = useParams();
  const slug = params.slug as string;
  const discussionId = params.discussionId as string;
  const { discussion, loading: loadingDiscussion, error: discussionError } = useDiscussion(slug, discussionId);
  const { messages, loading: loadingMessages, error: messagesError, refetch } = useDiscussionMessages(slug, discussionId);
  const { post: postMessage, loading: posting, error: postError } = usePostMessage(slug, discussionId);
  const [messageContent, setMessageContent] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handlePostMessage = async () => {
    if (!messageContent.trim()) {
      setSubmitError('Message cannot be empty');
      return;
    }

    try {
      setSubmitError(null);
      await postMessage(messageContent);
      setMessageContent('');
      refetch();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to post message');
    }
  };

  if (loadingDiscussion || loadingMessages) {
    return <LoadingState message="Loading discussion..." />;
  }

  if (discussionError) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <p className="text-red-800 font-medium">Error loading discussion</p>
          <p className="text-red-600 text-sm">{discussionError}</p>
        </div>
        <Link href={`/polymath/communities/${slug}/discussions`}>
          <Button>Back to Discussions</Button>
        </Link>
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="text-center">
          <p className="text-[#666666] font-medium mb-4">Discussion not found</p>
          <Link href={`/polymath/communities/${slug}/discussions`}>
            <Button>Back to Discussions</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href={`/polymath/communities/${slug}/discussions`} className="text-[#20B2AA] text-sm font-medium mb-4 inline-block hover:underline">
          ← Back to Discussions
        </Link>

        <Card>
          <CardBody className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-[#3C3C3C] mb-2">
                {discussion.title}
              </h1>
              {discussion.isPinned && (
                <div className="inline-block px-3 py-1 bg-[#FFE5B4] text-[#8B4513] text-xs font-medium rounded-full mb-3">
                  📌 Pinned
                </div>
              )}
            </div>

            {discussion.description && (
              <p className="text-[#666666]">{discussion.description}</p>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E5] text-sm text-[#999999]">
              <span>
                Started by {discussion.createdBy?.name || 'Unknown'}
              </span>
              <span>
                {new Date(discussion.createdAt).toLocaleDateString()} at {new Date(discussion.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Messages Thread */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-[#3C3C3C] mb-4">
          Messages ({messages.length})
        </h2>

        {loadingMessages ? (
          <p className="text-[#666666]">Loading messages...</p>
        ) : messagesError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800 font-medium">Error loading messages</p>
            <p className="text-red-600 text-sm">{messagesError}</p>
          </div>
        ) : messages.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <p className="text-[#666666]">No messages yet. Start the conversation!</p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <Card key={message.id}>
                <CardBody className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-[#3C3C3C]">
                        {message.createdBy?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-[#999999] mt-1">
                        {new Date(message.createdAt).toLocaleDateString()} at {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <p className="text-[#666666] mt-3 whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Reply Form */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-[#3C3C3C] mb-4">
          Reply to Discussion
        </h2>
        <Card>
          <CardBody className="space-y-4">
            <TextArea
              placeholder="Write your reply here..."
              value={messageContent}
              onChange={(e) => {
                setMessageContent(e.target.value);
                setSubmitError(null);
              }}
              rows={5}
              disabled={posting}
            />

            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {submitError}
              </div>
            )}

            {postError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {postError}
              </div>
            )}

            <Button
              onClick={handlePostMessage}
              disabled={posting || !messageContent.trim()}
              isLoading={posting}
            >
              {posting ? 'Posting...' : 'Post Reply'}
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
