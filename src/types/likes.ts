
import type { MatchProfile } from './matches';

export interface LikeRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  type: 'like' | 'super_like';
  created_at: string;
  sender_profile: MatchProfile;
}
