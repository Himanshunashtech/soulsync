
import React from 'react';
import InfoScreen from '../InfoScreen';

interface OpenSourceLicensesScreenProps {
  onNavigate: (screen: string) => void;
}

const OpenSourceLicensesScreen: React.FC<OpenSourceLicensesScreenProps> = ({ onNavigate }) => {
  return (
    <InfoScreen title="Open Source Licenses" onBack={() => onNavigate('settings')}>
      <p>Our application uses the following open-source software:</p>
      <ul className="list-disc list-inside space-y-2 mt-4">
        <li>React - MIT License</li>
        <li>Lucide - ISC License</li>
        <li>Tailwind CSS - MIT License</li>
      </ul>
    </InfoScreen>
  );
};

export default OpenSourceLicensesScreen;
