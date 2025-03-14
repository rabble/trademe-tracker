import { supabase } from '../../lib/supabase'
import { Property } from '../../types'
import { TradeMeService } from '../trademe/trademeService'

/**
 * Interface for property filters
 */
export interface PropertyFilters {
  status?: 'active' | 'under_offer' | 'sold' | 'archived';
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  searchQuery?: string;
  propertyCategory?: 'for_sale' | 'rental';
}

/**
 * Interface for pagination options
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

/**
 * Service for interacting with property data in the database
 */
export const PropertyService = {
  /**
   * Fetch properties with optional filtering and pagination
   * 
   * @param filters - Optional filters to apply to the query
   * @param pagination - Optional pagination options
   * @returns Promise with properties and count
   */
  async fetchProperties(
    filters?: PropertyFilters,
    pagination?: PaginationOptions,
    useTrademe: boolean = false
  ): Promise<{ data: Property[]; count: number }> {
    try {
      // If useTrademe is true, fetch properties from TradeMe API
      if (useTrademe) {
        try {
          console.log('Fetching properties from TradeMe API');
          
          // Convert our filters to TradeMe search params
          const searchParams: Record<string, string> = {};
          
          if (filters) {
            if (filters.propertyCategory) {
              // Set the appropriate TradeMe category based on property category
              searchParams.category = filters.propertyCategory === 'for_sale' 
                ? '5748' // TradeMe category for residential property for sale
                : '5779'; // TradeMe category for residential property to rent
            }
            
            if (filters.minPrice !== undefined) {
              searchParams.price_min = filters.minPrice.toString();
            }
            
            if (filters.maxPrice !== undefined) {
              searchParams.price_max = filters.maxPrice.toString();
            }
            
            if (filters.bedrooms) {
              searchParams.bedrooms_min = filters.bedrooms.toString();
            }
            
            if (filters.searchQuery) {
              searchParams.search_string = filters.searchQuery;
            }
          }
          
          // Fetch properties from TradeMe
          const trademeProperties = await TradeMeService.searchProperties(searchParams);
          
          // Apply pagination
          const page = pagination?.page || 1;
          const limit = pagination?.limit || 10;
          const startIndex = (page - 1) * limit;
          const data = trademeProperties.slice(startIndex, startIndex + limit);
          
          return {
            data: data as Property[],
            count: trademeProperties.length || 0,
          };
        } catch (error) {
          console.error('Error fetching from TradeMe, falling back to database:', error);
          // Fall through to database query
        }
      }
      
      // Use Supabase database query
      let query = supabase
        .from('properties')
        .select('*, property_images(*)', { count: 'exact' });
      
      // Apply filters if provided
      if (filters) {
        if (filters.status) {
          query = query.eq('status', filters.status);
        } else {
          // By default, don't show archived properties
          query = query.neq('status', 'archived');
        }
        
        if (filters.propertyCategory) {
          // Make sure we're using the right column name in the database
          query = query.eq('listing_type', filters.propertyCategory);
          console.log(`Filtering by property category: ${filters.propertyCategory}`);
        }
        
        if (filters.minPrice !== undefined) {
          query = query.gte('price', filters.minPrice);
        }
        
        if (filters.maxPrice !== undefined) {
          query = query.lte('price', filters.maxPrice);
        }
        
        if (filters.bedrooms) {
          query = query.eq('bedrooms', filters.bedrooms);
        }
        
        if (filters.bathrooms) {
          query = query.eq('bathrooms', filters.bathrooms);
        }
        
        if (filters.searchQuery) {
          const searchTerm = `%${filters.searchQuery}%`;
          query = query.or(`title.ilike.${searchTerm},address.ilike.${searchTerm}`);
        }
      } else {
        // By default, don't show archived properties
        query = query.neq('status', 'archived');
      }
      
      // Apply sorting
      query = query.order('created_at', { ascending: false });
      
      // Apply pagination
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const startIndex = (page - 1) * limit;
      query = query.range(startIndex, startIndex + limit - 1);
      
      // Execute the query
      const { data, error, count } = await query;
      
      if (error) {
        console.error('Error fetching properties from database:', error);
        throw error;
      }
      
      // Process the data to ensure all properties have valid image URLs
      const processedData = data?.map(property => {
        // Add a default primary image if none exists
        if (!property.property_images || property.property_images.length === 0) {
          return {
            ...property,
            primary_image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=60'
          };
        }
        
        // Find the primary image
        const primaryImage = property.property_images.find(img => img.is_primary);
        
        return {
          ...property,
          primary_image_url: primaryImage?.url || property.property_images[0]?.url || 
            'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=60'
        };
      });
      
      return {
        data: processedData as unknown as Property[],
        count: count || 0,
      };
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  },

  /**
   * Fetch a single property by ID
   * 
   * @param id - The property ID
   * @returns Promise with the property data
   */
  async fetchPropertyById(id: string): Promise<Property> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images(*),
          property_changes(*),
          property_insights(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        console.error(`Error fetching property with ID ${id}:`, error);
        throw error;
      }
      
      if (!data) {
        throw new Error(`Property with ID ${id} not found`);
      }
      
      // Process the data to ensure the property has valid image URLs
      const processedData = {
        ...data,
        primary_image_url: data.primary_image_url || 
          (data.property_images && data.property_images.length > 0 ? 
            data.property_images.find(img => img.is_primary)?.url || data.property_images[0]?.url : 
            'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=60')
      };

      return processedData as unknown as Property;
    } catch (error) {
      console.error(`Error fetching property with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update a property
   * 
   * @param id - The property ID
   * @param data - The data to update
   * @returns Promise with the updated property
   */
  async updateProperty(id: string, data: Partial<Property>): Promise<Property> {
    try {
      // Update the property in the database
      const { data: updatedData, error } = await supabase
        .from('properties')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error(`Error updating property with ID ${id}:`, error);
        throw error;
      }
      
      if (!updatedData) {
        throw new Error(`Property with ID ${id} not found`);
      }
      
      return updatedData as unknown as Property;
    } catch (error) {
      console.error(`Error updating property with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Archive a property (mark as archived)
   * 
   * @param id - The property ID
   * @returns Promise with the archived property
   */
  async archiveProperty(id: string): Promise<Property> {
    try {
      // Update the property status to archived in the database
      const { data: archivedProperty, error } = await supabase
        .from('properties')
        .update({ 
          status: 'archived',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error(`Error archiving property with ID ${id}:`, error);
        throw error;
      }
      
      if (!archivedProperty) {
        throw new Error(`Property with ID ${id} not found`);
      }
      
      return archivedProperty as unknown as Property;
    } catch (error) {
      console.error(`Error archiving property with ID ${id}:`, error);
      throw error;
    }
  }
};
