
export interface MatchProfile {
  user_id: string;
  name: string;
  age: number | null;
  images: string[] | null;
  bio?: string;
  location?: string;
  interests?: string[];
  gender?: string;
  mbti?: string;
  zodiac?: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  profiles: MatchProfile;
  lastMessage?: {
    content: string;
    created_at: string;
    sender_id: string;
    seen_at?: string | null;
  };
  unreadMessageCount?: number;
}
