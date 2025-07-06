
import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useProfileVisibility } from '@/hooks/useProfileVisibility';
import { Skeleton } from '@/components/ui/skeleton';

export const ProfileVisibilityToggle = () => {
  const { isVisible, loading, updateVisibility } = useProfileVisibility();

  if (loading) {
    return (
      <div className="flex items-center justify-between p-4 border-t border-white/10">
        <div className="flex items-start space-x-4">
          <Skeleton className="h-[22px] w-[22px] bg-slate-700" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-40 bg-slate-700" />
            <Skeleton className="h-4 w-48 bg-slate-700" />
          </div>
        </div>
        <Skeleton className="h-6 w-11 rounded-full bg-slate-700" />
      </div>
    );
  }

  const Icon = isVisible ? Eye : EyeOff;

  return (
    <div className="w-full flex items-center justify-between p-4 border-t border-white/10">
      <div className="flex items-start space-x-4">
        <Icon size={22} className="text-pink-400 mt-1" />
        <div className="text-left">
          <label htmlFor="show-profile-toggle" className="text-white font-medium cursor-pointer">Show Profile in Discover</label>
          <p className="text-sm text-slate-400">
            {isVisible ? "Your profile is visible to others." : "Your profile is hidden from others."}
          </p>
        </div>
      </div>
      <Switch
        id="show-profile-toggle"
        checked={isVisible}
        onCheckedChange={updateVisibility}
        className="data-[state=checked]:bg-pink-500"
      />
    </div>
  );
};
