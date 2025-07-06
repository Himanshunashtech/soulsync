
import React from 'react';
import { ArrowLeft, UserX, ShieldCheck, ChevronRight, Smartphone } from 'lucide-react';
import { ProfileVisibilityToggle } from './ProfileVisibilityToggle';
import { DeleteAccountDialog } from './DeleteAccountDialog';

interface PrivacySettingsScreenProps {
  onNavigate: (screen: string) => void;
}

const PrivacySettingsScreen: React.FC<PrivacySettingsScreenProps> = ({ onNavigate }) => {

  const privacyItems = [
    {
      label: 'Blocked Users',
      description: 'Manage users you have blocked.',
      icon: UserX,
      action: () => onNavigate('blocked-users'),
    },
    {
      label: 'Login Activity',
      description: 'Manage active sessions and sign out from other devices.',
      icon: Smartphone,
      action: () => onNavigate('login-activity'),
    },
    // Add more privacy settings here in the future
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      {/* Header */}
      <div className="p-4 bg-white/5 backdrop-blur-md border-b border-white/10 flex items-center space-x-4 sticky top-0 z-10">
        <button
          onClick={() => onNavigate('settings')}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        <h1 className="text-xl font-semibold text-white">Privacy & Safety</h1>
      </div>
      
      <div className="py-6 px-6 space-y-4">
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
          {privacyItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={item.action}
                className="w-full flex items-center justify-between p-4 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <Icon size={22} className="text-pink-400 mt-1" />
                  <div className="text-left">
                    <span className="text-white font-medium">{item.label}</span>
                    <p className="text-sm text-slate-400">{item.description}</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-slate-300" />
              </button>
            );
          })}
          <ProfileVisibilityToggle />
        </div>
        
        <div className="bg-red-900/10 backdrop-blur-md rounded-2xl border border-red-500/20 overflow-hidden">
          <DeleteAccountDialog />
        </div>
        
        <div className="text-center p-4 text-slate-500 text-sm">
          <ShieldCheck size={16} className="inline-block mr-1" />
          Your safety is our priority. More privacy controls coming soon.
        </div>
      </div>
    </div>
  );
};

export default PrivacySettingsScreen;
