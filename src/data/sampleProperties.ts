import { Property } from '../types'

/**
 * Sample property data for development and testing
 */
export const sampleProperties: Property[] = [
  {
    id: '1',
    title: 'Modern Beachfront Villa',
    address: '123 Ocean Drive, Mount Maunganui',
    price: 1250000,
    bedrooms: 4,
    bathrooms: 3,
    status: 'active',
    days_on_market: 14,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    listing_type: 'for_sale',
    primary_image_url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
    last_price_change: {
      old_price: 1300000,
      new_price: 1250000,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  },
  {
    id: '2',
    title: 'Charming Character Bungalow',
    address: '45 Victoria Street, Devonport, Auckland',
    price: 975000,
    bedrooms: 3,
    bathrooms: 1,
    status: 'active',
    days_on_market: 28,
    created_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    listing_type: 'for_sale',
    primary_image_url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
  },
  {
    id: '3',
    title: 'Luxury Penthouse Apartment',
    address: '1001/88 Customs Street, Auckland CBD',
    price: 2450000,
    bedrooms: 3,
    bathrooms: 2,
    status: 'under_offer',
    days_on_market: 45,
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    listing_type: 'for_sale',
    primary_image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
  },
  {
    id: '4',
    title: 'Contemporary Family Home',
    address: '27 Rimu Street, Karori, Wellington',
    price: 1150000,
    bedrooms: 4,
    bathrooms: 2,
    status: 'active',
    days_on_market: 7,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    listing_type: 'for_sale',
    primary_image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1175&q=80',
    last_price_change: {
      old_price: 1200000,
      new_price: 1150000,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  },
  {
    id: '5',
    title: 'Waterfront Lifestyle Property',
    address: '156 Harbour View Road, Omokoroa',
    price: 1850000,
    bedrooms: 5,
    bathrooms: 3,
    status: 'sold',
    days_on_market: 60,
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    listing_type: 'for_sale',
    primary_image_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
  },
  {
    id: '6',
    title: 'Stylish City Apartment',
    address: '303/42 Queen Street, Auckland CBD',
    price: 750000,
    bedrooms: 2,
    bathrooms: 1,
    status: 'active',
    days_on_market: 21,
    created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    listing_type: 'for_sale',
    primary_image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80'
  },
  {
    id: '7',
    title: 'Rural Lifestyle Block',
    address: '123 Valley Road, Cambridge',
    price: 1450000,
    bedrooms: 4,
    bathrooms: 2,
    status: 'active',
    days_on_market: 5,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    listing_type: 'for_sale',
    primary_image_url: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
  },
  {
    id: '8',
    title: 'Historic Villa with Modern Interior',
    address: '78 Franklin Road, Ponsonby, Auckland',
    price: 2250000,
    bedrooms: 4,
    bathrooms: 3,
    status: 'under_offer',
    days_on_market: 35,
    created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    listing_type: 'for_sale',
    primary_image_url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80',
    last_price_change: {
      old_price: 2400000,
      new_price: 2250000,
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    }
  },
  {
    id: '9',
    title: 'Coastal Retreat',
    address: '42 Beach Road, Whangamata',
    price: 895000,
    bedrooms: 3,
    bathrooms: 1,
    status: 'active',
    days_on_market: 12,
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    listing_type: 'for_sale',
    primary_image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
  },
  {
    id: '10',
    title: 'Executive Home with Views',
    address: '15 Panorama Terrace, Queenstown',
    price: 3200000,
    bedrooms: 5,
    bathrooms: 4,
    status: 'active',
    days_on_market: 2,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    listing_type: 'for_sale',
    primary_image_url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
  },
  {
    id: '11',
    title: 'Modern 2 Bedroom Apartment for Rent',
    address: '505/10 Queen Street, Auckland Central',
    price: 650,
    bedrooms: 2,
    bathrooms: 1,
    status: 'active',
    days_on_market: 7,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    listing_type: 'rental',
    primary_image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
  },
  {
    id: '12',
    title: 'Spacious 3 Bedroom House for Rent',
    address: '45 Valley Road, Mt Eden, Auckland',
    price: 850,
    bedrooms: 3,
    bathrooms: 2,
    status: 'active',
    days_on_market: 14,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    listing_type: 'rental',
    primary_image_url: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
  },
  {
    id: '13',
    title: 'Cozy 1 Bedroom Apartment in Ponsonby',
    address: '12/45 Ponsonby Road, Ponsonby, Auckland',
    price: 450,
    bedrooms: 1,
    bathrooms: 1,
    status: 'active',
    days_on_market: 5,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    listing_type: 'rental',
    primary_image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
  }
]

/**
 * Sample property insights for development and testing
 */
export const sampleInsights = [
  {
    id: '1',
    property_id: '1',
    properties: { title: 'Modern Beachfront Villa' },
    insight_type: 'price_trend',
    insight_text: 'This property is priced 8% below similar properties in Mount Maunganui. Consider viewing soon as it may sell quickly.',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    property_id: '4',
    properties: { title: 'Contemporary Family Home' },
    insight_type: 'market_comparison',
    insight_text: 'Properties in Karori have seen a 5% increase in value over the last 3 months. This home is priced competitively.',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    property_id: '8',
    properties: { title: 'Historic Villa with Modern Interior' },
    insight_type: 'recommendation',
    insight_text: 'The recent price drop of $150,000 makes this Ponsonby villa an excellent opportunity. Similar properties have sold within 2 weeks of price reductions.',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    property_id: '10',
    properties: { title: 'Executive Home with Views' },
    insight_type: 'price_trend',
    insight_text: 'Luxury properties in Queenstown are selling 15% faster than last year. This new listing is likely to attract significant interest.',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '5',
    property_id: '6',
    properties: { title: 'Stylish City Apartment' },
    insight_type: 'market_comparison',
    insight_text: 'CBD apartments have decreased in value by 3% this quarter. This unit is priced at the upper end of the market for its size.',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }
]

/**
 * Sample property changes for development and testing
 */
export const sampleChanges = [
  {
    id: '1',
    property_id: '1',
    properties: { title: 'Modern Beachfront Villa' },
    change_type: 'price',
    old_value: '1300000',
    new_value: '1250000',
    change_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    property_id: '4',
    properties: { title: 'Contemporary Family Home' },
    change_type: 'price',
    old_value: '1200000',
    new_value: '1150000',
    change_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    property_id: '3',
    properties: { title: 'Luxury Penthouse Apartment' },
    change_type: 'status',
    old_value: 'active',
    new_value: 'under_offer',
    change_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    property_id: '8',
    properties: { title: 'Historic Villa with Modern Interior' },
    change_type: 'price',
    old_value: '2400000',
    new_value: '2250000',
    change_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '5',
    property_id: '5',
    properties: { title: 'Waterfront Lifestyle Property' },
    change_type: 'status',
    old_value: 'under_offer',
    new_value: 'sold',
    change_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  }
]

/**
 * Sample portfolio summary for development and testing
 */
export const sampleSummary = {
  totalProperties: 10,
  activeProperties: 7,
  underOfferProperties: 2,
  soldProperties: 1,
  averagePrice: 1622000,
  averageDaysOnMarket: 22.9
}
