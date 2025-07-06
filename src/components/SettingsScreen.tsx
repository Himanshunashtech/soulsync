import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Shield, 
  Heart, 
  MapPin, 
  Volume2, 
  Moon, 
  LogOut, 
  ChevronRight,
  User,
  Crown,
  ArrowLeft,
  HelpCircle,
  MessageSquareWarning,
  FileText,
  Info,
  Code2,
  Megaphone,
  Accessibility,
  Smartphone,
  BookOpen,
  Gavel
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface SettingsScreenProps {
  onNavigate: (screen: string, targetId?: string, params?: any) => void;
}

interface Profile {
  name: string;
  images: string[] | null;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onNavigate }) => {
  const { signOut, user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, images')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
       
      onNavigate('welcome');
      
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const settingsGroups = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Edit Profile',
          action: () => onNavigate('profile'),
          hasChevron: true,
        },
        {
          icon: Crown,
          label: 'Go Premium',
          action: () => console.log('Premium'), 
          hasChevron: true,
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: Heart,
          label: 'Dating Preferences',
          action: () => onNavigate('dating-preferences'),
          hasChevron: true,
        },
        {
          icon: MapPin,
          label: 'Location',
          action: () => onNavigate('location'), // Navigate to 'location'
          hasChevron: true,
        },
        {
          icon: Bell,
          label: 'Notifications',
          action: () => onNavigate('notification-settings'),
          hasChevron: true,
        },
      ],
    },
    {
      title: 'App Settings',
      items: [
        {
          icon: Volume2,
          label: 'Sound',
          action: () => console.log('Sound'),
          hasChevron: true,
        },
        {
          icon: Moon,
          label: 'Dark Mode',
          action: () => console.log('Dark mode'),
          hasChevron: false,
          rightElement: (
            <div className="w-12 h-6 bg-purple-600 rounded-full flex items-center p-1">
              <div className="w-4 h-4 bg-white rounded-full transform translate-x-6 transition-transform" />
            </div>
          ),
        },
      ],
    },
    {
      title: 'Privacy & Safety',
      items: [
        {
          icon: Shield,
          label: 'Privacy Settings',
          action: () => onNavigate('privacy-settings'),
          hasChevron: true,
        },
      ],
    },
    {
      title: 'Help',
      items: [
        {
          icon: MessageSquareWarning,
          label: 'Report a Problem',
          action: () => onNavigate('report-problem'),
          hasChevron: true,
        },
        {
          icon: HelpCircle,
          label: 'Help Center',
          action: () => onNavigate('help-center'),
          hasChevron: true,
        },
        {
          icon: Shield,
          label: 'Privacy Policy',
          action: () => onNavigate('privacy-policy-info'),
          hasChevron: true,
        },
        {
          icon: FileText,
          label: 'Terms of Use',
          action: () => onNavigate('terms-of-use'),
          hasChevron: true,
        },
        {
          icon: Info,
          label: 'About',
          action: () => onNavigate('about-info'),
          hasChevron: true,
        },
        {
          icon: Code2,
          label: 'API',
          action: () => onNavigate('api-info'),
          hasChevron: true,
        },
        {
          icon: Megaphone,
          label: 'Ads',
          action: () => onNavigate('ads-info'),
          hasChevron: true,
        },
        {
          icon: Accessibility,
          label: 'Accessibility',
          action: () => onNavigate('accessibility-info'),
          hasChevron: true,
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: Smartphone,
          label: 'App Version',
          action: () => onNavigate('app-version'),
          hasChevron: true,
        },
        {
          icon: Gavel,
          label: 'Policies',
          action: () => onNavigate('policies-info'),
          hasChevron: true,
        },
        {
          icon: BookOpen,
          label: 'Open Source Licenses',
          action: () => onNavigate('open-source-licenses'),
          hasChevron: true,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      {/* Header */}
      <div className="p-6 bg-white/5 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center space-x-4 mb-2">
          <button
            onClick={() => onNavigate('profile')} 
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
        </div>
        <p className="text-slate-300">Manage your account and preferences</p>
      </div>

      {/* User Info */}
      <div className="px-6 mb-6">
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-pink-500 to-purple-600 p-0.5">
              {profile?.images?.[0] ? (
                <img 
                  src={profile.images[0]} 
                  alt={profile.name || 'User profile'}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <div className="w-full h-full bg-white/10 rounded-2xl flex items-center justify-center">
                  <User size={24} className="text-slate-300" />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">{profile?.name || user?.email}</h3>
              <p className="text-slate-300">Free Plan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Groups */}
      <div className="px-6 space-y-6">
        {settingsGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            <h2 className="text-slate-300 font-semibold mb-3 px-2">{group.title}</h2>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
              {group.items.map((item, itemIndex) => {
                const IconComponent = item.icon; // Renamed to avoid conflict with Icon type name
                return (
                  <button
                    key={itemIndex}
                    onClick={item.action}
                    className={`w-full flex items-center justify-between p-4 hover:bg-white/10 transition-colors ${
                      itemIndex < group.items.length - 1 ? 'border-b border-white/10' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <IconComponent size={20} className="text-slate-300" />
                      <span className="text-white font-medium">{item.label}</span>
                    </div>
                    {item.rightElement || (item.hasChevron && (
                      <ChevronRight size={20} className="text-slate-300" />
                    ))}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Sign Out */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 p-4 hover:bg-red-600/10 transition-colors"
          >
            <LogOut size={20} className="text-red-400" />
            <span className="text-red-400 font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
