
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ReceivedBouquet {
  sender_id: string;
  sender_name: string;
  sender_image: string | null;
  bouquet_id: string;
  bouquet_name: string;
  bouquet_image_url: string;
  bouquet_count: number;
  last_sent_at: string;
}

export const useReceivedBouquets = (userId: string | undefined) => {
  const [bouquets, setBouquets] = useState<ReceivedBouquet[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReceivedBouquets = useCallback(async () => {
    if (!userId) {
        setLoading(false);
        return;
    };
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_received_bouquets_summary', {
        p_user_id: userId,
      });

      if (error) throw error;
      setBouquets(data || []);
    } catch (error) {
      console.error('Error fetching received bouquets:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchReceivedBouquets();
  }, [fetchReceivedBouquets]);

  return { bouquets, loading, refetch: fetchReceivedBouquets };
};
