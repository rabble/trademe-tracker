-- Seed data for development environment
-- This file contains sample data to populate the database for testing

-- Sample properties
INSERT INTO public.properties (
    title, 
    address, 
    price, 
    bedrooms, 
    bathrooms, 
    status, 
    days_on_market, 
    property_type, 
    description,
    user_id
) VALUES 
(
    'Modern 3 Bedroom Home in Central Location',
    '123 Main Street, Wellington',
    850000,
    3,
    2,
    'active',
    14,
    'house',
    'Beautiful modern home with open plan living and great indoor-outdoor flow.',
    '00000000-0000-0000-0000-000000000000' -- Replace with actual user ID during testing
),
(
    'Spacious Apartment with City Views',
    '45 Harbor Road, Auckland',
    650000,
    2,
    1,
    'under_offer',
    28,
    'apartment',
    'Stunning apartment with panoramic views of the city skyline.',
    '00000000-0000-0000-0000-000000000000' -- Replace with actual user ID during testing
),
(
    'Charming Townhouse in Quiet Neighborhood',
    '78 Quiet Lane, Christchurch',
    520000,
    3,
    1,
    'sold',
    45,
    'townhouse',
    'Lovely townhouse in a peaceful setting with a small garden.',
    '00000000-0000-0000-0000-000000000000' -- Replace with actual user ID during testing
);

-- Sample property changes
INSERT INTO public.property_changes (
    property_id,
    change_type,
    old_value,
    new_value,
    description
) VALUES 
(
    (SELECT id FROM public.properties WHERE address = '45 Harbor Road, Auckland' LIMIT 1),
    'price',
    '680000',
    '650000',
    'Price reduced by $30,000 (4.4%)'
),
(
    (SELECT id FROM public.properties WHERE address = '78 Quiet Lane, Christchurch' LIMIT 1),
    'status',
    'active',
    'sold',
    'Property sold after 45 days on market'
);

-- Sample property insights
INSERT INTO public.property_insights (
    property_id,
    insight_type,
    insight_text
) VALUES 
(
    (SELECT id FROM public.properties WHERE address = '123 Main Street, Wellington' LIMIT 1),
    'market_comparison',
    'This property is priced 5% below similar properties in the area.'
),
(
    (SELECT id FROM public.properties WHERE address = '45 Harbor Road, Auckland' LIMIT 1),
    'price_trend',
    'Prices in this area have increased by 8% in the last 12 months.'
),
(
    (SELECT id FROM public.properties WHERE address = '78 Quiet Lane, Christchurch' LIMIT 1),
    'recommendation',
    'Consider investing in properties in this area as values are projected to rise.'
);

-- Sample property images
INSERT INTO public.property_images (
    property_id,
    url,
    is_primary
) VALUES
(
    (SELECT id FROM public.properties WHERE address = '123 Main Street, Wellington' LIMIT 1),
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=60',
    true
),
(
    (SELECT id FROM public.properties WHERE address = '123 Main Street, Wellington' LIMIT 1),
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=60',
    false
),
(
    (SELECT id FROM public.properties WHERE address = '45 Harbor Road, Auckland' LIMIT 1),
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=60',
    true
);

-- Sample saved filters
INSERT INTO public.saved_filters (
    user_id,
    name,
    filters
) VALUES 
(
    '00000000-0000-0000-0000-000000000000', -- Replace with actual user ID during testing
    'Wellington Houses Under $900k',
    '{"searchQuery":"Wellington","priceRange":[null,900000],"propertyType":["house"],"status":["active"]}'
);
