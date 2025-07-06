
-- Create ENUM types for status and type of like
CREATE TYPE public.like_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE public.like_type AS ENUM ('like', 'super_like');

-- Create the like_requests table
CREATE TABLE public.like_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status public.like_status NOT NULL DEFAULT 'pending',
    type public.like_type NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    -- The unique constraint will be added below using CREATE UNIQUE INDEX
);

-- Create a partial unique index to ensure a user cannot have multiple active (pending) like requests to the same person.
CREATE UNIQUE INDEX uq_pending_like_request
ON public.like_requests (sender_id, receiver_id)
WHERE (status = 'pending');

-- Enable Row Level Security
ALTER TABLE public.like_requests ENABLE ROW LEVEL SECURITY;

-- Policies for like_requests table

-- Users can create (send) their own like requests
CREATE POLICY "Users can create their own like requests"
ON public.like_requests FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Users can see like requests they have sent
CREATE POLICY "Users can see like requests they sent"
ON public.like_requests FOR SELECT
USING (auth.uid() = sender_id);

-- Users can see like requests they have received
CREATE POLICY "Users can see like requests they received"
ON public.like_requests FOR SELECT
USING (auth.uid() = receiver_id);

-- Receivers can update the status of PENDING requests sent to them (to 'accepted' or 'rejected')
CREATE POLICY "Receivers can update status of their pending requests"
ON public.like_requests FOR UPDATE
USING (auth.uid() = receiver_id AND status = 'pending')
WITH CHECK (status IN ('accepted', 'rejected'));

-- Trigger function to automatically update 'updated_at' timestamp on any update
CREATE OR REPLACE FUNCTION public.update_like_request_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER trigger_update_like_requests_updated_at
BEFORE UPDATE ON public.like_requests
FOR EACH ROW EXECUTE FUNCTION public.update_like_request_updated_at_column();

-- Indexes for performance (besides the unique index)
CREATE INDEX idx_like_requests_receiver_id_status ON public.like_requests (receiver_id, status);
CREATE INDEX idx_like_requests_sender_id_status ON public.like_requests (sender_id, status);

-- Add like_requests table to supabase_realtime publication for realtime updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.like_requests;

