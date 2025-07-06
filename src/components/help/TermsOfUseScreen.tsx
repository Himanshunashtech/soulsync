
import React from 'react';
import InfoScreen from '../InfoScreen';

interface TermsOfUseScreenProps {
  onNavigate: (screen: string) => void;
}

const TermsOfUseScreen: React.FC<TermsOfUseScreenProps> = ({ onNavigate }) => {
  return (
    <InfoScreen title="Terms of Use" onBack={() => onNavigate('settings')}>
       <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">1. Acceptance of Terms</h2>
        <p>By using our service, you agree to these terms. Please read them carefully. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        <h2 className="text-lg font-semibold text-white">2. User Conduct</h2>
        <p>You are responsible for your conduct and content. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
      </div>
    </InfoScreen>
  );
};

export default TermsOfUseScreen;
