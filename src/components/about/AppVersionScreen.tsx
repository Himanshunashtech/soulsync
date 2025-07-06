
import React from 'react';
import InfoScreen from '../InfoScreen';

interface AppVersionScreenProps {
  onNavigate: (screen: string) => void;
}

const AppVersionScreen: React.FC<AppVersionScreenProps> = ({ onNavigate }) => {
  return (
    <InfoScreen title="App Version" onBack={() => onNavigate('settings')}>
      <p>App Version: 1.0.0 (Build 20250614)</p>
      <p>You are on the latest version.</p>
    </InfoScreen>
  );
};

export default AppVersionScreen;
