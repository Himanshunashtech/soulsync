
import React from 'react';
import InfoScreen from '../InfoScreen';

interface APIScreenProps {
  onNavigate: (screen: string) => void;
}

const APIScreen: React.FC<APIScreenProps> = ({ onNavigate }) => {
  return (
    <InfoScreen title="API" onBack={() => onNavigate('settings')}>
       <div className="space-y-4">
        <p>Our API allows developers to integrate with our platform. Access to the API is currently restricted and requires an API key.</p>
        <p>For more information, please read our developer documentation.</p>
      </div>
    </InfoScreen>
  );
};

export default APIScreen;
