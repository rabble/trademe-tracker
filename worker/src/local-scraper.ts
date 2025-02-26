import { TradeMe } from './lib/trademe';
import { StorageService } from './services/storage';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

// Create a mock environment for local testing
const mockEnv = {
  TRADEME_BASE_URL: process.env.TRADEME_BASE_URL || 'https://www.trademe.co.nz',
  TRADEME_USERNAME: process.env.TRADEME_USERNAME || '',
  TRADEME_PASSWORD: process.env.TRADEME_PASSWORD || '',
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET || 'property-images',
  ENVIRONMENT: 'development',
  SCRAPE_INTERVAL_HOURS: '24',
  API_BASE_URL: '',
  PROPERTIES_KV: {
    get: async () => null,
    put: async () => {},
    list: async () => ({ keys: [] }),
  } as any,
};

async function runLocalScraper() {
  console.log('Starting local scraper');
  
  const trademe = new TradeMe({
    baseUrl: mockEnv.TRADEME_BASE_URL,
    username: mockEnv.TRADEME_USERNAME,
    password: mockEnv.TRADEME_PASSWORD,
    timeout: 60000 // 60 seconds
  });
  
  // Initialize storage service if Supabase credentials are provided
  const storageService = new StorageService(mockEnv);
  const enableImageProcessing = !!mockEnv.SUPABASE_URL && !!mockEnv.SUPABASE_ANON_KEY;
  
  try {
    // Initialize the browser and login
    await trademe.initialize();
    await trademe.login();
    
    // Get favorited properties
    const favoriteProperties = await trademe.getFavoriteProperties();
    console.log(`Found ${favoriteProperties.length} favorited properties`);
    
    // Save the basic property data
    fs.writeFileSync(
      path.join(__dirname, 'favorite-properties.json'),
      JSON.stringify(favoriteProperties, null, 2)
    );
    
    // Get detailed information for each property
    const detailedProperties = [];
    
    for (const property of favoriteProperties.slice(0, 3)) { // Limit to 3 for testing
      try {
        console.log(`Getting details for property ${property.id}`);
        
        // Add a small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const detailedProperty = await trademe.getPropertyDetails(property.id);
        
        // Process images if enabled
        if (enableImageProcessing && detailedProperty.images && detailedProperty.images.length > 0) {
          console.log(`Processing ${detailedProperty.images.length} images for property ${detailedProperty.id}`);
          
          try {
            // Process images with the storage service
            const processedImages = await storageService.processPropertyImages(
              detailedProperty.id, 
              detailedProperty.images
            );
            
            // Update property with processed images
            detailedProperty.images = processedImages;
            console.log(`Successfully processed images for property ${detailedProperty.id}`);
          } catch (imageError) {
            console.error(`Error processing images for property ${detailedProperty.id}:`, imageError);
          }
        } else if (!enableImageProcessing) {
          console.log('Image processing disabled - Supabase credentials not provided');
        }
        
        detailedProperties.push(detailedProperty);
      } catch (error) {
        console.error(`Error fetching details for property ${property.id}:`, error);
        // Continue with the next property
      }
    }
    
    // Save the detailed property data
    fs.writeFileSync(
      path.join(__dirname, 'detailed-properties.json'),
      JSON.stringify(detailedProperties, null, 2)
    );
    
    // Save image data separately for inspection
    if (detailedProperties.length > 0 && detailedProperties[0].images) {
      fs.writeFileSync(
        path.join(__dirname, 'property-images.json'),
        JSON.stringify(detailedProperties[0].images, null, 2)
      );
    }
    
    console.log('Local scraper completed successfully');
  } catch (error) {
    console.error('Error in local scraper:', error);
  } finally {
    // Always close the browser
    await trademe.close();
  }
}

// Run the scraper
runLocalScraper().catch(console.error);
