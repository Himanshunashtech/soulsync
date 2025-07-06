
import type { User } from '@supabase/supabase-js';

export type NotificationType = 'new_message' | 'new_like_request' | 'like_accepted' | 'new_match' | 'new_device_login' | 'new_bouquet';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string | null;
  message: string | null;
  reference_id: string | null; // e.g., match_id for new_message, like_request_id for likes
  reference_table: string | null; // e.g., 'messages', 'like_requests', 'matches'
  sender_id: string | null;
  sender_profile?: { // Enriched data
    name: string;
    images: string[] | null;
  } | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}
