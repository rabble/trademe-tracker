import { supabase } from '../../lib/supabase';
import type { Property, PropertyFilters, PropertyChange, PropertyImage } from '../../types';
import type { Database } from '../../lib/supabase/schema';

type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
type PropertyUpdate = Database['public']['Tables']['properties']['Update'];
type PropertyChangeInsert = Database['public']['Tables']['property_changes']['Insert'];
type PropertyImageInsert = Database['public']['Tables']['property_images']['Insert'];

export const PropertyDbService = {
  /**
   * Fetch properties with optional filtering
   */
  async fetchProperties(
    filters?: PropertyFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: Property[]; count: number }> {
    try {
      let query = supabase
        .from('properties')
        .select('*, property_images!inner(*)', { count: 'exact' });

      // Apply filters if provided
      if (filters) {
        if (filters.searchQuery) {
          query = query.or(
            `title.ilike.%${filters.searchQuery}%,address.ilike.%${filters.searchQuery}%`
          );
        }

        if (filters.priceRange) {
          const [minPrice, maxPrice] = filters.priceRange;
          if (minPrice !== undefined) {
            query = query.gte('price', minPrice);
          }
          if (maxPrice !== undefined) {
            query = query.lte('price', maxPrice);
          }
        }

        if (filters.propertyType && filters.propertyType.length > 0) {
          query = query.in('property_type', filters.propertyType);
        }

        if (filters.bedrooms) {
          const [minBeds, maxBeds] = filters.bedrooms;
          if (minBeds !== undefined) {
            query = query.gte('bedrooms', minBeds);
          }
          if (maxBeds !== undefined) {
            query = query.lte('bedrooms', maxBeds);
          }
        }

        if (filters.bathrooms) {
          const [minBaths, maxBaths] = filters.bathrooms;
          if (minBaths !== undefined) {
            query = query.gte('bathrooms', minBaths);
          }
          if (maxBaths !== undefined) {
            query = query.lte('bathrooms', maxBaths);
          }
        }

        if (filters.status && filters.status.length > 0) {
          query = query.in('status', filters.status);
        }

        if (filters.daysOnMarket) {
          const [minDays, maxDays] = filters.daysOnMarket;
          if (minDays !== undefined) {
            query = query.gte('days_on_market', minDays);
          }
          if (maxDays !== undefined) {
            query = query.lte('days_on_market', maxDays);
          }
        }

        if (filters.landArea) {
          const [minArea, maxArea] = filters.landArea;
          if (minArea !== undefined) {
            query = query.gte('land_area', minArea);
          }
          if (maxArea !== undefined) {
            query = query.lte('land_area', maxArea);
          }
        }

        if (filters.floorArea) {
          const [minArea, maxArea] = filters.floorArea;
          if (minArea !== undefined) {
            query = query.gte('floor_area', minArea);
          }
          if (maxArea !== undefined) {
            query = query.lte('floor_area', maxArea);
          }
        }
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      query = query.range(from, to);

      // Execute the query
      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching properties:', error);
        throw error;
      }

      return {
        data: data as unknown as Property[],
        count: count || 0
      };
    } catch (error) {
      console.error('Error in fetchProperties:', error);
      throw error;
    }
  },

  /**
   * Get a single property by ID
   */
  async getPropertyById(id: string): Promise<Property | null> {
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
        if (error.code === 'PGRST116') {
          // PGRST116 is the error code for "no rows returned"
          return null;
        }
        console.error('Error fetching property by ID:', error);
        throw error;
      }

      return data as unknown as Property;
    } catch (error) {
      console.error('Error in getPropertyById:', error);
      throw error;
    }
  },

  /**
   * Create a new property
   */
  async createProperty(property: Omit<PropertyInsert, 'id' | 'created_at' | 'updated_at'>): Promise<Property> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert(property)
        .select()
        .single();

      if (error) {
        console.error('Error creating property:', error);
        throw error;
      }

      return data as unknown as Property;
    } catch (error) {
      console.error('Error in createProperty:', error);
      throw error;
    }
  },

  /**
   * Update an existing property
   */
  async updateProperty(id: string, updates: PropertyUpdate): Promise<Property> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating property:', error);
        throw error;
      }

      return data as unknown as Property;
    } catch (error) {
      console.error('Error in updateProperty:', error);
      throw error;
    }
  },

  /**
   * Delete a property
   */
  async deleteProperty(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting property:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteProperty:', error);
      throw error;
    }
  },

  /**
   * Record a property change
   */
  async recordPropertyChange(change: PropertyChangeInsert): Promise<PropertyChange> {
    try {
      const { data, error } = await supabase
        .from('property_changes')
        .insert(change)
        .select()
        .single();

      if (error) {
        console.error('Error recording property change:', error);
        throw error;
      }

      return data as unknown as PropertyChange;
    } catch (error) {
      console.error('Error in recordPropertyChange:', error);
      throw error;
    }
  },

  /**
   * Get property changes for a specific property
   */
  async getPropertyChanges(propertyId: string): Promise<PropertyChange[]> {
    try {
      const { data, error } = await supabase
        .from('property_changes')
        .select('*')
        .eq('property_id', propertyId)
        .order('change_date', { ascending: false });

      if (error) {
        console.error('Error fetching property changes:', error);
        throw error;
      }

      return data as unknown as PropertyChange[];
    } catch (error) {
      console.error('Error in getPropertyChanges:', error);
      throw error;
    }
  },

  /**
   * Add a property image
   */
  async addPropertyImage(image: PropertyImageInsert): Promise<PropertyImage> {
    try {
      const { data, error } = await supabase
        .from('property_images')
        .insert(image)
        .select()
        .single();

      if (error) {
        console.error('Error adding property image:', error);
        throw error;
      }

      return data as unknown as PropertyImage;
    } catch (error) {
      console.error('Error in addPropertyImage:', error);
      throw error;
    }
  },

  /**
   * Get images for a specific property
   */
  async getPropertyImages(propertyId: string): Promise<PropertyImage[]> {
    try {
      const { data, error } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', propertyId)
        .order('is_primary', { ascending: false });

      if (error) {
        console.error('Error fetching property images:', error);
        throw error;
      }

      return data as unknown as PropertyImage[];
    } catch (error) {
      console.error('Error in getPropertyImages:', error);
      throw error;
    }
  },

  /**
   * Set a property image as primary
   */
  async setImageAsPrimary(imageId: string, propertyId: string): Promise<void> {
    try {
      // First, set all images for this property as non-primary
      const { error: resetError } = await supabase
        .from('property_images')
        .update({ is_primary: false })
        .eq('property_id', propertyId);

      if (resetError) {
        console.error('Error resetting primary images:', resetError);
        throw resetError;
      }

      // Then set the specified image as primary
      const { error } = await supabase
        .from('property_images')
        .update({ is_primary: true })
        .eq('id', imageId);

      if (error) {
        console.error('Error setting image as primary:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in setImageAsPrimary:', error);
      throw error;
    }
  },

  /**
   * Delete a property image
   */
  async deletePropertyImage(imageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('property_images')
        .delete()
        .eq('id', imageId);

      if (error) {
        console.error('Error deleting property image:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deletePropertyImage:', error);
      throw error;
    }
  }
};
