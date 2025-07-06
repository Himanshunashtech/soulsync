
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useNewDeviceNotifier = () => {
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          try {
            const userAgent = window.navigator.userAgent;
            const { error } = await supabase.rpc('notify_on_new_device', { p_user_agent: userAgent });
            if (error) {
              console.error('Error triggering new device notification:', error.message);
            }
          } catch (e) {
             console.error('Exception when triggering new device notification:', e);
          }
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);
};
