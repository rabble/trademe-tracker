-- This function allows executing arbitrary SQL from the API
-- Run this first before attempting to run migrations

CREATE OR REPLACE FUNCTION pg_execute(query text)
RETURNS VOID AS $$
BEGIN
  EXECUTE query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION pg_execute TO authenticated;
GRANT EXECUTE ON FUNCTION pg_execute TO service_role;
