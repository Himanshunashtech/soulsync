
import React from 'react';
import type { Post } from '@/hooks/useFeed';

interface PostContentProps {
  post: Post;
  onCommentToggle: () => void;
}

const PostContent: React.FC<PostContentProps> = ({ post, onCommentToggle }) => {
  return (
    <>
      {/* Likes count */}
      {post.likes_count > 0 && (
        <div className="mb-2">
          <span className="text-white font-semibold text-sm">
            {post.likes_count} {post.likes_count === 1 ? 'like' : 'likes'}
          </span>
        </div>
      )}

      {/* Post Content */}
      {post.content && (
        <div className="mb-2">
          <span className="text-white font-semibold text-sm mr-2">{post.profiles.name}</span>
          <span className="text-slate-300 text-sm whitespace-pre-wrap">{post.content}</span>
        </div>
      )}

      {/* Tagged users */}
      {post.post_tags && post.post_tags.length > 0 && (
        <div className="text-sm text-slate-400 mb-2">
          with{' '}
          {post.post_tags.map((tag, index) => (
            <React.Fragment key={tag.user_id}>
              <span className="font-semibold text-slate-300 hover:underline cursor-pointer">
                @{tag.profiles.name}
              </span>
              {index < post.post_tags.length - 1 && ', '}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* View comments */}
      {post.comments_count > 0 && (
        <button
          onClick={onCommentToggle}
          className="text-slate-400 text-sm mb-2 hover:text-purple-400 transition-colors"
        >
          View all {post.comments_count} comments
        </button>
      )}
    </>
  );
};

export default PostContent;
