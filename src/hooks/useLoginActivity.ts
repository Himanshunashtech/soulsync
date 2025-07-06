
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useLoginActivity = () => {
  const { mutate, isPending: isLoggingOut } = useMutation({
    mutationFn: async () => {
      // scope: 'global' logs out from all sessions for the user
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Successfully logged out from all devices.');
      // Force a reload to redirect to the login screen
      window.location.href = '/'; 
    },
    onError: (error) => {
      console.error('Error logging out from all devices:', error);
      toast.error('Failed to log out from all devices. Please try again.');
    },
  });

  return {
    signOutFromAllDevices: mutate,
    isLoggingOut,
  };
};
