
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

export type NotificationSettings = Tables<'notification_settings'>;

export const useNotificationSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_or_create_notification_settings', {
        p_user_id: user.id,
      });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setSettings(data[0]);
      } else {
        console.warn('Notification settings not found or created for user.');
        setSettings(null);
      }
    } catch (error: any) {
      console.error('Error fetching notification settings:', error);
      toast({
        title: 'Error',
        description: 'Could not load your notification settings.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSetting = async (key: keyof Omit<NotificationSettings, 'user_id' | 'updated_at'>, value: boolean) => {
    if (!user || !settings) return;

    const oldSettings = { ...settings };
    setSettings(prev => prev ? { ...prev, [key]: value } : null);

    try {
      const { error } = await supabase
        .from('notification_settings')
        .update({ [key]: value })
        .eq('user_id', user.id);

      if (error) {
        setSettings(oldSettings); // Revert on error
        throw error;
      }
      
      toast({
          title: 'Settings Updated',
          description: 'Your notification preferences have been saved.',
      });

    } catch (error: any) {
      console.error('Error updating notification setting:', error);
      setSettings(oldSettings);
      toast({
        title: 'Update Failed',
        description: 'Could not save your changes. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return { settings, loading, updateSetting, fetchSettings };
};
