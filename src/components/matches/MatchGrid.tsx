
import React from 'react';
import type { Match } from '@/types/matches';
import MatchGridItem from './MatchGridItem';

interface MatchGridProps {
  matches: Match[];
  onNavigateToChat: (matchId: string) => void;
}

const MatchGrid: React.FC<MatchGridProps> = ({ matches, onNavigateToChat }) => {
  return (
    <div className="px-6 my-6">
       <h2 className="text-xl font-semibold text-white mb-4">
        Matches <span className="text-slate-400 font-normal">{matches.length}</span>
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {matches.map((match) => (
          <MatchGridItem
            key={match.id}
            match={match}
            onNavigateToChat={onNavigateToChat}
          />
        ))}
      </div>
    </div>
  );
};

export default MatchGrid;
