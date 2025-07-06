
import React from 'react';
import InfoScreen from '../InfoScreen';
import { Switch } from '@/components/ui/switch';

interface AccessibilityScreenProps {
  onNavigate: (screen: string) => void;
}

const AccessibilityScreen: React.FC<AccessibilityScreenProps> = ({ onNavigate }) => {
  return (
    <InfoScreen title="Accessibility" onBack={() => onNavigate('settings')}>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <h3 className="text-white font-medium">Auto-generated Captions</h3>
            <p className="text-sm text-slate-400">Show captions for video content.</p>
          </div>
          <Switch className="data-[state=checked]:bg-pink-500" />
        </div>
      </div>
    </InfoScreen>
  );
};

export default AccessibilityScreen;
