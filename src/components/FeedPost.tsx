
import React, { useState } from 'react';
import type { Post, Comment } from '@/hooks/useFeed';
import { useAuth } from '@/hooks/useAuth';
import CommentSection from './CommentSection';
import SharePostModal from './SharePostModal'; // Import the new modal
import PostImageCarousel from './PostImageCarousel';
import PostHeader from './post/PostHeader';
import PostActions from './post/PostActions';
import PostContent from './post/PostContent';

interface FeedPostProps {
  post: Post;
  comments: { [key: string]: Comment[] };
  onToggleLike: (postId: string, currentlyLiked: boolean) => Promise<void>;
  onLoadComments: (postId: string) => void;
  onAddComment: (postId: string, content: string) => Promise<void>;
  onDeletePost: (postId: string) => Promise<void>;
  getTimeAgo: (dateString: string) => string;
}

const FeedPost: React.FC<FeedPostProps> = ({
  post,
  comments,
  onToggleLike,
  onLoadComments,
  onAddComment,
  onDeletePost,
  getTimeAgo
}) => {
  const { user } = useAuth();
  const [selectedPostForComments, setSelectedPostForComments] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false); // State for share modal

  const handleCommentToggle = () => {
    const isCurrentlySelected = selectedPostForComments === post.id;
    setSelectedPostForComments(isCurrentlySelected ? null : post.id);
    if (!isCurrentlySelected) {
      onLoadComments(post.id);
    }
  };
  
  const handleShareClick = () => {
    setShowShareModal(true);
  };

  const isOwnPost = user?.id === post.user_id;

  return (
    <> {/* Fragment to wrap post and modal */}
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <PostHeader
          post={post}
          getTimeAgo={getTimeAgo}
          isOwnPost={isOwnPost}
          onDeletePost={onDeletePost}
        />

        {/* Post Image */}
        {(post.post_images && post.post_images.length > 0) ? (
            <PostImageCarousel images={post.post_images} />
        ) : post.image_url ? (
            <div className="w-full">
                <img src={post.image_url} alt="Post" className="w-full max-h-[500px] object-cover" />
            </div>
        ) : null}

        {/* Post Actions & Content */}
        <div className="p-4">
          <PostActions
            post={post}
            onToggleLike={onToggleLike}
            onCommentToggle={handleCommentToggle}
            onShareClick={handleShareClick}
            selectedPostForComments={selectedPostForComments}
          />
          <PostContent
            post={post}
            onCommentToggle={handleCommentToggle}
          />

          {/* Comments Section */}
          {selectedPostForComments === post.id && (
            <CommentSection
              postId={post.id}
              comments={comments[post.id] || []}
              onLoadComments={onLoadComments}
              onAddComment={onAddComment}
              getTimeAgo={getTimeAgo}
            />
          )}
        </div>
      </div>
      {/* Share Post Modal */}
      {showShareModal && (
        <SharePostModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          postToShare={post}
        />
      )}
    </>
  );
};

export default FeedPost;
