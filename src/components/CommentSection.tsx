
import React, { useState } from 'react';
import { Send } from 'lucide-react';
import type { Comment } from '@/hooks/useFeed';

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  onLoadComments: (postId: string) => void;
  onAddComment: (postId: string, content: string) => Promise<void>;
  getTimeAgo: (dateString: string) => string;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  comments,
  onLoadComments,
  onAddComment,
  getTimeAgo
}) => {
  const [newComment, setNewComment] = useState('');

  const handleAddComment = async () => {
    await onAddComment(postId, newComment);
    setNewComment('');
  };

  return (
    <div className="mt-4 space-y-3">
      {comments.map((comment) => (
        <div key={comment.id} className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 p-0.5">
            <img
              src={comment.profiles.images?.[0] || '/placeholder.svg'}
              alt={comment.profiles.name}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="flex-1">
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-white text-sm font-semibold">{comment.profiles.name}</p>
              <p className="text-gray-300 text-sm">{comment.content}</p>
            </div>
            <p className="text-gray-500 text-xs mt-1">{getTimeAgo(comment.created_at)}</p>
          </div>
        </div>
      ))}

      <div className="flex items-center space-x-3 mt-4">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-white/10 border border-white/20 rounded-xl py-2 px-3 text-white placeholder-gray-400"
          onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
        />
        <button
          onClick={handleAddComment}
          className="p-2 bg-purple-500 rounded-xl hover:bg-purple-600 transition-colors"
        >
          <Send size={16} className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default CommentSection;
