
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useImageUpload } from '@/hooks/useImageUpload';
import { supabase } from '@/integrations/supabase/client';
import PostTagging from './post/PostTagging';
import PostImagePreview from './post/PostImagePreview';
import PostFilterSelector from './post/PostFilterSelector';
import CreatePostActions from './post/CreatePostActions';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose, SheetFooter } from '@/components/ui/sheet';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePost: (content: string, imageUrls: string[], taggedUserIds: string[]) => Promise<void>;
}

const filters = [
  { name: 'None', class: '' },
  { name: 'Moon', class: 'grayscale' },
  { name: 'Sepia', class: 'sepia' },
  { name: 'Aden', class: 'hue-rotate-[-20deg] contrast-90 saturate-85 brightness-120' },
  { name: 'Perpetua', class: 'contrast-110 saturate-110' },
  { name: 'Juno', class: 'contrast-120 saturate-140' },
  { name: 'Lark', class: 'contrast-90' },
  { name: 'Inkwell', class: 'grayscale contrast-125 brightness-110' },
  { name: 'Clarendon', class: 'contrast-120 saturate-125' },
];

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onCreatePost }) => {
  const { user } = useAuth();
  const { uploadFile, uploading } = useImageUpload();
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImages, setNewPostImages] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('');
  const [taggedUsers, setTaggedUsers] = useState<{ id: string, name: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{ id: string; name: string }[]>([]);

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || !user) return;

    const uploadPromises = Array.from(files).map(file => uploadFile(file, user.id, 'post-images'));
    
    const results = await Promise.all(uploadPromises);
    const validUrls = results.filter((url): url is string => url !== null);

    setNewPostImages(prev => [...prev, ...validUrls].slice(0, 10)); // Limit to 10 images
  };

  const removeImage = (indexToRemove: number) => {
    setNewPostImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSearchUsers = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const excludeUserIds = user ? [user.id, ...taggedUsers.map(u => u.id)] : taggedUsers.map(u => u.id);
      
      const { data, error } = await supabase.rpc('search_users_for_tagging', {
        p_search_query: query,
        p_exclude_user_ids: excludeUserIds,
      });

      if (error) throw error;
      setSearchResults(data || []);
    } catch(error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const addTaggedUser = (user: { id: string, name: string }) => {
    if (!taggedUsers.some(tu => tu.id === user.id) && taggedUsers.length < 10) {
        setTaggedUsers(prev => [...prev, user]);
    }
    setSearchQuery('');
    setSearchResults([]);
  }

  const removeTaggedUser = (userId: string) => {
      setTaggedUsers(prev => prev.filter(u => u.id !== userId));
  }

  const handleCreatePost = async () => {
    const taggedUserIds = taggedUsers.map(u => u.id);
    await onCreatePost(newPostContent, newPostImages, taggedUserIds);
    setNewPostContent('');
    setNewPostImages([]);
    setSelectedFilter('');
    setTaggedUsers([]);
    setSearchQuery('');
    setSearchResults([]);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-full bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white border-t-0 flex flex-col p-0 sm:max-w-full">
        <SheetHeader className="p-4 sm:p-6 text-left border-b border-white/10">
            <div className="flex items-center justify-between">
                <SheetTitle className="text-xl font-bold text-white">Create Post</SheetTitle>
                <SheetClose asChild>
                    <button
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X size={20} className="text-white" />
                    </button>
                </SheetClose>
            </div>
        </SheetHeader>

        <div className="flex-grow overflow-y-auto px-4 sm:px-6 py-4">
            {/* User info */}
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-0.5">
                <div className="w-full h-full bg-white/10 rounded-full"></div>
              </div>
              <span className="ml-3 font-semibold text-slate-200">You</span>
            </div>

            <PostTagging
              searchQuery={searchQuery}
              onSearchQueryChange={handleSearchUsers}
              isSearching={isSearching}
              searchResults={searchResults}
              onAddTaggedUser={addTaggedUser}
              taggedUsers={taggedUsers}
              onRemoveTaggedUser={removeTaggedUser}
              searchQueryLength={searchQuery.length}
            />

            {/* Content input */}
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full resize-none mb-4 bg-white/5 border border-white/20 rounded-2xl py-4 px-4 text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 transition-colors"
              rows={4}
            />

            {newPostImages.length > 0 && (
              <PostImagePreview
                images={newPostImages}
                onRemoveImage={removeImage}
                onSortImages={setNewPostImages}
                selectedFilter={selectedFilter}
              />
            )}

            {newPostImages.length > 0 && (
              <PostFilterSelector
                filters={filters}
                selectedFilter={selectedFilter}
                onSelectFilter={setSelectedFilter}
                previewImage={newPostImages[0]}
              />
            )}
        </div>

        <SheetFooter className="p-4 sm:p-6 bg-black/20 border-t border-white/10">
          <CreatePostActions
            onClose={onClose}
            onImageUpload={handleImageUpload}
            imageCount={newPostImages.length}
            maxImages={10}
            onCreatePost={handleCreatePost}
            uploading={uploading}
            canPost={!!newPostContent.trim() || newPostImages.length > 0}
          />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CreatePostModal;
