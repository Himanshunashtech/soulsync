
import React from 'react';
import { Heart, X, Star } from 'lucide-react';

interface DiscoverActionButtonsProps {
  onSwipe: (direction: 'left' | 'right' | 'super') => void;
  currentProfileExists: boolean;
}

const DiscoverActionButtons: React.FC<DiscoverActionButtonsProps> = ({ onSwipe, currentProfileExists }) => {
  if (!currentProfileExists) {
    return null;
  }

  return (
    <div className="px-6 pb-6 pt-6">
      <div className="flex items-center justify-center space-x-4 sm:space-x-6">
        <button
          onClick={() => onSwipe('left')}
          className="bg-white/5 border-2 border-white/10 p-3 sm:p-4 rounded-full text-white hover:bg-white/10 transition-transform transform hover:scale-110 shadow-lg"
          title="Pass"
        >
          <X size={24} className="sm:w-7 sm:h-7" />
        </button>
        <button
          onClick={() => onSwipe('super')}
          className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 p-4 sm:p-5 rounded-full text-white shadow-xl hover:scale-110 transition-transform transform"
          title="Super Like"
        >
          <Star size={20} className="sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={() => onSwipe('right')}
          className="bg-gradient-to-r from-emerald-400 to-cyan-400 p-3 sm:p-4 rounded-full text-white shadow-lg hover:scale-110 transition-transform transform border-2 border-emerald-300/50"
          title="Like"
        >
          <Heart size={24} className="sm:w-7 sm:h-7" />
        </button>
      </div>
    </div>
  );
};

export default DiscoverActionButtons;
