import dotenv from 'dotenv';
import { TradeMe } from '../lib/trademe';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Check if debug mode is enabled
const isDebug = process.argv.includes('--debug');

async function main() {
  // Validate required environment variables
  const requiredEnvVars = ['TRADEME_BASE_URL', 'TRADEME_USERNAME', 'TRADEME_PASSWORD'];
  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingEnvVars.length > 0) {
    console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
  }

  console.log('Starting TradeMe property scraper...');
  if (isDebug) {
    console.log('Debug mode enabled - will show detailed logs');
  }

  const trademe = new TradeMe({
    baseUrl: process.env.TRADEME_BASE_URL!,
    username: process.env.TRADEME_USERNAME!,
    password: process.env.TRADEME_PASSWORD!,
    maxRetries: 3,
    timeout: 30000,
    headless: !isDebug, // Show browser in debug mode
  });

  try {
    console.log('Initializing browser...');
    await trademe.initialize();
    
    console.log('Logging in to TradeMe...');
    await trademe.login();
    
    console.log('Successfully logged in!');
    
    // Get favorited properties
    console.log('Fetching favorited properties...');
    const properties = await trademe.getFavoriteProperties();
    console.log(`Found ${properties.length} favorited properties`);
    
    // Get detailed information for each property
    console.log('Fetching detailed property information...');
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      console.log(`[${i+1}/${properties.length}] Fetching details for property ${property.id}: ${property.title}`);
      
      try {
        const detailedProperty = await trademe.getPropertyDetails(property.id);
        console.log(`  - Successfully fetched details for ${detailedProperty.title}`);
        console.log(`  - Price: ${detailedProperty.price}`);
        console.log(`  - Status: ${detailedProperty.status}`);
        console.log(`  - Images: ${detailedProperty.images?.length || 0}`);
      } catch (error) {
        console.error(`  - Error fetching details for property ${property.id}:`, error);
      }
    }
    
    console.log('Scraping completed successfully');
  } catch (error) {
    console.error('Error during scraping:', error);
    process.exit(1);
  } finally {
    console.log('Closing browser...');
    await trademe.close();
  }
}

main();
