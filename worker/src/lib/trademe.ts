import * as playwright from 'playwright-aws-lambda';
import { Browser, Page } from 'playwright-core';
import puppeteer from 'puppeteer-core';
import { Property, PropertyImage, PropertyStatus } from '../types';

interface TradeMeOptions {
  baseUrl: string;
  username: string;
  password: string;
  maxRetries?: number;
  timeout?: number;
  headless?: boolean;
}

export class TradeMe {
  private baseUrl: string;
  private username: string;
  private password: string;
  private maxRetries: number;
  private timeout: number;
  private headless: boolean;
  private browser: puppeteer.Browser | null = null;
  private page: puppeteer.Page | null = null;
  
  constructor(options: TradeMeOptions) {
    this.baseUrl = options.baseUrl;
    this.username = options.username;
    this.password = options.password;
    this.maxRetries = options.maxRetries || 3;
    this.timeout = options.timeout || 30000; // 30 seconds
    this.headless = options.headless !== false; // Default to true if not specified
  }
  
  /**
   * Initialize the browser
   */
  async initialize(): Promise<void> {
    // Launch the browser
    this.browser = await playwright.default({
      headless: this.headless,
    });
    
    // Create a new page
    if (this.browser) {
      this.page = await this.browser.newPage();
      
      // Set timeout
      await this.page.setDefaultTimeout(this.timeout);
      
      // Set user agent to avoid detection
      await this.page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      });
    }
  }
  
  /**
   * Close the browser
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
  
  /**
   * Login to TradeMe
   */
  async login(): Promise<void> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }
    
    try {
      // Navigate to the login page
      await this.page.goto(`${this.baseUrl}/MyTradeMe/Login`);
      
      // Check if we're already logged in
      const alreadyLoggedIn = await this.page.evaluate(() => {
        return document.querySelector('.tm-header-account-name') !== null;
      });
      
      if (alreadyLoggedIn) {
        console.log('Already logged in');
        return;
      }
      
      // Fill in the login form
      await this.page.fill('#Email', this.username);
      await this.page.fill('#Password', this.password);
      
      // Submit the form
      await Promise.all([
        this.page.waitForNavigation(),
        this.page.click('button[type="submit"]')
      ]);
      
      // Check if login was successful
      const loginFailed = await this.page.evaluate(() => {
        return document.querySelector('.validation-summary-errors') !== null;
      });
      
      if (loginFailed) {
        throw new Error('Login failed');
      }
      
      console.log('Login successful');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
  
  /**
   * Get favorited properties
   */
  async getFavoriteProperties(): Promise<Property[]> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }
    
    try {
      // Navigate to the watchlist page
      await this.page.goto(`${this.baseUrl}/MyTradeMe/Watchlist`);
      
      // Wait for the watchlist to load
      await this.page.waitForSelector('.tm-watchlist-item');
      
      // Extract basic property information
      const properties = await this.page.evaluate((baseUrl: string) => {
        const items = Array.from(document.querySelectorAll('.tm-watchlist-item'));
        
        return items.map(item => {
          // Get the property ID from the URL
          const linkElement = item.querySelector('a.tm-property-search-card__link');
          const href = linkElement?.getAttribute('href') || '';
          const idMatch = href.match(/\/property\/(\d+)/);
          const id = idMatch ? idMatch[1] : '';
          
          // Get the title
          const titleElement = item.querySelector('.tm-property-search-card__title');
          const title = titleElement?.textContent?.trim() || '';
          
          // Get the address
          const addressElement = item.querySelector('.tm-property-search-card__address');
          const address = addressElement?.textContent?.trim() || '';
          
          // Get the price
          const priceElement = item.querySelector('.tm-property-search-card__price');
          const priceText = priceElement?.textContent?.trim() || '';
          // Extract numbers from price text (e.g., "$850,000" -> 850000)
          const priceMatch = priceText.match(/\$?([\d,]+)/);
          const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : 0;
          
          // Get the image URL
          const imageElement = item.querySelector('.tm-property-search-card__image');
          const imageUrl = imageElement?.getAttribute('src') || '';
          
          // Get the status
          const statusElement = item.querySelector('.tm-property-search-card__status');
          const statusText = statusElement?.textContent?.trim().toLowerCase() || '';
          let status: 'active' | 'under_offer' | 'sold' | 'archived' = 'active';
          
          if (statusText.includes('under offer')) {
            status = 'under_offer';
          } else if (statusText.includes('sold')) {
            status = 'sold';
          }
          
          return {
            id,
            title,
            address,
            price,
            status,
            primary_image_url: imageUrl,
            url: `${baseUrl}${href}`,
            created_at: new Date().toISOString(), // We'll update this when we get the full details
            days_on_market: 0 // We'll calculate this later
          };
        }).filter(property => property.id); // Filter out items without an ID
      }, this.baseUrl);
      
      console.log(`Found ${properties.length} favorited properties`);
      return properties;
    } catch (error) {
      console.error('Error getting favorited properties:', error);
      throw error;
    }
  }
  
  /**
   * Get detailed property information
   */
  async getPropertyDetails(propertyId: string): Promise<Property> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }
    
    let retries = 0;
    
    while (retries < this.maxRetries) {
      try {
        // Navigate to the property page
        await this.page.goto(`${this.baseUrl}/property/residential/${propertyId}`);
        
        // Wait for the property details to load
        await this.page.waitForSelector('.tm-property-listing');
        
        // Extract detailed property information
        const propertyDetails = await this.page.evaluate<Omit<Property, 'id'>>((baseUrl: string, propertyId: string) => {
          // Get the title
          const titleElement = document.querySelector('.tm-property-listing__title');
          const title = titleElement?.textContent?.trim() || '';
          
          // Get the address
          const addressElement = document.querySelector('.tm-property-listing__address');
          const address = addressElement?.textContent?.trim() || '';
          
          // Get the price
          const priceElement = document.querySelector('.tm-property-listing-price');
          const priceText = priceElement?.textContent?.trim() || '';
          // Extract numbers from price text
          const priceMatch = priceText.match(/\$?([\d,]+)/);
          const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : 0;
          
          // Get the description
          const descriptionElement = document.querySelector('.tm-property-listing-description');
          const description = descriptionElement?.textContent?.trim() || '';
          
          // Get the agent and agency information
          const agentElement = document.querySelector('.tm-property-listing-agent__name');
          const agent = agentElement?.textContent?.trim() || '';
          
          const agencyElement = document.querySelector('.tm-property-listing-agent__agency');
          const agency = agencyElement?.textContent?.trim() || '';
          
          // Get the status
          const statusElement = document.querySelector('.tm-property-listing-status');
          const statusText = statusElement?.textContent?.trim().toLowerCase() || '';
          let status: 'active' | 'under_offer' | 'sold' | 'archived' = 'active';
          
          if (statusText.includes('under offer')) {
            status = 'under_offer';
          } else if (statusText.includes('sold')) {
            status = 'sold';
          }
          
          // Get the bedrooms
          const bedroomsElement = document.querySelector('.tm-property-listing-attributes__bedrooms .tm-property-listing-attributes__value');
          const bedrooms = bedroomsElement ? parseInt(bedroomsElement.textContent?.trim() || '0') : undefined;
          
          // Get the bathrooms
          const bathroomsElement = document.querySelector('.tm-property-listing-attributes__bathrooms .tm-property-listing-attributes__value');
          const bathrooms = bathroomsElement ? parseInt(bathroomsElement.textContent?.trim() || '0') : undefined;
          
          // Get the property type
          const propertyTypeElement = document.querySelector('.tm-property-listing-attributes__property-type .tm-property-listing-attributes__value');
          const propertyType = propertyTypeElement?.textContent?.trim() || undefined;
          
          // Get the land area
          const landAreaElement = document.querySelector('.tm-property-listing-attributes__land-area .tm-property-listing-attributes__value');
          const landArea = landAreaElement?.textContent?.trim() || undefined;
          
          // Get the floor area
          const floorAreaElement = document.querySelector('.tm-property-listing-attributes__floor-area .tm-property-listing-attributes__value');
          const floorArea = floorAreaElement?.textContent?.trim() || undefined;
          
          // Get the listing date
          const listingDateElement = document.querySelector('.tm-property-listing-attributes__listed-date .tm-property-listing-attributes__value');
          const listingDateText = listingDateElement?.textContent?.trim() || '';
          const listingDate = listingDateText ? new Date(listingDateText).toISOString() : new Date().toISOString();
          
          // Get all image URLs
          const imageElements = Array.from(document.querySelectorAll('.tm-property-listing-gallery__thumbnail img'));
          const images = imageElements.map((img, index) => {
            const thumbnailUrl = img.getAttribute('src') || '';
            // Convert thumbnail URL to full-size URL
            const fullSizeUrl = thumbnailUrl.replace('/thumb/', '/full/');
            
            return {
              id: `${propertyId}-${index}`,
              property_id: propertyId,
              url: fullSizeUrl,
              is_primary: index === 0,
              created_at: new Date().toISOString()
            };
          });
          
          // Calculate days on market
          const listedDate = new Date(listingDate);
          const now = new Date();
          const daysOnMarket = Math.floor((now.getTime() - listedDate.getTime()) / (1000 * 60 * 60 * 24));
          
          return {
            title,
            address,
            price,
            status,
            bedrooms,
            bathrooms,
            property_type: propertyType,
            land_area: landArea,
            floor_area: floorArea,
            primary_image_url: images.length > 0 ? images[0].url : undefined,
            images,
            url: `${baseUrl}/property/residential/${propertyId}`,
            created_at: listingDate,
            days_on_market: daysOnMarket,
            description,
            agent,
            agency,
            last_updated: new Date().toISOString()
          };
        }, this.baseUrl, propertyId);
        
        // Add the property ID to the result
        const result: Property = {
          ...propertyDetails,
          id: propertyId
        };
        
        console.log(`Got details for property ${propertyId}`);
        return result;
      } catch (error) {
        console.error(`Error getting property details (attempt ${retries + 1}/${this.maxRetries}):`, error);
        retries++;
        
        if (retries >= this.maxRetries) {
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // This should never be reached due to the throw in the loop
    throw new Error(`Failed to get property details after ${this.maxRetries} attempts`);
  }
  
  /**
   * Check if the session is still valid
   */
  async isSessionValid(): Promise<boolean> {
    if (!this.page) {
      return false;
    }
    
    try {
      // Navigate to the account page
      await this.page.goto(`${this.baseUrl}/MyTradeMe/Account`);
      
      // Check if we're still logged in
      return await this.page.evaluate(() => {
        return document.querySelector('.tm-header-account-name') !== null;
      });
    } catch (error) {
      console.error('Error checking session validity:', error);
      return false;
    }
  }
}
