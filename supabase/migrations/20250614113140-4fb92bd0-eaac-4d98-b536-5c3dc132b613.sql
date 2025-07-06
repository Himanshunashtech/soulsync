
-- Create enum type for interested_in_gender
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_preference_enum') THEN
        CREATE TYPE public.gender_preference_enum AS ENUM ('male', 'female', 'non-binary', 'everyone');
    END IF;
END$$;

-- Create enum type for looking_for
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'relationship_type_enum') THEN
        CREATE TYPE public.relationship_type_enum AS ENUM ('long_term_relationship', 'short_term_relationship', 'new_friends', 'casual_dating', 'dont_know_yet');
    END IF;
END$$;

-- Create table for dating_preferences
CREATE TABLE IF NOT EXISTS public.dating_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  interested_in_gender public.gender_preference_enum DEFAULT 'everyone',
  min_age_preference INTEGER DEFAULT 18 CHECK (min_age_preference >= 18),
  max_age_preference INTEGER DEFAULT 99 CHECK (max_age_preference >= 18 AND max_age_preference >= min_age_preference),
  max_distance_preference INTEGER DEFAULT 100 CHECK (max_distance_preference > 0), -- in km or miles, unit to be decided by app logic
  looking_for public.relationship_type_enum[] DEFAULT ARRAY['dont_know_yet']::public.relationship_type_enum[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.dating_preferences ENABLE ROW LEVEL SECURITY;

-- Policies for dating_preferences
CREATE POLICY "Users can view their own dating preferences"
  ON public.dating_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dating preferences"
  ON public.dating_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dating preferences"
  ON public.dating_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dating preferences"
  ON public.dating_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION public.update_dating_preferences_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_dating_preferences_modtime
  BEFORE UPDATE ON public.dating_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_dating_preferences_updated_at_column();

-- Ensure profiles table exists and user_id is primary key or unique for the FK reference
-- This is assumed to be true based on existing schema structure (profiles.user_id is usually the FK to auth.users.id and primary key or unique for profiles table)

-- Add a function to get or create dating preferences for a user
CREATE OR REPLACE FUNCTION public.get_or_create_dating_preferences(p_user_id UUID)
RETURNS SETOF public.dating_preferences AS $$
DECLARE
  prefs public.dating_preferences%ROWTYPE;
BEGIN
  SELECT * INTO prefs FROM public.dating_preferences WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.dating_preferences (user_id) VALUES (p_user_id)
    RETURNING * INTO prefs;
  END IF;

  RETURN NEXT prefs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_or_create_dating_preferences(UUID) TO authenticated;


