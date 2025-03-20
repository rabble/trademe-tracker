import { Env } from '../index';
import { Property } from '../types';

interface ScraperResult {
  success: boolean;
  property?: Partial<Property>;
  error?: string;
}

/**
 * Service for scraping property data from external URLs
 */
export class UrlScraperService {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  /**
   * Scrape property data from a URL
   * 
   * @param url The URL to scrape
   * @returns Promise with the scraped property data or error
   */
  async scrapeUrl(url: string): Promise<ScraperResult> {
    console.log(`Scraping property data from URL: ${url}`);

    try {
      // Validate URL
      if (!this.isValidUrl(url)) {
        return {
          success: false,
          error: 'Invalid URL format. Please provide a valid HTTP or HTTPS URL.'
        };
      }

      // Fetch the page content
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to fetch URL: ${response.status} ${response.statusText}`
        };
      }

      const html = await response.text();
      
      // Extract property data using various methods
      const property = await this.extractPropertyData(url, html);
      
      // Check if we have at least a title
      if (!property.title) {
        return {
          success: false,
          error: 'Could not extract property data from the provided URL'
        };
      }

      return {
        success: true,
        property
      };
    } catch (error) {
      console.error(`Error scraping URL ${url}:`, error);
      return {
        success: false,
        error: `Failed to scrape URL: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Validate URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Extract property data from HTML content using multiple approaches
   */
  private async extractPropertyData(url: string, html: string): Promise<Partial<Property>> {
    // Initialize with empty property object
    const property: Partial<Property> = {
      url: url // Always store the source URL
    };

    // Check if this is a TradeMe URL
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname.includes('trademe.co.nz')) {
      // Use TradeMe-specific extraction
      return this.extractTradeMe(url, html);
    }

    // Try multiple methods to extract data
    await Promise.all([
      this.extractStructuredData(html, property),
      this.extractOpenGraph(html, property),
      this.extractMetaTags(html, property),
      this.extractContentHeuristics(html, property)
    ]);

    // Add default values for required fields if missing
    property.status = property.status || 'active';
    property.days_on_market = property.days_on_market || 0;
    
    // Format the images as an array if we have any
    if (property.primary_image_url && !property.image_urls) {
      property.image_urls = [property.primary_image_url];
    }

    return property;
  }
  
  /**
   * Extract property data specifically from TradeMe listings
   */
  private async extractTradeMe(url: string, html: string): Promise<Partial<Property>> {
    console.log('Extracting TradeMe property data from URL:', url);
    
    const property: Partial<Property> = {
      url: url,
      status: 'active',
      days_on_market: 0,
      property_type: 'house',
      listing_type: 'for_sale'
    };
    
    try {
      // Extract title from breadcrumb structure or page title
      const titleMatch = html.match(/<h1[^>]*class="[^"]*o-property-listing__title[^"]*"[^>]*>([^<]+)<\/h1>/i) ||
                         html.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
                         html.match(/<title>([^<]+)<\/title>/i);
                         
      if (titleMatch && titleMatch[1]) {
        property.title = titleMatch[1].trim();
      }
      
      // Extract price
      const priceMatch = html.match(/class="[^"]*tm-property-listing-body__price[^"]*"[^>]*>[^<]*\$([0-9,]+)/i) ||
                         html.match(/property-listing__price[^>]*>\s*\$([0-9,]+)/i) ||
                         html.match(/price[^>]*>\s*\$([0-9,]+)/i);
                         
      if (priceMatch && priceMatch[1]) {
        property.price = parseInt(priceMatch[1].replace(/,/g, ''));
      }
      
      // Extract address
      const addressMatch = html.match(/class="[^"]*tm-property-listing-body__address[^"]*"[^>]*>([^<]+)<\/span>/i) ||
                           html.match(/address[^>]*>([^<]+)<\/[^>]+>/i);
                           
      if (addressMatch && addressMatch[1]) {
        property.address = addressMatch[1].trim();
      }
      
      // Extract description - This is more complex and might need a multi-line approach
      const descriptionMatch = html.match(/<div[^>]*class="[^"]*tm-property-listing-body__description[^"]*"[^>]*>(.*?)<\/div>/is) ||
                               html.match(/<div[^>]*id="ListingDescription"[^>]*>(.*?)<\/div>/is);
                               
      if (descriptionMatch && descriptionMatch[1]) {
        // Remove HTML tags from description
        property.description = descriptionMatch[1]
          .replace(/<[^>]+>/g, ' ')  // Replace tags with spaces
          .replace(/\s+/g, ' ')      // Collapse whitespace
          .trim();
      }
      
      // Extract bedrooms
      const bedroomsMatch = html.match(/class="[^"]*o-property-listing-rooms__count[^"]*"[^>]*>([0-9]+)<\/span>[^<]*bedrooms/i) ||
                            html.match(/bedrooms?[^>]*>([0-9]+)<\/[^>]+>/i);
                            
      if (bedroomsMatch && bedroomsMatch[1]) {
        property.bedrooms = parseInt(bedroomsMatch[1]);
      }
      
      // Extract bathrooms
      const bathroomsMatch = html.match(/class="[^"]*o-property-listing-rooms__count[^"]*"[^>]*>([0-9]+)<\/span>[^<]*bathrooms/i) ||
                             html.match(/bathrooms?[^>]*>([0-9]+)<\/[^>]+>/i);
                             
      if (bathroomsMatch && bathroomsMatch[1]) {
        property.bathrooms = parseInt(bathroomsMatch[1]);
      }
      
      // Extract images - TradeMe typically has a gallery
      const imageMatches = html.matchAll(/<img[^>]*data-src="([^"]+)"[^>]*class="[^"]*o-gallery__thumbnail[^"]*"[^>]*>/gi);
      const imageUrls: string[] = [];
      
      for (const match of imageMatches) {
        if (match[1] && match[1].length > 0) {
          // Fix TradeMe image URLs - they sometimes have thumbnail size in the URL
          // Replace with fullsize images by removing thumbnail parameters
          let imageUrl = match[1].replace(/thumbnail\./, '.');
          imageUrls.push(imageUrl);
        }
      }
      
      // If we didn't find gallery images, try to find other images
      if (imageUrls.length === 0) {
        const fallbackMatches = html.matchAll(/<img[^>]*(data-src|src)="([^"]+)"[^>]*>/gi);
        
        for (const match of fallbackMatches) {
          const imgUrl = match[2];
          // Filter out small images, icons, and advertisements
          if (imgUrl && 
              !imgUrl.includes('icon') && 
              !imgUrl.includes('logo') && 
              !imgUrl.includes('ad') && 
              imgUrl.includes('trademe')) {
            imageUrls.push(imgUrl);
          }
        }
      }
      
      if (imageUrls.length > 0) {
        property.primary_image_url = imageUrls[0];
        property.image_urls = imageUrls;
      }
      
      // Determine property type from URL or breadcrumbs
      if (url.includes('residential/sale')) {
        property.property_type = 'house';
        property.listing_type = 'for_sale';
      } else if (url.includes('residential/lifestyle-property')) {
        property.property_type = 'lifestyle';
        property.listing_type = 'for_sale';
      } else if (url.includes('residential/rent')) {
        property.property_type = 'house';
        property.listing_type = 'rental';
      } else if (url.includes('commercial')) {
        property.property_type = 'commercial';
        property.listing_type = 'for_sale';
      }
      
      // Extract approximate days on market from "Listed" date if available
      const listedMatch = html.match(/Listed[^:]*:([^<]+)</i);
      if (listedMatch && listedMatch[1]) {
        const listedDate = listedMatch[1].trim();
        // Convert date string to approximate days
        try {
          if (listedDate.includes('today')) {
            property.days_on_market = 0;
          } else if (listedDate.includes('yesterday')) {
            property.days_on_market = 1;
          } else if (listedDate.toLowerCase().includes('ago')) {
            // Extract "X days ago" format
            const daysMatch = listedDate.match(/(\d+)\s*days?/i);
            if (daysMatch && daysMatch[1]) {
              property.days_on_market = parseInt(daysMatch[1]);
            }
          } else {
            // Try to parse a specific date
            const listedTime = new Date(listedDate).getTime();
            const currentTime = new Date().getTime();
            const diffTime = Math.abs(currentTime - listedTime);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            property.days_on_market = diffDays;
          }
        } catch (error) {
          console.error('Error parsing listed date:', error);
          property.days_on_market = 0; // Default to 0 if we can't parse
        }
      }
    } catch (error) {
      console.error('Error extracting TradeMe data:', error);
    }
    
    // Use fallbacks for empty required fields
    property.title = property.title || this.extractTitleFromUrl(url);
    property.status = property.status || 'active';
    property.property_type = property.property_type || 'house';
    property.listing_type = property.listing_type || 'for_sale';
    
    return property;
  }
  
  /**
   * Extract a basic title from the URL if we couldn't get one from the page
   */
  private extractTitleFromUrl(url: string): string {
    try {
      const parsedUrl = new URL(url);
      const pathParts = parsedUrl.pathname.split('/').filter(part => part);
      
      // Last part of the URL path typically has the listing name in it
      const lastPart = pathParts[pathParts.length - 1] || '';
      
      if (lastPart.includes('.')) {
        // Remove file extension if present
        const withoutExtension = lastPart.substring(0, lastPart.lastIndexOf('.'));
        return this.formatUrlTitle(withoutExtension);
      }
      
      return this.formatUrlTitle(lastPart);
    } catch (error) {
      return 'Property Listing';
    }
  }
  
  /**
   * Format a URL segment into a readable title
   */
  private formatUrlTitle(urlSegment: string): string {
    // Replace hyphens with spaces
    let title = urlSegment.replace(/-/g, ' ');
    
    // Remove listing IDs (typically numeric parts)
    title = title.replace(/\d+$/, '').trim();
    
    // If we still have a title, capitalize it properly
    if (title) {
      return title
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    return 'Property Listing';
  }

  /**
   * Extract data from structured JSON-LD or other structured data
   */
  private async extractStructuredData(html: string, property: Partial<Property>): Promise<void> {
    try {
      // Look for JSON-LD data
      const jsonLdMatch = html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/i);
      if (jsonLdMatch && jsonLdMatch[1]) {
        const jsonLd = JSON.parse(jsonLdMatch[1].trim());
        
        // Handle different schema types
        if (jsonLd['@type'] === 'Product' || jsonLd['@type'] === 'Residence' || jsonLd['@type'] === 'RealEstateListing') {
          property.title = property.title || jsonLd.name;
          property.description = property.description || jsonLd.description;
          
          // Extract price
          if (jsonLd.offers && jsonLd.offers.price) {
            property.price = parseFloat(jsonLd.offers.price) || property.price;
          }
          
          // Extract images
          if (jsonLd.image) {
            if (Array.isArray(jsonLd.image)) {
              property.image_urls = jsonLd.image;
              property.primary_image_url = jsonLd.image[0];
            } else {
              property.primary_image_url = jsonLd.image;
              property.image_urls = [jsonLd.image];
            }
          }
          
          // Extract address
          if (jsonLd.address) {
            if (typeof jsonLd.address === 'string') {
              property.address = jsonLd.address;
            } else if (jsonLd.address.streetAddress) {
              const addressParts = [];
              if (jsonLd.address.streetAddress) addressParts.push(jsonLd.address.streetAddress);
              if (jsonLd.address.addressLocality) addressParts.push(jsonLd.address.addressLocality);
              if (jsonLd.address.addressRegion) addressParts.push(jsonLd.address.addressRegion);
              if (jsonLd.address.postalCode) addressParts.push(jsonLd.address.postalCode);
              if (jsonLd.address.addressCountry) addressParts.push(jsonLd.address.addressCountry);
              
              property.address = addressParts.join(', ');
            }
          }
        }
      }
    } catch (error) {
      console.error('Error extracting structured data:', error);
      // Continue with other extraction methods
    }
  }

  /**
   * Extract data from Open Graph meta tags
   */
  private async extractOpenGraph(html: string, property: Partial<Property>): Promise<void> {
    try {
      // Extract Open Graph title
      const ogTitleMatch = html.match(/<meta property="og:title" content="([^"]+)"/i);
      if (ogTitleMatch && ogTitleMatch[1]) {
        property.title = property.title || ogTitleMatch[1];
      }
      
      // Extract Open Graph description
      const ogDescMatch = html.match(/<meta property="og:description" content="([^"]+)"/i);
      if (ogDescMatch && ogDescMatch[1]) {
        property.description = property.description || ogDescMatch[1];
      }
      
      // Extract Open Graph image
      const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/i);
      if (ogImageMatch && ogImageMatch[1]) {
        property.primary_image_url = property.primary_image_url || ogImageMatch[1];
        property.image_urls = property.image_urls || [ogImageMatch[1]];
      }
      
      // Extract Open Graph URL
      const ogUrlMatch = html.match(/<meta property="og:url" content="([^"]+)"/i);
      if (ogUrlMatch && ogUrlMatch[1]) {
        property.url = property.url || ogUrlMatch[1];
      }
    } catch (error) {
      console.error('Error extracting Open Graph data:', error);
      // Continue with other extraction methods
    }
  }

  /**
   * Extract data from standard meta tags
   */
  private async extractMetaTags(html: string, property: Partial<Property>): Promise<void> {
    try {
      // Extract title from meta title
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        property.title = property.title || titleMatch[1].trim();
      }
      
      // Extract description from meta description
      const descMatch = html.match(/<meta name="description" content="([^"]+)"/i);
      if (descMatch && descMatch[1]) {
        property.description = property.description || descMatch[1];
      }
    } catch (error) {
      console.error('Error extracting meta tags:', error);
      // Continue with other extraction methods
    }
  }

  /**
   * Extract data using heuristics from page content
   */
  private async extractContentHeuristics(html: string, property: Partial<Property>): Promise<void> {
    try {
      // Extract title from h1 if missing
      if (!property.title) {
        const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
        if (h1Match && h1Match[1]) {
          property.title = h1Match[1].trim();
        }
      }
      
      // Look for price patterns
      if (!property.price) {
        // Common price formats
        const pricePatterns = [
          /[\$£€]([0-9,]+)/,                   // $123,456
          /([0-9,]+)[\$£€]/,                   // 123,456$
          /price[:\s]+[\$£€]?([0-9,]+)[\$£€]?/i,   // Price: $123,456
          /asking[:\s]+[\$£€]?([0-9,]+)[\$£€]?/i,  // Asking: $123,456
          /\$([0-9,]+\.[0-9]{2})/,             // $123,456.00
          /([0-9,]+\.[0-9]{2})\$/              // 123,456.00$
        ];
        
        for (const pattern of pricePatterns) {
          const priceMatch = html.match(pattern);
          if (priceMatch && priceMatch[1]) {
            // Remove commas and convert to number
            const priceStr = priceMatch[1].replace(/,/g, '');
            const price = parseFloat(priceStr);
            if (!isNaN(price)) {
              property.price = price;
              break;
            }
          }
        }
      }
      
      // Look for bedroom/bathroom patterns if missing
      if (!property.bedrooms) {
        const bedroomPatterns = [
          /(\d+)\s*bed/i,           // 3 bed
          /(\d+)\s*bedroom/i,        // 3 bedroom
          /bedrooms?[:\s]+(\d+)/i   // Bedrooms: 3
        ];
        
        for (const pattern of bedroomPatterns) {
          const bedroomMatch = html.match(pattern);
          if (bedroomMatch && bedroomMatch[1]) {
            const bedrooms = parseInt(bedroomMatch[1]);
            if (!isNaN(bedrooms)) {
              property.bedrooms = bedrooms;
              break;
            }
          }
        }
      }
      
      if (!property.bathrooms) {
        const bathroomPatterns = [
          /(\d+)\s*bath/i,           // 2 bath
          /(\d+)\s*bathroom/i,        // 2 bathroom
          /bathrooms?[:\s]+(\d+)/i   // Bathrooms: 2
        ];
        
        for (const pattern of bathroomPatterns) {
          const bathroomMatch = html.match(pattern);
          if (bathroomMatch && bathroomMatch[1]) {
            const bathrooms = parseInt(bathroomMatch[1]);
            if (!isNaN(bathrooms)) {
              property.bathrooms = bathrooms;
              break;
            }
          }
        }
      }
      
      // Extract all image URLs if we don't have any yet
      if (!property.image_urls || property.image_urls.length === 0) {
        const imgMatches = html.matchAll(/<img[^>]+src="([^"]+)"[^>]*>/gi);
        const imageUrls = [];
        
        for (const match of imgMatches) {
          if (match[1] && match[1].length > 0) {
            // Skip small images and common icons
            if (!match[1].includes('icon') && !match[1].includes('logo')) {
              // Handle relative URLs
              let imageUrl = match[1];
              if (imageUrl.startsWith('/')) {
                const baseUrl = new URL(property.url || '');
                imageUrl = `${baseUrl.origin}${imageUrl}`;
              }
              
              imageUrls.push(imageUrl);
            }
          }
        }
        
        if (imageUrls.length > 0) {
          property.image_urls = imageUrls;
          property.primary_image_url = imageUrls[0];
        }
      }
      
      // Attempt to extract address if missing
      if (!property.address) {
        // Look for common address patterns
        const addressPatterns = [
          /address[:\s]+([^<]+)</i,               // Address: 123 Main St
          /location[:\s]+([^<]+)</i,              // Location: 123 Main St
          /property[^>]+address[:\s]+([^<]+)</i,  // Property address: 123 Main St
        ];
        
        for (const pattern of addressPatterns) {
          const addressMatch = html.match(pattern);
          if (addressMatch && addressMatch[1]) {
            property.address = addressMatch[1].trim();
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error extracting content heuristics:', error);
      // Continue despite errors
    }
  }
}

export { ScraperResult };