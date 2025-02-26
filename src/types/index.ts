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
  trademe_id?: string;
  url?: string;
  description?: string;
  user_notes?: string;
  land_area?: number;
  floor_area?: number;
  property_type?: 'house' | 'apartment' | 'townhouse' | 'section' | 'other';
  primary_image_url?: string;
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
