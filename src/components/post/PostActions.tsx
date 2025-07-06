
import React from 'react';
import { Heart, MessageCircle, Share } from 'lucide-react';
import type { Post } from '@/hooks/useFeed';

interface PostActionsProps {
  post: Post;
  onToggleLike: (postId: string, currentlyLiked: boolean) => Promise<void>;
  onCommentToggle: () => void;
  onShareClick: () => void;
  selectedPostForComments: string | null;
}

const PostActions: React.FC<PostActionsProps> = ({ post, onToggleLike, onCommentToggle, onShareClick, selectedPostForComments }) => {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => onToggleLike(post.id, post.user_liked)}
          className="flex items-center space-x-1 group"
        >
          <Heart
            size={24}
            className={`transition-all duration-300 ${
              post.user_liked 
                ? 'text-pink-500 fill-current scale-110' 
                : 'text-slate-300 hover:text-pink-500 hover:scale-110'
            }`}
          />
        </button>

        <button
          onClick={onCommentToggle}
          className="flex items-center space-x-1 group"
        >
          <MessageCircle 
            size={24} 
            className={`text-slate-300 hover:text-purple-400 transition-colors group-hover:scale-110 ${
              selectedPostForComments === post.id ? 'text-purple-400' : ''
            }`} 
          />
        </button>

        <button 
          onClick={onShareClick}
          className="flex items-center space-x-1 group"
        >
          <Share size={24} className="text-slate-300 hover:text-blue-400 transition-colors group-hover:scale-110" />
        </button>
      </div>
    </div>
  );
};

export default PostActions;
