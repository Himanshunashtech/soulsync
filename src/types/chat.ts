
import type { Json } from '@/integrations/supabase/types';

export interface Message {
  id: string;
  sender_id: string;
  match_id: string;
  content: string | null;
  created_at: string;
  image_url?: string | null;
  voice_note_url?: string | null;
  reactions: Json | null;
  seen_at?: string | null; // Added seen_at
}

export interface MatchProfile {
  user_id: string;
  name: string;
  images: string[] | null;
  age?: number | null;
  bio?: string | null;
  location?: string | null;
  interests?: string[] | null;
  gender?: string | null;
  mbti?: string | null;
  zodiac?: string | null;
  total_matches?: number | null;
  likes_received?: number | null;
  posts_count?: number | null;
}

export interface SimpleMatch { // New type for the share modal
  matchId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserImage: string | null;
}
