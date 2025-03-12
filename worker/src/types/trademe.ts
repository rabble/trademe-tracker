// TradeMe API response types

export interface TradeMeSearchResponse {
  TotalCount: number;
  Page: number;
  PageSize: number;
  List: TradeMeListingItem[];
}

export interface TradeMeListingItem {
  ListingId: number;
  Title?: string;
  Category?: string;
  StartPrice: number;
  BuyNowPrice?: number;
  StartDate?: string;
  EndDate?: string;
  ListingLength?: number;
  AsAt?: string;
  CategoryPath?: string;
  PictureHref?: string;
  HasGallery?: boolean;
  IsBold?: boolean;
  IsHighlighted?: boolean;
  Region?: string;
  Suburb?: string;
  HasBuyNow?: boolean;
  NoteDate?: string;
  PriceDisplay?: string;
  Address?: string;
  District?: string;
  AgencyReference?: string;
  LandArea?: number;
  LandAreaUnit?: string;
  FloorArea?: number;
  FloorAreaUnit?: string;
  Bedrooms?: number;
  Bathrooms?: number;
  Parking?: string;
  PropertyType?: string;
  PropertyId?: number;
  Attributes?: TradeMeAttribute[];
  GeographicLocation?: {
    Latitude: number;
    Longitude: number;
    Accuracy: string;
  };
}

export interface TradeMePropertyDetails extends TradeMeListingItem {
  Body?: string;
  ViewingInstructions?: string;
  AdditionalData?: {
    OpenHomes?: TradeMeOpenHome[];
    Broadband?: TradeMeBroadband;
  };
}

export interface TradeMeOpenHome {
  Start: string;
  End: string;
}

export interface TradeMeBroadband {
  MaxDownSpeed: number;
  MaxUpSpeed: number;
  Technologies: string[];
}
