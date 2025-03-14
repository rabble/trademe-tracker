-- Function to get all tables in the public schema
CREATE OR REPLACE FUNCTION get_public_tables()
RETURNS SETOF json AS $$
BEGIN
    RETURN QUERY
    SELECT json_build_object(
        'table_name', table_name
    )
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_public_tables TO authenticated;
GRANT EXECUTE ON FUNCTION get_public_tables TO service_role;
