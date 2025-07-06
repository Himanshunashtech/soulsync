import React from 'react';
import { ArrowLeft, MessageCircle, Heart, Users, BellDot, ShieldAlert } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useNotificationSettings, NotificationSettings } from '@/hooks/useNotificationSettings';
import { Skeleton } from '@/components/ui/skeleton';

interface NotificationSettingsScreenProps {
  onNavigate: (screen: string) => void;
}

type SettingKey = keyof Omit<NotificationSettings, 'user_id' | 'updated_at'>;

const NotificationSettingsScreen: React.FC<NotificationSettingsScreenProps> = ({ onNavigate }) => {
  const { settings, loading, updateSetting } = useNotificationSettings();

  const settingItems: { key: SettingKey; label: string; description: string, icon: React.ElementType }[] = [
    { 
      key: 'new_message_enabled', 
      label: 'New Messages', 
      description: 'Notify me when I receive a new message.',
      icon: MessageCircle
    },
    { 
      key: 'new_like_request_enabled', 
      label: 'New Likes', 
      description: 'Notify me when someone likes my profile.',
      icon: Heart
    },
    { 
      key: 'like_accepted_enabled', 
      label: 'Likes Accepted', 
      description: 'Notify me when someone accepts my like request.',
      icon: Heart,
    },
    { 
      key: 'new_match_enabled', 
      label: 'New Matches', 
      description: 'Notify me when I get a new match.',
      icon: Users
    },
    { 
      key: 'new_device_login_enabled', 
      label: 'New Device Logins', 
      description: 'Notify me when a login occurs on a new device or browser.',
      icon: ShieldAlert
    },
  ];

  const handleToggle = (key: SettingKey, checked: boolean) => {
    updateSetting(key, checked);
  };
  
  const renderSkeleton = () => (
    <div className="space-y-4 px-6">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32 bg-slate-700" />
            <Skeleton className="h-4 w-48 bg-slate-700" />
          </div>
          <Skeleton className="h-6 w-11 rounded-full bg-slate-700" />
        </div>
      ))}
    </div>
  );

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
        <h1 className="text-xl font-semibold text-white">Notification Settings</h1>
      </div>
      
      <div className="py-6">
        {loading ? renderSkeleton() : (
          <div className="space-y-4 px-6">
            {settings && settingItems.map(item => {
              const Icon = item.icon;
              return (
                <div key={item.key} className="flex items-start space-x-4 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                  <div className="flex-shrink-0 pt-1 text-pink-400">
                    <Icon size={22} />
                  </div>
                  <div className="flex-1">
                    <label htmlFor={item.key} className="font-medium text-white cursor-pointer">
                      {item.label}
                    </label>
                    <p className="text-sm text-slate-400">{item.description}</p>
                  </div>
                  <Switch
                    id={item.key}
                    checked={settings[item.key]}
                    onCheckedChange={(checked) => handleToggle(item.key, checked)}
                    className="data-[state=checked]:bg-pink-500"
                  />
                </div>
              )
            })}
             {!settings && !loading && (
              <div className="text-center text-slate-400 p-8">
                <BellDot size={40} className="mx-auto mb-4"/>
                <p>Could not load settings.</p>
                <p className="text-sm">Please try again later.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationSettingsScreen;
