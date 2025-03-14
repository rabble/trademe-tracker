// Basic types for the application

export interface User {
  id: string;
  email: string;
}

export interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  status: 'active' | 'under_offer' | 'sold' | 'archived';
  days_on_market: number;
  created_at: string;
  updated_at: string;
  trademe_listing_id?: string;
  url?: string;
  image_urls?: string[];
  description?: string;
  user_notes?: string;
  land_area?: number;
  floor_area?: number;
  property_type?: 'house' | 'apartment' | 'townhouse' | 'section' | 'other';
  listing_type: 'for_sale' | 'rental';
  primary_image_url?: string;
  latitude?: number;
  longitude?: number;
  last_price_change?: {
    old_price: number;
    new_price: number;
    date: string;
  };
}

export interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  is_primary: boolean;
  created_at: string;
}

export interface PropertyChange {
  id: string;
  property_id: string;
  change_type: 'price' | 'status' | 'description';
  old_value: string;
  new_value: string;
  change_date: string;
}

export interface PropertyFilters {
  searchQuery?: string;
  priceRange?: [number | undefined, number | undefined];
  propertyType?: Array<'house' | 'apartment' | 'townhouse' | 'section' | 'other'>;
  bedrooms?: [number | undefined, number | undefined];
  bathrooms?: [number | undefined, number | undefined];
  landArea?: [number | undefined, number | undefined];
  floorArea?: [number | undefined, number | undefined];
  status?: Array<'active' | 'under_offer' | 'sold' | 'archived'>;
  daysOnMarket?: [number | undefined, number | undefined];
  listingType?: Array<'auction' | 'price_by_negotiation' | 'asking_price' | 'tender' | 'enquiries_over'>;
  propertyCategory?: 'for_sale' | 'rental';
}

export interface SavedFilter {
  id: string;
  name: string;
  filters: PropertyFilters;
  createdAt: string;
}
