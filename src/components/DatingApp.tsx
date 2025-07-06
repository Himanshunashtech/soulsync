
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigation } from '@/hooks/useNavigation';
import { useProfile } from '@/hooks/useProfile';
import AuthenticatedApp from './AuthenticatedApp';
import UnauthenticatedApp from './UnauthenticatedApp';

const DatingApp = () => {
  const { user, loading: authLoading, isConfirmationPending } = useAuth();
  const { 
    currentScreen, 
    setCurrentScreen, 
    navigateToScreen, 
    matchId,
    handleBottomNavigation,
  } = useNavigation('welcome');
  
  const { profile, profileLoading, loadProfile } = useProfile(currentScreen, setCurrentScreen);

  useEffect(() => {
    if (isConfirmationPending) {
      setCurrentScreen('auth-confirm-email');
    }
  }, [isConfirmationPending, setCurrentScreen]);

  useEffect(() => {
    if (!user) {
      if (!['welcome', 'auth-signup', 'auth-login', 'forgot-password'].includes(currentScreen)) {
        setCurrentScreen('welcome');
      }
    }
  }, [user, currentScreen, setCurrentScreen]);

  if (authLoading || (user && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
        <div className="text-center">
          <div className="text-6xl mb-4 bubble-effect">👻</div>
          <div className="text-primary text-xl font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <UnauthenticatedApp 
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
        onAuthComplete={loadProfile}
      />
    );
  }

  return (
    <AuthenticatedApp
      profile={profile}
      currentScreen={currentScreen}
      navigateToScreen={navigateToScreen}
      handleBottomNavigation={handleBottomNavigation}
      onOnboardingComplete={loadProfile}
      matchId={matchId}
    />
  );
};

export default DatingApp;
