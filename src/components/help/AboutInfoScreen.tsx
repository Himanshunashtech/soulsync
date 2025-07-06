
import React from 'react';
import InfoScreen from '../InfoScreen';

interface AboutInfoScreenProps {
  onNavigate: (screen: string) => void;
}

const AboutInfoScreen: React.FC<AboutInfoScreenProps> = ({ onNavigate }) => {
  return (
    <InfoScreen title="About" onBack={() => onNavigate('settings')}>
      <div className="space-y-4">
        <p>This is a dating application created to connect people. Our mission is to build a community based on mutual respect and shared interests.</p>
        <p>For press inquiries, please contact <a href="mailto:press@example.com" className="text-pink-400 hover:underline">press@example.com</a>.</p>
        <p>We are hiring! Check our careers page for more information.</p>
      </div>
    </InfoScreen>
  );
};

export default AboutInfoScreen;
