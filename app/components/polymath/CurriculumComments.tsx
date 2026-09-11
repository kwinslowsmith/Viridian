'use client';

import React, { useState } from 'react';
import { Button, Card, CardBody, TextInput } from './index';

interface Comment {
  id: string;
  author: string;
  authorEmail?: string;
  authorAvatar?: string;
  text: string;
  timestamp: string;
  likes?: number;
  replies?: Comment[];
  isOwner?: boolean;
}

interface CurriculumCommentsProps {
  comments: Comment[];
  onAddComment: (text: string) => void;
  onDeleteComment: (commentId: string) => void;
  onReplyComment: (parentId: string, text: string) => void;
  currentUserName: string;
}

export function CurriculumComments({
  comments,
  onAddComment,
  onDeleteComment,
  onReplyComment,
  currentUserName,
}: CurriculumCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    onAddComment(newComment);
    setNewComment('');
  };

  const handleSubmitReply = (parentId: string) => {
    if (!replyText.trim()) return;
    onReplyComment(parentId, replyText);
    setReplyText('');
    setReplyingTo(null);
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#3C3C3C] mb-2">Comments</h2>
        <p className="text-[#666666]">Collaborate and share feedback with other teachers</p>
      </div>

      {/* Add Comment Form */}
      <Card className="mb-8">
        <CardBody>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-[#20B2AA] text-white flex items-center justify-center font-medium text-sm flex-shrink-0">
              {getInitials(currentUserName)}
            </div>
            <div className="flex-1">
              <textarea
                placeholder="Share your thoughts or suggestions..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#20B2AA] resize-none"
                rows={3}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setNewComment('')}
                  className="px-3 py-2 text-sm font-medium text-[#666666] hover:text-[#3C3C3C]"
                >
                  Cancel
                </button>
                <Button onClick={handleSubmitComment}>Post Comment</Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-12 text-[#666666]">
          <p className="mb-2">No comments yet</p>
          <p className="text-sm">Be the first to share feedback!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id}>
              <Card>
                <CardBody>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#20B2AA]/20 text-[#20B2AA] flex items-center justify-center font-medium text-sm flex-shrink-0">
                      {comment.authorAvatar || getInitials(comment.author)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium text-[#3C3C3C]">
                            {comment.author}
                          </div>
                          <div className="text-xs text-[#999999]">
                            {comment.timestamp}
                          </div>
                        </div>

                        {comment.isOwner && (
                          <button
                            onClick={() => onDeleteComment(comment.id)}
                            className="text-red-500 hover:text-red-700 text-xs font-medium"
                          >
                            Delete
                          </button>
                        )}
                      </div>

                      <p className="text-sm text-[#3C3C3C] mb-3 break-words">
                        {comment.text}
                      </p>

                      <div className="flex gap-4 text-xs">
                        <button
                          onClick={() =>
                            setReplyingTo(replyingTo === comment.id ? null : comment.id)
                          }
                          className="text-[#20B2AA] hover:underline font-medium"
                        >
                          Reply
                        </button>
                        {comment.replies && comment.replies.length > 0 && (
                          <button
                            onClick={() => toggleReplies(comment.id)}
                            className="text-[#666666] hover:underline font-medium"
                          >
                            {expandedReplies.has(comment.id)
                              ? `Hide ${comment.replies.length} reply/replies`
                              : `Show ${comment.replies.length} reply/replies`}
                          </button>
                        )}
                      </div>

                      {/* Reply Form */}
                      {replyingTo === comment.id && (
                        <div className="mt-4 pt-4 border-t border-[#E5E5E5]">
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#20B2AA] text-white flex items-center justify-center font-medium text-xs flex-shrink-0">
                              {getInitials(currentUserName)}
                            </div>
                            <div className="flex-1">
                              <textarea
                                placeholder="Write a reply..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#20B2AA] resize-none"
                                rows={2}
                              />
                              <div className="flex justify-end gap-2 mt-2">
                                <button
                                  onClick={() => {
                                    setReplyingTo(null);
                                    setReplyText('');
                                  }}
                                  className="px-3 py-1.5 text-xs font-medium text-[#666666] hover:text-[#3C3C3C]"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSubmitReply(comment.id)}
                                  className="px-3 py-1.5 text-xs font-medium bg-[#20B2AA] text-white rounded hover:bg-[#1a9490]"
                                >
                                  Reply
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Replies */}
                      {expandedReplies.has(comment.id) &&
                        comment.replies &&
                        comment.replies.length > 0 && (
                          <div className="mt-4 space-y-3 pt-4 border-t border-[#E5E5E5]">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex gap-3 pl-4 border-l-2 border-[#E5E5E5]">
                                <div className="w-8 h-8 rounded-full bg-[#20B2AA]/20 text-[#20B2AA] flex items-center justify-center font-medium text-xs flex-shrink-0">
                                  {reply.authorAvatar || getInitials(reply.author)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="text-xs font-medium text-[#3C3C3C]">
                                        {reply.author}
                                      </div>
                                      <div className="text-xs text-[#999999]">
                                        {reply.timestamp}
                                      </div>
                                    </div>
                                    {reply.isOwner && (
                                      <button
                                        onClick={() => onDeleteComment(reply.id)}
                                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                                      >
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-xs text-[#3C3C3C] mt-1 break-words">
                                    {reply.text}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
