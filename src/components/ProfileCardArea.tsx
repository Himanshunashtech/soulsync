
import React from 'react';
import SwipeCard from './SwipeCard';
import { Profile } from './DiscoverScreen'; // Assuming Profile type is exported or moved

interface ProfileCardAreaProps {
  currentProfileData: Profile | undefined;
  loading: boolean; // This is the loading state while profiles are being fetched *after* initial load
  profilesAvailable: boolean; // True if profiles array is not empty
  onSwipe: (direction: 'left' | 'right' | 'super') => void;
}

const ProfileCardArea: React.FC<ProfileCardAreaProps> = ({ currentProfileData, loading, profilesAvailable, onSwipe }) => {
  if (loading && profilesAvailable) { // Loading new profiles while some were already there
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
        <div className="text-primary text-xl font-medium">Loading new profiles...</div>
      </div>
    );
  }

  if (currentProfileData) {
    return (
      <div className="relative w-full max-w-sm">
        <SwipeCard
          profile={{
            id: currentProfileData.id,
            name: currentProfileData.name,
            age: currentProfileData.age || 0,
            image: currentProfileData.images?.[0] || '/placeholder.svg',
            bio: currentProfileData.bio || 'No bio yet.',
            location: currentProfileData.location || 'Unknown location',
            compatibility: Math.floor(Math.random() * 20) + 80, // This was random, keeping it for now
          }}
          onSwipe={onSwipe}
        />
      </div>
    );
  }

  // This case handles when there are no more profiles to show (currentIndex >= profiles.length)
  // and not in an intermediate loading state for new profiles.
  if (!loading && !currentProfileData) {
    return (
      <div className="bg-white/10 border border-white/10 backdrop-blur-md p-8 rounded-3xl text-center text-white">
        <div className="text-6xl mb-6 bubble-effect">👻</div>
        <h3 className="text-3xl font-bold mb-4">No more souls to discover</h3>
        <p className="text-slate-300 text-lg mb-6">
          Try changing your filters or check back later for new connections ✨
        </p>
        <div className="flex justify-center gap-2 text-2xl">
          <span className="floating-emoji">🌙</span>
          <span className="bubble-effect">💖</span>
          <span className="floating-emoji">⭐</span>
        </div>
      </div>
    );
  }
  
  return null; // Should not be reached if logic is correct, or covers initial empty state before first load completes
};

export default ProfileCardArea;
