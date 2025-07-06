
import React from 'react';

interface Profile {
  user_id: string;
  name: string;
  age: number | null;
  images: string[] | null;
  bio?: string;
  location?: string;
  interests?: string[];
  gender?: string;
  mbti?: string;
  zodiac?: string;
}

interface MatchItem {
  id: string;
  profiles: Profile;
}

interface NewMatchesCarouselProps {
  matches: MatchItem[];
  onProfileClick: (profile: Profile) => void;
}

const NewMatchesCarousel: React.FC<NewMatchesCarouselProps> = ({ matches, onProfileClick }) => {
  if (matches.length === 0) {
    return (
      <div className="px-6 py-6 bg-white/5 backdrop-blur-md">
        <h2 className="text-xl font-semibold text-white mb-4">New Matches</h2>
        <p className="text-slate-400">No new matches to display here yet. Start swiping!</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-6 bg-white/5 backdrop-blur-md">
      <h2 className="text-xl font-semibold text-white mb-4">New Matches</h2>
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {matches.slice(0, 6).map((match) => (
          <div
            key={match.id}
            className="flex-shrink-0 relative cursor-pointer transform hover:scale-105 transition-all duration-300"
            onClick={() => onProfileClick(match.profiles)}
          >
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/5 p-0.5 border border-white/10">
              <img
                src={match.profiles.images?.[0] || '/placeholder.svg'}
                alt={match.profiles.name}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-sm">
              {/* This random percentage seems like placeholder, adjust if needed */}
              {Math.floor(Math.random() * 20) + 80}%
            </div>
            <p className="text-white text-sm font-medium mt-2 text-center">{match.profiles.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewMatchesCarousel;
