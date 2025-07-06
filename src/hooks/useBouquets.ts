
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Bouquet {
  id: string;
  name: string;
  image_url: string;
}

export const useBouquets = (receiverId: string | undefined | null) => {
  const { user } = useAuth();
  const [bouquets, setBouquets] = useState<Bouquet[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchBouquets = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('bouquets').select('*');
        if (error) throw error;
        setBouquets(data || []);
      } catch (error) {
        console.error('Error fetching bouquets:', error);
        toast.error('Could not load bouquets.');
      } finally {
        setLoading(false);
      }
    };
    fetchBouquets();
  }, []);

  const sendBouquet = async (bouquetId: string) => {
    if (!user || !receiverId || sending) return;

    setSending(true);
    try {
      const { error } = await supabase.from('user_bouquets').insert({
        sender_id: user.id,
        receiver_id: receiverId,
        bouquet_id: bouquetId,
      });

      if (error) throw error;
      toast.success('Flower sent successfully!');
      return true;
    } catch (error) {
      console.error('Error sending bouquet:', error);
      toast.error('Failed to send flower. Please try again.');
      return false;
    } finally {
      setSending(false);
    }
  };

  return { bouquets, loading, sending, sendBouquet };
};
