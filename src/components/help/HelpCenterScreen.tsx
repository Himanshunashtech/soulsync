
import React from 'react';
import InfoScreen from '../InfoScreen';

interface HelpCenterScreenProps {
  onNavigate: (screen: string) => void;
}

const HelpCenterScreen: React.FC<HelpCenterScreenProps> = ({ onNavigate }) => {
  return (
    <InfoScreen title="Help Center" onBack={() => onNavigate('settings')}>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Frequently Asked Questions</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>How do I create an account?</li>
            <li>How can I update my profile?</li>
            <li>Is my data safe?</li>
            <li>How does matching work?</li>
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Contact Support</h2>
          <p>If you can't find the answer you're looking for, please email us at <a href="mailto:support@example.com" className="text-pink-400 hover:underline">support@example.com</a>.</p>
        </div>
      </div>
    </InfoScreen>
  );
};

export default HelpCenterScreen;
