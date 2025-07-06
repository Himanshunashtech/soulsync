
import React, { useRef } from 'react';
import { X } from 'lucide-react';

interface PostImagePreviewProps {
  images: string[];
  onRemoveImage: (index: number) => void;
  onSortImages: (images: string[]) => void;
  selectedFilter: string;
}

const PostImagePreview: React.FC<PostImagePreviewProps> = ({
  images,
  onRemoveImage,
  onSortImages,
  selectedFilter,
}) => {
  const dragImage = useRef<number | null>(null);
  const dragOverImage = useRef<number | null>(null);

  const handleSort = () => {
    if (dragImage.current === null || dragOverImage.current === null) return;
    const newImages = [...images];
    const draggedImageContent = newImages.splice(dragImage.current, 1)[0];
    newImages.splice(dragOverImage.current, 0, draggedImageContent);
    dragImage.current = null;
    dragOverImage.current = null;
    onSortImages(newImages);
  };

  return (
    <div className="mb-4">
      <p className="text-sm text-slate-400 mb-2">Drag to reorder images</p>
      <div className="flex overflow-x-auto space-x-2 pb-2">
        {images.map((image, index) => (
          <div
            key={index}
            draggable
            onDragStart={() => (dragImage.current = index)}
            onDragEnter={() => (dragOverImage.current = index)}
            onDragEnd={handleSort}
            onDragOver={(e) => e.preventDefault()}
            className="relative flex-shrink-0 w-24 h-24 cursor-move"
          >
            <img src={image} alt={`Post preview ${index + 1}`} className={`w-full h-full object-cover rounded-xl transition-all duration-300 ${selectedFilter}`} />
            <button
              onClick={() => onRemoveImage(index)}
              className="absolute top-1 right-1 bg-black/50 backdrop-blur-sm rounded-full p-1 hover:bg-black/70 transition-colors z-10"
            >
              <X size={12} className="text-white" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostImagePreview;
