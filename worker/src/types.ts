export type PropertyStatus = 'active' | 'under_offer' | 'sold' | 'archived';

// TradeMe API interfaces
export interface TradeMeWatchlistResponse {
  TotalCount: number;
  Page: number;
  PageSize: number;
  List: TradeMeWatchlistItem[];
  FoundCategories?: TradeMeFoundCategory[];
}

export interface TradeMeWatchlistItem {
  ListingId: number;
  Title?: string;
  Category?: string;
  StartPrice: number;
  BuyNowPrice: number;
  StartDate: string;
  EndDate: string;
  MaxBidAmount: number;
  AsAt: string;
  CategoryPath?: string;
  PictureHref?: string;
  PhotoId: number;
  Region?: string;
  Suburb?: string;
  PriceDisplay?: string;
  IsClassified: boolean;
  GeographicLocation?: {
    Latitude: number;
    Longitude: number;
    Accuracy: number;
  };
  Attributes?: TradeMeAttribute[];
}

export interface TradeMeAttribute {
  Name?: string;
  DisplayName?: string;
  Value?: string;
}

export interface TradeMeFoundCategory {
  Count: number;
  Category?: string;
  Name?: string;
  CategoryId: number;
  IsLeaf: boolean;
}

export interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  property_type?: string;
  land_area?: string;
  floor_area?: string;
  status: PropertyStatus;
  primary_image_url?: string;
  images?: PropertyImage[];
  url?: string;
  created_at: string;
  days_on_market: number;
  description?: string;
  agent?: string;
  agency?: string;
  last_updated?: string;
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
  property_title: string;
  change_type: 'price' | 'status' | 'description';
  old_value: string;
  new_value: string;
  change_date: string;
  description?: string;
}

export interface PortfolioSummary {
  totalProperties: number;
  activeProperties: number;
  underOfferProperties: number;
  soldProperties: number;
  averagePrice: number;
  averageDaysOnMarket: number;
}
