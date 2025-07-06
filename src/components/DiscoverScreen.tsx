import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DiscoverHeader from './DiscoverHeader';
import UniverseTags from './UniverseTags';
import ProfileCardArea from './ProfileCardArea';
import DiscoverActionButtons from './DiscoverActionButtons';

// Exporting Profile interface for ProfileCardArea
export interface Profile {
  id: string;
  user_id: string;
  name: string;
  age: number | null;
  bio: string | null;
  images: string[] | null;
  location: string | null;
  gender: string | null;
  interests: string[] | null; // Still string[] here, but DB query handles text
  mbti: string | null;
  zodiac: string | null;
  is_visible: boolean;
}

interface DiscoverScreenProps {
  onNavigate: (screen: string) => void;
}

const DiscoverScreen: React.FC<DiscoverScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  useEffect(() => {
    if (userProfile) {
      loadProfiles();
    }
  }, [userProfile]);

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('interested_in, gender, location') 
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadProfiles = async () => {
    if (!user || !userProfile) return;
    setLoading(true);
    try {
      const { data: swipedProfiles } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', user.id);

      const swipedIds = swipedProfiles?.map(s => s.swiped_id) || [];

      let query = supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user.id)
        .eq('is_visible', true);

      if (userProfile?.interested_in && userProfile.interested_in !== 'Everyone') {
        query = query.eq('gender', userProfile.interested_in);
      }
      
      if (swipedIds.length > 0) {
        query = query.not('user_id', 'in', `(${swipedIds.join(',')})`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProfiles(data || []);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right' | 'super') => {
    const currentProfile = profiles[currentIndex];
    if (!currentProfile || !user) return;

    try {
      const { error: swipeError } = await supabase
        .from('swipes')
        .insert({
          swiper_id: user.id,
          swiped_id: currentProfile.user_id,
          direction,
        });

      if (swipeError) throw swipeError;

      if (direction === 'right' || direction === 'super') {
        const likeType = direction === 'right' ? 'like' : 'super_like';
        const { error: likeRequestError } = await supabase
          .from('like_requests')
          .insert({
            sender_id: user.id,
            receiver_id: currentProfile.user_id,
            type: likeType,
            status: 'pending',
          });

        if (likeRequestError) {
          if (likeRequestError.code === '23505') { 
            console.log('Pending like request already exists for this user.');
          } else {
            throw likeRequestError;
          }
        } else {
          console.log(`Like request (${likeType}) sent to ${currentProfile.name}`);
        }
      }

      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      console.error('Error recording swipe or like request:', error);
    }
  };

  const currentProfileData = profiles[currentIndex];

  if (loading && profiles.length === 0 && !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
        <div className="text-center">
          <div className="text-6xl mb-4 bubble-effect">👻</div>
          <div className="text-primary text-xl font-medium">Finding your soul connections...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      <DiscoverHeader />
      <UniverseTags />

      <div className="flex-1 flex items-center justify-center px-6 pt-4">
        <ProfileCardArea
          currentProfileData={currentProfileData}
          loading={loading && profiles.length > 0}
          profilesAvailable={profiles.length > 0 && currentIndex < profiles.length}
          onSwipe={handleSwipe}
        />
      </div>

      <DiscoverActionButtons
        onSwipe={handleSwipe}
        currentProfileExists={!!currentProfileData}
      />
    </div>
  );
};

export default DiscoverScreen;
