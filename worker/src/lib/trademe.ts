import { Property, PropertyImage, PropertyStatus, TradeMeWatchlistResponse, TradeMeWatchlistItem } from '../types';
import { generateDirectOAuthHeader } from '../utils/oauthUtils';
import { TRADEME_SANDBOX_API_URL, TRADEME_API_URL, getCredentials } from '../config/trademeConfig';

interface TradeMeOptions {
  apiUrl?: string;
  consumerKey?: string;
  consumerSecret?: string;
  oauthToken?: string;
  oauthTokenSecret?: string;
  maxRetries?: number;
  timeout?: number;
  isSandbox?: boolean;
  env?: any; // Environment variables
}

export class TradeMe {
  private apiUrl: string;
  private consumerKey: string;
  private consumerSecret: string;
  private oauthToken: string;
  private oauthTokenSecret: string;
  private maxRetries: number;
  private timeout: number;
  private isSandbox: boolean;
  
  constructor(options: TradeMeOptions) {
    this.isSandbox = options.isSandbox || false;
    this.apiUrl = this.isSandbox ? TRADEME_SANDBOX_API_URL : (options.apiUrl || TRADEME_API_URL);
    
    // Get credentials, potentially from environment
    const credentials = getCredentials(options.env);
    this.consumerKey = options.consumerKey || credentials.consumerKey;
    this.consumerSecret = options.consumerSecret || credentials.consumerSecret;
    
    this.oauthToken = options.oauthToken || '';
    this.oauthTokenSecret = options.oauthTokenSecret || '';
    this.maxRetries = options.maxRetries || 3;
    this.timeout = options.timeout || 30000; // 30 seconds
  }
  
  /**
   * Generate OAuth 1.0a authorization header
   */
  private generateAuthHeader(method: string, url: string): string {
    // Use the imported OAuth utility function
    return generateDirectOAuthHeader(
      'api',
      this.consumerKey,
      this.consumerSecret,
      {
        token: this.oauthToken,
        tokenSecret: this.oauthTokenSecret
      }
    );
  }
  
  /**
   * Get favorited properties using the TradeMe API
   */
  async getFavoriteProperties(): Promise<Property[]> {
    try {
      console.log('Fetching watchlist from TradeMe API');
      
      // Fetch property listings from the watchlist API
      const watchlistData = await this.fetchWatchlist();
      
      // Convert TradeMe watchlist items to our Property format
      const properties = this.convertWatchlistToProperties(watchlistData);
      
      console.log(`Found ${properties.length} favorited properties`);
      return properties;
    } catch (error) {
      console.error('Error getting favorited properties:', error);
      throw error;
    }
  }
  
  /**
   * Fetch watchlist data from TradeMe API
   */
  private async fetchWatchlist(): Promise<TradeMeWatchlistResponse> {
    let retries = 0;
    
    while (retries < this.maxRetries) {
      try {
        // Filter for property category (5), which is the property category in TradeMe
        const url = `${this.apiUrl}/v1/MyTradeMe/Watchlist/All.json?category=5&rows=100`;
        
        console.log(`Fetching watchlist from: ${url}`);
        console.log('TradeMe API credentials:', {
          apiUrl: this.apiUrl,
          hasConsumerKey: !!this.consumerKey,
          hasConsumerSecret: !!this.consumerSecret,
          hasOAuthToken: !!this.oauthToken,
          hasOAuthTokenSecret: !!this.oauthTokenSecret,
          isSandbox: this.isSandbox
        });
        
        // Generate the OAuth header
        const authHeader = this.generateAuthHeader('GET', url);
        
        // Make the request
        console.log('Making request to TradeMe API...');
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': authHeader,
            'Accept': 'application/json'
          },
          timeout: this.timeout
        });
        
        console.log('TradeMe API response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('TradeMe API error response:', errorText);
          throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json() as TradeMeWatchlistResponse;
        console.log('TradeMe API response data:', {
          totalCount: data.TotalCount,
          page: data.Page,
          pageSize: data.PageSize,
          listLength: data.List?.length || 0,
          sampleItem: data.List && data.List.length > 0 ? {
            id: data.List[0].ListingId,
            title: data.List[0].Title?.substring(0, 20) + '...',
            hasAttributes: !!data.List[0].Attributes
          } : null
        });
        return data;
      } catch (error) {
        console.error(`Error fetching watchlist (attempt ${retries + 1}/${this.maxRetries}):`, error);
        retries++;
        
        if (retries >= this.maxRetries) {
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    throw new Error(`Failed to fetch watchlist after ${this.maxRetries} attempts`);
  }
  
  /**
   * Convert TradeMe watchlist items to our Property format
   */
  private convertWatchlistToProperties(watchlistData: TradeMeWatchlistResponse): Property[] {
    if (!watchlistData.List || watchlistData.List.length === 0) {
      return [];
    }
    
    return watchlistData.List
      .filter(item => {
        // Filter to only include property listings
        // Category path for properties usually starts with /property/
        return item.CategoryPath?.includes('/property/');
      })
      .map(item => this.mapWatchlistItemToProperty(item));
  }
  
  /**
   * Map a TradeMe watchlist item to our Property format
   */
  private mapWatchlistItemToProperty(item: TradeMeWatchlistItem): Property {
    // Extract property ID from the listing ID
    const id = item.ListingId.toString();
    
    // Determine property status based on attributes or other fields
    let status: PropertyStatus = 'active';
    
    // Check if there are any status attributes
    if (item.Attributes) {
      const statusAttribute = item.Attributes.find(attr => 
        attr.Name?.toLowerCase().includes('status') || 
        attr.DisplayName?.toLowerCase().includes('status')
      );
      
      if (statusAttribute && statusAttribute.Value) {
        const statusValue = statusAttribute.Value.toLowerCase();
        if (statusValue.includes('under offer')) {
          status = 'under_offer';
        } else if (statusValue.includes('sold')) {
          status = 'sold';
        }
      }
    }
    
    // Calculate days on market based on start date
    const startDate = new Date(item.StartDate);
    const now = new Date();
    const daysOnMarket = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Extract address from title or attributes
    let address = '';
    if (item.Attributes) {
      const addressAttribute = item.Attributes.find(attr => 
        attr.Name?.toLowerCase().includes('address') || 
        attr.DisplayName?.toLowerCase().includes('address')
      );
      
      if (addressAttribute && addressAttribute.Value) {
        address = addressAttribute.Value;
      }
    }
    
    // If no address found in attributes, try to extract from title
    if (!address && item.Title) {
      address = item.Title;
    }
    
    // Extract bedrooms and bathrooms from attributes if available
    let bedrooms: number | undefined;
    let bathrooms: number | undefined;
    let propertyType: string | undefined;
    let landArea: string | undefined;
    let floorArea: string | undefined;
    
    if (item.Attributes) {
      // Extract bedrooms
      const bedroomsAttribute = item.Attributes.find(attr => 
        attr.Name?.toLowerCase().includes('bedroom') || 
        attr.DisplayName?.toLowerCase().includes('bedroom')
      );
      
      if (bedroomsAttribute && bedroomsAttribute.Value) {
        const bedroomsValue = parseInt(bedroomsAttribute.Value);
        if (!isNaN(bedroomsValue)) {
          bedrooms = bedroomsValue;
        }
      }
      
      // Extract bathrooms
      const bathroomsAttribute = item.Attributes.find(attr => 
        attr.Name?.toLowerCase().includes('bathroom') || 
        attr.DisplayName?.toLowerCase().includes('bathroom')
      );
      
      if (bathroomsAttribute && bathroomsAttribute.Value) {
        const bathroomsValue = parseInt(bathroomsAttribute.Value);
        if (!isNaN(bathroomsValue)) {
          bathrooms = bathroomsValue;
        }
      }
      
      // Extract property type
      const propertyTypeAttribute = item.Attributes.find(attr => 
        attr.Name?.toLowerCase().includes('property type') || 
        attr.DisplayName?.toLowerCase().includes('property type')
      );
      
      if (propertyTypeAttribute && propertyTypeAttribute.Value) {
        propertyType = propertyTypeAttribute.Value;
      }
      
      // Extract land area
      const landAreaAttribute = item.Attributes.find(attr => 
        attr.Name?.toLowerCase().includes('land area') || 
        attr.DisplayName?.toLowerCase().includes('land area')
      );
      
      if (landAreaAttribute && landAreaAttribute.Value) {
        landArea = landAreaAttribute.Value;
      }
      
      // Extract floor area
      const floorAreaAttribute = item.Attributes.find(attr => 
        attr.Name?.toLowerCase().includes('floor area') || 
        attr.DisplayName?.toLowerCase().includes('floor area')
      );
      
      if (floorAreaAttribute && floorAreaAttribute.Value) {
        floorArea = floorAreaAttribute.Value;
      }
    }
    
    return {
      id,
      title: item.Title || '',
      address,
      price: item.StartPrice || 0,
      status,
      bedrooms,
      bathrooms,
      property_type: propertyType,
      land_area: landArea,
      floor_area: floorArea,
      primary_image_url: item.PictureHref,
      url: `https://www.trademe.co.nz/a/property/residential/${id}`,
      created_at: item.StartDate,
      days_on_market: daysOnMarket,
      last_updated: new Date().toISOString()
    };
  }
  
  /**
   * Get detailed property information
   */
  async searchProperties(searchParams: Record<string, string> = {}): Promise<Property[]> {
    try {
      console.log('Searching for properties with params:', searchParams);
      
      // Default to property category
      const defaultParams = {
        category: '5', // Property category
        rows: '20',
        sort_order: 'Default'
      };
      
      const params = { ...defaultParams, ...searchParams };
      
      // Build query string
      const queryString = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
      
      const url = `${this.apiUrl}/v1/Search/Property.json?${queryString}`;
      
      console.log(`Searching properties at: ${url}`);
      
      // Generate the OAuth header
      const authHeader = this.generateAuthHeader('GET', url);
      
      // Make the request
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json'
        },
        timeout: this.timeout
      });
      
      if (!response.ok) {
        throw new Error(`TradeMe API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Convert TradeMe search results to our Property format
      return this.convertSearchResultsToProperties(data);
    } catch (error) {
      console.error('Error searching properties:', error);
      throw error;
    }
  }
  
  private convertSearchResultsToProperties(searchData: any): Property[] {
    if (!searchData.List || searchData.List.length === 0) {
      return [];
    }
    
    return searchData.List
      .filter((item: any) => item)
      .map((item: any) => this.mapSearchItemToProperty(item));
  }
  
  private mapSearchItemToProperty(item: any): Property {
    // Extract property ID from the listing ID
    const id = item.ListingId?.toString() || '';
    
    // Determine property status based on attributes or other fields
    let status: PropertyStatus = 'active';
    
    // Extract price
    let price = 0;
    if (item.PriceDisplay) {
      // Try to extract numeric value from price display
      const priceMatch = item.PriceDisplay.match(/\$([0-9,]+)/);
      if (priceMatch && priceMatch[1]) {
        price = parseInt(priceMatch[1].replace(/,/g, ''), 10);
      }
    } else if (item.StartPrice) {
      price = item.StartPrice;
    }
    
    // Extract bedrooms and bathrooms
    let bedrooms: number | undefined;
    let bathrooms: number | undefined;
    let propertyType: string | undefined;
    let landArea: string | undefined;
    let floorArea: string | undefined;
    
    if (item.Attributes) {
      for (const attr of item.Attributes) {
        if (attr.Name === 'Bedrooms') {
          bedrooms = parseInt(attr.Value || '0', 10);
        } else if (attr.Name === 'Bathrooms') {
          bathrooms = parseInt(attr.Value || '0', 10);
        } else if (attr.Name === 'PropertyType') {
          propertyType = attr.Value;
        } else if (attr.Name === 'LandArea') {
          landArea = attr.Value;
        } else if (attr.Name === 'FloorArea') {
          floorArea = attr.Value;
        }
      }
    }
    
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
      days_on_market: 0, // Default value, may need to calculate from listing date
      created_at: item.StartDate || new Date().toISOString(),
      primary_image_url: item.PictureHref,
      url: `https://www.trademe.co.nz/a/property/residential/${id}`,
      last_updated: new Date().toISOString()
    };
  }
  
  async getPropertyDetails(propertyId: string): Promise<Property> {
    try {
      console.log(`Fetching details for property ${propertyId}`);
      
      // Use the TradeMe API to get detailed property information
      const url = `${this.apiUrl}/v1/Listings/${propertyId}.json`;
      
      console.log(`Fetching property details from: ${url}`);
      
      // Generate the OAuth header
      const authHeader = this.generateAuthHeader('GET', url);
      
      // Make the request
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json'
        },
        timeout: this.timeout
      });
      
      if (!response.ok) {
        throw new Error(`TradeMe API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Convert TradeMe listing to our Property format
      const property = this.mapSearchItemToProperty(data);
      
      // Add placeholder images array
      property.images = [{
        id: `${propertyId}-0`,
        property_id: propertyId,
        url: property.primary_image_url || '',
        is_primary: true,
        created_at: new Date().toISOString()
      }];
      
      console.log(`Got details for property ${propertyId}`);
      return property;
    } catch (error) {
      console.error(`Error fetching property details for ${propertyId}:`, error);
      
      // Fallback to watchlist data if available
      try {
        const watchlistData = await this.fetchWatchlist();
        const watchlistItem = watchlistData.List.find(item => item.ListingId.toString() === propertyId);
        
        if (!watchlistItem) {
          throw new Error(`Property ${propertyId} not found in watchlist`);
        }
        
        // Map the watchlist item to our Property format
        const property = this.mapWatchlistItemToProperty(watchlistItem);
        
        // Add placeholder images array
        property.images = [{
          id: `${propertyId}-0`,
          property_id: propertyId,
          url: property.primary_image_url || '',
          is_primary: true,
          created_at: new Date().toISOString()
        }];
        
        return property;
      } catch (fallbackError) {
        console.error(`Fallback also failed for property ${propertyId}:`, fallbackError);
        throw error; // Throw the original error
      }
    }
  }
}
