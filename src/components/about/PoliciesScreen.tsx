
import React from 'react';
import InfoScreen from '../InfoScreen';

interface PoliciesScreenProps {
  onNavigate: (screen: string) => void;
}

const PoliciesScreen: React.FC<PoliciesScreenProps> = ({ onNavigate }) => {
  return (
    <InfoScreen title="Policies" onBack={() => onNavigate('settings')}>
      <ul className="list-disc list-inside space-y-2">
        <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('privacy-policy-info'); }} className="text-pink-400 hover:underline">Data Policy</a></li>
        <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('terms-of-use'); }} className="text-pink-400 hover:underline">Terms of Use</a></li>
        <li><a href="#" onClick={(e) => { e.preventDefault(); }} className="text-pink-400 hover:underline">Cookie Policy</a></li>
      </ul>
    </InfoScreen>
  );
};

export default PoliciesScreen;
