
export type GenderPreference = 'male' | 'female' | 'non-binary' | 'everyone';
export type RelationshipType = 
  | 'long_term_relationship' 
  | 'short_term_relationship' 
  | 'new_friends' 
  | 'casual_dating' 
  | 'dont_know_yet';

export interface DatingPreferences {
  id: string;
  user_id: string;
  interested_in_gender: GenderPreference;
  min_age_preference: number;
  max_age_preference: number;
  max_distance_preference: number; // Assuming km for now
  looking_for: RelationshipType[];
  created_at: string;
  updated_at: string;
}

export type DatingPreferencesFormData = Omit<DatingPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

