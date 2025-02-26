import { Env } from '../index';
import { Property, PropertyChange, PropertyStatus } from '../types';

/**
 * Interface for property changes
 */
export interface PropertyChangeDetails {
  property: Property;
  changes: PropertyChange[];
  isNew: boolean;
}

/**
 * Service for tracking property changes
 */
export class ChangeTracker {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  /**
   * Process a property and detect changes
   * 
   * @param property - The property to process
   * @returns Promise with property change details
   */
  async processProperty(property: Property): Promise<PropertyChangeDetails> {
    try {
      // Get the existing property data from KV
      const existingPropertyJson = await this.env.PROPERTIES_KV.get(`property:${property.id}`);
      const existingProperty = existingPropertyJson ? JSON.parse(existingPropertyJson) as Property : null;
      
      // Initialize result
      const result: PropertyChangeDetails = {
        property,
        changes: [],
        isNew: !existingProperty
      };
      
      // If this is a new property, no changes to detect
      if (!existingProperty) {
        console.log(`New property detected: ${property.id} - ${property.title}`);
        return result;
      }
      
      // Detect changes
      result.changes = this.detectChanges(existingProperty, property);
      
      // Update days on market for active properties
      if (property.status === 'active') {
        const listedDate = new Date(property.created_at);
        const now = new Date();
        const daysOnMarket = Math.floor((now.getTime() - listedDate.getTime()) / (1000 * 60 * 60 * 24));
        property.days_on_market = daysOnMarket;
      }
      
      return result;
    } catch (error) {
      console.error(`Error processing property ${property.id}:`, error);
      // Return basic result with no changes
      return {
        property,
        changes: [],
        isNew: false
      };
    }
  }
  
  /**
   * Detect changes between two property versions
   * 
   * @param oldProperty - The old property data
   * @param newProperty - The new property data
   * @returns Array of property changes
   */
  private detectChanges(oldProperty: Property, newProperty: Property): PropertyChange[] {
    const changes: PropertyChange[] = [];
    
    // Check for price changes
    if (oldProperty.price !== newProperty.price) {
      const priceChange = this.createPriceChange(oldProperty, newProperty);
      changes.push(priceChange);
    }
    
    // Check for status changes
    if (oldProperty.status !== newProperty.status) {
      const statusChange = this.createStatusChange(oldProperty, newProperty);
      changes.push(statusChange);
    }
    
    // Check for description changes (if available)
    if (oldProperty.description !== newProperty.description && 
        oldProperty.description && newProperty.description) {
      const descriptionChange = this.createDescriptionChange(oldProperty, newProperty);
      changes.push(descriptionChange);
    }
    
    // Check for image changes
    if (oldProperty.images && newProperty.images) {
      const oldImageCount = oldProperty.images.length;
      const newImageCount = newProperty.images.length;
      
      if (oldImageCount !== newImageCount) {
        const imageChange = this.createImageCountChange(oldProperty, newProperty);
        changes.push(imageChange);
      }
    }
    
    return changes;
  }
  
  /**
   * Create a price change record
   */
  private createPriceChange(oldProperty: Property, newProperty: Property): PropertyChange {
    const oldPrice = oldProperty.price;
    const newPrice = newProperty.price;
    const priceDiff = newPrice - oldPrice;
    const percentChange = (priceDiff / oldPrice) * 100;
    
    // Format the percentage for the change description
    const percentFormatted = Math.abs(percentChange).toFixed(1);
    const direction = priceDiff > 0 ? 'increased' : 'decreased';
    
    // Create a descriptive change message
    let changeMessage = '';
    if (Math.abs(percentChange) >= 10) {
      // Significant price change
      changeMessage = `Price ${direction} significantly by ${percentFormatted}%`;
    } else {
      changeMessage = `Price ${direction} by ${percentFormatted}%`;
    }
    
    return {
      id: crypto.randomUUID(),
      property_id: newProperty.id,
      property_title: newProperty.title,
      change_type: 'price',
      old_value: oldProperty.price.toString(),
      new_value: newProperty.price.toString(),
      change_date: new Date().toISOString(),
      description: changeMessage
    };
  }
  
  /**
   * Create a status change record
   */
  private createStatusChange(oldProperty: Property, newProperty: Property): PropertyChange {
    // Create a descriptive change message based on the status transition
    let changeMessage = `Status changed from ${oldProperty.status} to ${newProperty.status}`;
    
    // Add more context for specific transitions
    if (oldProperty.status === 'active' && newProperty.status === 'under_offer') {
      changeMessage = 'Property is now under offer';
    } else if (oldProperty.status === 'active' && newProperty.status === 'sold') {
      changeMessage = 'Property has been sold';
    } else if (oldProperty.status === 'under_offer' && newProperty.status === 'sold') {
      changeMessage = 'Property sale has been completed';
    } else if (newProperty.status === 'archived') {
      changeMessage = 'Property listing has been archived';
    }
    
    return {
      id: crypto.randomUUID(),
      property_id: newProperty.id,
      property_title: newProperty.title,
      change_type: 'status',
      old_value: oldProperty.status,
      new_value: newProperty.status,
      change_date: new Date().toISOString(),
      description: changeMessage
    };
  }
  
  /**
   * Create a description change record
   */
  private createDescriptionChange(oldProperty: Property, newProperty: Property): PropertyChange {
    // For description changes, we don't store the full text in old/new values
    // as they could be very large. Instead, we note that it changed.
    return {
      id: crypto.randomUUID(),
      property_id: newProperty.id,
      property_title: newProperty.title,
      change_type: 'description',
      old_value: 'previous_version',
      new_value: 'updated_version',
      change_date: new Date().toISOString(),
      description: 'Property description has been updated'
    };
  }
  
  /**
   * Create an image count change record
   */
  private createImageCountChange(oldProperty: Property, newProperty: Property): PropertyChange {
    const oldCount = oldProperty.images?.length || 0;
    const newCount = newProperty.images?.length || 0;
    
    let changeMessage = '';
    if (newCount > oldCount) {
      const addedCount = newCount - oldCount;
      changeMessage = `${addedCount} new image${addedCount > 1 ? 's' : ''} added`;
    } else {
      const removedCount = oldCount - newCount;
      changeMessage = `${removedCount} image${removedCount > 1 ? 's' : ''} removed`;
    }
    
    return {
      id: crypto.randomUUID(),
      property_id: newProperty.id,
      property_title: newProperty.title,
      change_type: 'description',
      old_value: `${oldCount} images`,
      new_value: `${newCount} images`,
      change_date: new Date().toISOString(),
      description: changeMessage
    };
  }
  
  /**
   * Store property changes in the database
   * 
   * @param changes - Array of property changes to store
   */
  async storeChanges(changes: PropertyChange[]): Promise<void> {
    if (changes.length === 0) {
      return;
    }
    
    try {
      // Get existing changes
      const existingChangesJson = await this.env.PROPERTIES_KV.get('property_changes');
      const existingChanges = existingChangesJson ? JSON.parse(existingChangesJson) as PropertyChange[] : [];
      
      // Combine and store
      const allChanges = [...changes, ...existingChanges].slice(0, 100); // Keep only the most recent 100 changes
      await this.env.PROPERTIES_KV.put('property_changes', JSON.stringify(allChanges));
      
      console.log(`Stored ${changes.length} property changes`);
    } catch (error) {
      console.error('Error storing property changes:', error);
    }
  }
  
  /**
   * Store a property snapshot
   * 
   * @param property - The property to store
   */
  async storePropertySnapshot(property: Property): Promise<void> {
    try {
      // Store the current property data
      await this.env.PROPERTIES_KV.put(`property:${property.id}`, JSON.stringify(property));
      
      // Store a historical snapshot with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      await this.env.PROPERTIES_KV.put(
        `property:${property.id}:history:${timestamp}`, 
        JSON.stringify(property)
      );
      
      // Store property images reference if available
      if (property.images && property.images.length > 0) {
        await this.env.PROPERTIES_KV.put(`property:${property.id}:images`, JSON.stringify(property.images));
      }
    } catch (error) {
      console.error(`Error storing property snapshot for ${property.id}:`, error);
    }
  }
  
  /**
   * Get historical snapshots for a property
   * 
   * @param propertyId - The property ID
   * @param limit - Maximum number of snapshots to return
   * @returns Promise with array of property snapshots
   */
  async getPropertyHistory(propertyId: string, limit: number = 10): Promise<Property[]> {
    try {
      // List all historical snapshots for this property
      const keys = await this.env.PROPERTIES_KV.list({ prefix: `property:${propertyId}:history:` });
      
      // Sort keys by timestamp (newest first)
      const sortedKeys = keys.keys.sort((a, b) => b.name.localeCompare(a.name));
      
      // Get the most recent snapshots up to the limit
      const snapshots: Property[] = [];
      for (const key of sortedKeys.slice(0, limit)) {
        const snapshotJson = await this.env.PROPERTIES_KV.get(key.name);
        if (snapshotJson) {
          snapshots.push(JSON.parse(snapshotJson) as Property);
        }
      }
      
      return snapshots;
    } catch (error) {
      console.error(`Error getting property history for ${propertyId}:`, error);
      return [];
    }
  }
}
