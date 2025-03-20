-- Add temporary user support for progressive login
-- This migration adds support for storing property pins and collections
-- for users who haven't created a full account yet

-- Create a new table for temporary users
CREATE TABLE IF NOT EXISTS public.temp_users (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  meta JSONB DEFAULT '{}'::JSONB
);

-- Add comments
COMMENT ON TABLE public.temp_users IS 'Stores temporary user information for progressive login';
COMMENT ON COLUMN public.temp_users.id IS 'Temporary user ID (temp_uuid format)';
COMMENT ON COLUMN public.temp_users.created_at IS 'When the temporary user was created';
COMMENT ON COLUMN public.temp_users.last_active_at IS 'When the temporary user was last active';
COMMENT ON COLUMN public.temp_users.meta IS 'Additional metadata about the temporary user';

-- Create index for faster cleanup of old temporary users
CREATE INDEX IF NOT EXISTS temp_users_last_active_idx ON public.temp_users (last_active_at);

-- Create a function to update the last_active_at timestamp
CREATE OR REPLACE FUNCTION update_temp_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_active_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the last_active_at timestamp on update
CREATE TRIGGER update_temp_user_last_active
BEFORE UPDATE ON public.temp_users
FOR EACH ROW
EXECUTE FUNCTION update_temp_user_last_active();

-- Create a table for property pins
CREATE TABLE IF NOT EXISTS public.property_pins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id TEXT NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id TEXT,
  temp_user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  collection_id UUID,
  notes TEXT,
  CONSTRAINT pin_has_user_reference CHECK (
    (user_id IS NOT NULL AND temp_user_id IS NULL) OR
    (user_id IS NULL AND temp_user_id IS NOT NULL)
  )
);

-- Add comments
COMMENT ON TABLE public.property_pins IS 'Stores property pins for both registered and temporary users';
COMMENT ON COLUMN public.property_pins.property_id IS 'Reference to the pinned property';
COMMENT ON COLUMN public.property_pins.user_id IS 'Reference to the registered user who pinned the property (null for temporary users)';
COMMENT ON COLUMN public.property_pins.temp_user_id IS 'Reference to the temporary user who pinned the property (null for registered users)';
COMMENT ON COLUMN public.property_pins.collection_id IS 'Optional reference to a collection this pin belongs to';
COMMENT ON COLUMN public.property_pins.notes IS 'Optional notes added to this pin';

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS property_pins_user_id_idx ON public.property_pins (user_id);
CREATE INDEX IF NOT EXISTS property_pins_temp_user_id_idx ON public.property_pins (temp_user_id);
CREATE INDEX IF NOT EXISTS property_pins_property_id_idx ON public.property_pins (property_id);
CREATE INDEX IF NOT EXISTS property_pins_collection_id_idx ON public.property_pins (collection_id);

-- Create a table for collections
CREATE TABLE IF NOT EXISTS public.property_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  user_id TEXT,
  temp_user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT collection_has_user_reference CHECK (
    (user_id IS NOT NULL AND temp_user_id IS NULL) OR
    (user_id IS NULL AND temp_user_id IS NOT NULL)
  )
);

-- Add comments
COMMENT ON TABLE public.property_collections IS 'Stores property collections for both registered and temporary users';
COMMENT ON COLUMN public.property_collections.name IS 'The name of the collection';
COMMENT ON COLUMN public.property_collections.description IS 'Optional description of the collection';
COMMENT ON COLUMN public.property_collections.user_id IS 'Reference to the registered user who owns the collection (null for temporary users)';
COMMENT ON COLUMN public.property_collections.temp_user_id IS 'Reference to the temporary user who owns the collection (null for registered users)';

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS property_collections_user_id_idx ON public.property_collections (user_id);
CREATE INDEX IF NOT EXISTS property_collections_temp_user_id_idx ON public.property_collections (temp_user_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_collection_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at timestamp on update
CREATE TRIGGER update_collection_updated_at
BEFORE UPDATE ON public.property_collections
FOR EACH ROW
EXECUTE FUNCTION update_collection_updated_at();

-- Create a function to merge temporary user data into a permanent user account
CREATE OR REPLACE FUNCTION merge_temp_user_data(
  p_temp_user_id TEXT,
  p_permanent_user_id TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Update pins from temporary user to permanent user
  UPDATE public.property_pins
  SET user_id = p_permanent_user_id,
      temp_user_id = NULL
  WHERE temp_user_id = p_temp_user_id;
  
  -- Update collections from temporary user to permanent user
  UPDATE public.property_collections
  SET user_id = p_permanent_user_id,
      temp_user_id = NULL
  WHERE temp_user_id = p_temp_user_id;
  
  -- Delete the temporary user record (no longer needed)
  DELETE FROM public.temp_users
  WHERE id = p_temp_user_id;
END;
$$ LANGUAGE plpgsql;

-- Add security policies to protect the data
-- Allow temporary users to see and manage only their own data
ALTER TABLE public.property_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temp_users ENABLE ROW LEVEL SECURITY;

-- Temporary user's pins policy
CREATE POLICY temp_user_pins_policy ON public.property_pins
  FOR ALL
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (temp_user_id IS NOT NULL AND temp_user_id = current_setting('app.temp_user_id', TRUE))
  );

-- Temporary user's collections policy
CREATE POLICY temp_user_collections_policy ON public.property_collections
  FOR ALL
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (temp_user_id IS NOT NULL AND temp_user_id = current_setting('app.temp_user_id', TRUE))
  );

-- Temporary users policy (only for authenticated backend operations)
CREATE POLICY temp_users_policy ON public.temp_users
  FOR ALL
  USING (FALSE)
  WITH CHECK (FALSE);

-- Create a cron job to clean up old temporary users (older than 45 days)
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'cleanup-old-temp-users',
  '0 3 * * *', -- Run at 3 AM every day
  $$
    -- Delete pins for temporary users that haven't been active for over 45 days
    DELETE FROM public.property_pins
    WHERE temp_user_id IN (
      SELECT id FROM public.temp_users
      WHERE last_active_at < now() - INTERVAL '45 days'
    );
    
    -- Delete collections for temporary users that haven't been active for over 45 days
    DELETE FROM public.property_collections
    WHERE temp_user_id IN (
      SELECT id FROM public.temp_users
      WHERE last_active_at < now() - INTERVAL '45 days'
    );
    
    -- Delete temporary users that haven't been active for over 45 days
    DELETE FROM public.temp_users
    WHERE last_active_at < now() - INTERVAL '45 days';
  $$
);

-- Create a function to set the temp_user_id for the current session
-- This is used by the client to set the temp_user_id for RLS policies
CREATE OR REPLACE FUNCTION set_temp_user_id(p_temp_user_id TEXT)
RETURNS VOID AS $$
BEGIN
  -- Store temp_user_id in session variables for later use in RLS policies
  PERFORM set_config('app.temp_user_id', p_temp_user_id, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a table for tracking progressive login analytics events
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  temp_user_id TEXT,
  user_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  metadata JSONB DEFAULT '{}'::JSONB
);

-- Add comments
COMMENT ON TABLE public.analytics_events IS 'Stores analytics events for tracking progressive login';
COMMENT ON COLUMN public.analytics_events.event_type IS 'Type of event (temp_user_created, property_pinned, etc.)';
COMMENT ON COLUMN public.analytics_events.temp_user_id IS 'Temporary user ID associated with the event';
COMMENT ON COLUMN public.analytics_events.user_id IS 'Permanent user ID associated with the event';
COMMENT ON COLUMN public.analytics_events.metadata IS 'Additional metadata about the event';

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS analytics_events_event_type_idx ON public.analytics_events (event_type);
CREATE INDEX IF NOT EXISTS analytics_events_temp_user_id_idx ON public.analytics_events (temp_user_id);
CREATE INDEX IF NOT EXISTS analytics_events_user_id_idx ON public.analytics_events (user_id);
CREATE INDEX IF NOT EXISTS analytics_events_timestamp_idx ON public.analytics_events (timestamp);

-- Add RLS policy for analytics events
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Policy to allow inserts from any authenticated client
CREATE POLICY analytics_events_insert_policy ON public.analytics_events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);