
import React from 'react';
import type { Match } from '@/types/matches';

interface MatchGridItemProps {
  match: Match;
  onNavigateToChat: (matchId: string) => void;
}

const MatchGridItem: React.FC<MatchGridItemProps> = ({ match, onNavigateToChat }) => {
  const { profiles: profile } = match;

  return (
    <div 
      className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg group cursor-pointer bg-slate-800"
      onClick={() => onNavigateToChat(match.id)}
    >
      <img
        src={profile.images?.[0] || '/placeholder.svg'}
        alt={profile.name}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
      <div className="absolute bottom-0 left-0 p-4 text-white">
        <p className="font-bold text-lg">
          {profile.name}{profile.age ? `, ${profile.age}` : ''}
        </p>
      </div>
    </div>
  );
};

export default MatchGridItem;
