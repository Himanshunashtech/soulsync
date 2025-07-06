import React, { useState, useRef } from 'react';
import { Heart, Plus, Sparkles, Star } from 'lucide-react';
import { useFeed } from '@/hooks/useFeed';
import CreatePostModal from './CreatePostModal';
import FeedPost from './FeedPost';

interface FeedScreenProps {
  onNavigate: (screen: string) => void;
}

const FeedScreen: React.FC<FeedScreenProps> = ({ onNavigate }) => {
  const {
    posts,
    loading,
    comments,
    createPost,
    deletePost,
    toggleLike,
    loadComments,
    addComment
  } = useFeed();
  
  const [showCreatePost, setShowCreatePost] = useState(false);
  const touchStartX = useRef(0);

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  };

  const handleCreatePost = async (content: string, imageUrls: string[], taggedUserIds: string[]) => {
    await createPost(content, imageUrls, taggedUserIds);
    setShowCreatePost(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const swipeDistance = touchEndX - touchStartX.current;
    if (swipeDistance > 50) { // Swiped right
      setShowCreatePost(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black">
        <div className="text-center">
          <div className="text-6xl mb-4 bubble-effect">👻</div>
          <div className="text-white text-xl font-medium">Loading your cosmic feed...</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen pb-20 bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/10 bg-slate-900/50 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles size={20} className="text-purple-400" />
            Feed
          </h1>
        </div>
        <button
          onClick={() => setShowCreatePost(true)}
          className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-lg"
        >
          <Plus size={20} className="text-white" />
        </button>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onCreatePost={handleCreatePost}
      />

      {/* Posts - Instagram Style */}
      <div className="space-y-0">
        {posts.map((post) => (
          <FeedPost
            key={post.id}
            post={post}
            comments={comments}
            onToggleLike={toggleLike}
            onLoadComments={loadComments}
            onAddComment={addComment}
            onDeletePost={deletePost}
            getTimeAgo={getTimeAgo}
          />
        ))}

        {posts.length === 0 && (
          <div className="text-center py-20 px-6">
            <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10">
              <div className="text-6xl mb-6 bubble-effect">👻</div>
              <h3 className="text-2xl font-bold text-white mb-4">Share your vibe</h3>
              <p className="text-slate-300 text-lg mb-6">
                Be the first to share your cosmic energy! ✨
              </p>
              <button
                onClick={() => setShowCreatePost(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 text-white font-semibold rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Create Your First Post
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedScreen;
