'use client';

import { useEffect, useState } from 'react';
import { MessageCircle, Send, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { commentsApi } from '@/lib/api';
import type { Comment } from '@/types';

interface CommentSectionProps {
  lessonId: string;
}

export default function CommentSection({ lessonId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    commentsApi.list(lessonId)
      .then((res) => setComments(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lessonId]);

  const handlePost = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await commentsApi.create(lessonId, { content: newComment });
      setComments((prev) => [res.data, ...prev]);
      setNewComment('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyText.trim()) return;
    try {
      const res = await commentsApi.create(lessonId, { content: replyText, parent_id: parentId });
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId ? { ...c, replies: [...c.replies, res.data] } : c
        )
      );
      setReplyText('');
      setReplyTo(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await commentsApi.delete(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8 pl-4 border-l-2 border-dark-700' : ''} mb-3`}>
      <div className="p-3 rounded-lg bg-dark-700/50">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center text-xs font-bold">
              {comment.username[0].toUpperCase()}
            </div>
            <span className="text-sm font-medium text-white">{comment.username}</span>
            <span className="text-xs text-dark-500">{new Date(comment.created_at).toLocaleDateString()}</span>
            {comment.is_solution && (
              <span className="badge bg-green-500/20 text-green-400 text-xs">Solution</span>
            )}
          </div>
          <button
            onClick={() => handleDelete(comment.id)}
            className="text-dark-500 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-dark-200 text-sm">{comment.content}</p>
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
            className="text-xs text-dark-400 hover:text-primary-400 transition-colors"
          >
            Reply
          </button>
          {comment.replies.length > 0 && (
            <button
              onClick={() => toggleExpand(comment.id)}
              className="text-xs text-dark-400 hover:text-white flex items-center gap-1"
            >
              {expanded.has(comment.id) ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>
      </div>

      {replyTo === comment.id && (
        <div className="ml-8 mt-2 flex gap-2">
          <input
            className="input text-sm py-1.5"
            placeholder="Write a reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleReply(comment.id)}
          />
          <button
            onClick={() => handleReply(comment.id)}
            className="btn-primary text-xs py-1.5"
          >
            <Send className="w-3 h-3" />
          </button>
        </div>
      )}

      {expanded.has(comment.id) && comment.replies.map((r) => renderComment(r, true))}
    </div>
  );

  return (
    <div className="card" id="comments">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-primary-400" />
        Discussion ({comments.length})
      </h3>

      <div className="flex gap-2 mb-6">
        <input
          className="input"
          placeholder="Share your thoughts or ask a question..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handlePost()}
        />
        <button onClick={handlePost} className="btn-primary">
          <Send className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1">
        {loading ? (
          <p className="text-dark-500 text-sm text-center py-4">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-dark-500 text-sm text-center py-4">
            No comments yet. Be the first to share!
          </p>
        ) : (
          comments.map((c) => renderComment(c))
        )}
      </div>
    </div>
  );
}
