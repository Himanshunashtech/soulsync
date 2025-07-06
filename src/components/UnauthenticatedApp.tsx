
import React from 'react';
import WelcomeScreen from './WelcomeScreen';
import AuthScreen from './AuthScreen';
import ForgotPasswordScreen from './ForgotPasswordScreen';
import { ScreenName } from '@/hooks/useNavigation';
import ConfirmEmailScreen from './ConfirmEmailScreen';

interface UnauthenticatedAppProps {
  currentScreen: ScreenName;
  setCurrentScreen: (screen: ScreenName) => void;
  onAuthComplete: () => void;
}

const UnauthenticatedApp: React.FC<UnauthenticatedAppProps> = ({ 
  currentScreen, 
  setCurrentScreen,
  onAuthComplete 
}) => {
  switch(currentScreen) {
    case 'welcome':
      return (
        <WelcomeScreen 
          onGetStarted={() => setCurrentScreen('auth-signup')}
          onLogin={() => setCurrentScreen('auth-login')}
        />
      );
    case 'auth-signup':
    case 'auth-login':
      return (
        <AuthScreen 
          onAuthComplete={onAuthComplete}
          onBack={() => setCurrentScreen('welcome')}
          onForgotPassword={() => setCurrentScreen('forgot-password')}
          initialMode={currentScreen === 'auth-login' ? 'login' : 'signup'}
        />
      );
    case 'forgot-password':
      return <ForgotPasswordScreen onBack={() => setCurrentScreen('auth-login')} />;
    case 'auth-confirm-email':
      return <ConfirmEmailScreen onContinue={() => setCurrentScreen('auth-login')} />;
    default:
      // This should ideally not be reached if logic in parent is correct
      return (
        <WelcomeScreen 
          onGetStarted={() => setCurrentScreen('auth-signup')}
          onLogin={() => setCurrentScreen('auth-login')}
        />
      );
  }
};

export default UnauthenticatedApp;
