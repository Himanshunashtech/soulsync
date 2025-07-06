
import React from 'react';
import { Camera } from 'lucide-react';

interface CreatePostActionsProps {
  onClose: () => void;
  onImageUpload: (files: FileList | null) => void;
  imageCount: number;
  maxImages: number;
  onCreatePost: () => void;
  uploading: boolean;
  canPost: boolean;
}

const CreatePostActions: React.FC<CreatePostActionsProps> = ({
  onClose,
  onImageUpload,
  imageCount,
  maxImages,
  onCreatePost,
  uploading,
  canPost,
}) => {
  return (
    <div className="flex items-center justify-between">
      <label className="cursor-pointer">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => onImageUpload(e.target.files)}
          className="hidden"
          disabled={imageCount >= maxImages}
        />
        <div className={`p-3 hover:bg-white/10 rounded-full transition-colors ${imageCount >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <Camera size={24} className="text-slate-300 hover:text-white" />
        </div>
      </label>

      <div className="flex space-x-3">
        <button
          onClick={onClose}
          className="px-6 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onCreatePost}
          disabled={uploading || !canPost}
          className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-2xl shadow-md hover:shadow-pink-600/40 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          {uploading ? 'Uploading...' : 'Share'}
        </button>
      </div>
    </div>
  );
};

export default CreatePostActions;
