/**
 * TradeMe Property Scraper Service
 * Uses FireCrawl to scrape property details from web pages
 */
import { Property } from '../../types';
import FireCrawl from '@mendable/firecrawl-js';

// Initialize FireCrawl client with API key from environment variables
const apiKey = import.meta.env.VITE_FIRECRAWL_API_KEY;
if (!apiKey) {
  console.error('FireCrawl API key is missing. Please add VITE_FIRECRAWL_API_KEY to your .env file.');
}
const firecrawl = new FireCrawl(apiKey || '');

/**
 * Service for scraping TradeMe property listings
 */
export const trademeScraper = {
  /**
   * Scrape a TradeMe property listing by URL
   */
  async scrapeUrl(url: string, retryCount = 0): Promise<Partial<Property>> {
    try {
      console.log('Scraping TradeMe URL:', url);
      
      // Use FireCrawl to fetch and extract page content
      const response = await firecrawl.scrape(url, {
        // Add options for better reliability
        timeout: 15000, // 15 second timeout
        waitForSelector: '.tm-property-listing, .tm-property-search-card, .o-property' // Wait for TradeMe property elements
      });
      
      console.log('FireCrawl response:', response);
      
      // Extract property data from the response
      const propertyData = extractPropertyData(url, response.data);
      
      // Validate we have enough property data before returning
      if (propertyData.title && (propertyData.address || propertyData.description)) {
        return propertyData;
      } else if (retryCount < 2) {
        // If we didn't get enough data and haven't maxed out retries, try again
        console.log(`Incomplete property data, retrying (${retryCount + 1}/2)...`);
        // Short delay before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.scrapeUrl(url, retryCount + 1);
      } else {
        // Max retries reached, return what we have
        console.warn('Max retries reached with incomplete data');
        return propertyData;
      }
    } catch (error) {
      console.error('Error scraping TradeMe URL:', error);
      
      // If we haven't retried too many times, try again
      if (retryCount < 2) {
        console.log(`Error scraping, retrying (${retryCount + 1}/2)...`);
        // Longer delay before retry after error
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.scrapeUrl(url, retryCount + 1);
      }
      
      // If retries exhausted, return a minimal valid property rather than failing
      return {
        title: 'Property Listing',
        address: 'Location not found',
        url: url,
        status: 'active',
        days_on_market: 0,
        listing_type: 'for_sale'
      };
    }
  }
};

/**
 * Extract property data from the scraped page content
 */
function extractPropertyData(url: string, data: any): Partial<Property> {
  // Initialize with empty property object and set the required fields
  const property: Partial<Property> = {
    url: url,
    status: 'active',
    days_on_market: 0,
    listing_type: 'for_sale' // Default, will be overridden if needed
  };
  
  try {
    console.log('Extracting data from FireCrawl response:', data);
    
    // Extract title - try different common patterns
    if (data.title) {
      property.title = data.title;
    } else if (data.ogTitle) {
      property.title = data.ogTitle;
    } else if (data.pageTitle) {
      property.title = data.pageTitle;
    } else if (data.metaTitle) {
      property.title = data.metaTitle;
    }
    
    // Clean up title if it contains the site name
    if (property.title && property.title.includes('Trade Me')) {
      property.title = property.title.replace(/\s*\|\s*Trade Me.*$/i, '');
    }
    
    // Extract description
    if (data.description) {
      property.description = data.description;
    } else if (data.ogDescription) {
      property.description = data.ogDescription;
    } else if (data.metaDescription) {
      property.description = data.metaDescription;
    }
    
    // Extract images - try to get all available images
    if (data.images && Array.isArray(data.images) && data.images.length > 0) {
      // Filter out any non-image URLs or small images like icons
      const validImages = data.images
        .filter((img: string) => 
          img && img.match(/\.(jpg|jpeg|png|webp)($|\?)/i) && 
          !img.includes('icon') && !img.includes('logo')
        )
        .map((img: string) => sanitizeImageUrl(img));
      
      if (validImages.length > 0) {
        property.image_urls = validImages;
        property.primary_image_url = validImages[0];
      }
    } else if (data.ogImage) {
      const sanitizedImage = sanitizeImageUrl(data.ogImage);
      property.primary_image_url = sanitizedImage;
      property.image_urls = [sanitizedImage];
    }
    
    // If we still don't have images, try to extract from HTML elements in the data
    if ((!property.image_urls || property.image_urls.length === 0) && data.html) {
      try {
        const imgRegex = /<img[^>]+(src|data-src)=["']([^"']+)["'][^>]*>/gi;
        const matches = [...data.html.matchAll(imgRegex)];
        
        const potentialImages = matches
          .map(match => match[2])
          .filter(url => 
            url && url.match(/\.(jpg|jpeg|png|webp)($|\?)/i) && 
            !url.includes('icon') && !url.includes('logo') &&
            url.length > 20
          )
          .map(url => sanitizeImageUrl(url));
          
        if (potentialImages.length > 0) {
          property.image_urls = potentialImages;
          property.primary_image_url = potentialImages[0];
        }
      } catch (imgError) {
        console.error('Error extracting images from HTML:', imgError);
      }
    }
    
    // Extract TradeMe listing ID from URL
    const listingIdMatch = url.match(/listing\/([0-9]+)/);
    if (listingIdMatch && listingIdMatch[1]) {
      property.trademe_listing_id = listingIdMatch[1];
    }
    
    // Try multiple strategies to extract price
    if (data.text) {
      // Look for price patterns in the text
      const priceRegexes = [
        /(?:Price|Listed for|Asking price|Enquiries over)\s*\$([0-9,]+)/i,
        /\$([0-9,]+)[^0-9](?:k|,000)/i, // Match $600k or $600,000
        /\$([0-9,]+(?:,[0-9]+)*)/       // Match any price with $ prefix
      ];
      
      for (const regex of priceRegexes) {
        const match = data.text.match(regex);
        if (match && match[1]) {
          // Remove commas and convert to number
          property.price = parseInt(match[1].replace(/,/g, ''));
          // If price looks like it's in thousands (under 1000), multiply by 1000
          if (property.price < 1000 && !match[0].includes('weekly')) {
            property.price *= 1000;
          }
          break;
        }
      }
    }
    
    // If price not found in text, try other sources
    if (!property.price) {
      const priceText = findNestedValue(data, 'price') || 
                       findNestedValue(data, 'priceDisplay') || 
                       findTextContaining(data, '$');
      
      if (priceText) {
        // Try to extract numeric value from price text
        const priceMatch = priceText.match(/[\$£€]([0-9,]+)/);
        if (priceMatch && priceMatch[1]) {
          property.price = parseInt(priceMatch[1].replace(/,/g, ''));
        }
      }
    }
    
    // Try to extract address
    if (data.text) {
      // Look for address patterns
      const addressRegexes = [
        /(?:Located at|Located in|Address:|Address|Property at:)\s*([^\n\.,]{3,}(?:Road|Street|Avenue|Lane|Drive|Place|Terrace|Way|Court|Heights)[^\n\.]*)/i,
        /([^\n\.,]{3,}(?:Road|Street|Avenue|Lane|Drive|Place|Terrace|Way|Court|Heights)[^\n\.]{3,})/i
      ];
      
      for (const regex of addressRegexes) {
        const match = data.text.match(regex);
        if (match && match[1]) {
          property.address = match[1].trim();
          break;
        }
      }
    }
    
    // If address not found in text, try other sources
    if (!property.address) {
      const address = findNestedValue(data, 'address') || 
                     findNestedValue(data, 'location');
      if (address) {
        property.address = address;
      }
    }
    
    // Extract property features
    if (data.text) {
      // Bedrooms
      const bedroomMatch = data.text.match(/(\d+)\s*(?:bedroom|bed)/i);
      if (bedroomMatch && bedroomMatch[1]) {
        property.bedrooms = parseInt(bedroomMatch[1]);
      }
      
      // Bathrooms
      const bathroomMatch = data.text.match(/(\d+)\s*(?:bathroom|bath)/i);
      if (bathroomMatch && bathroomMatch[1]) {
        property.bathrooms = parseInt(bathroomMatch[1]);
      }
      
      // Land area
      const landAreaMatch = data.text.match(/(\d+(?:\.\d+)?)\s*(?:hectares|ha|acres|sqm|square meters|m²|m2)/i);
      if (landAreaMatch && landAreaMatch[1]) {
        let landArea = parseFloat(landAreaMatch[1]);
        // Convert to square meters if needed
        if (landAreaMatch[0].includes('hectare') || landAreaMatch[0].includes('ha')) {
          landArea *= 10000; // Convert hectares to sqm
        } else if (landAreaMatch[0].includes('acre')) {
          landArea *= 4046.86; // Convert acres to sqm
        }
        property.land_area = landArea;
      }
      
      // Floor area
      const floorAreaMatch = data.text.match(/(\d+(?:\.\d+)?)\s*(?:sqm|square meters|m²|m2)(?:\s*(?:floor area|home|house|interior))/i);
      if (floorAreaMatch && floorAreaMatch[1]) {
        property.floor_area = parseFloat(floorAreaMatch[1]);
      }
    }
    
    // Determine property type from URL or content
    if (url.includes('lifestyle-property')) {
      property.property_type = 'other'; // Our schema doesn't have 'lifestyle'
    } else if (url.includes('section-land')) {
      property.property_type = 'section';
    } else if (url.includes('townhouse')) {
      property.property_type = 'townhouse';
    } else if (url.includes('apartment')) {
      property.property_type = 'apartment';
    } else {
      property.property_type = 'house';
    }
    
    // Determine listing type from URL
    if (url.includes('rent') || url.includes('rental')) {
      property.listing_type = 'rental';
    } else {
      property.listing_type = 'for_sale';
    }
    
    // Set fallback values for required fields if they're still empty
    if (!property.title && property.trademe_listing_id) {
      property.title = `Property Listing #${property.trademe_listing_id}`;
    } else if (!property.title) {
      property.title = 'Property Listing';
    }
    
    if (!property.address) {
      // Try to extract location from URL path
      const pathSegments = new URL(url).pathname.split('/').filter(Boolean);
      const locationSegments = pathSegments.filter(segment => 
        !['a', 'property', 'residential', 'sale', 'rent', 'lifestyle-property', 
          'section-land', 'listing', 'townhouse', 'apartment'].includes(segment) &&
        !segment.match(/^\d+$/)
      );
      
      if (locationSegments.length > 0) {
        property.address = locationSegments
          .map(segment => segment.replace(/-/g, ' '))
          .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
          .join(', ');
      } else {
        property.address = 'Unknown Location';
      }
    }
    
    // Default price if none found
    if (!property.price) {
      if (property.listing_type === 'rental') {
        property.price = 500; // Default weekly rental price
      } else {
        property.price = 750000; // Default sale price
      }
    }
    
    return property;
  } catch (error) {
    console.error('Error extracting property data:', error);
    
    // Return a minimal valid property with required fields
    return {
      title: 'Property Listing',
      address: 'Unknown Location',
      price: 750000,
      status: 'active',
      days_on_market: 0,
      listing_type: 'for_sale',
      url
    };
  }
}

/**
 * Helper function to find a value by key in a nested object
 */
function findNestedValue(obj: any, key: string): any {
  if (!obj || typeof obj !== 'object') return null;
  
  if (obj[key] !== undefined) return obj[key];
  
  for (const k in obj) {
    if (typeof obj[k] === 'object') {
      const result = findNestedValue(obj[k], key);
      if (result !== null) return result;
    }
  }
  
  return null;
}

/**
 * Helper function to find any text containing a specific substring
 */
function findTextContaining(obj: any, substring: string): string | null {
  if (!obj || typeof obj !== 'object') return null;
  
  for (const k in obj) {
    if (typeof obj[k] === 'string' && obj[k].includes(substring)) {
      return obj[k];
    } else if (typeof obj[k] === 'object') {
      const result = findTextContaining(obj[k], substring);
      if (result !== null) return result;
    }
  }
  
  return null;
}

/**
 * Helper function to sanitize image URLs
 * This helps prevent issues with malformed URLs, relative paths, etc.
 */
function sanitizeImageUrl(url: string): string {
  if (!url) return '';
  
  // Handle common issues with TradeMe image URLs
  
  // 1. Replace thumbnail sizes with full size
  url = url.replace(/thumbnail\./, '.');
  
  // 2. Fix incomplete URLs (TradeMe sometimes returns partial URLs)
  if (url.startsWith('//')) {
    url = 'https:' + url;
  }
  
  // 3. Add domain if it's a relative URL
  if (url.startsWith('/')) {
    url = 'https://www.trademe.co.nz' + url;
  }
  
  // 4. Remove any tracking parameters
  url = url.split('?')[0];
  
  return url;
}