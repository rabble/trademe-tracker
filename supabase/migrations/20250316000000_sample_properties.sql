-- Sample properties migration
-- This file contains sample property data to be loaded into Supabase

-- Create sample properties
INSERT INTO public.properties (
    id,
    title, 
    address, 
    price, 
    bedrooms, 
    bathrooms, 
    status, 
    days_on_market,
    created_at,
    property_type,
    description,
    user_id
) VALUES 
(
    '1',
    'Stunning Waterfront Villa',
    '123 Ocean Drive, Auckland',
    1250000,
    4,
    3,
    'active',
    14,
    NOW() - INTERVAL '14 days',
    'house',
    'Breathtaking waterfront property with panoramic ocean views. This luxurious villa features an open floor plan, gourmet kitchen, and private beach access.',
    (SELECT id FROM auth.users LIMIT 1)
),
(
    '2',
    'Modern City Apartment',
    '45 Queen Street, Auckland',
    650000,
    2,
    1,
    'active',
    7,
    NOW() - INTERVAL '7 days',
    'apartment',
    'Stylish apartment in the heart of the city. Walking distance to shops, restaurants, and public transport.',
    (SELECT id FROM auth.users LIMIT 1)
),
(
    '3',
    'Charming Suburban Home',
    '78 Maple Avenue, Wellington',
    820000,
    3,
    2,
    'under_offer',
    21,
    NOW() - INTERVAL '21 days',
    'house',
    'Beautiful family home in a quiet suburban neighborhood. Features a large backyard, renovated kitchen, and close proximity to excellent schools.',
    (SELECT id FROM auth.users LIMIT 1)
),
(
    '4',
    'Luxury Penthouse',
    '100 Harbour View Road, Auckland',
    1800000,
    3,
    3,
    'active',
    30,
    NOW() - INTERVAL '30 days',
    'apartment',
    'Exclusive penthouse with stunning harbour views. Features include high ceilings, floor-to-ceiling windows, and a private rooftop terrace.',
    (SELECT id FROM auth.users LIMIT 1)
),
(
    '5',
    'Cozy Cottage',
    '22 Garden Lane, Christchurch',
    450000,
    2,
    1,
    'sold',
    45,
    NOW() - INTERVAL '45 days',
    'house',
    'Charming cottage with character features. Includes a beautiful garden, updated bathroom, and wood-burning fireplace.',
    (SELECT id FROM auth.users LIMIT 1)
),
(
    '6',
    'Beachfront Condo',
    '8 Seaside Boulevard, Mount Maunganui',
    950000,
    3,
    2,
    'active',
    10,
    NOW() - INTERVAL '10 days',
    'apartment',
    'Modern beachfront condo with direct beach access. Open concept living with high-end finishes throughout.',
    (SELECT id FROM auth.users LIMIT 1)
),
(
    '7',
    'Rural Lifestyle Property',
    '156 Country Road, Hamilton',
    1100000,
    4,
    2,
    'active',
    60,
    NOW() - INTERVAL '60 days',
    'house',
    'Spacious lifestyle property on 5 acres. Includes a modern home, barn, and paddocks perfect for horses or other livestock.',
    (SELECT id FROM auth.users LIMIT 1)
),
(
    '8',
    'Historic Villa',
    '45 Heritage Street, Dunedin',
    780000,
    4,
    2,
    'under_offer',
    28,
    NOW() - INTERVAL '28 days',
    'house',
    'Beautifully restored historic villa with original features. Includes modern updates while maintaining its classic charm.',
    (SELECT id FROM auth.users LIMIT 1)
),
(
    '9',
    'Mountain View Retreat',
    '72 Alpine Way, Queenstown',
    1450000,
    5,
    3,
    'active',
    14,
    NOW() - INTERVAL '14 days',
    'house',
    'Stunning mountain retreat with breathtaking views. Perfect for year-round enjoyment with proximity to skiing and hiking trails.',
    (SELECT id FROM auth.users LIMIT 1)
),
(
    '10',
    'Urban Townhouse',
    '33 City Centre, Wellington',
    720000,
    3,
    2,
    'active',
    5,
    NOW() - INTERVAL '5 days',
    'townhouse',
    'Modern townhouse in the heart of the city. Features include a rooftop terrace, open plan living, and secure parking.',
    (SELECT id FROM auth.users LIMIT 1)
);

-- Add property images
INSERT INTO public.property_images (
    property_id,
    url,
    is_primary
) VALUES
(
    '1',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914',
    true
),
(
    '1',
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83',
    false
),
(
    '2',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
    true
),
(
    '3',
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
    true
),
(
    '4',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
    true
),
(
    '5',
    'https://images.unsplash.com/photo-1510798831971-661eb04b3739',
    true
),
(
    '6',
    'https://images.unsplash.com/photo-1523217582562-09d0def993a6',
    true
),
(
    '7',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6',
    true
),
(
    '8',
    'https://images.unsplash.com/photo-1577495508048-b635879837f1',
    true
),
(
    '9',
    'https://images.unsplash.com/photo-1513584684374-8bab748fbf90',
    true
),
(
    '10',
    'https://images.unsplash.com/photo-1494526585095-c41746248156',
    true
);

-- Add property changes
INSERT INTO public.property_changes (
    property_id,
    change_type,
    old_value,
    new_value,
    change_date,
    description
) VALUES
(
    '3',
    'status',
    'active',
    'under_offer',
    NOW() - INTERVAL '7 days',
    'Property received an offer after 14 days on market'
),
(
    '5',
    'status',
    'active',
    'sold',
    NOW() - INTERVAL '15 days',
    'Property sold after 30 days on market'
),
(
    '5',
    'price',
    '475000',
    '450000',
    NOW() - INTERVAL '25 days',
    'Price reduced by $25,000 to attract more buyers'
),
(
    '8',
    'status',
    'active',
    'under_offer',
    NOW() - INTERVAL '3 days',
    'Property received an offer after 25 days on market'
),
(
    '7',
    'price',
    '1200000',
    '1100000',
    NOW() - INTERVAL '30 days',
    'Price reduced by $100,000 after 30 days on market'
);

-- Add property insights
INSERT INTO public.property_insights (
    property_id,
    insight_type,
    insight_text,
    created_at
) VALUES
(
    '1',
    'market_comparison',
    'This property is priced 5% above similar properties in the area.',
    NOW() - INTERVAL '7 days'
),
(
    '2',
    'price_trend',
    'Apartment prices in this area have increased by 8% in the last 12 months.',
    NOW() - INTERVAL '5 days'
),
(
    '3',
    'recommendation',
    'Consider accepting the current offer as it is within 3% of the asking price.',
    NOW() - INTERVAL '2 days'
),
(
    '4',
    'market_comparison',
    'Luxury properties in this area typically sell within 45 days.',
    NOW() - INTERVAL '15 days'
),
(
    '5',
    'price_trend',
    'Properties in this neighborhood have seen a 6% increase in value over the past year.',
    NOW() - INTERVAL '20 days'
),
(
    '7',
    'recommendation',
    'Consider another price reduction if no offers are received in the next 15 days.',
    NOW() - INTERVAL '10 days'
),
(
    '9',
    'market_comparison',
    'This property is priced competitively compared to similar mountain properties.',
    NOW() - INTERVAL '8 days'
);
