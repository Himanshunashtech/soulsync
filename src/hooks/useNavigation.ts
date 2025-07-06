
import { useState } from 'react';

export type ScreenName = 
  | 'welcome' 
  | 'auth-signup' 
  | 'auth-login'
  | 'auth-confirm-email'
  | 'forgot-password'
  | 'onboarding' 
  | 'profile' 
  | 'matches' 
  | 'chat' 
  | 'discover' 
  | 'feed' 
  | 'settings'
  | 'dating-preferences'
  | 'location'
  | 'notification-settings'
  | 'privacy-settings'
  | 'blocked-users'
  | 'login-activity'
  | 'report-problem'
  | 'help-center'
  | 'privacy-policy-info'
  | 'terms-of-use'
  | 'about-info'
  | 'api-info'
  | 'ads-info'
  | 'accessibility-info'
  | 'app-version'
  | 'policies-info'
  | 'open-source-licenses';

export const useNavigation = (initialScreen: ScreenName = 'welcome') => {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>(initialScreen);
  const [matchId, setMatchId] = useState<string | undefined>(undefined);
  const [navParams, setNavParams] = useState<any>(undefined);

  const navigateToScreen = (screen: ScreenName, targetId?: string, params?: any) => {
    setCurrentScreen(screen);
    setNavParams(params);
    if (screen === 'chat' && targetId) {
      setMatchId(targetId);
    } else {
      setMatchId(undefined);
    }
  };
  
  const handleBottomNavigation = (screen: string) => {
    if (['discover', 'matches', 'feed', 'profile'].includes(screen)) {
      navigateToScreen(screen as ScreenName);
    }
  };

  return {
    currentScreen,
    setCurrentScreen,
    navigateToScreen,
    matchId,
    navParams,
    handleBottomNavigation,
  };
};
