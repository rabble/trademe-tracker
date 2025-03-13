/**
 * Property mapping utilities for converting TradeMe API responses to our application's property model
 */
import { Property } from '../types';

/**
 * Helper function to parse numeric values from strings
 * 
 * @param value - String value that may contain a number
 * @returns Parsed number or undefined
 */
export function parseNumericValue(value: string | undefined): number | undefined {
  if (!value) return undefined;
  
  // Extract numeric part using regex
  const numericMatch = value.match(/(\d+(\.\d+)?)/);
  if (numericMatch && numericMatch[1]) {
    return parseFloat(numericMatch[1]);
  }
  return undefined;
}

/**
 * Maps TradeMe property type strings to our application's property types
 * 
 * @param type - Property type string from TradeMe
 * @returns Mapped property type or undefined
 */
export function mapToPropertyType(
  type: string | undefined
): 'house' | 'apartment' | 'townhouse' | 'section' | 'other' | undefined {
  if (!type) return undefined;
  
  const lowerType = type.toLowerCase();
  
  if (lowerType.includes('house')) return 'house';
  if (lowerType.includes('apartment')) return 'apartment';
  if (lowerType.includes('townhouse') || lowerType.includes('town house')) return 'townhouse';
  if (lowerType.includes('section') || lowerType.includes('land')) return 'section';
  
  return 'other';
}

/**
 * Extract property attributes from TradeMe listing attributes
 * 
 * @param attributes - Array of TradeMe attributes
 * @returns Object containing extracted property attributes
 */
export function extractPropertyAttributes(attributes: any[] | undefined): {
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: 'house' | 'apartment' | 'townhouse' | 'section' | 'other';
  landArea?: number;
  floorArea?: number;
} {
  if (!attributes || !Array.isArray(attributes)) {
    return {};
  }
  
  const result: {
    bedrooms?: number;
    bathrooms?: number;
    propertyType?: 'house' | 'apartment' | 'townhouse' | 'section' | 'other';
    landArea?: number;
    floorArea?: number;
  } = {};
  
  for (const attr of attributes) {
    if (attr.Name === 'Bedrooms') {
      result.bedrooms = parseInt(attr.Value || '0', 10);
    } else if (attr.Name === 'Bathrooms') {
      result.bathrooms = parseInt(attr.Value || '0', 10);
    } else if (attr.Name === 'PropertyType') {
      result.propertyType = mapToPropertyType(attr.Value);
    } else if (attr.Name === 'LandArea') {
      result.landArea = parseNumericValue(attr.Value);
    } else if (attr.Name === 'FloorArea') {
      result.floorArea = parseNumericValue(attr.Value);
    }
  }
  
  return result;
}

/**
 * Extract price from TradeMe listing
 * 
 * @param item - TradeMe listing item
 * @returns Extracted price as a number
 */
export function extractPrice(item: any): number {
  if (item.PriceDisplay) {
    // Try to extract numeric value from price display
    const priceMatch = item.PriceDisplay.match(/\$([0-9,]+)/);
    if (priceMatch && priceMatch[1]) {
      return parseInt(priceMatch[1].replace(/,/g, ''), 10);
    }
  } else if (item.StartPrice) {
    return item.StartPrice;
  }
  
  return 0;
}

/**
 * Calculate days on market from start date
 * 
 * @param startDate - Start date string
 * @returns Number of days on market
 */
export function calculateDaysOnMarket(startDate: string | undefined): number {
  if (!startDate) return 0;
  
  const start = new Date(startDate);
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Map a TradeMe listing to our Property format
 * 
 * @param item - TradeMe listing item
 * @returns Mapped Property object
 */
export function mapListingToProperty(item: any): Property {
  if (!item) {
    throw new Error('Invalid listing item');
  }
  
  // Extract property ID from the listing ID
  const id = item.ListingId?.toString() || '';
  
  // Determine property status based on attributes or other fields
  let status: 'active' | 'under_offer' | 'sold' | 'archived' = 'active';
  
  // Extract price
  const price = extractPrice(item);
  
  // Extract bedrooms and bathrooms
  let bedrooms: number | undefined = item.Bedrooms;
  let bathrooms: number | undefined = item.Bathrooms;
  let propertyType: 'house' | 'apartment' | 'townhouse' | 'section' | 'other' | undefined = 
    mapToPropertyType(item.PropertyType);
  let landArea: number | undefined;
  let floorArea: number | undefined;
  
  if (item.LandArea) {
    landArea = typeof item.LandArea === 'number' ? item.LandArea : parseNumericValue(item.LandArea);
  }
  
  if (item.FloorArea) {
    floorArea = typeof item.FloorArea === 'number' ? item.FloorArea : parseNumericValue(item.FloorArea);
  }
  
  // Extract attributes if available
  if (item.Attributes) {
    const attributes = extractPropertyAttributes(item.Attributes);
    
    // Only use attributes if the direct properties aren't available
    if (!bedrooms && attributes.bedrooms) bedrooms = attributes.bedrooms;
    if (!bathrooms && attributes.bathrooms) bathrooms = attributes.bathrooms;
    if (!propertyType && attributes.propertyType) propertyType = attributes.propertyType;
    if (!landArea && attributes.landArea) landArea = attributes.landArea;
    if (!floorArea && attributes.floorArea) floorArea = attributes.floorArea;
  }
  
  // Calculate days on market
  const daysOnMarket = calculateDaysOnMarket(item.StartDate);
  
  return {
    id,
    title: item.Title || 'Untitled Property',
    address: item.Address || item.Suburb || 'Unknown Location',
    price,
    bedrooms,
    bathrooms,
    property_type: propertyType,
    land_area: landArea,
    floor_area: floorArea,
    status,
    days_on_market: daysOnMarket,
    created_at: item.StartDate || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    image_urls: item.PictureHref ? [item.PictureHref] : [],
    trademe_listing_id: id,
    url: `https://www.trademe.co.nz/a/property/residential/sale/listing/${id}`
  };
}

/**
 * Map a TradeMe watchlist item to our Property format
 * 
 * @param item - TradeMe watchlist item
 * @param userId - Current user ID
 * @returns Mapped Property object
 */
export function mapWatchlistItemToProperty(item: any, userId: string = 'anonymous'): Property {
  const property = mapListingToProperty(item);
  
  // Add watchlist-specific properties
  // Note: Only add properties that exist in the Property type
  return {
    ...property,
    // Only add properties that are defined in the Property type
    source: 'trademe'
  };
}

/**
 * Convert TradeMe search results to our Property format
 * 
 * @param searchData - TradeMe search response data
 * @returns Array of mapped Property objects
 */
export function convertSearchResultsToProperties(searchData: any): Property[] {
  if (!searchData.List || searchData.List.length === 0) {
    return [];
  }
  
  return searchData.List
    .filter((item: any) => item)
    .map((item: any) => mapListingToProperty(item));
}
