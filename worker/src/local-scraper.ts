import { TradeMe } from './lib/trademe';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

async function runLocalScraper() {
  console.log('Starting local scraper');
  
  const trademe = new TradeMe({
    baseUrl: process.env.TRADEME_BASE_URL || 'https://www.trademe.co.nz',
    username: process.env.TRADEME_USERNAME || '',
    password: process.env.TRADEME_PASSWORD || '',
    timeout: 60000 // 60 seconds
  });
  
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
