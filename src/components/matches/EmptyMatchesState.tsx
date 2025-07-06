
import React from 'react';
import { Heart } from 'lucide-react';

interface EmptyMatchesStateProps {
  onNavigateToDiscover: () => void;
}

const EmptyMatchesState: React.FC<EmptyMatchesStateProps> = ({ onNavigateToDiscover }) => {
  return (
    <div className="flex flex-col items-center justify-center mt-20 px-6">
      <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
        <Heart size={40} className="text-white" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-4">No matches yet</h3>
      <p className="text-slate-300 text-center mb-6">
        Start swiping to find your perfect match!
      </p>
      <button
        onClick={onNavigateToDiscover}
        className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-3 px-8 rounded-2xl shadow-lg hover:shadow-pink-600/40 hover:scale-105 transition-all"
      >
        Start Discovering
      </button>
    </div>
  );
};

export default EmptyMatchesState;
