
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { ScreenName } from './useNavigation';

export const useProfile = (
    currentScreen: ScreenName, 
    setCurrentScreen: (screen: ScreenName) => void
) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const screenRef = useRef(currentScreen);
  screenRef.current = currentScreen;

  const loadProfile = useCallback(async () => {
    if (!user) {
        setProfile(null);
        setProfileLoading(false);
        return;
    }
    
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        if (error.code === 'PGRST116') { // Profile not found
          if (screenRef.current !== 'onboarding') {
             setCurrentScreen('onboarding');
          }
        }
        setProfile(null);
      } else {
        setProfile(data);
        const onboardingComplete = data && data.gender && data.interested_in && Array.isArray(data.images) && data.images.length >= 6;

        if (!onboardingComplete) {
          if (screenRef.current !== 'onboarding') {
            setCurrentScreen('onboarding');
          }
        } else if (['welcome', 'auth-signup', 'auth-login', 'onboarding', 'forgot-password'].includes(screenRef.current)) {
          setCurrentScreen('discover');
        }
      }
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, [user, setCurrentScreen]);

  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      setProfile(null);
      setProfileLoading(false);
    }
  }, [user, loadProfile]);

  return { profile, profileLoading, loadProfile };
};
