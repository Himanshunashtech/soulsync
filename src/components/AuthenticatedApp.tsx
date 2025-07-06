import React from 'react';
import OnboardingScreen from './OnboardingScreen';
import DiscoverScreen from './DiscoverScreen';
import ProfileScreen from './ProfileScreen';
import MatchesScreen from './MatchesScreen';
import FeedScreen from './FeedScreen';
import SettingsScreen from './SettingsScreen';
import ChatScreen from './ChatScreen';
import DatingPreferencesScreen from './DatingPreferencesScreen';
import LocationScreen from './LocationScreen';
import NotificationSettingsScreen from './NotificationSettingsScreen';
import PrivacySettingsScreen from './PrivacySettingsScreen';
import BlockedUsersScreen from './BlockedUsersScreen';
import LoginActivityScreen from './LoginActivityScreen';
import ReportProblemScreen from './help/ReportProblemScreen';
import HelpCenterScreen from './help/HelpCenterScreen';
import PrivacyPolicyScreen from './help/PrivacyPolicyScreen';
import TermsOfUseScreen from './help/TermsOfUseScreen';
import AboutInfoScreen from './help/AboutInfoScreen';
import APIScreen from './help/APIScreen';
import AdsScreen from './help/AdsScreen';
import AccessibilityScreen from './help/AccessibilityScreen';
import AppVersionScreen from './about/AppVersionScreen';
import PoliciesScreen from './about/PoliciesScreen';
import OpenSourceLicensesScreen from './about/OpenSourceLicensesScreen';
import BottomNavigation from './BottomNavigation';
import { ScreenName } from '@/hooks/useNavigation';

interface AuthenticatedAppProps {
  profile: any;
  currentScreen: ScreenName;
  navigateToScreen: (screen: ScreenName, targetId?: string, params?: any) => void;
  handleBottomNavigation: (screen: string) => void;
  onOnboardingComplete: () => void;
  matchId?: string;
}

const AuthenticatedApp: React.FC<AuthenticatedAppProps> = ({
  profile,
  currentScreen,
  navigateToScreen,
  handleBottomNavigation,
  onOnboardingComplete,
  matchId,
}) => {
  const screensWithBottomNav = ['discover', 'matches', 'feed', 'profile'];
  const showBottomNav = screensWithBottomNav.includes(currentScreen);

  const renderCurrentScreen = () => {
    const authScreens: { [key in ScreenName]?: React.ReactNode } = {
        'onboarding': <OnboardingScreen onComplete={onOnboardingComplete} />,
        'discover': <DiscoverScreen onNavigate={navigateToScreen} />,
        'profile': <ProfileScreen onNavigate={navigateToScreen} />,
        'matches': <MatchesScreen onNavigate={navigateToScreen} />,
        'feed': <FeedScreen onNavigate={navigateToScreen} />,
        'settings': <SettingsScreen onNavigate={navigateToScreen} />,
        'chat': <ChatScreen onNavigate={navigateToScreen} matchId={matchId} />,
        'dating-preferences': <DatingPreferencesScreen onNavigate={navigateToScreen} />,
        'location': <LocationScreen onNavigate={navigateToScreen} />,
        'notification-settings': <NotificationSettingsScreen onNavigate={navigateToScreen} />,
        'privacy-settings': <PrivacySettingsScreen onNavigate={navigateToScreen} />,
        'blocked-users': <BlockedUsersScreen onNavigate={navigateToScreen} />,
        'login-activity': <LoginActivityScreen onNavigate={navigateToScreen} />,
        'report-problem': <ReportProblemScreen onNavigate={navigateToScreen} />,
        'help-center': <HelpCenterScreen onNavigate={navigateToScreen} />,
        'privacy-policy-info': <PrivacyPolicyScreen onNavigate={navigateToScreen} />,
        'terms-of-use': <TermsOfUseScreen onNavigate={navigateToScreen} />,
        'about-info': <AboutInfoScreen onNavigate={navigateToScreen} />,
        'api-info': <APIScreen onNavigate={navigateToScreen} />,
        'ads-info': <AdsScreen onNavigate={navigateToScreen} />,
        'accessibility-info': <AccessibilityScreen onNavigate={navigateToScreen} />,
        'app-version': <AppVersionScreen onNavigate={navigateToScreen} />,
        'policies-info': <PoliciesScreen onNavigate={navigateToScreen} />,
        'open-source-licenses': <OpenSourceLicensesScreen onNavigate={navigateToScreen} />,
    };

    return authScreens[currentScreen] || <DiscoverScreen onNavigate={navigateToScreen} />;
  };

  return (
    <div className="relative bg-background min-h-screen">
      <div className="">
        {renderCurrentScreen()}
      </div>
      {showBottomNav && (
        <BottomNavigation 
          currentScreen={currentScreen} 
          onNavigate={handleBottomNavigation} 
        />
      )}
    </div>
  );
};

export default AuthenticatedApp;
