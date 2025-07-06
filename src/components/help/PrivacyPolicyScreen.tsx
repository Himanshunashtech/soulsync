
import React from 'react';
import InfoScreen from '../InfoScreen';

interface PrivacyPolicyScreenProps {
  onNavigate: (screen: string) => void;
}

const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ onNavigate }) => {
  return (
    <InfoScreen title="Privacy Policy" onBack={() => onNavigate('settings')}>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">1. Information We Collect</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        <h2 className="text-lg font-semibold text-white">2. How We Use Your Information</h2>
        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      </div>
    </InfoScreen>
  );
};

export default PrivacyPolicyScreen;
