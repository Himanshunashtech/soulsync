
import React from 'react';
import { Heart } from 'lucide-react';

interface EmptyChatPlaceholderProps {
  matchProfileName?: string;
}

const EmptyChatPlaceholder: React.FC<EmptyChatPlaceholderProps> = ({ matchProfileName }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="w-20 h-20 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center mb-4">
        <Heart size={32} className="text-white" />
      </div>
      <h3 className="text-slate-700 text-xl font-semibold mb-2">It's a Match!</h3>
      <p className="text-slate-500">
        {matchProfileName ? `You and ${matchProfileName} have liked each other.` : 'You have a new match!'}
        <br />
        Start the conversation!
      </p>
    </div>
  );
};

export default EmptyChatPlaceholder;
