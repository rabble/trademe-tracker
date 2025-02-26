import { Env } from '../index';
import { TradeMe } from '../lib/trademe';
import { Property, PropertyChange, PropertyStatus } from '../types';

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
    
    // 1. Fetch properties from TradeMe
    const properties = await fetchPropertiesFromTradeMe(env);
    
    // 2. Process and store the properties
    const changes = await storeProperties(properties, env);
    
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
  console.log('Fetching properties from TradeMe');
  
  const trademe = new TradeMe({
    baseUrl: env.TRADEME_BASE_URL,
    username: env.TRADEME_USERNAME,
    password: env.TRADEME_PASSWORD
  });
  
  try {
    // Initialize the browser and login
    await trademe.initialize();
    await trademe.login();
    
    // Get favorited properties
    const favoriteProperties = await trademe.getFavoriteProperties();
    
    // Get detailed information for each property
    const detailedProperties: Property[] = [];
    
    for (const property of favoriteProperties) {
      try {
        // Add a small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const detailedProperty = await trademe.getPropertyDetails(property.id);
        detailedProperties.push(detailedProperty);
      } catch (error) {
        console.error(`Error fetching details for property ${property.id}:`, error);
        // Continue with the next property
      }
    }
    
    return detailedProperties;
  } finally {
    // Always close the browser
    await trademe.close();
  }
}

// Function for storing properties and detecting changes
async function storeProperties(properties: Property[], env: Env): Promise<PropertyChange[]> {
  console.log(`Processing ${properties.length} properties`);
  
  const changes: PropertyChange[] = [];
  
  for (const property of properties) {
    try {
      // Get the existing property data from KV
      const existingPropertyJson = await env.PROPERTIES_KV.get(`property:${property.id}`);
      const existingProperty = existingPropertyJson ? JSON.parse(existingPropertyJson) as Property : null;
      
      // Detect changes
      if (existingProperty) {
        // Check for price changes
        if (existingProperty.price !== property.price) {
          changes.push({
            id: crypto.randomUUID(),
            property_id: property.id,
            property_title: property.title,
            change_type: 'price',
            old_value: existingProperty.price.toString(),
            new_value: property.price.toString(),
            change_date: new Date().toISOString()
          });
        }
        
        // Check for status changes
        if (existingProperty.status !== property.status) {
          changes.push({
            id: crypto.randomUUID(),
            property_id: property.id,
            property_title: property.title,
            change_type: 'status',
            old_value: existingProperty.status,
            new_value: property.status,
            change_date: new Date().toISOString()
          });
        }
        
        // Update days on market
        if (property.status === 'active') {
          const listedDate = new Date(property.created_at);
          const now = new Date();
          const daysOnMarket = Math.floor((now.getTime() - listedDate.getTime()) / (1000 * 60 * 60 * 24));
          property.days_on_market = daysOnMarket;
        }
      }
      
      // Store the updated property
      await env.PROPERTIES_KV.put(`property:${property.id}`, JSON.stringify(property));
      
      // Store property images
      if (property.images && property.images.length > 0) {
        await env.PROPERTIES_KV.put(`property:${property.id}:images`, JSON.stringify(property.images));
      }
    } catch (error) {
      console.error(`Error processing property ${property.id}:`, error);
      // Continue with the next property
    }
  }
  
  // Store the changes
  if (changes.length > 0) {
    // Get existing changes
    const existingChangesJson = await env.PROPERTIES_KV.get('property_changes');
    const existingChanges = existingChangesJson ? JSON.parse(existingChangesJson) as PropertyChange[] : [];
    
    // Combine and store
    const allChanges = [...changes, ...existingChanges].slice(0, 100); // Keep only the most recent 100 changes
    await env.PROPERTIES_KV.put('property_changes', JSON.stringify(allChanges));
  }
  
  console.log(`Stored ${properties.length} properties with ${changes.length} changes`);
  return changes;
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
