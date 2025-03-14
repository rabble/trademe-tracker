-- Function to calculate property statistics
CREATE OR REPLACE FUNCTION get_property_stats()
RETURNS json AS $$
DECLARE
    result json;
BEGIN
    SELECT json_build_object(
        'totalValue', COALESCE(SUM(price), 0),
        'avgPrice', COALESCE(AVG(price), 0),
        'avgDaysOnMarket', COALESCE(AVG(days_on_market), 0)
    ) INTO result
    FROM properties;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_property_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_property_stats TO service_role;
