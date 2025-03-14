import { supabase } from '../lib/supabase';
import { PropertyDbService } from '../services/property/propertyDbService';
import type { Property } from '../types';

/**
 * Synchronizes TradeMe properties with our database
 * @param tradeMeProperties Properties fetched from TradeMe API
 * @returns Array of synchronized properties
 */
export async function syncTradeMeProperties(tradeMeProperties: Property[]): Promise<Property[]> {
  try {
    console.log(`Syncing ${tradeMeProperties.length} properties from TradeMe`);
    
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const syncedProperties: Property[] = [];
    
    for (const tradeMeProperty of tradeMeProperties) {
      try {
        // Check if property already exists in our database
        const { data: existingProperties } = await supabase
          .from('properties')
          .select('*')
          .eq('trademe_listing_id', tradeMeProperty.trademe_listing_id || '')
          .limit(1);
        
        const existingProperty = existingProperties?.[0];
        
        if (existingProperty) {
          // Property exists, check for changes
          const changes: Record<string, any> = {};
          let hasChanges = false;
          
          // Check for price changes
          if (existingProperty.price !== tradeMeProperty.price) {
            changes.price = tradeMeProperty.price;
            hasChanges = true;
            
            // Record price change
            await PropertyDbService.recordPropertyChange({
              property_id: existingProperty.id,
              change_type: 'price',
              old_value: existingProperty.price.toString(),
              new_value: tradeMeProperty.price.toString(),
              description: `Price changed from $${existingProperty.price.toLocaleString()} to $${tradeMeProperty.price.toLocaleString()}`
            });
          }
          
          // Check for status changes
          if (existingProperty.status !== tradeMeProperty.status) {
            changes.status = tradeMeProperty.status;
            hasChanges = true;
            
            // Record status change
            await PropertyDbService.recordPropertyChange({
              property_id: existingProperty.id,
              change_type: 'status',
              old_value: existingProperty.status,
              new_value: tradeMeProperty.status,
              description: `Status changed from ${existingProperty.status} to ${tradeMeProperty.status}`
            });
          }
          
          // Check for description changes
          if (existingProperty.description !== tradeMeProperty.description && tradeMeProperty.description) {
            changes.description = tradeMeProperty.description;
            hasChanges = true;
            
            // Record description change
            await PropertyDbService.recordPropertyChange({
              property_id: existingProperty.id,
              change_type: 'description',
              old_value: existingProperty.description || 'No description',
              new_value: tradeMeProperty.description,
              description: 'Description updated'
            });
          }
          
          // Update other fields
          if (tradeMeProperty.bedrooms !== undefined && existingProperty.bedrooms !== tradeMeProperty.bedrooms) {
            changes.bedrooms = tradeMeProperty.bedrooms;
            hasChanges = true;
          }
          
          if (tradeMeProperty.bathrooms !== undefined && existingProperty.bathrooms !== tradeMeProperty.bathrooms) {
            changes.bathrooms = tradeMeProperty.bathrooms;
            hasChanges = true;
          }
          
          if (tradeMeProperty.land_area !== undefined && existingProperty.land_area !== tradeMeProperty.land_area) {
            changes.land_area = tradeMeProperty.land_area;
            hasChanges = true;
          }
          
          if (tradeMeProperty.floor_area !== undefined && existingProperty.floor_area !== tradeMeProperty.floor_area) {
            changes.floor_area = tradeMeProperty.floor_area;
            hasChanges = true;
          }
          
          // Update days on market
          changes.days_on_market = tradeMeProperty.days_on_market;
          
          // Update the property if there are changes
          if (hasChanges || tradeMeProperty.days_on_market !== existingProperty.days_on_market) {
            const updatedProperty = await PropertyDbService.updateProperty(existingProperty.id, changes);
            syncedProperties.push(updatedProperty);
          } else {
            syncedProperties.push(existingProperty as unknown as Property);
          }
          
          // Sync images if available
          if (tradeMeProperty.image_urls && tradeMeProperty.image_urls.length > 0) {
            await syncPropertyImages(existingProperty.id, tradeMeProperty.image_urls);
          }
        } else {
          // Property doesn't exist, create it
          const newProperty = await PropertyDbService.createProperty({
            title: tradeMeProperty.title,
            address: tradeMeProperty.address,
            price: tradeMeProperty.price,
            bedrooms: tradeMeProperty.bedrooms,
            bathrooms: tradeMeProperty.bathrooms,
            status: tradeMeProperty.status,
            days_on_market: tradeMeProperty.days_on_market,
            trademe_listing_id: tradeMeProperty.trademe_listing_id,
            url: tradeMeProperty.url,
            image_urls: tradeMeProperty.image_urls,
            description: tradeMeProperty.description,
            land_area: tradeMeProperty.land_area,
            floor_area: tradeMeProperty.floor_area,
            property_type: tradeMeProperty.property_type,
            primary_image_url: tradeMeProperty.primary_image_url,
            latitude: tradeMeProperty.latitude,
            longitude: tradeMeProperty.longitude,
            user_id: userId
          });
          
          syncedProperties.push(newProperty);
          
          // Add images if available
          if (tradeMeProperty.image_urls && tradeMeProperty.image_urls.length > 0) {
            await syncPropertyImages(newProperty.id, tradeMeProperty.image_urls);
          }
        }
      } catch (propertyError) {
        console.error(`Error syncing property ${tradeMeProperty.trademe_listing_id}:`, propertyError);
        // Continue with next property
      }
    }
    
    return syncedProperties;
  } catch (error) {
    console.error('Error in syncTradeMeProperties:', error);
    throw error;
  }
}

/**
 * Synchronizes property images
 * @param propertyId The property ID
 * @param imageUrls Array of image URLs
 */
async function syncPropertyImages(propertyId: string, imageUrls: string[]): Promise<void> {
  try {
    // Get existing images for this property
    const { data: existingImages } = await supabase
      .from('property_images')
      .select('*')
      .eq('property_id', propertyId);
    
    const existingUrls = new Set(existingImages?.map(img => img.url) || []);
    
    // Add new images
    for (let i = 0; i < imageUrls.length; i++) {
      const url = imageUrls[i];
      
      // Skip if image already exists
      if (existingUrls.has(url)) continue;
      
      // Add the image
      await PropertyDbService.addPropertyImage({
        property_id: propertyId,
        url,
        is_primary: i === 0 && existingImages?.length === 0 // Set as primary if it's the first image and no existing images
      });
    }
  } catch (error) {
    console.error(`Error syncing images for property ${propertyId}:`, error);
    throw error;
  }
}
