
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import UAParser from 'ua-parser-js';

// This matches the type returned by the get_my_sessions() SQL function
interface SessionInfo {
  id: string;
  user_agent: string;
  created_at: string;
  updated_at: string;
}

export interface EnrichedSession extends SessionInfo {
  device: UAParser.IResult;
}

export const useLoginSessions = () => {
  return useQuery({
    queryKey: ['loginSessions'],
    queryFn: async (): Promise<EnrichedSession[]> => {
      const { data: sessions, error } = await supabase.rpc('get_my_sessions');

      if (error) {
        console.error("Error fetching sessions:", error);
        throw error;
      }
      if (!sessions) return [];

      const enrichedSessions = (sessions as any as SessionInfo[]).map(
        (session) => {
          const parser = new UAParser(session.user_agent);
          
          return {
            ...session,
            device: parser.getResult(),
          };
        }
      );
      
      return enrichedSessions;
    },
  });
};
