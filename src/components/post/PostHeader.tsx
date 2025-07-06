
import React, { useState } from 'react';
import { MoreVertical, Trash2 } from 'lucide-react';
import type { Post } from '@/hooks/useFeed';

interface PostHeaderProps {
  post: Post;
  getTimeAgo: (dateString: string) => string;
  isOwnPost: boolean;
  onDeletePost: (postId: string) => Promise<void>;
}

const PostHeader: React.FC<PostHeaderProps> = ({ post, getTimeAgo, isOwnPost, onDeletePost }) => {
  const [showPostOptionsMenu, setShowPostOptionsMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteLocalPost = async () => {
    if (deleting) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this post?');
    if (!confirmed) return;

    setDeleting(true);
    try {
      await onDeletePost(post.id);
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setDeleting(false);
      setShowPostOptionsMenu(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-pink-500 to-purple-600 p-0.5">
          <img
            src={post.profiles.images?.[0] || '/placeholder.svg'}
            alt={post.profiles.name}
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        <div className="ml-3">
          <h3 className="text-white font-semibold text-sm">{post.profiles.name}</h3>
          <p className="text-slate-300 text-xs">{getTimeAgo(post.created_at)}</p>
        </div>
      </div>
      
      {isOwnPost && (
        <div className="relative">
          <button
            onClick={() => setShowPostOptionsMenu(!showPostOptionsMenu)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <MoreVertical size={16} className="text-slate-300" />
          </button>
          
          {showPostOptionsMenu && (
            <div className="absolute right-0 top-10 bg-slate-800 border border-white/10 rounded-xl py-2 z-10 min-w-[120px] shadow-lg">
              <button
                onClick={handleDeleteLocalPost}
                disabled={deleting}
                className="flex items-center space-x-2 w-full px-4 py-2 text-red-400 hover:bg-red-600/10 transition-colors disabled:opacity-50"
              >
                <Trash2 size={16} />
                <span className="text-sm">{deleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostHeader;
