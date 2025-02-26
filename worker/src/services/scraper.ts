import { Env } from '../index';
import { TradeMe } from '../lib/trademe';
import { Property, PropertyChange, PropertyStatus } from '../types';
import { StorageService } from './storage';
import { ChangeTracker } from './changeTracker';

// This function will be triggered by the scheduled cron
export async function scheduledScraper(env: Env): Promise<void> {
  console.log('Starting scheduled scraping job');
  
  try {
    // Check if we need to run the scraper based on the last run time
    const lastRunTime = await env.PROPERTIES_KV.get('lastScraperRun');
    if (lastRunTime) {
      const lastRun = new Date(lastRunTime);
      const now = new Date();
      const hoursSinceLastRun = (now.getTime() - lastRun.getTime()) / (1000 * 60 * 60);
      const scrapeIntervalHours = parseInt(env.SCRAPE_INTERVAL_HOURS || '24');
      
      if (hoursSinceLastRun < scrapeIntervalHours) {
        console.log(`Skipping scraper run. Last run was ${hoursSinceLastRun.toFixed(2)} hours ago.`);
        return;
      }
    }
    
    // Initialize services
    const storageService = new StorageService(env);
    const changeTracker = new ChangeTracker(env);
    
    // 1. Fetch properties from TradeMe
    const properties = await fetchPropertiesFromTradeMe(env);
    
    // 2. Process and store the properties
    const changes = await processProperties(properties, env, storageService, changeTracker);
    
    // 3. Update analytics data
    await updateAnalytics(env, changes);
    
    // Update the last run time
    await env.PROPERTIES_KV.put('lastScraperRun', new Date().toISOString());
    
    console.log('Scheduled scraping job completed successfully');
  } catch (error) {
    console.error('Error in scheduled scraping job:', error);
    // In a production environment, you might want to send an alert or notification
  }
}

// Function for fetching properties from TradeMe
async function fetchPropertiesFromTradeMe(env: Env): Promise<Property[]> {
  console.log('Fetching properties from TradeMe API');
  
  const trademe = new TradeMe({
    apiUrl: env.TRADEME_API_URL || 'https://api.trademe.co.nz',
    consumerKey: env.TRADEME_CONSUMER_KEY,
    consumerSecret: env.TRADEME_CONSUMER_SECRET,
    oauthToken: env.TRADEME_OAUTH_TOKEN,
    oauthTokenSecret: env.TRADEME_OAUTH_TOKEN_SECRET
  });
  
  try {
    // Get favorited properties
    const favoriteProperties = await trademe.getFavoriteProperties();
    
    // Get detailed information for each property
    const detailedProperties: Property[] = [];
    
    for (const property of favoriteProperties) {
      try {
        // Add a small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const detailedProperty = await trademe.getPropertyDetails(property.id);
        detailedProperties.push(detailedProperty);
      } catch (error) {
        console.error(`Error fetching details for property ${property.id}:`, error);
        // If we can't get details, use the basic property info
        detailedProperties.push(property);
      }
    }
    
    return detailedProperties;
  } catch (error) {
    console.error('Error fetching properties from TradeMe:', error);
    throw error;
  }
}

// Function for processing properties and tracking changes
async function processProperties(
  properties: Property[], 
  env: Env, 
  storageService: StorageService,
  changeTracker: ChangeTracker
): Promise<PropertyChange[]> {
  console.log(`Processing ${properties.length} properties`);
  
  const allChanges: PropertyChange[] = [];
  
  for (const property of properties) {
    try {
      // Process images if available
      if (property.images && property.images.length > 0) {
        try {
          console.log(`Processing ${property.images.length} images for property ${property.id}`);
          
          // Process images with the storage service
          const processedImages = await storageService.processPropertyImages(property.id, property.images);
          
          // Update property with processed images
          property.images = processedImages;
        } catch (error) {
          console.error(`Error processing images for property ${property.id}:`, error);
          // Continue with property processing even if image processing fails
        }
      }
      
      // Detect and track changes
      const changeResult = await changeTracker.processProperty(property);
      
      // Store the property snapshot (current state)
      await changeTracker.storePropertySnapshot(changeResult.property);
      
      // Add detected changes to the list
      if (changeResult.changes.length > 0) {
        allChanges.push(...changeResult.changes);
      }
      
      // Log information about the property
      if (changeResult.isNew) {
        console.log(`New property added: ${property.id} - ${property.title}`);
      } else if (changeResult.changes.length > 0) {
        console.log(`Changes detected for property ${property.id}: ${changeResult.changes.length} changes`);
      } else {
        console.log(`No changes detected for property ${property.id}`);
      }
    } catch (error) {
      console.error(`Error processing property ${property.id}:`, error);
      // Continue with the next property
    }
  }
  
  // Store all the changes
  if (allChanges.length > 0) {
    await changeTracker.storeChanges(allChanges);
  }
  
  console.log(`Processed ${properties.length} properties with ${allChanges.length} changes`);
  return allChanges;
}

// Function for updating analytics data
async function updateAnalytics(env: Env, changes: PropertyChange[]): Promise<void> {
  console.log('Updating analytics data');
  
  try {
    // Get all properties
    const properties: Property[] = [];
    const keys = await env.PROPERTIES_KV.list({ prefix: 'property:' });
    
    for (const key of keys.keys) {
      if (!key.name.includes(':images')) { // Skip image keys
        const propertyJson = await env.PROPERTIES_KV.get(key.name);
        if (propertyJson) {
          properties.push(JSON.parse(propertyJson) as Property);
        }
      }
    }
    
    // Calculate summary statistics
    const summary = {
      totalProperties: properties.length,
      activeProperties: properties.filter(p => p.status === 'active').length,
      underOfferProperties: properties.filter(p => p.status === 'under_offer').length,
      soldProperties: properties.filter(p => p.status === 'sold').length,
      averagePrice: properties.length > 0 
        ? properties.reduce((sum, p) => sum + p.price, 0) / properties.length 
        : 0,
      averageDaysOnMarket: properties.filter(p => p.status === 'active').length > 0
        ? properties.filter(p => p.status === 'active').reduce((sum, p) => sum + (p.days_on_market || 0), 0) / properties.filter(p => p.status === 'active').length
        : 0
    };
    
    // Store summary
    await env.PROPERTIES_KV.put('analytics:summary', JSON.stringify(summary));
    
    // Store recent changes
    if (changes.length > 0) {
      await env.PROPERTIES_KV.put('analytics:recent_changes', JSON.stringify(changes));
    }
  } catch (error) {
    console.error('Error updating analytics:', error);
  }
}
