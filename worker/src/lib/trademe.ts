import * as playwright from 'playwright-aws-lambda';
import * as puppeteer from 'puppeteer-core';
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
  private browser: any = null;
  private page: any = null;
  
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
    console.log(`Launching browser in ${this.headless ? 'headless' : 'visible'} mode`);
    
    // Launch the browser
    this.browser = await playwright.launchChromium({
      headless: this.headless,
    }) as any;
    
    // Create a new page
    if (this.browser) {
      this.page = await this.browser.newPage();
      
      // Set timeout
      await this.page.setDefaultTimeout(this.timeout);
      
      // Set user agent to avoid detection
      const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
      await this.page.setExtraHTTPHeaders({
        'User-Agent': userAgent
      });
      
      // Enable console logging from the browser
      this.page.on('console', (msg: any) => console.log('Browser console:', msg.text()));
      
      // Log navigation events in debug mode
      if (!this.headless) {
        this.page.on('request', (request: any) => {
          console.log(`Request: ${request.method()} ${request.url()}`);
        });
        
        this.page.on('response', (response: any) => {
          console.log(`Response: ${response.status()} ${response.url()}`);
        });
      }
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
      await this.page.goto(`https://www.trademe.co.nz/a/login`);
      
      // Check if we're already logged in
      const alreadyLoggedIn = await this.page.evaluate(() => {
        return document.querySelector('.tm-header-account-name') !== null;
      });
      
      if (alreadyLoggedIn) {
        console.log('Already logged in');
        return;
      }
      
      console.log('Waiting for login iframe...');
      
      // Wait for the login iframe to appear
      try {
        // Wait for the iframe to load
        await this.page.waitForSelector('iframe[src*="auth.trademe.co.nz"]', { timeout: 10000 });
        
        // Get all iframes
        const frames = this.page.frames();
        console.log(`Found ${frames.length} frames on the page`);
        
        // Find the login iframe
        const loginFrame = frames.find((frame: any) => 
          frame.url().includes('auth.trademe.co.nz')
        );
        
        if (!loginFrame) {
          throw new Error('Login iframe not found');
        }
        
        console.log('Found login iframe, waiting for form elements...');
        
        // Wait for the form elements in the iframe
        await loginFrame.waitForSelector('#Email', { timeout: 10000 });
        await loginFrame.waitForSelector('#Password', { timeout: 5000 });
        
        // Take a screenshot in debug mode
        if (!this.headless) {
          await this.page.screenshot({ path: 'login-form.png' });
          console.log('Saved screenshot to login-form.png');
        }
        
        // Fill in the login form within the iframe
        await loginFrame.type('#Email', this.username);
        await loginFrame.type('#Password', this.password);
        
        console.log('Submitting login form...');
        
        // Submit the form
        await Promise.all([
          this.page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }),
          loginFrame.click('button[type="submit"]')
        ]);
        
        // Wait for successful login redirect
        await this.page.waitForSelector('.tm-header-account-name', { timeout: 15000 })
          .catch(() => console.log('Account name element not found after login, but continuing...'));
        
      } catch (error) {
        console.error('Error with login form:', error);
        
        // Take a screenshot to see what's on the page
        if (!this.headless) {
          await this.page.screenshot({ path: 'login-error.png' });
          console.log('Saved error screenshot to login-error.png');
        }
        
        // Get the page content to debug
        const content = await this.page.content();
        console.log('Page content:', content.substring(0, 500) + '...');
        
        throw new Error('Failed to find login form elements');
      }
      
      // Check if we're on the dashboard page
      const currentUrl = this.page.url();
      if (currentUrl.includes('trademe.co.nz/a/') && !currentUrl.includes('/login')) {
        console.log('Login successful, redirected to:', currentUrl);
      } else {
        console.warn('Login may have failed, current URL:', currentUrl);
      }
      
      console.log('Login process completed');
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
        const propertyDetails = await this.page.evaluate((baseUrl: string, propertyId: string) => {
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
          id: propertyId,
          title: propertyDetails.title,
          address: propertyDetails.address,
          price: propertyDetails.price,
          status: propertyDetails.status as PropertyStatus,
          bedrooms: propertyDetails.bedrooms,
          bathrooms: propertyDetails.bathrooms,
          property_type: propertyDetails.property_type,
          land_area: propertyDetails.land_area,
          floor_area: propertyDetails.floor_area,
          primary_image_url: propertyDetails.primary_image_url,
          images: propertyDetails.images,
          url: propertyDetails.url,
          created_at: propertyDetails.created_at,
          days_on_market: propertyDetails.days_on_market,
          description: propertyDetails.description,
          agent: propertyDetails.agent,
          agency: propertyDetails.agency,
          last_updated: propertyDetails.last_updated
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
