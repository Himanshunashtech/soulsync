
import React from 'react';
import InfoScreen from '../InfoScreen';

interface AdsScreenProps {
  onNavigate: (screen: string) => void;
}

const AdsScreen: React.FC<AdsScreenProps> = ({ onNavigate }) => {
  return (
    <InfoScreen title="Ads" onBack={() => onNavigate('settings')}>
      <p>We show ads to keep our service free. Premium users can enjoy an ad-free experience. You can manage your ad preferences in the app settings.</p>
    </InfoScreen>
  );
};

export default AdsScreen;
