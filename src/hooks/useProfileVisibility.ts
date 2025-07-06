
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export const useProfileVisibility = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  const fetchVisibility = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_visible')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // Ignore error for no rows found
        throw error;
      }
      
      if (data) {
        setIsVisible(data.is_visible);
      } else {
        // if profile doesn't exist or is_visible is null, default to true
        setIsVisible(true);
      }
    } catch (error: any) {
      console.error('Error fetching profile visibility:', error);
      toast({
        title: 'Error',
        description: 'Could not load profile visibility setting.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchVisibility();
  }, [fetchVisibility]);

  const updateVisibility = async (visible: boolean) => {
    if (!user) return;

    const oldVisibility = isVisible;
    setIsVisible(visible);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_visible: visible })
        .eq('user_id', user.id);

      if (error) {
        setIsVisible(oldVisibility); // Revert on error
        throw error;
      }
      
      toast({
          title: 'Visibility Updated',
          description: `Your profile is now ${visible ? 'visible' : 'hidden'} in Discover.`,
      });

    } catch (error: any) {
      console.error('Error updating profile visibility:', error);
      setIsVisible(oldVisibility);
      toast({
        title: 'Update Failed',
        description: 'Could not save your changes. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return { isVisible, loading, updateVisibility };
};
